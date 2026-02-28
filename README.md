# Powder Match — Ski & Snowboard Instructor Matching

Connect ski and snowboard students with instructors at major Hokkaido resorts (Niseko, Rusutsu, Kiroro). Match by teaching language, skill level, and areas to improve.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS
- **i18n:** next-intl (English, 简体中文, 日本語)
- **Backend:** Next.js API routes
- **Database:** Supabase (PostgreSQL)

## Getting Started

### 1. Install dependencies

```bash
cd ski-instructor-app
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the schema in `supabase/migrations/001_initial_schema.sql` via the SQL Editor
3. Run the seed SQL from `npm run db:seed` (or copy from script output) in the SQL Editor
4. Copy `.env.example` to `.env.local` and add your Supabase URL and anon key

### 3. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app will redirect to `/en`, `/zh`, or `/ja` based on your locale.

## Project Structure

```
ski-instructor-app/
├── src/
│   ├── app/
│   │   ├── [locale]/          # Locale-specific routes
│   │   │   ├── page.tsx       # Home
│   │   │   └── find/          # Find instructors
│   │   └── api/               # API routes
│   ├── components/
│   ├── i18n/                  # Messages (en, zh, ja)
│   ├── lib/                   # Supabase client
│   └── types/
├── supabase/migrations/       # Database schema
└── scripts/seed-database.ts   # Seed data
```

## Adding New Resorts

Resorts are data-driven. Add new rows to the `resorts` table (linked to a `region`). The UI will show them automatically. No code changes needed.

## Mobile-Ready

The app is API-first. The same endpoints can power a future React Native or Flutter app.
