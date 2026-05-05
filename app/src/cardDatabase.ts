export interface CardRow {
  set: string;       // CSV column 0
  no: string;        // CSV column 1  e.g. "10A", "10B", "29", "43D"
  pool: string;      // CSV column 2
  subPool: string;   // CSV column 3
  name: string;      // CSV column 6
}

let cachedRows: CardRow[] | null = null;

export async function loadCardDatabase(): Promise<CardRow[]> {
  if (cachedRows) return cachedRows;
  const resp = await fetch("/cards.csv");
  const text = await resp.text();
  const lines = text.split("\n");
  const rows: CardRow[] = [];
  for (const line of lines) {
    // Skip header and empty lines
    if (!line.trim() || line.startsWith("Set,")) continue;
    // Basic CSV split – handles quoted commas in the name field
    const cols = splitCSV(line);
    if (cols.length < 7) continue;
    rows.push({
      set: cols[0].trim(),
      no: cols[1].trim(),
      pool: cols[2].trim(),
      subPool: cols[3].trim(),
      name: cols[6].trim(),
    });
  }
  cachedRows = rows;
  return rows;
}

/** Minimal CSV field splitter that respects double-quoted fields. */
function splitCSV(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}
