import { useEffect, useMemo, useRef, useState } from "react";
import { builtInDecks } from "./decks/index.js";
import { KINDS, parseTSV, shuffle } from "./lib/cards.js";
import ChipGroup from "./components/ChipGroup.jsx";
import StudySession from "./components/StudySession.jsx";
import ImportDeck from "./components/ImportDeck.jsx";
import ExportPanel from "./components/ExportPanel.jsx";

const STORE = "cn-flashcards-decks-v1"; // user-added decks, saved as { topic: tsvText }

function loadUserDecks() {
  try {
    return JSON.parse(localStorage.getItem(STORE)) || {};
  } catch {
    return {};
  }
}

export default function App() {
  const [userDecks, setUserDecks] = useState(loadUserDecks);
  const decks = useMemo(() => {
    const all = { ...builtInDecks };
    for (const [name, tsv] of Object.entries(userDecks)) all[name] = parseTSV(tsv).cards;
    return all;
  }, [userDecks]);

  const [topics, setTopics] = useState(() => new Set(Object.keys(decks)));
  const [kinds, setKinds] = useState(() => new Set(KINDS));
  const [doShuffle, setDoShuffle] = useState(true);
  const [session, setSession] = useState(null); // { cards, key }
  const studyRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify(userDecks));
    } catch {
      /* storage unavailable: decks last for this visit only */
    }
  }, [userDecks]);

  const inTopics = [...topics].flatMap((t) => (decks[t] || []).map((c) => ({ ...c, topic: t })));
  const selected = inTopics.filter((c) => kinds.has(c.kind));

  const toggle = (set, setter) => (value) => {
    const next = new Set(set);
    next.has(value) ? next.delete(value) : next.add(value);
    setter(next);
  };

  function start() {
    setSession({ cards: doShuffle ? shuffle(selected) : selected, key: Date.now() });
    setTimeout(() => studyRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
  }

  function addDeck(name, tsv) {
    setUserDecks((prev) => ({ ...prev, [name]: (prev[name] ? prev[name] + "\n" : "") + tsv.trim() }));
    setTopics((prev) => new Set(prev).add(name));
  }

  return (
    <main>
      <h1>Counter-Narrative Flashcards</h1>
      <p className="sub">
        Fact-checked answers to common narratives about the Tinubu (PBAT) administration. Pick topics and
        card types, then study. Tap a card to show the answer.
      </p>

      <section className="panel">
        <h2>1. Topics</h2>
        <ChipGroup
          items={Object.keys(decks).map((name) => ({ label: name, count: decks[name].length }))}
          selected={topics}
          onToggle={toggle(topics, setTopics)}
        />
        <h2 className="spaced">2. Card types</h2>
        <ChipGroup
          items={KINDS.map((k) => ({ label: k, count: inTopics.filter((c) => c.kind === k).length }))}
          selected={kinds}
          onToggle={toggle(kinds, setKinds)}
        />
        <div className="row">
          <label className="check">
            <input type="checkbox" checked={doShuffle} onChange={(e) => setDoShuffle(e.target.checked)} /> Shuffle
          </label>
          <button className="btn primary" disabled={!selected.length} onClick={start}>
            Start studying
          </button>
          <span className="msg">
            {selected.length} card{selected.length === 1 ? "" : "s"} selected
          </span>
        </div>
      </section>

      {session && (
        <section className="panel" ref={studyRef}>
          <StudySession key={session.key} cards={session.cards} />
        </section>
      )}

      <section className="panel">
        <ImportDeck onAdd={addDeck} />
      </section>

      <section className="panel">
        <ExportPanel cards={selected} />
      </section>
    </main>
  );
}
