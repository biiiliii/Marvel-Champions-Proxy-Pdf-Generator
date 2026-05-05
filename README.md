# Marvel Champions Proxy Printer

A web app to generate printable proxy cards for the **Marvel Champions: The Card Game** board game.

Given a deck list, it automatically fetches the card images from the [Cerebro database](https://cerebrodatastorage.blob.core.windows.net/cerebro-cards/official/) and lays them out ready to print on A4 paper.

---

## How it works

1. Paste your deck list into the text area
2. Click **Load Deck** — the app looks up every card in the database and shows a thumbnail preview
3. Click **Print / Save PDF** — your browser's print dialog opens with the cards laid out at standard card size (63×88 mm), 3 per row on A4

Cards that can't be found are shown as placeholders with warnings.

---

## Deck list format

The format follows the standard MarvelCDB export style:

```
Deck Title

Hero Name
Packs: (ignored line)

Section Header (ignored)
2x Card Name (Set Name)
1x Another Card (Set Name)
```

**Rules:**
- Line 1: deck title (used as the PDF filename hint)
- Line 2: blank
- Line 3: hero name — both hero sides (A & B) are added automatically
- Line 4: ignored (usually `Packs: ...`)
- Any line starting with a number followed by `x` is a card: `Nx Card Name (Set Name)`
- All other lines (section headers, blank lines) are ignored

**Example:**
```
Not Just a Cameo

Captain Marvel
Packs: From Core Set to SP//dr

Upgrades
2x Clarity of Purpose (SP//dr)
1x Captain Marvel's Helmet (Core Set)
2x Cosmic Flight (Core Set)

Events
3x Crisis Interdiction (Core Set)
3x Photonic Blast (Core Set)

Allies
1x Ant-Man (Ant-Man)
1x Spider-Woman (Core Set)
```

---

## Set names

Use the full English set name in parentheses. Common ones:

| Set name in deck | Set |
|---|---|
| Core Set | Core |
| Green Goblin | Green Goblin |
| Captain America | Captain America |
| The Rise of Red Skull | The Rise of Red Skull |
| Black Widow | Black Widow |
| Doctor Strange | Doctor Strange |
| Thor | Thor |
| Hulk | Hulk |
| Ant-Man | Ant-Man |
| Wasp | Wasp |
| The Mad Titan's Shadow | The Mad Titan's Shadow |
| War Machine | War Machine |
| Valkyrie | Valkyrie |
| Sinister Motives | Sinister Motives |
| SP//dr | SP//dr |
| Wolverine | Wolverine |
| Deadpool | Deadpool |
| Age of Apocalypse | Age of Apocalypse |

The full mapping is in [`app/src/setMap.ts`](app/src/setMap.ts).

---

## Printing tips

- The app uses the [Cerebro card image database](https://cerebrodatastorage.blob.core.windows.net/cerebro-cards/official/) — no images are bundled locally
- Cards are sized at **63×88 mm** (standard card size) on A4 with 5 mm margins
- Print at **100% scale** (do not fit to page)
- After printing, cut out the cards and sleeve them inside an existing card (basic resources like Energy/Genius/Strength work great as backing)

---

## Running locally

Requires [Node.js](https://nodejs.org/) 18+.

```bash
cd app
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

### Build for production

```bash
cd app
npm run build
```

The static output will be in `app/dist/` — you can host it anywhere (GitHub Pages, Netlify, etc.).

---

## Project structure

```
app/                        Vite + React + TypeScript app
├── public/
│   └── cards.csv           Full card database (Marvel Champions - All Sets.csv)
└── src/
    ├── setMap.ts            CSV set codes ↔ Cerebro set numbers ↔ deck.txt names
    ├── cardDatabase.ts      CSV loader & parser
    ├── cardUrl.ts           Card lookup & Cerebro URL builder
    ├── deckParser.ts        Deck list text parser
    ├── deckResolver.ts      Ties everything together
    ├── App.tsx              Main UI
    └── PrintPreview.tsx     Print layout

Marvel Champions - All Sets.csv   Full card database (source)
deck.txt                           Example deck list
Instructions.txt                   Original manual instructions
```

---

## Card database

The card database (`Marvel Champions - All Sets.csv`) is a community-maintained spreadsheet covering all released sets. It is included in this repo for convenience. All card images belong to Fantasy Flight Games / Asmodee.

---

## Disclaimer

This project is a fan-made tool for personal use. Marvel Champions: The Card Game and all related content are property of Fantasy Flight Games / Asmodee. This tool does not distribute any copyrighted images — it only links to them from the Cerebro community database.

## Quick start: Export from MarvelCDB

The fastest way to use this tool is to export your deck from [MarvelCDB](https://marvelcdb.com/decklists):

1. Go to https://marvelcdb.com/decklists and open your deck
2. Click the **Export** button and choose **Export as .txt**
3. Open the downloaded `.txt` file and copy all its contents
4. Paste it into the app's text area

This ensures the format is always correct and all set names match automatically.
