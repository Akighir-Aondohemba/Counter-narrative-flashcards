export const KINDS = ["Voter Response", "Definition", "Application", "Comparison", "Example"];

// Infer a card's type from how its question is worded, so users can filter by type.
// A question in quotation marks (or a stage direction in brackets) is something a voter says.
export function kindOf(question) {
  const s = question.toLowerCase();
  if (/^["“(]/.test(s)) return "Voter Response";
  if (/\b(difference|differ|compare|contrast|versus|vs\.?)\b/.test(s)) return "Comparison";
  if (/^give\b|\b(examples?|illustrate)\b/.test(s)) return "Example";
  if (/^how (much|many|long)\b/.test(s)) return "Definition";
  if (/^(how|why)\b/.test(s)) return "Application";
  return "Definition"; // what / who / when / which: definitions and key facts
}

// Label for a card's optional third column: the backup fact on voter responses, a tip otherwise.
export const noteLabel = (card) => (card.kind === "Voter Response" ? "If they push back" : "Note");

// Parse "Question<TAB>Answer[<TAB>Note]" lines. Returns valid cards and the 1-based numbers of bad lines.
export function parseTSV(text) {
  const cards = [];
  const bad = [];
  text.split(/\r?\n/).forEach((line, i) => {
    if (!line.trim()) return;
    const [q = "", a = "", ...rest] = line.split("\t").map((s) => s.trim());
    const note = rest.filter(Boolean).join(" ");
    if (q && a) cards.push(note ? { q, a, note, kind: kindOf(q) } : { q, a, kind: kindOf(q) });
    else bad.push(i + 1);
  });
  return { cards, bad };
}

export function toTSV(cards) {
  return cards.map((c) => [c.q, c.a, ...(c.note ? [c.note] : [])].join("\t")).join("\n");
}

// Turn a search box entry into one regex per term. Words match anywhere; "quoted phrases" match
// as a whole. Straight and curly quotes/apostrophes match each other.
export function searchTerms(query) {
  const terms = [...query.matchAll(/"([^"]+)"|“([^”]+)”|(\S+)/g)].map((m) => (m[1] || m[2] || m[3]).trim());
  return terms.filter(Boolean).map((t) => {
    const src = t
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/['‘’]/g, "['‘’]")
      .replace(/["“”]/g, '["“”]')
      .replace(/\s+/g, "\\s+");
    return new RegExp(src, "i");
  });
}

// Cards containing every search term in the question, answer, note or topic name.
export function searchCards(cards, query) {
  const terms = searchTerms(query);
  if (!terms.length) return [];
  return cards.filter((c) => {
    const text = [c.q, c.a, c.note, c.topic].filter(Boolean).join("\n");
    return terms.every((re) => re.test(text));
  });
}

export function shuffle(list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
