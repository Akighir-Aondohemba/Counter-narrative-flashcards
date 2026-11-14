export const KINDS = ["Definition", "Application", "Comparison", "Example"];

// Infer a card's type from how its question is worded, so users can filter by type.
export function kindOf(question) {
  const s = question.toLowerCase();
  if (/\b(difference|differ|compare|contrast|versus|vs\.?)\b/.test(s)) return "Comparison";
  if (/^give\b|\b(examples?|illustrate)\b/.test(s)) return "Example";
  if (/^how (much|many|long)\b/.test(s)) return "Definition";
  if (/^(how|why)\b/.test(s)) return "Application";
  return "Definition"; // what / who / when / which: definitions and key facts
}

// Parse "Question<TAB>Answer" lines. Returns valid cards and the 1-based numbers of bad lines.
export function parseTSV(text) {
  const cards = [];
  const bad = [];
  text.split(/\r?\n/).forEach((line, i) => {
    if (!line.trim()) return;
    const tab = line.indexOf("\t");
    const q = tab < 0 ? "" : line.slice(0, tab).trim();
    const a = tab < 0 ? "" : line.slice(tab + 1).trim();
    if (q && a) cards.push({ q, a, kind: kindOf(q) });
    else bad.push(i + 1);
  });
  return { cards, bad };
}

export function toTSV(cards) {
  return cards.map((c) => `${c.q}\t${c.a}`).join("\n");
}

export function shuffle(list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
