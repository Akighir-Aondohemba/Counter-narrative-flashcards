import { useEffect, useMemo, useRef, useState } from "react";
import { builtInDecks, CARDS_UPDATED, COLLECTIONS, RELATED_FACTS, topicCollection } from "./decks/index.js";
import { cardId, FACT, KINDS, parseTSV, shuffle } from "./lib/cards.js";
import { readLink, writeLink } from "./lib/links.js";
import { shareLink } from "./lib/device.js";
import FilterPicker from "./components/FilterPicker.jsx";
import StudySession from "./components/StudySession.jsx";
import ImportDeck from "./components/ImportDeck.jsx";
import ExportPanel from "./components/ExportPanel.jsx";
import { SearchBox, SearchResults } from "./components/SearchPanel.jsx";
import FactOfTheDay from "./components/FactOfTheDay.jsx";

const STORE = "cn-flashcards-decks-v1"; // user-added decks, saved as { topic: tsvText }
const PROGRESS = "cn-flashcards-progress-v1"; // ids of cards marked "Got it", saved as an array

function load(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: this lasts for this visit only */
  }
}

const updatedLabel = new Date(`${CARDS_UPDATED}T12:00:00`).toLocaleDateString("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default function App() {
  const [userDecks, setUserDecks] = useState(() => load(STORE, {}));
  const decks = useMemo(() => {
    const all = { ...builtInDecks };
    for (const [name, tsv] of Object.entries(userDecks)) all[name] = parseTSV(tsv).cards;
    return all;
  }, [userDecks]);
  const topicNames = Object.keys(decks);

  // A shared link (?set=…&topics=…&types=…&q=…&new=1) sets the starting selection.
  const [link] = useState(() => readLink(window.location.search, topicNames, KINDS));
  // A link names topics from one collection; the other collection keeps all of its topics.
  const [topics, setTopics] = useState(() => {
    if (!link.topics) return new Set(topicNames);
    const linked = new Set([...link.topics].map((t) => topicCollection[t] || "replies"));
    return new Set([...link.topics, ...topicNames.filter((t) => !linked.has(topicCollection[t] || "replies"))]);
  });
  const [kinds, setKinds] = useState(() => link.kinds || new Set(KINDS));
  const [query, setQuery] = useState(link.query);
  const [onlyNew, setOnlyNew] = useState(link.onlyNew);
  const [set, setSet] = useState(link.set); // which collection: "replies" (counter-narratives) or "facts"
  const [doShuffle, setDoShuffle] = useState(true);
  const [session, setSession] = useState(null); // { cards, key }
  const [learned, setLearned] = useState(() => new Set(load(PROGRESS, [])));
  const [shareMsg, setShareMsg] = useState("");
  const [installPrompt, setInstallPrompt] = useState(null); // Android/Chrome "add to home screen" offer
  const studyRef = useRef(null);

  useEffect(() => save(STORE, userDecks), [userDecks]);
  useEffect(() => save(PROGRESS, [...learned]), [learned]);

  // Keep the address bar in step with the selection, so it can be bookmarked or shared.
  const search = writeLink(
    { topics, kinds: set === "facts" ? new Set(KINDS) : kinds, query, onlyNew, set },
    topicNames.filter((t) => (topicCollection[t] || "replies") === set),
    KINDS,
  );
  useEffect(() => {
    try {
      window.history.replaceState(null, "", `${window.location.pathname}${search}${window.location.hash}`);
    } catch {
      /* some embedded browsers block this */
    }
  }, [search]);

  useEffect(() => {
    const offer = (e) => {
      e.preventDefault(); // show our own button instead of the browser's banner
      setInstallPrompt(e);
    };
    const done = () => setInstallPrompt(null);
    window.addEventListener("beforeinstallprompt", offer);
    window.addEventListener("appinstalled", done);
    return () => {
      window.removeEventListener("beforeinstallprompt", offer);
      window.removeEventListener("appinstalled", done);
    };
  }, []);

  async function install() {
    installPrompt.prompt();
    await installPrompt.userChoice.catch(() => {});
    setInstallPrompt(null);
  }

  useEffect(() => {
    if (!shareMsg) return;
    const t = setTimeout(() => setShareMsg(""), 2500);
    return () => clearTimeout(t);
  }, [shareMsg]);

  const isLearned = (c) => learned.has(cardId(c));
  const collectionOf = (topic) => topicCollection[topic] || "replies"; // decks users add are replies
  const allCards = Object.entries(decks).flatMap(([t, list]) =>
    list.map((c) => ({ ...c, topic: t, collection: collectionOf(t) })),
  );
  const facts = allCards.filter((c) => c.kind === FACT);
  const inSet = allCards.filter((c) => c.collection === set);
  const setTopicNames = topicNames.filter((t) => collectionOf(t) === set);
  const inTopics = inSet.filter((c) => topics.has(c.topic));
  const ofKinds = set === "facts" ? inTopics : inTopics.filter((c) => kinds.has(c.kind));
  const selected = onlyNew ? ofKinds.filter((c) => !isLearned(c)) : ofKinds;
  const learnedCount = inSet.filter(isLearned).length;

  // A positive fact to back up a counter-narrative card, picked from its topic's list.
  // The same card always gets the same fact.
  const relatedFact = (card) => {
    const codes = (RELATED_FACTS[card.topic] || []).map((c) => `DYK-${c}`);
    const pool = facts.filter((f) => codes.includes(f.code));
    if (!pool.length) return null;
    const h = [...cardId(card)].reduce((n, ch) => (n * 31 + ch.charCodeAt(0)) >>> 0, 7);
    return pool[h % pool.length];
  };

  const toggle = (set, setter) => (value) => {
    const next = new Set(set);
    next.has(value) ? next.delete(value) : next.add(value);
    setter(next);
  };
  const mark = (card, on) =>
    setLearned((prev) => {
      const next = new Set(prev);
      on ? next.add(cardId(card)) : next.delete(cardId(card));
      return next;
    });

  function start(cards = selected, mix = doShuffle) {
    setSession({ cards: mix ? shuffle(cards) : cards, key: Date.now() });
    setTimeout(() => studyRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
  }

  function addDeck(name, tsv) {
    setUserDecks((prev) => ({ ...prev, [name]: (prev[name] ? prev[name] + "\n" : "") + tsv.trim() }));
    setTopics((prev) => new Set(prev).add(name));
  }

  function resetProgress() {
    if (window.confirm("Clear your learning progress on this phone? Every card will count as not learned.")) {
      setLearned(new Set());
    }
  }

  async function share() {
    const url = `${window.location.origin}${window.location.pathname}${search}`;
    const result = await shareLink(url, "Counter-Narrative Flashcards");
    setShareMsg(result === "copied" ? "Link copied ✓" : result === "failed" ? "Couldn't share the link" : "");
  }

  const voterCount = allCards.filter((c) => c.kind === "Voter Response").length;
  const stats = [
    [allCards.length, "cards"],
    [voterCount, "voter responses"],
    [facts.length, "impact facts"],
  ];
  const setPickerTopics = (list) =>
    setTopics((prev) => new Set([...[...prev].filter((t) => collectionOf(t) !== set), ...list]));

  return (
    <>
      <header className="hero">
        <div className="hero-inner">
          <p className="eyebrow">Voter engagement &amp; callers team</p>
          <h1>Counter-Narrative Flashcards</h1>
          <p className="lede">
            Fact-checked replies to what voters say about the Tinubu (PBAT) administration, and positive
            facts to share. Search for a phrase, or build a study set below.
          </p>
          <SearchBox query={query} onChange={setQuery} />
          <ul className="stats">
            {stats.map(([n, label]) => (
              <li key={label}>
                <b>{n}</b> {label}
              </li>
            ))}
          </ul>
          <div className="hero-foot">
            <p className="updated">Cards updated {updatedLabel} · works offline after your first visit</p>
            {installPrompt && (
              <button type="button" className="install" onClick={install}>
                ⤓ Install app
              </button>
            )}
          </div>
        </div>
      </header>

      <main>
        <SearchResults
          cards={allCards}
          query={query}
          onStudy={(cards) => start(cards, false)}
          onClear={() => setQuery("")}
          isLearned={isLearned}
        />

        <FactOfTheDay facts={facts} />

        <section className="panel">
          <div className="panel-head">
            <h2>Choose what to study</h2>
            <button type="button" className="link share" onClick={share}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
              </svg>
              {shareMsg || "Share this selection"}
            </button>
          </div>
          <div className="tabs" role="tablist" aria-label="Collection">
            {COLLECTIONS.map((col) => (
              <button
                key={col.id}
                type="button"
                role="tab"
                aria-selected={set === col.id}
                className={`tab ${col.id}`}
                onClick={() => setSet(col.id)}
              >
                <span className="tab-name">{col.name}</span>
                <span className="tab-sub">
                  {allCards.filter((c) => c.collection === col.id).length} cards · {col.blurb}
                </span>
              </button>
            ))}
          </div>
          <div className={set === "facts" ? "pickers single" : "pickers"}>
            <FilterPicker
              title={set === "facts" ? "Themes" : "Topics"}
              items={setTopicNames.map((name) => {
                const list = inSet.filter((c) => c.topic === name);
                return { label: name, count: list.length, learned: list.filter(isLearned).length };
              })}
              selected={topics}
              onToggle={toggle(topics, setTopics)}
              onSetAll={setPickerTopics}
            />
            {set === "replies" && (
              <FilterPicker
                title="Card types"
                items={KINDS.map((k) => {
                  const list = inTopics.filter((c) => c.kind === k);
                  return { label: k, count: list.length, learned: list.filter(isLearned).length };
                })}
                selected={kinds}
                onToggle={toggle(kinds, setKinds)}
                onSetAll={(list) => setKinds(new Set(list))}
              />
            )}
          </div>

          <div className="learned-row">
            <label className="switch">
              <input type="checkbox" checked={onlyNew} onChange={(e) => setOnlyNew(e.target.checked)} />
              <span className="track" aria-hidden="true" />
              Only cards I haven't learned
            </label>
            <span className="msg">
              {learnedCount} of {inSet.length} learned
              {learnedCount > 0 && (
                <>
                  {" · "}
                  <button type="button" className="link small" onClick={resetProgress}>
                    Reset
                  </button>
                </>
              )}
            </span>
          </div>

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
            <StudySession
              key={session.key}
              cards={session.cards}
              onGotIt={(c) => mark(c, true)}
              onAgain={(c) => mark(c, false)}
              relatedFact={relatedFact}
            />
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
