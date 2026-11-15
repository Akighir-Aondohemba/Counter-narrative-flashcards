import { useEffect, useMemo, useRef, useState } from "react";
import { builtInDecks } from "./decks/index.js";
import { KINDS, parseTSV, shuffle } from "./lib/cards.js";
import ChipGroup from "./components/ChipGroup.jsx";
import StudySession from "./components/StudySession.jsx";
import ImportDeck from "./components/ImportDeck.jsx";
import ExportPanel from "./components/ExportPanel.jsx";
import { SearchBox, SearchResults } from "./components/SearchPanel.jsx";

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
  const [query, setQuery] = useState("");
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

  const allCards = Object.entries(decks).flatMap(([t, list]) => list.map((c) => ({ ...c, topic: t })));

  function start(cards = selected, mix = doShuffle) {
    setSession({ cards: mix ? shuffle(cards) : cards, key: Date.now() });
    setTimeout(() => studyRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
  }

  function addDeck(name, tsv) {
    setUserDecks((prev) => ({ ...prev, [name]: (prev[name] ? prev[name] + "\n" : "") + tsv.trim() }));
    setTopics((prev) => new Set(prev).add(name));
  }

  const voterCount = allCards.filter((c) => c.kind === "Voter Response").length;
  const stats = [
    [allCards.length, "cards"],
    [Object.keys(decks).length, "topics"],
    [voterCount, "voter responses"],
  ];

  return (
    <>
      <header className="hero">
        <div className="hero-inner">
          <p className="eyebrow">Voter engagement &amp; callers team</p>
          <h1>Counter-Narrative Flashcards</h1>
          <p className="lede">
            Fact-checked replies to what voters say about the Tinubu (PBAT) administration. Search for a
            phrase, or build a study set below.
          </p>
          <SearchBox query={query} onChange={setQuery} />
          <ul className="stats">
            {stats.map(([n, label]) => (
              <li key={label}>
                <b>{n}</b> {label}
              </li>
            ))}
          </ul>
        </div>
      </header>

      <main>
        <SearchResults
          cards={allCards}
          query={query}
          onStudy={(cards) => start(cards, false)}
          onClear={() => setQuery("")}
        />

        <section className="panel">
          <div className="step">
            <span className="num">1</span>
            <h2>Choose topics</h2>
            <SelectAll all={Object.keys(decks)} set={topics} setter={setTopics} />
          </div>
          <ChipGroup
            items={Object.keys(decks).map((name) => ({ label: name, count: decks[name].length }))}
            selected={topics}
            onToggle={toggle(topics, setTopics)}
          />

          <div className="step spaced">
            <span className="num">2</span>
            <h2>Choose card types</h2>
            <SelectAll all={KINDS} set={kinds} setter={setKinds} />
          </div>
          <ChipGroup
            items={KINDS.map((k) => ({ label: k, count: inTopics.filter((c) => c.kind === k).length }))}
            selected={kinds}
            onToggle={toggle(kinds, setKinds)}
          />

          <div className="startbar">
            <div className="count">
              <b>{selected.length}</b> card{selected.length === 1 ? "" : "s"} selected
            </div>
            <label className="switch">
              <input type="checkbox" checked={doShuffle} onChange={(e) => setDoShuffle(e.target.checked)} />
              <span className="track" aria-hidden="true" />
              Shuffle
            </label>
            <button className="btn primary big" disabled={!selected.length} onClick={() => start()}>
              Start studying →
            </button>
          </div>
        </section>

        {session && (
          <section className="panel study" ref={studyRef}>
            <StudySession key={session.key} cards={session.cards} />
          </section>
        )}

        <section className="tools">
          <div className="panel slim">
            <ImportDeck onAdd={addDeck} />
          </div>
          <div className="panel slim">
            <ExportPanel cards={selected} />
          </div>
        </section>
      </main>
    </>
  );
}

function SelectAll({ all, set, setter }) {
  const allOn = all.every((x) => set.has(x));
  return (
    <button className="link" onClick={() => setter(new Set(allOn ? [] : all))}>
      {allOn ? "Clear all" : "Select all"}
    </button>
  );
}
