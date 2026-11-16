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

// Parse "Question<TAB>Answer[<TAB>Note[<TAB>Code]]" lines. The note may be empty when a code follows.
// Returns valid cards and the 1-based numbers of bad lines.
export function parseTSV(text) {
  const cards = [];
  const bad = [];
  text.split(/\r?\n/).forEach((line, i) => {
    if (!line.trim()) return;
    const [q = "", a = "", note = "", code = ""] = line.split("\t").map((s) => s.trim());
    if (!q || !a) return bad.push(i + 1);
    const card = { q, a, kind: kindOf(q) };
    if (note) card.note = note;
    if (code) card.code = code;
    cards.push(card);
  });
  return { cards, bad };
}

export function toTSV(cards) {
  return cards
    .map((c) => {
      const cols = [c.q, c.a];
      if (c.note || c.code) cols.push(c.note || "");
      if (c.code) cols.push(c.code);
      return cols.join("\t");
    })
    .join("\n");
}

// A stable id for remembering progress: the printed card code when there is one.
export const cardId = (c) => c.code || `${c.topic}|${c.q}`;

// "Food & Cost of Living" -> "food-cost-of-living", for links.
export const slug = (s) =>
  s.toLowerCase().replace(/&/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const MONTHS = "January|February|March|April|May|June|July|August|September|October|November|December";
const DEADLINE = new RegExp(
  `\\b(?:(?:is |are )?due(?: by| on)?|aiming to finish by|expected by)\\s+(?:(\\d{1,2})\\s+)?(${MONTHS})\\s+(\\d{4})`,
  "g",
);

// Upcoming deadlines a card states ("due 15 December 2026", "aiming to finish by December 2026")
// that are now before `today`, so the card may be out of date. Past dates told as history
// ("by April 2026", "deadline 29 May 2025") are not flagged.
// A month without a day counts as its last day. Returns the matched dates as written.
export function passedDeadlines(card, today = new Date()) {
  const text = [card.a, card.note].filter(Boolean).join(" ");
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const out = [];
  for (const m of text.matchAll(DEADLINE)) {
    const [, day, month, year] = m;
    const mi = MONTHS.split("|").indexOf(month);
    const date = day ? new Date(+year, mi, +day) : new Date(+year, mi + 1, 0);
    const label = `${day ? day + " " : ""}${month} ${year}`;
    if (date < start && !out.includes(label)) out.push(label);
  }
  return out;
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

// Cards containing every search term in the question, answer, note, topic name or card code.
export function searchCards(cards, query) {
  const terms = searchTerms(query);
  if (!terms.length) return [];
  return cards.filter((c) => {
    const text = [c.q, c.a, c.note, c.topic, c.code].filter(Boolean).join("\n");
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
