// Wraps every match of the search terms in <mark>.
export default function Highlight({ text, terms }) {
  if (!terms.length || !text) return text || null;
  const re = new RegExp(terms.map((t) => `(?:${t.source})`).join("|"), "gi");
  const out = [];
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (!m[0]) continue;
    out.push(text.slice(last, m.index), <mark key={m.index}>{m[0]}</mark>);
    last = m.index + m[0].length;
  }
  out.push(text.slice(last));
  return out;
}
