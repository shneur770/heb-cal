# heb-cal

Hebrew Date & Parsha web app. Displays today's Hebrew date, weekly Torah portion, and holidays — with a "Go to Date" picker to explore any date in history.

## Features

- Hebrew date in English transliteration and gematriya
- Weekly parsha with Torah book reference
- Holiday display
- Go-to-date picker (any Gregorian date, year 1–9999)
- "Today" button to return to the current date
- Dark/gold aesthetic with animated starfield
- Full keyboard accessibility

## Setup

```bash
npm install
npm run dev
```

## Stack

- Vanilla JS + Vite
- [@hebcal/core](https://github.com/hebcal/hebcal-es6) for Hebrew calendar calculations
- Vitest + fast-check for testing
