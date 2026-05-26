# Levelshift Intelligence

Your team's daily briefing — AI-curated, editorial quality, beautiful on any screen.

## Stack

- **Next.js 15** — App Router, React Server Components
- **Claude API** — content curation and summarisation engine
- **OpenAI TTS** — article audio (GPT `tts-1`, Nova voice)
- **Tailwind CSS** — styling
- **Playfair Display + IBM Plex** — editorial typography

## Setup

### 1. Install dependencies

```bash
npm install @anthropic-ai/sdk openai framer-motion clsx
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in:
- `ANTHROPIC_API_KEY` — from console.anthropic.com
- `OPENAI_API_KEY` — from platform.openai.com

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── briefing/route.js   ← Claude content engine
│   │   └── audio/route.js      ← GPT TTS
│   ├── layout.js               ← Fonts + metadata
│   └── page.js                 ← Main feed
├── components/
│   ├── feed/
│   │   ├── LeadStory.js        ← Hero article
│   │   ├── AIDigest.js         ← Claude synthesis block
│   │   └── StoryRow.js         ← Feed item
│   ├── layout/
│   │   ├── Masthead.js         ← Header + beat nav
│   │   └── AudioRail.js        ← Persistent audio player
│   └── ui/
│       └── ThemeProvider.js    ← Dark/light toggle
└── styles/
    └── globals.css             ← Full design system
```

## How the content engine works

1. Every hour, `/api/briefing` fetches RSS feeds from TechCrunch, The Verge, Wired, Marketing Week, Hacker News, and Product Hunt
2. Claude reads all articles and selects the 6 most relevant for the marketing team
3. Claude writes editorial headlines (with italic emphasis), decks, and the AI digest
4. The feed updates on each page load (1h cache)

## Roadmap

- [ ] Supabase persistence (saved articles, read state)
- [ ] NextAuth SSO
- [ ] MS Teams daily digest webhook
- [ ] ElevenLabs TTS upgrade
- [ ] Article detail view
- [ ] Push notifications
- [ ] Admin dashboard