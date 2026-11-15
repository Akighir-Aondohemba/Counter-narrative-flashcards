# Counter-Narrative Flashcards

A React flashcard app for the voter-engagement and callers team. It gives fact-checked answers to common narratives about the Tinubu (PBAT) administration, in question-and-answer form.

211 cards in 16 topics: Why Vote Again, Food & Cost of Living, Fuel Subsidy Removal, Electricity, Security, Minimum Wage, New Tax Laws, My State & LGA, Regional Inclusion, National Debt & Borrowing, Youth, Jobs & Japa, Corruption & Accountability, Renewed Hope Promises, Judiciary & Electoral Integrity, Personal Attacks, and Caller Technique.

57 of them are **voter responses**: what a voter says, a 15-second reply, and a backup fact to use only if they push back.

**Live app:** https://akighir-aondohemba.github.io/Counter-narrative-flashcards/

Every push to `main` rebuilds and redeploys the site through GitHub Actions (`.github/workflows/deploy-pages.yml`).

## Run it

You need [Node.js](https://nodejs.org) 18 or later.

```bash
npm install
npm run dev
```

Then open the address it prints (usually http://localhost:5173).

| Command | What it does |
|---|---|
| `npm run dev` | Starts the app locally and reloads it as you edit |
| `npm test` | Runs the tests |
| `npm run build` | Builds a static site into `dist/` that you can host anywhere, such as GitHub Pages or Netlify |
| `npm run preview` | Serves the built `dist/` folder locally |

## Using the app

- **Search cards** finds words or phrases in every card's question, answer and note, across all topics. Separate words must all appear; put a phrase in quotes ("student loan") to match it exactly. **Study these** starts a session with just the matches.
- Tap topics and card types (Voter Response, Definition, Application, Comparison, Example) to choose which cards to study.
- Tap a card to show the answer. **Got it** removes the card from this session; **Review again** moves it to the back.
- Keyboard: Space flips the card, ← → move between cards, G is "Got it", R is "Review again".
- **Add or import a deck** takes pasted lines or a `.tsv` file. Cards added this way are saved only in that browser.
- **Export** copies or downloads the selected cards as tab-separated text.

## Editing the cards

Each topic is a plain text file in `src/decks/`. Every line is one card: the question, a tab character, then the answer. An optional third column, after another tab, holds a note: the "If they push back" fact on voter responses, or a tip on study cards. There are no headers, labels or numbers.

```
What is the BAT-O-METER?<TAB>The AdvoKC Foundation's tracker of Tinubu's campaign promises.
```

To add a topic, put a new `.tsv` file in `src/decks/` and add its file name and display name to the `TOPICS` list in `src/decks/index.js`.

A card's type is worked out from how its question starts. A question in quotation marks (what a voter says) or in brackets (a situation, such as an angry voter) is a Voter Response. "What is the difference…" is Comparison, "Give an example…" is Example, "How…" and "Why…" are Application, and everything else is Definition.

## Sources

The cards are drawn from the team's research documents (November 2026):

- The most frequent negative narratives about the Tinubu administration (national debt)
- Nigeria Fuel Subsidy Removal Research Brief
- Public Accountability and Corruption Allegations Under President Bola Ahmed Tinubu
- Regional Inclusion Brief (Loro)
- Renewed Hope 2023 Promise Verification Report
- Youth and Japa narrative brief
- Voter Engagement Playbook: Judicial Trust & Electoral Integrity
- PBAT Voter Response Cards (77 cards, research cut-off 15 November 2026)

The answers keep the documents' caveats, such as which allegations are unproven and which figures predate the administration. Keep those caveats when you edit cards.
