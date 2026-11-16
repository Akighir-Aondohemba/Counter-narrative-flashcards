import { describe, expect, it } from "vitest";
import { kindOf, parseTSV, searchCards, toTSV } from "./cards.js";
import { builtInDecks } from "../decks/index.js";

describe("kindOf", () => {
  it.each([
    ["What is the difference between X and Y?", "Comparison"],
    ["Give an example of X.", "Example"],
    ["How much was disbursed?", "Definition"],
    ["Why does X happen?", "Application"],
    ["How should callers respond to X?", "Application"],
    ["What is X?", "Definition"],
    ["“Why should I vote for him again?”", "Voter Response"],
    ["(Voter is shouting or very angry.)", "Voter Response"],
  ])("%s -> %s", (q, kind) => expect(kindOf(q)).toBe(kind));
});

describe("parseTSV", () => {
  it("keeps valid lines and reports bad ones", () => {
    const { cards, bad } = parseTSV("Q1\tA1\n\nno tab here\nQ2\t\nQ3\tA3");
    expect(cards.map((c) => c.q)).toEqual(["Q1", "Q3"]);
    expect(bad).toEqual([3, 4]);
  });

  it("reads an optional third column as a note", () => {
    const { cards } = parseTSV("Q\tA\tBackup fact");
    expect(cards[0]).toMatchObject({ q: "Q", a: "A", note: "Backup fact" });
  });

  it("round-trips through toTSV", () => {
    const text = "What is X?\tX.\nWhy Y?\tBecause.\tA note.";
    expect(toTSV(parseTSV(text).cards)).toBe(text);
  });
});

describe("built-in decks", () => {
  it("load every deck with only valid lines", () => {
    const names = Object.keys(builtInDecks);
    expect(names).toHaveLength(16);
    for (const name of names) expect(builtInDecks[name].length).toBeGreaterThan(0);
    expect(names.reduce((n, name) => n + builtInDecks[name].length, 0)).toBe(211);
  });
});

describe("searchCards", () => {
  const cards = [
    { q: "“I can't feed my family.”", a: "Food prices rose.", topic: "Food" },
    { q: "What is NELFUND?", a: "The student loan fund.", note: "1.6m loans", topic: "Youth" },
  ];
  it("matches every word, in any field, ignoring case", () => {
    expect(searchCards(cards, "STUDENT 1.6m")).toEqual([cards[1]]);
    expect(searchCards(cards, "student food")).toEqual([]);
  });
  it("matches quoted phrases and straight or curly apostrophes", () => {
    expect(searchCards(cards, '"loan fund"')).toEqual([cards[1]]);
    expect(searchCards(cards, '"fund loan"')).toEqual([]);
    expect(searchCards(cards, "can’t")).toEqual([cards[0]]);
  });
  it("searches topic names and returns nothing for an empty query", () => {
    expect(searchCards(cards, "youth")).toEqual([cards[1]]);
    expect(searchCards(cards, "   ")).toEqual([]);
  });
});

describe("picker summary", async () => {
  const { summary } = await import("../components/FilterPicker.jsx");
  const items = ["A", "B", "C", "D"].map((label) => ({ label, count: 1 }));
  it.each([
    [["A", "B", "C", "D"], "All 4"],
    [[], "None"],
    [["B"], "B"],
    [["A", "C"], "A, C"],
    [["A", "B", "C"], "3 of 4"],
  ])("%j -> %s", (on, text) => expect(summary(items, new Set(on))).toBe(text));
});
