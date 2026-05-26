# CLAUDE.md — Levelshift Intelligence Briefing Agent

This file is the authoritative context document for Claude Code.
Read it fully before touching any file.

---

## What this project is

**Levelshift Intelligence** is an internal daily briefing app for the Levelshift marketing team.
It fetches live articles from credible tech and marketing sources, uses Claude to curate and
summarise them editorially, and presents them in a beautiful mobile-first reading experience
with GPT text-to-speech audio playback.

Think: NYT morning briefing meets Bloomberg Terminal, built for a marketing team.

---

## Tech stack

| Layer        | Choice                          | Why                                      |
|--------------|---------------------------------|------------------------------------------|
| Framework    | Next.js 15, App Router          | SSR, API routes, one repo                |
| Language     | JavaScript (no TypeScript)      | Team preference                          |
| Styling      | Tailwind CSS v4 + CSS variables | Design system lives in globals.css       |
| AI — content | Anthropic Claude API (Sonnet)   | Curates + summarises articles            |
| AI — audio   | OpenAI TTS (`tts-1`, nova)      | Reads articles aloud. ElevenLabs later.  |
| Fonts        | Playfair Display + IBM Plex     | Editorial serif + information sans       |
| Deploy       | Vercel                          | Zero config, already connected           |
| DB (pending) | Supabase                        | Not wired yet — see roadmap              |
| Auth (pending)| NextAuth.js                    | Not wired yet — see roadmap              |

---

## Project structure

```
levelshift-briefing/
├── CLAUDE.md                          ← you are here
├── README.md
├── tailwind.config.js                 ← custom font vars + accent colour
├── postcss.config.js                  ← leave untouched (auto-generated)
├── .env.local                         ← secrets (never commit)
├── .env.example                       ← template for new devs
└── src/
    ├── app/
    │   ├── globals.css                ← ENTIRE design system (tokens, components, animations)
    │   ├── layout.js                  ← root layout, font loading
    │   ├── page.js                    ← home feed (main entry point)
    │   └── api/
    │       ├── briefing/route.js      ← Claude content engine (GET)
    │       └── audio/route.js         ← GPT TTS endpoint (POST)
    └── components/
        ├── feed/
        │   ├── LeadStory.js           ← hero article card
        │   ├── AIDigest.js            ← Claude synthesis pull-quote block
        │   └── StoryRow.js            ← individual article in feed list
        ├── layout/
        │   ├── Masthead.js            ← sticky header, beat nav, theme toggle
        │   └── AudioRail.js           ← persistent audio player (mobile fixed, desktop sidebar)
        └── ui/
            └── ThemeProvider.js       ← dark/light context + localStorage persistence
```

---

## Design system — read before writing any CSS

**Never** introduce new colours, fonts, or spacing outside of the CSS variable system.
All design tokens live in `src/app/globals.css` under `:root`, `[data-theme="dark"]`, and `[data-theme="light"]`.

### Colour tokens

```
--bg           Main background
--bg-2         Slightly elevated surface (audio rail, cards)
--bg-3         Higher surface (progress track)
--bg-hover     Hover state background

--text         Primary text  (#F5F0E8 dark / #0E0E0F light)
--text-muted   Secondary text
--text-dim     Tertiary / metadata text

--accent       #C8973A amber — used ONLY for: kickers, live dot, listen button, audio bar, AI digest border
--accent-dim   Accent at 12% opacity (button background)
--accent-border Accent at 25% opacity (button border)

--rule         Divider lines (7% opacity)
--rule-strong  Stronger divider (14% opacity)
```

### Typography rules

- **Headlines** → `font-playfair` (Playfair Display), weights 700/900
- **Body / UI** → `font-sans` (IBM Plex Sans), weight 300 (light) for copy, 400/500 for labels
- **Metadata / labels / kickers** → `font-mono` (IBM Plex Mono), 8–10px, `letter-spacing: 0.12–0.2em`, uppercase
- Italic `<em>` tags inside headlines are intentional editorial style — preserve them
- Use `.text-kicker` class for category labels above headlines
- Use `.text-label` class for timestamps, sources, metadata

### CSS utility classes (defined in globals.css — use these, don't reinvent)

