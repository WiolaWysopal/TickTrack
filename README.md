# ⌛ TickTrack ⌛

**TickTrack** is a lightweight and modern Progressive Web App (`PWA`) designed to help users track time and manage tasks efficiently.

## 🚀 Features

- ⏱️ Task timer with a clean and responsive interface

- 📦 Progressive Web App - works offline and can be installed on devices

- ☁️ Real-time data sync using Supabase

- ⚡ Fast performance thanks to Vite

- 🧠 Prototyped using [Bolt.new](https://bolt.new) - an AI tool for rapid app development

- 📁 Uploading files to tasks using Supabase Bucket (`Supabase Storage`)

## 🛠️ Tech Stack

- `Bolt.new` – initial app structure and components generated using AI

- `Vite` – as the frontend build tool

- `PWA` – installable app experience with offline support

- `Supabase` – backend-as-a-service (authentication + database)

- `Node.js` / `npm` – dependency and script management

- `Cloudflare` – domain management with DNS, SSL and performance optimizations

## 🤖 Creating Prompts in `Bolt.new`

`Bolt.new` allows rapid prototyping of UI components and app logic using AI-generated prompts. Here’s a quick guide to creating effective prompts:

1. **Be specific** – clearly describe the component or feature you want.
2. **Include context** – mention frameworks, libraries, or styling preferences.
3. **Provide examples** – show the desired structure or behavior if possible.
4. **Iterate** – refine your prompt based on the generated output.

**Sample prompt**

```yml
Create a responsive task timer component in React + TypeScript,
with start/stop buttons and a progress bar.
Style it using Tailwind CSS.
The component should display elapsed time in HH:MM:SS format.
```

### General Tips for AI Prompting

- **Use plain language first, then add technical details**  
  Start with a simple, natural description of what you want, then layer in frameworks, languages, or constraints. This helps the AI understand your intent clearly.

- **Experiment with different phrasings**  
  Slightly changing how you word a prompt can produce different outputs. Don’t hesitate to reword or restructure sentences for clarity or creativity.

- **Combine multiple instructions carefully**  
  You can include several requirements in one prompt, but keep it readable and organized. Use line breaks, bullet points, or numbered lists if the AI supports it.

- **Specify the audience or user**  
  Mention the target users or context, e.g., “Design this for mobile users” or “Make this suitable for beginners.” This ensures the output is tailored appropriately.

- **Include constraints and rules explicitly**  
  If there are limitations (design style, length, format, accessibility requirements), state them clearly to avoid undesired outputs.

- **Ask for step-by-step reasoning for complex tasks**  
  For multi-step problems or explanations, request that the AI think step by step. Example: “Explain your approach before giving the final code.”

- **Provide examples whenever possible**  
  Demonstrate desired outputs with sample code snippets, UI layouts, or text formats to guide the AI toward your expectations.
- **Iterate and refine**  
  Don’t expect perfection on the first try. Review outputs, adjust the prompt, and iterate until you get satisfactory results.

- **Use explicit roles or personas**  
  For creative tasks, you can assign the AI a role: “You are a UX designer” or “You are an expert in React development.” This often improves relevance and style.

- **Keep prompts concise yet complete**  
  Avoid overly long prompts with unnecessary details, but ensure all key requirements are included.


## 🏡 Hosting

The project’s domain is managed through Cloudflare, which provides fast DNS routing, automatic SSL certificates, and essential security features. While the application itself is hosted elsewhere (locally during development), Cloudflare ensures stable, secure, and globally optimized access to the domain. This setup allows the frontend to load reliably and benefit from Cloudflare’s performance enhancements without requiring full Cloudflare hosting.

## 📁Uploading files

### [`SOON`]

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

## 🖼️ Favicon

The application’s avatar (favicon) was generated using `Craion`, an AI-powered tool that creates images based on short text prompts. Craion uses generative models to produce graphics in various styles, making it easy to generate simple illustrations, icons, or visual concepts. The image used in this project was created specifically for the application and does not depict any real persons or objects.

## 🌐 Live Demo

The **TickTrack** app is deployed and available online at:

[https://ticktrack.work](https://ticktrack.work)

You can access the full Progressive Web App (`PWA`) in your browser.
