import { useEffect, useRef, useState } from "react";
import { FACT, noteLabel, shareText } from "../lib/cards.js";
import { CopyButton, SpeakButton, StaleWarning } from "./CardTools.jsx";

const SWIPE = 80; // pixels a card must travel to count as a swipe

// One study run. "Got it" removes the current card; "Review again" moves it to the back.
// On phones, swipe right for "Got it" and left for "Review again".
export default function StudySession({ cards, onGotIt, onAgain, relatedFact }) {
  const [queue, setQueue] = useState(cards);
  const [pos, setPos] = useState(0);
  const [shown, setShown] = useState(false);
  const [learned, setLearned] = useState(0);
  const [noteOpen, setNoteOpen] = useState(false); // the push-back fact starts collapsed on every card
  const [relOpen, setRelOpen] = useState(false); // the related "Did you know?" fact, also collapsed
  const [dx, setDx] = useState(0); // current swipe offset
  const touch = useRef(null);
  const total = cards.length;

  const reset = () => {
    setShown(false);
    setNoteOpen(false);
    setRelOpen(false);
  };
  const flip = () => {
    if (!queue.length) return;
    setShown((s) => !s);
    setNoteOpen(false);
    setRelOpen(false);
  };
  const move = (d) => {
    if (!queue.length) return;
    setPos((p) => (p + d + queue.length) % queue.length);
    reset();
  };
  const removeCurrent = (requeue) => {
    if (!queue.length) return;
    const next = [...queue];
    const [card] = next.splice(pos, 1);
    if (requeue) {
      next.push(card);
      onAgain?.(card);
    } else {
      setLearned((n) => n + 1);
      onGotIt?.(card);
    }
    setQueue(next);
    if (pos >= next.length) setPos(0);
    reset();
  };

  useEffect(() => {
    const onKey = (e) => {
      if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.target.closest?.("dialog")) return;
      if (e.key === " ") {
        e.preventDefault();
        flip();
      } else if (e.key === "ArrowRight") move(1);
      else if (e.key === "ArrowLeft") move(-1);
      else if (e.key.toLowerCase() === "g") removeCurrent(false);
      else if (e.key.toLowerCase() === "r") removeCurrent(true);
      else if (e.key.toLowerCase() === "p" && shown) setNoteOpen((o) => !o);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  // Swipe: follow the finger sideways, then decide on release. Vertical drags scroll as usual.
  const onTouchStart = (e) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY, horizontal: null };
  };
  const onTouchMove = (e) => {
    const s = touch.current;
    if (!s) return;
    const t = e.touches[0];
    const x = t.clientX - s.x;
    const y = t.clientY - s.y;
    if (s.horizontal === null && (Math.abs(x) > 10 || Math.abs(y) > 10)) s.horizontal = Math.abs(x) > Math.abs(y);
    if (s.horizontal) setDx(x);
  };
  const onTouchEnd = () => {
    const s = touch.current;
    touch.current = null;
    if (s?.horizontal && Math.abs(dx) > SWIPE) removeCurrent(dx < 0);
    setDx(0);
  };

  const bar = (
    <div
      className="bar"
      role="progressbar"
      aria-label="Cards learned"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={learned}
    >
      <span style={{ width: `${total ? (learned / total) * 100 : 0}%` }} />
    </div>
  );

  if (!queue.length) {
    return (
      <>
        {bar}
        <div className="card done">
          <div className="done-mark" aria-hidden="true">✓</div>
          <div className="q">
            Done! {learned} of {total} marked “Got it”.
          </div>
          <div className="hint">Press “Start studying” to go again.</div>
        </div>
      </>
    );
  }

  const card = queue[pos];
  const voter = card.kind === "Voter Response";
  const fact = card.kind === FACT;
  const related = !fact && relatedFact?.(card);
  const stop = (fn) => (e) => {
    e.stopPropagation(); // buttons inside the card must not flip it
    fn();
  };
  const swipeHint = dx > SWIPE ? "got" : dx < -SWIPE ? "again" : "";
  return (
    <>
      <div className="progress">
        <span>
          Card {pos + 1} of {queue.length}
        </span>
        <span>{learned} learned</span>
      </div>
      {bar}
      <div className="card-wrap">
        <div className={`swipe-label got${swipeHint === "got" ? " on" : ""}`} aria-hidden="true">✓ Got it</div>
        <div className={`swipe-label again${swipeHint === "again" ? " on" : ""}`} aria-hidden="true">↻ Again</div>
        <div
          className={`card${shown ? " shown" : ""}${voter ? " voter" : ""}${fact ? " fact" : ""}${dx ? " dragging" : ""}`}
          style={dx ? { transform: `translateX(${dx}px) rotate(${dx / 30}deg)` } : undefined}
          role="button"
          tabIndex={0}
          aria-live="polite"
          onClick={flip}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
        >
          <div className="meta">
            <span className="tag">{voter ? "Voter says" : fact ? "Did you know?" : card.kind}</span>
            {card.code && <span className="code">{card.code.replace(/^DYK-/, "")}</span>}
            {card.topic}
          </div>
          <div className="q">{card.q}</div>
          {shown ? (
            <>
              <div className="a">
                {voter && <span className="say">Say this</span>}
                {fact && <span className="say">The fact</span>}
                {card.a}
              </div>
              <StaleWarning card={card} />
              {fact && card.note && (
                <div className="note why">
                  <strong>{noteLabel(card)}</strong> {card.note}
                </div>
              )}
              {fact && card.source && <p className="source">Source: {card.source}</p>}
              {!fact && card.note && (
                <div className={`note collapsible${noteOpen ? " open" : ""}`}>
                  <button
                    type="button"
                    className="note-toggle"
                    aria-expanded={noteOpen}
                    onClick={stop(() => setNoteOpen((o) => !o))}
                  >
                    <strong>{noteLabel(card)}</strong>
                    <span className="chev" aria-hidden="true">▸</span>
                  </button>
                  {noteOpen && <p>{card.note}</p>}
                </div>
              )}
              {related && (
                <div className={`note collapsible related${relOpen ? " open" : ""}`}>
                  <button
                    type="button"
                    className="note-toggle"
                    aria-expanded={relOpen}
                    onClick={stop(() => setRelOpen((o) => !o))}
                  >
                    <strong>💡 Back it up: did you know?</strong>
                    <span className="chev" aria-hidden="true">▸</span>
                  </button>
                  {relOpen && (
                    <div className="related-body">
                      <p className="related-q">
                        {related.q} <span className="code">{related.code.replace(/^DYK-/, "")}</span>
                      </p>
                      <p>{related.a}</p>
                      {related.source && <p className="source">Source: {related.source}</p>}
                    </div>
                  )}
                </div>
              )}
              <div className="tools-row">
                <CopyButton text={shareText(card)} label={fact ? "Copy fact" : "Copy reply"} />
                <SpeakButton texts={fact ? [card.q, card.a, card.note] : [card.q, card.a]} />
              </div>
            </>
          ) : (
            <>
              <div className="hint">Tap the card or press Space to reveal the answer</div>
              <div className="tools-row">
                <SpeakButton texts={[card.q]} />
              </div>
            </>
          )}
        </div>
      </div>
      <div className="controls">
        <button className="btn ghost" onClick={() => move(-1)} aria-label="Previous card">
          ←
        </button>
        <button className="btn again" onClick={() => removeCurrent(true)}>
          ↻ Review again
        </button>
        <button className="btn primary" onClick={() => removeCurrent(false)}>
          ✓ Got it
        </button>
        <button className="btn ghost" onClick={() => move(1)} aria-label="Next card">
          →
        </button>
      </div>
      <p className="keys">Keys: Space flips · P push-back fact · ← → move · G got it · R review again</p>
      <p className="swipe-tip">Tip: swipe the card right for “Got it”, left for “Review again”.</p>
    </>
  );
}
