import { FACT, parseTSV } from "../lib/cards.js";

// When the built-in cards were last checked against the research briefs. Update it with the cards.
export const CARDS_UPDATED = "2026-11-19";

// Two collections, each with its own ordered topics. To add a topic: drop a
// Question<TAB>Answer[<TAB>Note[<TAB>Code[<TAB>Source]]] .tsv file in the collection's
// folder and add its file name and display name below.
export const COLLECTIONS = [
  {
    id: "replies",
    name: "Counter-narratives",
    blurb: "Replies to voters",
    folder: ".",
    topics: [
      ["why-vote-again", "Why Vote Again"],
      ["food-cost-of-living", "Food & Cost of Living"],
      ["fuel-subsidy-removal", "Fuel Subsidy Removal"],
      ["electricity", "Electricity"],
      ["security", "Security"],
      ["minimum-wage", "Minimum Wage"],
      ["new-tax-laws", "New Tax Laws"],
      ["my-state-lga", "My State & LGA"],
      ["national-debt-borrowing", "National Debt & Borrowing"],
      ["youth-jobs-japa", "Youth, Jobs & Japa"],
      ["corruption-accountability", "Corruption & Accountability"],
      ["renewed-hope-promises", "Renewed Hope Promises"],
      ["judiciary-electoral-integrity", "Judiciary & Electoral Integrity"],
      ["personal-attacks", "Personal Attacks"],
      ["caller-technique", "Caller Technique"],
    ],
  },
  {
    id: "facts",
    name: "Did You Know?",
    blurb: "Good-news facts",
    folder: "./did-you-know",
    kind: FACT,
    topics: [
      ["economy-revenue", "Economy & Revenue"],
      ["agriculture-food", "Agriculture & Food"],
      ["roads-rail-ports", "Roads, Rail & Ports"],
      ["power-oil-mining-water", "Power, Oil, Mining & Water"],
      ["social-support-housing", "Social Support & Housing"],
      ["youth-skills-digital", "Youth, Skills & Digital"],
      ["security-safety", "Security & Safety"],
      ["fighting-corruption", "Fighting Corruption"],
      ["services-nigeria-abroad", "Services & Nigeria Abroad"],
      ["in-your-zone", "In Your Zone"],
    ],
  },
];

// "Did You Know?" facts (by code) that back up each counter-narrative topic with good news.
// A card shows one of its topic's facts; topics with none listed show none.
export const RELATED_FACTS = {
  "Why Vote Again": ["E01", "E02", "E03", "E06", "E09"],
  "Food & Cost of Living": ["A01", "A02", "A03", "A04", "A06"],
  "Fuel Subsidy Removal": ["E01", "E02", "E05", "P06"],
  Electricity: ["P03", "P05", "P07", "P08", "P09"],
  Security: ["S01", "S02", "S03", "S05", "S06"],
  "Minimum Wage": ["E02", "H01"],
  "New Tax Laws": ["E03", "E04", "E06"],
  "My State & LGA": ["E02", "E05", "Y06"],
  "National Debt & Borrowing": ["E01", "E03", "E04", "E05"],
  "Youth, Jobs & Japa": ["Y01", "Y02", "Y03", "Y09", "H06"],
  "Corruption & Accountability": ["C01", "C02", "C03", "C04", "C05", "C06"],
  "Renewed Hope Promises": ["A01", "H06", "N01", "R01"],
};

const files = import.meta.glob(["./*.tsv", "./did-you-know/*.tsv"], { query: "?raw", import: "default", eager: true });

// Topic name -> cards, for every built-in topic in both collections.
export const builtInDecks = {};
// Topic name -> collection id.
export const topicCollection = {};

for (const col of COLLECTIONS) {
  for (const [file, name] of col.topics) {
    const path = `${col.folder}/${file}.tsv`;
    const text = files[path];
    if (text === undefined) throw new Error(`Deck file src/decks/${path.slice(2)} is missing`);
    builtInDecks[name] = parseTSV(text, { kind: col.kind }).cards;
    topicCollection[name] = col.id;
  }
}
