import { useState } from "react";
import { noteLabel, searchCards, searchTerms } from "../lib/cards.js";
import Highlight from "./Highlight.jsx";

// Searches every card in every topic, whatever topics and types are selected below.
export default function SearchPanel({ cards, onStudy }) {
  const [query, setQuery] = useState("");
  const terms = searchTerms(query);
  const results = searchCards(cards, query);

  return (
    <>
      <h2>
        <label htmlFor="search">Search cards</label>
      </h2>
      <div className="search-row">
        <input
          id="search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Words or a "phrase", e.g. minimum wage, "student loan"'
          autoComplete="off"
        />
      </div>
      {terms.length > 0 && (
        <>
          <div className="row">
            <span className="msg" aria-live="polite">
              {results.length} card{results.length === 1 ? "" : "s"} found in all topics
            </span>
            {results.length > 0 && (
              <button className="btn primary" onClick={() => onStudy(results)}>
                Study these
              </button>
            )}
          </div>
          <ol className="results">
            {results.map((c, i) => (
              <li key={i}>
                <div className="kind">
                  {c.topic} · {c.kind}
                </div>
                <div className="rq">
                  <Highlight text={c.q} terms={terms} />
                </div>
                <div className="ra">
                  <Highlight text={c.a} terms={terms} />
                </div>
                {c.note && (
                  <div className="note">
                    <strong>{noteLabel(c)}:</strong> <Highlight text={c.note} terms={terms} />
                  </div>
                )}
              </li>
            ))}
          </ol>
        </>
      )}
    </>
  );
}
