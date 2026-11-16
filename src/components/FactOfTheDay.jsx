import { useState } from "react";
import { shareText } from "../lib/cards.js";
import { CopyButton } from "./CardTools.jsx";

// Today's position in the list: the same fact for the whole team all day, a new one tomorrow.
export function dayIndex(length, date = new Date()) {
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
  return length ? day % length : 0;
}

// "Fact of the day" on the home screen: guess the answer to the question, then tap to check it.
export default function FactOfTheDay({ facts }) {
  const [index, setIndex] = useState(() => dayIndex(facts.length));
  const [shown, setShown] = useState(false);
  const [today] = useState(index);
  if (!facts.length) return null;
  const fact = facts[index % facts.length];

  function another() {
    let next = index;
    while (facts.length > 1 && next === index) next = Math.floor(Math.random() * facts.length);
    setIndex(next);
    setShown(false);
  }

  return (
    <section className="panel dyk" aria-labelledby="dyk-title">
      <div className="dyk-head">
        <h2 id="dyk-title">
          <span className="dyk-badge" aria-hidden="true">💡</span>
          <span>
            {index === today ? "Fact of the day" : "Another fact"}
            <small>Guess the answer, then check it</small>
          </span>
        </h2>
        <button type="button" className="link small" onClick={another}>
          Next fact ↻
        </button>
      </div>
      <div className="meta">
        <span className="code">{fact.code?.replace(/^DYK-/, "")}</span>
        {fact.topic}
      </div>
      <p className="dyk-q">{fact.q}</p>
      {shown ? (
        <>
          <p className="dyk-a">{fact.a}</p>
          <p className="dyk-why">
            <strong>Why it matters to voters</strong> {fact.note}
          </p>
          <div className="result-actions">
            {fact.source && <p className="source">Source: {fact.source}</p>}
            <CopyButton text={shareText(fact)} label="Copy fact" />
          </div>
        </>
      ) : (
        <button type="button" className="btn reveal" onClick={() => setShown(true)}>
          Tap to see the answer
        </button>
      )}
    </section>
  );
}
