# PrepPair

Shared interview prep tracker for the Moniepoint DreamDevs coding bootcamp (18 participants). Each week an admin generates randomised pairings across 5 problems (2 DSA, 2 System Design, 1 Database). Pairs submit collaborative solutions and receive AI feedback.

## Stack

- React 18 + Vite + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL + Realtime)
- OpenAI gpt-4o-mini via Vercel serverless function
- TanStack Query v5
- Vercel (hosting + API routes)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `OPENAI_API_KEY` | OpenAI API key (server only) |
| `NOTION_TOKEN` | Notion integration token (Phase 7) |
| `NOTION_DATABASE_ID` | Notion database ID (Phase 7) |

### 3. Set up database

Run the contents of `supabase/schema.sql` in your Supabase SQL editor. This creates:

- `participants` table
- `weekly_pairings` table
- `app_config` table
- Update trigger, RLS policies, and replica identity for Realtime

### 4. Enable Realtime

In Supabase Dashboard, go to Database > Replication and enable Realtime for:
- `participants`
- `weekly_pairings`
- `app_config`

### 5. Run locally

```bash
npm run dev           # Vite dev server (frontend only)
npm run dev:vercel    # Vercel dev (frontend + API routes)
```

### 6. Deploy

```bash
vercel
```

## Problem Bank

4 weeks, 20 problems total:

| Week | DSA | DSA | System Design | System Design | Database |
|------|-----|-----|---------------|---------------|----------|
| 1 | Two Sum | Sliding Window Maximum | URL Shortener | Rate Limiter | Multi-tenant Schema |
| 2 | Valid Parentheses | Merge Intervals | Notification System | Payment Processing | Query Optimization |
| 3 | LRU Cache | Binary Tree Level Order | Distributed Cache | Social Activity Feed | ACID Transactions |
| 4 | Coin Change | Find All Anagrams | Search Autocomplete | Bulk Transfer | Sharding vs Replication |
