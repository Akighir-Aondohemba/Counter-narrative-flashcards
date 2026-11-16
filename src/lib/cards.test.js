import { describe, expect, it } from "vitest";
import { cardId, kindOf, parseTSV, passedDeadlines, searchCards, slug, toTSV } from "./cards.js";
import { readLink, writeLink } from "./links.js";
import { speakable } from "./device.js";
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

  it("reads a card code in the fourth column, with or without a note", () => {
    const { cards } = parseTSV("Q1\tA1\tNote\tF01\nQ2\tA2\t\tT04");
    expect(cards[0]).toMatchObject({ note: "Note", code: "F01" });
    expect(cards[1]).toMatchObject({ code: "T04" });
    expect(cards[1].note).toBeUndefined();
  });

  it("round-trips through toTSV", () => {
    const text = "What is X?\tX.\nWhy Y?\tBecause.\tA note.\nQ\tA\t\tT04\nQ2\tA2\tN\tF01";
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

  it("give all 77 voter response cards a unique code", () => {
    const codes = Object.values(builtInDecks).flat().map((c) => c.code).filter(Boolean);
    expect(codes).toHaveLength(77);
    expect(new Set(codes).size).toBe(77);
  });

  it("flag no passed deadlines as of the last content update", () => {
    const stale = Object.values(builtInDecks).flat().filter((c) => passedDeadlines(c, new Date(2026, 10, 15)).length);
    expect(stale).toEqual([]);
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
  it("finds cards by code", () => {
    const coded = [...cards, { q: "Q", a: "A", code: "F03", topic: "Fuel" }];
    expect(searchCards(coded, "f03")).toEqual([coded[2]]);
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

describe("passedDeadlines", () => {
  const card = { a: "The final register is due 15 December 2026.", note: "Lawmakers are aiming to finish by December 2026." };
  it("ignores deadlines still ahead", () => expect(passedDeadlines(card, new Date(2026, 10, 16))).toEqual([]));
  it("treats a month on its own as its last day", () =>
    expect(passedDeadlines(card, new Date(2026, 11, 20))).toEqual(["15 December 2026"]));
  it("flags both once they pass", () =>
    expect(passedDeadlines(card, new Date(2027, 0, 2))).toEqual(["15 December 2026", "December 2026"]));
  it("ignores past dates told as history", () =>
    expect(passedDeadlines({ a: "15 states had taken control by April 2026 (deadline 29 May 2025)." }, new Date(2027, 0, 1))).toEqual([]));
});

describe("ids and slugs", () => {
  it("prefer the printed code", () => {
    expect(cardId({ code: "W01", q: "Q", topic: "T" })).toBe("W01");
    expect(cardId({ q: "Q", topic: "T" })).toBe("T|Q");
  });
  it("slug topic names", () => expect(slug("Youth, Jobs & Japa")).toBe("youth-jobs-japa"));
});

describe("shareable links", () => {
  const topics = ["Electricity", "Security", "Food & Cost of Living"];
  const kinds = ["Voter Response", "Definition"];
  it("leave defaults out", () =>
    expect(writeLink({ topics: new Set(topics), kinds: new Set(kinds), query: "", onlyNew: false }, topics, kinds)).toBe(""));
  it("round-trip a selection", () => {
    const state = { topics: new Set(["Electricity", "Food & Cost of Living"]), kinds: new Set(["Voter Response"]), query: "wage bill", onlyNew: true };
    const link = writeLink(state, topics, kinds);
    expect(link).toBe("?topics=electricity,food-cost-of-living&types=voter-response&q=wage+bill&new=1");
    expect(readLink(link, topics, kinds)).toEqual(state);
  });
  it("fall back to everything for unknown names", () => {
    expect(readLink("?topics=nothing", topics, kinds).topics).toBeNull();
  });
});

describe("speakable", () => {
  it("reads currency the way people say it", () =>
    expect(speakable("₦1.93 trillion, ₦70,000, ₦15.8tn and $50bn.")).toBe(
      "1.93 trillion naira, 70,000 naira, 15.8 trillion naira and 50 billion dollars.",
    ));
});
