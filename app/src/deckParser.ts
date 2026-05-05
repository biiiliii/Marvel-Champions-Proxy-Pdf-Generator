export interface DeckCard {
  quantity: number;
  name: string;
  setName: string; // as written in deck.txt, e.g. "Core Set"
}

export interface ParsedDeck {
  title: string;
  hero: string;
  cards: DeckCard[];
}

/**
 * Parses a deck.txt file content into a structured object.
 *
 * Format:
 *   Line 1: Title
 *   Line 2: empty
 *   Line 3: Hero name
 *   Line 4: "Packs: ..." (ignored)
 *   Remaining: section headers (ignored) and card lines:
 *     [N]x [Card Name] ([Set Name])
 */
export function parseDeck(text: string): ParsedDeck {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const title = lines[0] ?? "Unnamed Deck";
  const hero = lines[1] ?? "";
  const cards: DeckCard[] = [];

  // Card line pattern: "2x Card Name (Set Name)"
  const cardPattern = /^(\d+)x\s+(.+?)\s+\(([^)]+)\)\s*$/;

  for (const line of lines.slice(2)) {
    const m = line.match(cardPattern);
    if (!m) continue;
    cards.push({
      quantity: parseInt(m[1], 10),
      name: m[2].trim(),
      setName: m[3].trim(),
    });
  }

  return { title, hero, cards };
}
