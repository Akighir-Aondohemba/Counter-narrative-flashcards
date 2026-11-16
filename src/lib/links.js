import { slug } from "./cards.js";

// Shareable links keep the selection in the address: ?topics=electricity,security&types=voter-response&q=wage&new=1
// Anything left at its default (all topics, all types, empty search, all cards) is left out.

export function readLink(search, topicNames, kindNames) {
  const p = new URLSearchParams(search);
  const pick = (key, names) => {
    if (!p.has(key)) return null;
    const wanted = new Set(p.get(key).split(",").filter(Boolean));
    const found = names.filter((n) => wanted.has(slug(n)));
    return found.length ? new Set(found) : null; // a link to nothing we know falls back to everything
  };
  return {
    topics: pick("topics", topicNames),
    kinds: pick("types", kindNames),
    query: p.get("q") || "",
    onlyNew: p.get("new") === "1",
  };
}

export function writeLink({ topics, kinds, query, onlyNew }, topicNames, kindNames) {
  const p = new URLSearchParams();
  const put = (key, set, names) => {
    if (names.every((n) => set.has(n))) return;
    p.set(key, names.filter((n) => set.has(n)).map(slug).join(","));
  };
  put("topics", topics, topicNames);
  put("types", kinds, kindNames);
  if (query.trim()) p.set("q", query.trim());
  if (onlyNew) p.set("new", "1");
  const s = p.toString().replace(/%2C/g, ",");
  return s ? `?${s}` : "";
}
