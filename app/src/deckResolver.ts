import type { CardRow } from "./cardDatabase";
import { loadCardDatabase } from "./cardDatabase";
import { parseDeck } from "./deckParser";
import type { ParsedDeck, DeckCard } from "./deckParser";
import {
  findCards,
  findHeroCards,
  cardRowToUrl,
  resolveDeckSetName,
} from "./cardUrl";

export interface ResolvedCard {
  name: string;
  url: string;
  quantity: number;
  found: boolean;
}

export interface ResolvedDeck {
  title: string;
  hero: string;
  heroCards: ResolvedCard[];
  deckCards: ResolvedCard[];
  errors: string[];
}

/**
 * Resolves a deck text to image URLs using the card database.
 */
export async function resolveDeck(deckText: string): Promise<ResolvedDeck> {
  const db = await loadCardDatabase();
  const parsed: ParsedDeck = parseDeck(deckText);
  const errors: string[] = [];

  // --- Resolve hero ---
  const heroCards = resolveHero(db, parsed.hero, errors);

  // --- Resolve deck cards ---
  const deckCards = parsed.cards.flatMap((c) =>
    resolveCard(db, c, errors)
  );

  return {
    title: parsed.title,
    hero: parsed.hero,
    heroCards,
    deckCards,
    errors,
  };
}

function resolveHero(
  db: CardRow[],
  heroName: string,
  errors: string[]
): ResolvedCard[] {
  const rows = findHeroCards(db, heroName);
  if (rows.length === 0) {
    errors.push(`Hero not found: "${heroName}"`);
    return [];
  }
  return rows.map((r) => ({
    name: r.name,
    url: cardRowToUrl(r),
    quantity: 1,
    found: true,
  }));
}

function resolveCard(
  db: CardRow[],
  card: DeckCard,
  errors: string[]
): ResolvedCard[] {
  const setCode = resolveDeckSetName(card.setName);
  if (!setCode) {
    errors.push(`Unknown set: "${card.setName}" (for card "${card.name}")`);
  }

  let rows = findCards(db, card.name, setCode);

  // If not found with the specific set, try without set filter as fallback
  if (rows.length === 0 && setCode) {
    rows = findCards(db, card.name, null);
    if (rows.length > 0) {
      errors.push(
        `Card "${card.name}" not found in "${card.setName}", using first match from "${rows[0].set}"`
      );
    }
  }

  if (rows.length === 0) {
    errors.push(`Card not found: "${card.name}" (${card.setName})`);
    return [
      {
        name: card.name,
        url: "",
        quantity: card.quantity,
        found: false,
      },
    ];
  }

  const row = rows[0];
  return [
    {
      name: card.name,
      url: cardRowToUrl(row),
      quantity: card.quantity,
      found: true,
    },
  ];
}
