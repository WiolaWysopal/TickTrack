# ⌛ TickTrack ⌛

**TickTrack** is a lightweight and modern Progressive Web App (`PWA`) designed to help users track time and manage tasks efficiently.

## 🚀 Features

- ⏱️ Task timer with a clean and responsive interface

- 📦 Progressive Web App - works offline and can be installed on devices

- ☁️ Real-time data sync using Supabase

- ⚡ Fast performance thanks to Vite

- 🧠 Prototyped using [Bolt.new](https://bolt.new) - an AI tool for rapid app development

## 🛠️ Tech Stack

- `Bolt.new` – initial app structure and components generated using AI

- `Vite` – as the frontend build tool

- `PWA` – installable app experience with offline support

- `Supabase` – backend-as-a-service (authentication + database)

- `Node.js` / `npm` – dependency and script management

## 📦 Installation

1. Clone the repository:

```bash
git clone https://github.com/WiolaWysopal/TickTrack.git
cd TickTrack
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

## 🧪 Available Scripts

- `npm run dev` – start the development server

- `npm run build` – build the app for production

- `npm run preview` – preview the production build

- `npm run lint` – lint code with ESLint

- `npm run typecheck` – run TypeScript type checking

## 🔐 Supabase Environment Variables

Create a `.env.public` file in your project/ directory:

```bash
VITE_SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_PUBLIC_ANON_KEY"
```

## 🕒 Keeping Supabase Awake (CRON)

The project uses `GitHub Actions` to periodically ping Supabase, preventing the free-tier database from going to sleep.

1. Add `.github/workflows/keep-supabase-awake.yml`:

```yml

name: Keep Supabase Awake

on:
  schedule:
    - cron: '*/5 * * * *'

jobs:
  ping:
    runs-on: ubuntu-latest

    steps:
      - name: Ping Supabase tables
        run: |
          SUPA_URL="https://YOUR-PROJECT.supabase.co"
          SUPA_KEY="YOUR_PUBLIC_ANON_KEY"

          for table in tasks users projects; do
            echo "Pinging table: $table"
            curl -X GET "$SUPA_URL/rest/v1/$table" \
                -H "apikey: $SUPA_KEY" \
                -H "Authorization: Bearer $SUPA_KEY" \
                -H "Accept: application/json"
            echo ""
          done
```

2. You can view the run history in `GitHub → Actions → Keep Supabase Awake`.

## 🌐 Live Demo

The **TickTrack** app is deployed and available online at:

[https://ticktrack.work](https://ticktrack.work)

You can access the full Progressive Web App (`PWA`) in your browser.
