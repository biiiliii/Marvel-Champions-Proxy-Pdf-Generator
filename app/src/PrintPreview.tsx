import React from "react";
import type { ResolvedDeck } from "./deckResolver";
import { buildCardList } from "./App";
import "./PrintPreview.css";

interface Props {
  resolved: ResolvedDeck;
  onBack: () => void;
}

export function PrintPreview({ resolved, onBack }: Props) {
  const cards = buildCardList(resolved);

  return (
    <div className="print-preview">
      <div className="print-toolbar no-print">
        <button onClick={onBack}>← Back to editor</button>
        <span>
          {resolved.title} — {cards.length} card(s)
        </span>
        <button onClick={() => window.print()}>🖨 Print / Save PDF</button>
      </div>

      <div className="print-page">
        {cards.map((c, i) =>
          c.found && c.url ? (
            <div key={i} className="print-card">
              <img src={c.url} alt={c.name} />
            </div>
          ) : (
            <div key={i} className="print-card print-card--missing">
              <span>{c.name}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
