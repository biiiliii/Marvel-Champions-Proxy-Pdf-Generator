import type { CardRow } from "./cardDatabase";
import { SET_TO_NUMBER, DECK_SET_NAME_TO_CSV } from "./setMap";

const BASE_URL =
  "https://cerebrodatastorage.blob.core.windows.net/cerebro-cards/official/";

/**
 * Converts a CSV set code + card number to the 5-char Cerebro code.
 * Format: XXYYYC  where XX = set number, YYY = zero-padded card number,
 * C = optional letter suffix (A/B/C/D) from the No column.
 */
export function buildCerebroCode(setCode: string, no: string): string {
  const setNum = SET_TO_NUMBER[setCode];
  if (!setNum) return "";
  // no could be "10A", "29B", "43D", "12", "100A" etc.
  const match = no.match(/^(\d+)([A-Za-z]*)$/);
  if (!match) return "";
  const numPart = match[1].padStart(3, "0");
  const letterPart = match[2].toUpperCase();
  return `${setNum}${numPart}${letterPart}`;
}

export function cerebroCodeToUrl(code: string): string {
  return `${BASE_URL}${code}.jpg`;
}

/**
 * Resolves the deck.txt set name (e.g. "Core Set") to the CSV set code.
 */
export function resolveDeckSetName(deckSetName: string): string | null {
  const key = deckSetName.trim().toLowerCase();
  return DECK_SET_NAME_TO_CSV[key] ?? null;
}

/**
 * Finds cards by name in the database, optionally filtered by set.
 * Returns all matching rows (there can be multiple per name if reprinted).
 */
/** Normalizes a card name for comparison: lowercases, strips trailing ellipsis,
 *  and replaces curly/fancy apostrophes with a standard one. */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[\u2018\u2019\u201b\u02bc]/g, "'") // curly apostrophes → '
    .replace(/\.{2,}$/, "")                       // trailing ... or .. → remove
    .trim();
}

/** Strips a trailing parenthetical disambiguation tag like " (WM)" or " (H)".
 *  Only strips short tags (≤6 chars) to avoid removing real set names. */
function stripDisambig(name: string): string {
  return name.replace(/\s+\([^)]{1,6}\)$/, "").trim();
}

export function findCards(
  db: CardRow[],
  cardName: string,
  setCode: string | null
): CardRow[] {
  const needle = normalizeName(cardName);
  return db.filter((r) => {
    const haystack = normalizeName(r.name);
    const haystackStripped = stripDisambig(haystack);
    // Exact match, slash-alias match, or match after stripping disambiguation tag
    const nameMatch =
      haystack === needle ||
      haystack.startsWith(needle + " /") ||
      haystack.startsWith(needle + "/") ||
      haystackStripped === needle ||
      haystackStripped.startsWith(needle + " /") ||
      haystackStripped.startsWith(needle + "/");
    if (!nameMatch) return false;
    if (setCode) return r.set === setCode;
    return true;
  });
}

/**
 * Finds the hero card rows (A and B sides, plus any C/D etc.) for a hero name.
 * Hero cards have pool = "Hero" and no ending in a letter (e.g. 10A, 10B).
 */
export function findHeroCards(db: CardRow[], heroName: string): CardRow[] {
  const nameLower = heroName.toLowerCase();
  // First try to find the sub-pool matching the hero name
  const heroRows = db.filter(
    (r) =>
      r.pool === "Hero" &&
      r.subPool.toLowerCase() === nameLower &&
      /[A-Za-z]$/.test(r.no) // ends with a letter → it's a sided card
  );
  return heroRows;
}

/**
 * Given a found card row, build its image URL.
 */
export function cardRowToUrl(row: CardRow): string {
  const code = buildCerebroCode(row.set, row.no);
  if (!code) return "";
  return cerebroCodeToUrl(code);
}
