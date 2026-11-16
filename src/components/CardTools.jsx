import { useEffect, useState } from "react";
import { canSpeak, copyText, speak, stopSpeaking } from "../lib/device.js";
import { passedDeadlines } from "../lib/cards.js";

const stop = (e) => e.stopPropagation(); // buttons inside a card must not flip it

// Copies the reply, ready to paste into WhatsApp or SMS.
export function CopyButton({ text, label = "Copy reply" }) {
  const [state, setState] = useState("");
  useEffect(() => {
    if (!state) return;
    const t = setTimeout(() => setState(""), 1800);
    return () => clearTimeout(t);
  }, [state]);
  return (
    <button
      type="button"
      className="tool"
      onClick={async (e) => {
        stop(e);
        setState((await copyText(text)) ? "Copied ✓" : "Copy failed");
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="8" y="8" width="12" height="12" rx="2" />
        <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
      </svg>
      <span aria-live="polite">{state || label}</span>
    </button>
  );
}

// Reads the given texts aloud with the phone's built-in voice; tap again to stop.
export function SpeakButton({ texts }) {
  const [on, setOn] = useState(false);
  const key = texts.join("|");
  useEffect(() => () => stopSpeaking(), []);
  useEffect(() => {
    // A new card stops the old one.
    stopSpeaking();
    setOn(false);
  }, [key]);
  if (!canSpeak()) return null;
  return (
    <button
      type="button"
      className="tool"
      aria-pressed={on}
      onClick={(e) => {
        stop(e);
        if (on) {
          stopSpeaking();
          setOn(false);
        } else {
          setOn(true);
          speak(texts, { onEnd: () => setOn(false) });
        }
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 9v6h4l5 4V5L8 9H4z" />
        {on ? <path d="M17 9l4 6M21 9l-4 6" /> : <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />}
      </svg>
      <span>{on ? "Stop" : "Read aloud"}</span>
    </button>
  );
}

// Warns when a deadline the card mentions has passed, so callers check the fact first.
export function StaleWarning({ card }) {
  const dates = passedDeadlines(card);
  if (!dates.length) return null;
  return (
    <p className="stale" role="note">
      ⚠ This card mentions {dates.join(" and ")}, which has passed. Check it is still current before using it.
    </p>
  );
}
