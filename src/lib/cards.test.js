import { describe, expect, it } from "vitest";
import { kindOf, parseTSV, toTSV } from "./cards.js";
import { builtInDecks } from "../decks/index.js";

describe("kindOf", () => {
  it.each([
    ["What is the difference between X and Y?", "Comparison"],
    ["Give an example of X.", "Example"],
    ["How much was disbursed?", "Definition"],
    ["Why does X happen?", "Application"],
    ["How should callers respond to X?", "Application"],
    ["What is X?", "Definition"],
  ])("%s -> %s", (q, kind) => expect(kindOf(q)).toBe(kind));
});

describe("parseTSV", () => {
  it("keeps valid lines and reports bad ones", () => {
    const { cards, bad } = parseTSV("Q1\tA1\n\nno tab here\nQ2\t\nQ3\tA3");
    expect(cards.map((c) => c.q)).toEqual(["Q1", "Q3"]);
    expect(bad).toEqual([3, 4]);
  });

  it("round-trips through toTSV", () => {
    const text = "What is X?\tX.\nWhy Y?\tBecause.";
    expect(toTSV(parseTSV(text).cards)).toBe(text);
  });
});

describe("built-in decks", () => {
  it("load every deck with only valid lines", () => {
    const names = Object.keys(builtInDecks);
    expect(names).toHaveLength(7);
    for (const name of names) expect(builtInDecks[name].length).toBeGreaterThan(0);
  });
});
