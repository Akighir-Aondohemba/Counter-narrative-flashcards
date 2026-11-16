import { parseTSV } from "../lib/cards.js";

// Built-in decks. To add one: drop a Question<TAB>Answer[<TAB>Note] .tsv file in this folder
// and add a line below with its file name and the topic name shown in the app.
// When the built-in cards were last checked against the research briefs. Update it with the cards.
export const CARDS_UPDATED = "2026-11-15";

const TOPICS = [
  ["why-vote-again", "Why Vote Again"],
  ["food-cost-of-living", "Food & Cost of Living"],
  ["fuel-subsidy-removal", "Fuel Subsidy Removal"],
  ["electricity", "Electricity"],
  ["security", "Security"],
  ["minimum-wage", "Minimum Wage"],
  ["new-tax-laws", "New Tax Laws"],
  ["my-state-lga", "My State & LGA"],
  ["regional-inclusion", "Regional Inclusion"],
  ["national-debt-borrowing", "National Debt & Borrowing"],
  ["youth-jobs-japa", "Youth, Jobs & Japa"],
  ["corruption-accountability", "Corruption & Accountability"],
  ["renewed-hope-promises", "Renewed Hope Promises"],
  ["judiciary-electoral-integrity", "Judiciary & Electoral Integrity"],
  ["personal-attacks", "Personal Attacks"],
  ["caller-technique", "Caller Technique"],
];

const files = import.meta.glob("./*.tsv", { query: "?raw", import: "default", eager: true });

export const builtInDecks = Object.fromEntries(
  TOPICS.map(([file, name]) => {
    const text = files[`./${file}.tsv`];
    if (text === undefined) throw new Error(`Deck file src/decks/${file}.tsv is missing`);
    return [name, parseTSV(text).cards];
  }),
);
