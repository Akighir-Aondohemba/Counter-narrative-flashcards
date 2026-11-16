import { useState } from "react";
import { noteLabel, searchCards, searchTerms } from "../lib/cards.js";
import Highlight from "./Highlight.jsx";

// The search box. It sits in the page header; results show in <SearchResults>.
export function SearchBox({ query, onChange }) {
  return (
    <div className="search">
      <svg className="search-icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        id="search"
        type="search"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder='Search words or "a phrase"'
        aria-label="Search all cards for words or a phrase"
        autoComplete="off"
      />
    </div>
  );
}

// Matches from every card in every topic, whatever topics and types are selected below.
export function SearchResults({ cards, query, onStudy, onClear }) {
  const terms = searchTerms(query);
  if (!terms.length) return null;
  const results = searchCards(cards, query);

  return (
    <section className="panel" aria-labelledby="results-title">
      <div className="panel-head">
        <h2 id="results-title" aria-live="polite">
          {results.length} card{results.length === 1 ? "" : "s"} found
          <span className="muted"> in all topics</span>
        </h2>
        <div className="head-actions">
          <button className="btn ghost" onClick={onClear}>
            Clear
          </button>
          {results.length > 0 && (
            <button className="btn primary" onClick={() => onStudy(results)}>
              Study these
            </button>
          )}
        </div>
      </div>
      {results.length === 0 ? (
        <p className="empty">No card contains all of those words. Try fewer or different words.</p>
      ) : (
        <ol className="results">
          {results.map((c, i) => (
            <ResultItem key={`${c.topic}|${c.q}|${i}`} card={c} terms={terms} />
          ))}
        </ol>
      )}
    </section>
  );
}

// Long answers start clamped to a few lines; "Read more" shows the whole answer and the note.
const LONG = 170; // characters

function ResultItem({ card: c, terms }) {
  const [open, setOpen] = useState(false);
  const long = c.a.length > LONG || Boolean(c.note);
  const collapsed = long && !open;
  return (
    <li className={c.kind === "Voter Response" ? "voter" : ""}>
      <div className="meta">
        <span className="tag">{c.kind}</span>
        {c.topic}
      </div>
      <div className="rq">
        <Highlight text={c.q} terms={terms} />
      </div>
      <div className={collapsed ? "ra clamp" : "ra"}>
        <Highlight text={c.a} terms={terms} />
      </div>
      {c.note && !collapsed && (
        <div className="note">
          <strong>{noteLabel(c)}</strong> <Highlight text={c.note} terms={terms} />
        </div>
      )}
      {long && (
        <button type="button" className="link more" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? "Show less ▴" : "Read more ▾"}
        </button>
      )}
    </li>
  );
}
