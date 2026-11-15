import { useEffect, useState } from "react";
import { noteLabel } from "../lib/cards.js";

// One study run. "Got it" removes the current card; "Review again" moves it to the back.
export default function StudySession({ cards }) {
  const [queue, setQueue] = useState(cards);
  const [pos, setPos] = useState(0);
  const [shown, setShown] = useState(false);
  const [learned, setLearned] = useState(0);
  const total = cards.length;

  const flip = () => queue.length && setShown((s) => !s);
  const move = (d) => {
    if (!queue.length) return;
    setPos((p) => (p + d + queue.length) % queue.length);
    setShown(false);
  };
  const removeCurrent = (requeue) => {
    if (!queue.length) return;
    const next = [...queue];
    const [card] = next.splice(pos, 1);
    if (requeue) next.push(card);
    else setLearned((n) => n + 1);
    setQueue(next);
    if (pos >= next.length) setPos(0);
    setShown(false);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (/INPUT|TEXTAREA/.test(e.target.tagName)) return;
      if (e.key === " ") {
        e.preventDefault();
        flip();
      } else if (e.key === "ArrowRight") move(1);
      else if (e.key === "ArrowLeft") move(-1);
      else if (e.key.toLowerCase() === "g") removeCurrent(false);
      else if (e.key.toLowerCase() === "r") removeCurrent(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  if (!queue.length) {
    return (
      <div className="card">
        <div className="q">
          Done — {learned} of {total} marked “Got it”.
        </div>
        <div className="hint">Press “Start studying” to go again.</div>
      </div>
    );
  }

  const card = queue[pos];
  return (
    <>
      <div className="card" role="button" tabIndex={0} aria-live="polite" onClick={flip}>
        <div className="kind">
          {card.topic} · {card.kind}
        </div>
        <div className="q">{card.q}</div>
        {shown ? (
          <>
            <div className="a">{card.a}</div>
            {card.note && (
              <div className="note">
                <strong>{noteLabel(card)}:</strong> {card.note}
              </div>
            )}
          </>
        ) : (
          <div className="hint">Tap or press Space to reveal</div>
        )}
      </div>
      <div className="progress">
        Card {pos + 1} of {queue.length} remaining · {learned} learned
      </div>
      <div className="row center">
        <button className="btn" onClick={() => move(-1)}>← Prev</button>
        <button className="btn" onClick={() => removeCurrent(true)}>Review again</button>
        <button className="btn primary" onClick={() => removeCurrent(false)}>Got it</button>
        <button className="btn" onClick={() => move(1)}>Next →</button>
      </div>
    </>
  );
}
