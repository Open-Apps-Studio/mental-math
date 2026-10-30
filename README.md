# (Open Source) Mental Math

Mental Math is a free, open-source mental arithmetic trainer built with Expo
and React Native, by [Open Apps Studio](https://github.com/Open-Apps-Studio).
It is inspired by the product shape of apps like "Mental Math Games: FastMath"
without copying their branding, screenshots, or assets.

## Features

Five tabs, modeled on FastMath's structure:

- **Tests** – a daily 60-second challenge plus preset timed tests (sprint,
  marathon, per-operation, hard mixed) at any of four difficulty levels, each
  tracking its best score, plus a Magic Square number puzzle.
- **Trainer** – Standard/Custom modes. Pick a number domain (Times tables,
  Natural, Decimal, Money, Huge), select one or more exercises, set per-exercise
  difficulty (Easy → Super hard) via the signal-bar indicator, choose a round
  length (30s, 1 min, 2 min, or no limit), then START.
- **Knowledge** – a library of mental-math tricks grouped by operation
  (addition, subtraction, multiplication, division, squares) with step-by-step
  walk-throughs, worked examples, and local favorites. Every trick has a
  60-second drill that practices exactly that trick.
- **Progress** – totals, accuracy, best run, daily streak, longest streak, a
  last-7-days activity strip, and recent rounds.
- **Settings** – light/dark/system theme, haptics, about.

Everything is **free** — no Pro tier, paywall, or locked content. Exercises cover
addition, subtraction, multiplication, division, squares, square roots,
fractions, percentages, and modulo. The session screen uses an on-screen numeric
keypad with haptic answer feedback; answers score the moment they are correct,
and Skip moves past a question, shows its answer, and lists it for review on the
results screen.

## Tech Stack

- Expo SDK 56 + Expo Router (typed routes, React Compiler enabled)
- React Native 0.85
- TypeScript
- AsyncStorage for local stats, settings, and favorites
- `useSyncExternalStore` for lightweight global stores (no extra deps)
- Expo Haptics for answer feedback

## Commands

```bash
npm install
npm run typecheck
npm test
npm run web
npm start
```

Tests live next to the code they cover (`*.test.ts`). Keep them out of `app/`,
where Expo Router would treat them as routes.

## App Store / Release Notes

Do not commit local credentials:

- `.env` / `.env.*`
- Apple `.p8` keys
- certificates or provisioning profiles
- EAS submit API key paths, issuer IDs, or key IDs
- Superwall/API keys

`eas.json` is release-aware but does not include private App Store Connect
credentials. Use the credentials already configured on Ahmet's Mac when doing
real builds/submissions.

## Product Direction

Mental Math is **fully free** — no accounts, no paywall, no locked content.
Possible future additions (all intended to stay free):

- richer custom trainer builder
- exam-prep challenge sets
- Game Center leaderboards
- deeper progress analytics
