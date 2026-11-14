import { parseTSV } from "../lib/cards.js";

// Built-in decks. To add one: drop a Question<TAB>Answer .tsv file in this folder
// and add a line below with its file name and the topic name shown in the app.
const TOPICS = [
  ["national-debt-borrowing", "National Debt & Borrowing"],
  ["fuel-subsidy-removal", "Fuel Subsidy Removal"],
  ["corruption-accountability", "Corruption & Accountability"],
  ["regional-inclusion", "Regional Inclusion"],
  ["renewed-hope-promises", "Renewed Hope Promises"],
  ["youth-jobs-japa", "Youth, Jobs & Japa"],
  ["judiciary-electoral-integrity", "Judiciary & Electoral Integrity"],
];

const files = import.meta.glob("./*.tsv", { query: "?raw", import: "default", eager: true });

export const builtInDecks = Object.fromEntries(
  TOPICS.map(([file, name]) => {
    const text = files[`./${file}.tsv`];
    if (text === undefined) throw new Error(`Deck file src/decks/${file}.tsv is missing`);
    return [name, parseTSV(text).cards];
  }),
);
