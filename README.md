# Rapid Math

Rapid Math is a fast mental arithmetic trainer built with Expo and React Native.
It is inspired by the product shape of apps like "Mental Math Games: FastMath"
without copying their branding, screenshots, or assets.

## MVP

- One-minute timed drills
- Unlimited practice mode
- Addition, subtraction, multiplication, division, mixed, squares, and percent drills
- Numeric keypad optimized for quick answers
- Local progress, best scores, accuracy, streaks, and recent rounds
- Mental math tips and shortcuts
- Expo Router tabs: Today, Train, Stats, Tips

## Tech Stack

- Expo SDK 56
- React Native 0.85
- TypeScript
- Expo Router
- AsyncStorage for local stats
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

The clean launch version should be free and useful without accounts. Later
options:

- custom trainer builder
- fractions and roots packs
- exam-prep challenge sets
- Game Center leaderboards
- optional subscription for advanced analytics and extra modes
