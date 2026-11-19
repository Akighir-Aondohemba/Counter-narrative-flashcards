# Counter-Narrative Flashcards

A React flashcard app for the voter-engagement and callers team. It gives fact-checked answers to common narratives about the Tinubu (PBAT) administration, and positive facts to share, in question-and-answer form.

287 cards in two collections:

**Counter-narratives:** 77 cards in 15 topics: Why Vote Again, Food & Cost of Living, Fuel Subsidy Removal, Electricity, Security, Minimum Wage, New Tax Laws, My State & LGA, National Debt & Borrowing, Youth, Jobs & Japa, Corruption & Accountability, Renewed Hope Promises, Judiciary & Electoral Integrity, Personal Attacks, and Caller Technique.

57 of them are **voter responses**: what a voter says, a 15-second reply, and a backup fact to use only if they push back.

**Did You Know?:** 76 positive-impact facts in 10 themes: Economy & Revenue, Agriculture & Food, Roads, Rail & Ports, Power, Oil, Mining & Water, Social Support & Housing, Youth, Skills & Digital, Security & Safety, Fighting Corruption, Services & Nigeria Abroad, and In Your Zone. Each has a question, the fact, why it matters to voters, and its source.

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

- The tabs at the top of **Choose what to study** switch between **Counter-narratives** and **Did You Know?**. Each has its own topics; card types apply to counter-narratives only.
- Did You Know cards are labelled "Impact fact": the question is on the front, and the back shows the fact, why it matters to voters and the source.
- On a counter-narrative card, **Back it up with a fact** offers a related positive fact, such as a power fact on an Electricity card, to share after the reply.

- **Search cards** finds words or phrases in every card's question, answer, note and code, across all topics. Separate words must all appear; put a phrase in quotes ("student loan") to match it exactly. Type a card code such as `F03` to jump to that card. Long answers are cut to three lines; **Read more** shows the full answer and its push-back fact. **Study these** starts a session with just the matches.
- Tap **Topics** or **Card types** (Voter Response, Definition, Application, Comparison, Example) to open a checklist and choose which cards to study. The checklist shows how many cards of each topic you've learned.
- Tap a card to show the answer. On voter responses, tap **If they push back** to show the backup fact. **Got it** removes the card from this session; **Review again** moves it to the back. On a phone you can swipe the card right for "Got it" or left for "Review again".
- **Copy reply** copies the answer, ready to paste into WhatsApp or SMS. **Copy fact** on Did You Know cards also copies why it matters and the source. **Read aloud** reads the card with the phone's built-in voice.
- The app remembers which cards you marked "Got it", on that phone or browser only. Turn on **Only cards I haven't learned** to skip them; **Reset** clears your progress.
- **Share this selection** shares a link that opens the app with the same topics, card types and search already chosen, e.g. `?topics=security&types=voter-response`.
- Cards that mention an upcoming deadline (such as "due 15 December 2026") show a warning once that date has passed, so callers check the fact before using it.
- Keyboard: Space flips the card, P shows the push-back fact, ← → move between cards, G is "Got it", R is "Review again".
- **Add or import a deck** takes pasted lines or a `.tsv` file. Cards added this way are saved only in that browser.
- **Export** copies or downloads the selected cards as tab-separated text.

### Offline and on the home screen

After the first visit, the app is saved on the phone and works without a connection, including search. To add it to the home screen: on Android, tap **Install app** in the header (or the browser menu, then **Add to Home screen**); on iPhone, tap Share, then **Add to Home Screen**. When the site is updated, the new version loads the next time the app is opened with a connection.

## Editing the cards

Each counter-narrative topic is a plain text file in `src/decks/`, and each Did You Know theme is one in `src/decks/did-you-know/`. Every line is one card: the question, a tab character, then the answer. An optional third column, after another tab, holds a note: the "If they push back" fact on voter responses, or a tip on study cards. An optional fourth column holds the card's code from the printed Voter Response Cards (such as `F03`); leave the third column empty if a coded card has no note. Did You Know cards use five columns: question, fact, why it matters, code (`DYK-E01`) and source. There are no headers or labels.

```
What is the BAT-O-METER?<TAB>The AdvoKC Foundation's tracker of Tinubu's campaign promises.
```

To add a topic, put a new `.tsv` file in the collection's folder and add its file name and display name to that collection's `topics` list in `src/decks/index.js`. `RELATED_FACTS` in the same file lists which Did You Know facts back up each counter-narrative topic.

When you change the cards, update `CARDS_UPDATED` in `src/decks/index.js`; the app shows it as "Cards updated …".

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
- PBAT Did You Know? Impact Cards (76 cards, research cut-off 15 November 2026)

The answers keep the documents' caveats, such as which allegations are unproven and which figures predate the administration. Keep those caveats when you edit cards.
