import { useState } from "react";
import { resolveDeck } from "./deckResolver";
import type { ResolvedDeck } from "./deckResolver";
import { PrintPreview } from "./PrintPreview";
import "./App.css";

const DEFAULT_DECK = `Not Just a Cameo

Captain Marvel
Packs: From Core Set to SP//dr

Upgrades
2x Clarity of Purpose (SP//dr)
1x Captain Marvel's Helmet (Core Set)
2x Cosmic Flight (Core Set)
2x Energy Channel (Core Set)

Events
3x Crisis Interdiction (Core Set)
3x Photonic Blast (Core Set)
3x Make the Call (Core Set)
2x Avengers Assemble! (Captain America)
3x Strength in Numbers (Captain America)

Supports
1x Mighty Avengers (The Mad Titan's Shadow)
1x Alpha Flight Station (Core Set)
1x The Triskelion (Core Set)
1x Avengers Tower (Captain America)
1x Team Training (The Rise of Red Skull)
1x Quincarrier (Black Widow)

Resources
2x Band Together (The Mad Titan's Shadow)
2x Energy Absorption (Core Set)
1x Energy (Core Set)
1x Genius (Core Set)
1x Strength (Core Set)

Allies
1x Ant-Man (Ant-Man)
1x Stinger (Ant-Man)
1x White Tiger (The Mad Titan's Shadow)
1x Kaluu (The Mad Titan's Shadow)
1x Spider-Woman (Core Set)
1x Hawkeye (Core Set)`;

export default function App() {
  const [deckText, setDeckText] = useState(DEFAULT_DECK);
  const [resolved, setResolved] = useState<ResolvedDeck | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  async function handleResolve() {
    setLoading(true);
    setShowPreview(false);
    try {
      const result = await resolveDeck(deckText);
      setResolved(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    setShowPreview(true);
    setTimeout(() => window.print(), 400);
  }

  return (
    <div className="app">
      {!showPreview && (
        <div className="editor-pane">
          <h1>Marvel Champions Proxy Printer</h1>
          <p className="hint">
            Paste your deck list below. Format: <code>Nx Card Name (Set Name)</code>
          </p>
          <textarea
            className="deck-input"
            value={deckText}
            onChange={(e) => setDeckText(e.target.value)}
            spellCheck={false}
            rows={30}
          />
          <div className="actions">
            <button onClick={handleResolve} disabled={loading}>
              {loading ? "Loading…" : "Load Deck"}
            </button>
            {resolved && (
              <button className="print-btn" onClick={handlePrint}>
                🖨 Print / Save PDF
              </button>
            )}
          </div>

          {resolved && resolved.errors.length > 0 && (
            <div className="errors">
              <strong>Warnings:</strong>
              <ul>
                {resolved.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          {resolved && <CardGrid resolved={resolved} />}
        </div>
      )}

      {showPreview && resolved && (
        <PrintPreview resolved={resolved} onBack={() => setShowPreview(false)} />
      )}
    </div>
  );
}

function CardGrid({ resolved }: { resolved: ResolvedDeck }) {
  const allCards = buildCardList(resolved);

  return (
    <div className="card-grid-preview">
      <h2>
        {resolved.title} — {allCards.length} card(s)
      </h2>
      <div className="card-grid">
        {allCards.map((c, i) => (
          <div key={i} className="card-thumb">
            {c.found && c.url ? (
              <img src={c.url} alt={c.name} loading="lazy" />
            ) : (
              <div className="card-missing">{c.name}</div>
            )}
            <span className="card-label">{c.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function buildCardList(resolved: ResolvedDeck) {
  return [
    ...resolved.heroCards,
    ...resolved.deckCards.flatMap((c) =>
      Array.from({ length: c.quantity }, () => ({ ...c }))
    ),
  ];
}
