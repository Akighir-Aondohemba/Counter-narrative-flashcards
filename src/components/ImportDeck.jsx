import { useState } from "react";
import { parseTSV } from "../lib/cards.js";

export default function ImportDeck({ onAdd }) {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [msg, setMsg] = useState({ text: "", err: false });

  function add(deckName, tsv) {
    const { cards, bad } = parseTSV(tsv);
    if (!deckName) return setMsg({ text: "Give the deck a topic name.", err: true });
    if (!cards.length) return setMsg({ text: "No valid Question⇥Answer lines found.", err: true });
    onAdd(deckName, tsv);
    setMsg({
      text:
        `Added ${cards.length} card(s) to “${deckName}”.` +
        (bad.length ? ` Skipped line(s) ${bad.join(", ")} (no tab or empty side).` : ""),
      err: false,
    });
  }

  async function onFiles(e) {
    for (const f of e.target.files) {
      add(f.name.replace(/\.(tsv|txt)$/i, "").replace(/[_-]+/g, " "), await f.text());
    }
    e.target.value = "";
  }

  return (
    <details>
      <summary>Add or import a counter-narrative deck (TSV: Question⇥Answer, optional ⇥Note)</summary>
      <div className="row">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Topic name, e.g. Security"
        />
      </div>
      <div className="row">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="One card per line: Question[TAB]Answer, optionally [TAB]Note"
        />
      </div>
      <div className="row">
        <button className="btn primary" onClick={() => add(name.trim(), text)}>Add deck</button>
        <label className="btn">
          Import .tsv file
          <input type="file" accept=".tsv,.txt" multiple hidden onChange={onFiles} />
        </label>
        <span className={msg.err ? "msg err" : "msg"}>{msg.text}</span>
      </div>
    </details>
  );
}
