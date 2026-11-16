# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm install`, then `npm run dev` to run locally (Vite).
- `npm test` runs Vitest once. Run a single test by name: `npx vitest run -t "parseTSV"`.
- `npm run build` outputs a static site to `dist/`. `vite.config.js` sets `base: "./"` so the build works from any subpath, such as GitHub Pages.

## Architecture

A React 18 + Vite single-page app in plain JavaScript (JSX), with no TypeScript, router or state library.

- **Card content lives in `src/decks/*.tsv`**, one card per line as `Question<TAB>Answer`, with an optional third `<TAB>Note` column (the "If they push back" fact on voter responses). `src/decks/index.js` loads them with `import.meta.glob(..., { query: "?raw" })` and maps each file to its display name through the ordered `TOPICS` list. A new `.tsv` file also needs an entry in `TOPICS`, or it throws at load time if listed but missing.
- **`src/lib/cards.js`** has the pure logic: `parseTSV` (returns valid cards and the line numbers of bad lines), `toTSV`, `shuffle`, `searchCards`, and `kindOf`. `kindOf` infers a card's type (Voter Response, Definition, Application, Comparison, Example) from the question's wording with regexes. A question starting with a quotation mark or `(` is a Voter Response. Phrase other questions to match it: "What is the difference…", "Give an example…", "How/Why…". "How much/many" counts as Definition.
- **`src/App.jsx`** holds all state: the selected topics and kinds (as Sets), the shuffle flag, and the current study session. Decks users add in the UI are stored in `localStorage` under `cn-flashcards-decks-v1` as `{ topic: tsvText }` and merged over the built-in decks. Every storage access is wrapped in try/catch.
- **`SearchPanel`** searches every card in every topic (all words must match; quoted phrases match whole), ignoring the topic and type filters.
- **`FilterPicker`** is the Topics / Card types button; it opens a native `<dialog>` checklist (a bottom sheet on phones).
- **`StudySession`** is remounted through a `key` for each new session, and owns its own queue. "Got it" removes the current card; "Review again" moves it to the end. The note (push-back fact) starts collapsed on every card.

## Content rules

The cards come from the team's research briefs (listed in README.md). Answers must stay accurate to those sources and keep their caveats. For example: allegations aren't convictions; the NDDC ₦6tn covers 2000–2019; the appointment list was withdrawn; the Second Niger Bridge was completed before this administration. Don't add figures that aren't in the sources.
