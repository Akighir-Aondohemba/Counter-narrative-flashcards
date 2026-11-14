import { useState } from "react";
import { toTSV } from "../lib/cards.js";

export default function ExportPanel({ cards }) {
  const [msg, setMsg] = useState("");
  const tsv = toTSV(cards);

  async function copy() {
    try {
      await navigator.clipboard.writeText(tsv);
      setMsg("Copied.");
    } catch {
      setMsg("Copy failed — select the text manually.");
    }
  }

  function download() {
    const blob = new Blob([tsv + "\n"], { type: "text/tab-separated-values" });
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: "flashcards.tsv",
    });
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <details>
      <summary>Export the selected cards as TSV</summary>
      <pre className="tsv">{tsv}</pre>
      <div className="row">
        <button className="btn" onClick={copy}>Copy</button>
        <button className="btn" onClick={download}>Download .tsv</button>
        <span className="msg">{msg}</span>
      </div>
    </details>
  );
}
