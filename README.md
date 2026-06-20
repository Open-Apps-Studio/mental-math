# OpenMath

OpenMath is a fast mental arithmetic trainer built with Expo and React Native.
It is inspired by the product shape of apps like "Mental Math Games: FastMath"
without copying their branding, screenshots, or assets.

## Features

Five tabs, modeled on FastMath's structure:

- **Tests** – a daily 60-second challenge plus preset timed tests (sprints,
  marathon, per-operation, hard mixed) that track best scores.
- **Trainer** – Standard/Custom modes. Pick a number domain (Times tables,
  Natural, Decimal, Money, Huge), select one or more exercises, set per-exercise
  difficulty (Easy → Super hard) via the signal-bar indicator, then START.
- **Knowledge** – a library of mental-math tricks grouped by operation
  (addition, subtraction, multiplication, division, squares) with step-by-step
  walk-throughs, worked examples, and local favorites.
- **Progress** – totals, accuracy, best run, daily streak, and recent rounds.
- **Settings** – light/dark/system theme, haptics & sound, about.

Everything is **free** — no Pro tier, paywall, or locked content. Exercises cover
addition, subtraction, multiplication, division, squares, square roots,
fractions, percentages, and modulo. The session screen uses an on-screen numeric
keypad with haptic answer feedback.

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
npm run web
npm start
```

## App Store / Release Notes

This repo is intentionally private under `Open-Apps-Studio` for now, but should
remain clean enough to open source later.

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

OpenMath is **fully free** — no accounts, no paywall, no locked content.
Possible future additions (all intended to stay free):

- richer custom trainer builder
- exam-prep challenge sets
- Game Center leaderboards
- deeper progress analytics