```
.text-kicker      mono, 9px, uppercase, letter-spaced, accent colour
.text-label       mono, 9px, uppercase, letter-spaced, dim colour
.text-body        sans, 15px, light, muted colour
.rule-kicker      flex row with amber line before kicker text
.digest-quote     amber left-border pull quote block
.btn-listen       amber ghost button with wave animation
.btn-ghost        transparent text button
.story-row        hover state for article rows
.skeleton         shimmer loading placeholder
.animate-feed     staggered fade-up on feed children
.scroll-hide      hides scrollbar cross-browser
.live-dot         pulsing amber dot
.wave-bar         animated audio wave bar (4 needed per group)
.progress-track   audio progress bar track
.progress-fill    audio progress bar fill (set width via inline style %)
.beat-pill        beat navigation button (add .active for selected state)
```

### Layout breakpoints

- **Mobile** (default): single column, max-width 430px shell
- **Desktop** (md: 768px+): `.desktop-grid` activates → two columns (main + 340px sidebar)
- **Wide** (lg: 1200px+): sidebar expands to 380px, max-width 1260px

Always write mobile-first. Desktop styles use `md:` and `lg:` Tailwind prefixes.

---

## API routes

### `GET /api/briefing?beat=all`

The Claude content engine. Call this to get the day's curated articles.

**Query params:**
- `beat` — `all` | `competitors` | `ai tools` | `campaigns` | `trends`

**Response shape:**
```json
{
  "articles": [
    {
      "id": "unique-slug",
      "headline": "Headline with <em>italicised phrase</em>",
      "deck": "Why this matters in 1–2 sentences.",
      "category": "Competitor Move | AI Tool | Industry Trend | Campaign Intel | Research | New Tool",
      "source": "TechCrunch",
      "url": "https://...",
      "timeAgo": "2h ago",
      "readTime": "3 min",
      "isLead": true
    }
  ],
  "digest": {
    "summary": "HTML string with <strong> tags",
    "detail": "HTML string expanding on summary",
    "watchFor": "Plain text — one thing to watch"
  },
  "fetchedAt": "2025-05-26T09:00:00.000Z",
  "sourceCount": 48
}
```

**Caching:** `next: { revalidate: 3600 }` on each RSS fetch — refreshes hourly.

**Sources currently configured:**
- TechCrunch RSS
- The Verge RSS
- Wired RSS
- Marketing Week RSS
- Hacker News frontpage RSS
- Product Hunt RSS

### `POST /api/audio`

Converts article text to speech via OpenAI TTS.

**Request body:**
```json
{
  "text": "Headline. Deck copy.",
  "articleId": "unique-slug"
}
```

**Response:** `audio/mpeg` binary stream (MP3)

**Config:** model `tts-1`, voice `nova`, speed `0.95`
Cache-Control set to 24h — same article won't re-generate.

---

## Component API reference

### `<Masthead articleCount onBeatChange />`
- `articleCount` — number, shows in live pill
- `onBeatChange(beat)` — callback when user taps a beat pill

### `<LeadStory article onListen onSave />`
- `article` — full article object from API + `saved: boolean`
- `onListen(article)` — triggers audio playback
- `onSave(article)` — toggles saved state

### `<AIDigest digest isLoading />`
- `digest` — digest object from API
- `isLoading` — shows skeleton when true

### `<StoryRow article index onListen onSave isPlaying />`
- `index` — display number (01, 02, etc.)
- `isPlaying` — shows animated wave bars instead of play button

### `<AudioRail article onClose />`
- Manages its own audio element and playback state
- Fetches audio from `/api/audio` when `article` prop changes
- Renders fixed on mobile, inline on desktop sidebar
- `onClose()` — hides the player

### `<ThemeProvider>` + `useTheme()`
- Wraps the entire app in `src/app/page.js`
- Sets `data-theme="dark"` or `data-theme="light"` on `<html>`
- Persists to `localStorage` key `ls-theme`
- `useTheme()` returns `{ theme, toggle }`

---

## Environment variables

```bash
# Required now
ANTHROPIC_API_KEY=sk-ant-...     # Claude API — content engine
OPENAI_API_KEY=sk-...            # OpenAI TTS — audio

# Required later (not yet wired)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
TEAMS_WEBHOOK_URL=
```

---

## State management

No external state library. All state lives in `src/app/page.js`:

```
articles      []          — curated articles from API
digest        {}|null     — AI synthesis object
loading       bool        — feed loading state
error         str|null    — error message
activeBeat    str         — selected beat pill
playingArticle {}|null    — article currently in audio player
savedIds      Set         — saved article IDs (persisted to localStorage)
```

`localStorage` keys:
- `ls-saved` — JSON array of saved article ID strings
- `ls-theme` — `"dark"` or `"light"`

---

## Roadmap — what to build next (in order)

### 1. Article detail view — `src/app/article/[id]/page.js`
- Full article read view
- Large Playfair headline, full body text
- Audio player at top
- Related articles at bottom
- Back navigation to feed
- Share button (copy URL)

### 2. Supabase persistence
- Install: `npm install @supabase/supabase-js`
- Create client at `src/lib/supabase.js`
- Tables needed:
  - `articles` — cached curated articles (id, headline, deck, category, source, url, created_at)
  - `saved_articles` — (user_id, article_id, saved_at)
  - `read_articles` — (user_id, article_id, read_at)
- Move `savedIds` from localStorage → Supabase once auth is wired

### 3. NextAuth SSO — `src/app/api/auth/[...nextauth]/route.js`
- Install: `npm install next-auth`
- Use Microsoft Azure AD provider (org uses MS Teams)
- Protect `/api/briefing` and `/api/audio` with session check
- Show user name in Masthead avatar

### 4. MS Teams daily digest webhook
- New API route: `src/app/api/deliver/teams/route.js`
- Triggered by Vercel Cron at 07:30 daily
- Calls `/api/briefing`, formats top 3 stories as Teams Adaptive Card
- Posts to `TEAMS_WEBHOOK_URL`
- Add to `vercel.json`:
```json
{
  "crons": [{ "path": "/api/deliver/teams", "schedule": "30 7 * * 1-5" }]
}
```

### 5. ElevenLabs TTS upgrade
- Replace OpenAI in `src/app/api/audio/route.js`
- Install: `npm install elevenlabs`
- Use voice ID for a warm British male voice (matches Levelshift brand)
- Keep the same response interface — `AudioRail.js` needs zero changes

### 6. Admin dashboard — `src/app/admin/page.js`
- Protected route (admin role only)
- Add/remove RSS sources
- Override Claude's lead story pick
- View engagement metrics (reads, listens, saves per article)

---

## Conventions — follow these exactly

**File naming:** PascalCase for components (`LeadStory.js`), camelCase for utilities (`supabase.js`), kebab-case for routes (`briefing/route.js`)

**Imports:** Always use `@/` alias for src-relative imports. Never use relative `../../`.

**'use client' directive:** Add to any component that uses hooks, browser APIs, or event handlers. API routes never need it.

**Inline styles vs Tailwind:** Use CSS variables via `style={{ color: 'var(--text)' }}` for theme-aware colours. Use Tailwind only for spacing (`px-6`, `py-4`), layout (`flex`, `grid`), and responsive prefixes (`md:`, `hidden`). Never hardcode colour hex values in component files.

**HTML in content:** Article `headline` and `digest.summary` fields contain `<em>` and `<strong>` HTML tags. Always render with `dangerouslySetInnerHTML`. Never render as plain text.

**Error handling:** Every API route must return structured JSON errors: `{ error: message }` with appropriate HTTP status codes. Never let unhandled exceptions reach the client.

**No ESLint:** Project has no ESLint config. Don't add one.

**No TypeScript:** Project is JavaScript only. Don't add `.ts` or `.tsx` files.

---

## Common tasks

**Add a new RSS source:**
Edit `SOURCES.all` array in `src/app/api/briefing/route.js`. Add `{ name, url, type: 'rss' }`.

**Change the TTS voice:**
Edit `voice` in `src/app/api/audio/route.js`. Options: `alloy | echo | fable | onyx | nova | shimmer`.

**Add a new beat category:**
1. Add string to `BEATS` array in `src/components/layout/Masthead.js`
2. Update the beat context string in `curateWithClaude()` in `briefing/route.js`

**Change the accent colour:**
Edit `--accent: #C8973A` in `src/app/globals.css`. One variable, changes everywhere.

**Toggle default theme:**
Edit `useState('dark')` in `src/components/ui/ThemeProvider.js`.

---

## Known issues / watch out for

- `AudioRail` creates a new `<audio>` element and fetches TTS on every article change. If the same article is clicked twice, it re-fetches (TODO: cache blob URLs in a ref map).
- The RSS parser is a simple regex-based extractor — it handles CDATA and basic XML but not all edge cases. If a source breaks, check its feed format first.
- `dangerouslySetInnerHTML` is used for article headlines and digest text. The only HTML injected comes from Claude's API response. If adding user-generated content later, sanitise with DOMPurify.
- Tailwind v4 uses `@import "tailwindcss"` at the top of `globals.css` — NOT the old `@tailwind base/components/utilities` directives.