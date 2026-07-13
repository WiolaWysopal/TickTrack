# ⌛ TickTrack ⌛

 **TickTrack** is a lightweight and modern Progressive Web App ( `PWA` ) designed to help users track time and manage tasks efficiently.

## 💡 Why TickTrack?

TickTrack was created as a lightweight productivity application focused on simplicity and performance. The project combines task management, time tracking, document storage, customizable user profiles and a modern light/dark interface inside a Progressive Web App powered by Supabase.

The application demonstrates practical usage of React, TypeScript, Supabase Authentication, PostgreSQL, Storage, Row Level Security (RLS) and Progressive Web App technologies.

## 🚀 Features

### Task Management

* ✅ Create and delete tasks
* 📂 Organize tasks into projects
* 📝 Add task descriptions
* 📅 Assign due dates to tasks
* 🚦 Assign task statuses (To Do, In Progress, Done)
* 🎯 Assign task priorities (Low, Medium, High)
* ✏️ Update task status and priority directly from the task list
* 🔍 Filter tasks by status and priority
* 📊 Sort tasks by name, status and priority

### Time Tracking

* ⏱️ Built-in task timer
* ▶️ Start / pause / stop tracking
* 📊 Automatic time calculation

### Productivity Dashboard

* 📊 Dashboard statistics
* 📈 Completion rate tracking
* ⚠️ Highlight overdue tasks
* ⏱️ Total tracked time
* 📅 Tasks due today
* ✅ Tasks completed today
* 🔁 Total number of time tracking sessions
* 📊 Average tracked time per task
* 📈 Productivity charts:
  + Tracked Time Last 7 Days
  + Tasks by Status

### File Management

* 📄 Upload PDF files directly to tasks
* 🖱️ Drag & drop PDF upload
* 👀 Built-in PDF preview
* 📥 Download uploaded files
* 🗑️ Delete attached files
* 🔒 Private storage per authenticated user
* ☁️ Files stored in Supabase Storage

### Calendar

* 📅 Monthly calendar view for task deadlines
* 📌 Display tasks assigned to each day
* 🔴 Highlight overdue tasks
* ✅ Visual indicators for completed tasks
* 🖱️ Click a day to view scheduled tasks
* ✏️ Update task status and priority directly from the calendar

### Authentication & User Profile

* 🔐 Email authentication with Supabase
* 👤 User-specific projects and tasks
* 🖼️ Custom user avatar
* ✏️ Editable display name
* 🔑 Secure password change
* ☁️ Avatar storage in Supabase Storage

### Appearance

* 🌙 Light / Dark mode
* 💾 Theme preference saved in localStorage
* 🖥️ Automatic system theme detection
* 🎨 Consistent theme across the entire application
* ✨ Modern UI built with shadcn/ui
* 🔔 Toast notifications using Sonner
* 📱 Responsive layout improvements

### Progressive Web App

* 📦 Installable
* 📱 Mobile-friendly
* 🌙 Offline support

## 🛠️ Tech Stack

* `React 19`
* `TypeScript`
* `Tailwind CSS`
* `localStorage` – persistent theme preferences
* `Bolt.new` – initial project scaffold and selected UI components
* `Vite` – as the frontend build tool
* `PWA` – installable app experience with offline support
* `Supabase` – Authentication, PostgreSQL and Storage
* `Node.js` / `npm` – dependency and script management
* `Cloudflare` – domain management with DNS, SSL and performance optimizations
* `Recharts` – chart library used for dashboard productivity visualizations
* `PDF.js` – in-app PDF preview rendering
* `shadcn/ui` – reusable UI component library
* `Radix UI` – accessible component primitives
* `Sonner` – toast notifications

## 🤖 Project Origin

The initial project structure and a small part of the UI were bootstrapped using Bolt.new.

From the authentication system onwards, the application has been developed independently, including:

* Supabase Authentication
* Database design
* Row Level Security (RLS)
* File upload system
* PDF validation
* Supabase Storage integration
* Task management
* Timer functionality
* Responsive UI improvements
* Bug fixes and further feature development

Further development included:

* complete UI redesign using shadcn/ui
* responsive landing page
* modern dialog system
* toast notifications
* user profile management
* avatar upload
* password management

## 🤖 AI-Assisted Development

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

* **Use plain language first, then add technical details** 
  Start with a simple, natural description of what you want, then layer in frameworks, languages, or constraints. This helps the AI understand your intent clearly.

* **Experiment with different phrasings** 
  Slightly changing how you word a prompt can produce different outputs. Don’t hesitate to reword or restructure sentences for clarity or creativity.

* **Combine multiple instructions carefully** 
  You can include several requirements in one prompt, but keep it readable and organized. Use line breaks, bullet points, or numbered lists if the AI supports it.

* **Specify the audience or user** 
  Mention the target users or context, e.g., “Design this for mobile users” or “Make this suitable for beginners.” This ensures the output is tailored appropriately.

* **Include constraints and rules explicitly** 
  If there are limitations (design style, length, format, accessibility requirements), state them clearly to avoid undesired outputs.

* **Ask for step-by-step reasoning for complex tasks** 
  For multi-step problems or explanations, request that the AI think step by step. Example: “Explain your approach before giving the final code.”

* **Provide examples whenever possible** 
  Demonstrate desired outputs with sample code snippets, UI layouts, or text formats to guide the AI toward your expectations.
* **Iterate and refine** 
  Don’t expect perfection on the first try. Review outputs, adjust the prompt, and iterate until you get satisfactory results.

* **Use explicit roles or personas** 
  For creative tasks, you can assign the AI a role: “You are a UX designer” or “You are an expert in React development.” This often improves relevance and style.

* **Keep prompts concise yet complete** 
  Avoid overly long prompts with unnecessary details, but ensure all key requirements are included.

## 🏗️ Architecture

TickTrack follows a client-first architecture powered by Supabase services.

### Application Architecture

```bash
                User
                 │
                 ▼
         Cloudflare (DNS/CDN)
                 │
                 ▼
        Netlify (Frontend Hosting)
                 │
                 ▼
          React + Vite (PWA)
                 │
                 ▼
             Supabase
     ┌────────────────────┐
     │ Authentication     │
     │ PostgreSQL         │
     │ Storage            │
     │ Row Level Security │
     └────────────────────┘
```

The frontend communicates directly with Supabase using the official JavaScript SDK. User authentication, database operations and file uploads are secured using Row Level Security (RLS) policies.

## 📂 Project Structure

```
src/
├── components/
│   ├── ui/
│   │   ├── alert-dialog.tsx
│   |   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── sonner.tsx
│   │   └── textarea.tsx
│   │
│   ├── AdSense.tsx
│   ├── AdSenseVerification.tsx
│   ├── Auth.tsx
│   ├── Dashboard.tsx
│   ├── PasswordReset.tsx
│   ├── PdfUpload.tsx
│   ├── PriorityBadge.tsx
│   ├── ProductivityCharts.tsx
│   ├── ProfileDialog.tsx
│   ├── ProjectList.tsx
│   ├── StatusBadge.tsx
│   ├── TaskFilesList.tsx
│   ├── TaskList.tsx
│   ├── ThemeToggle.tsx
│   └── Timer.tsx
│
├── lib/
│   ├── directAuth.ts
│   └── supabase.ts
│   └── theme.ts
│
├── App.css
├── App.tsx
├── index.css
├── main.tsx
├── registerSW.ts
├── types.ts
├── vite-env.d.ts
│
├── supabase/
│
├── ...
```

The application is organized into reusable React components with Supabase configuration separated inside the `lib` directory.

## 🧩 Main Components

### Dashboard

Responsible for:

* displaying project statistics
* calculating task completion rate
* showing overdue task count
* summarizing tracked working time
* showing productivity metrics
* displaying tasks due today
* displaying tasks completed today
* calculating average task time
* calculating total number of time tracking sessions

### ProductivityCharts

Responsible for:

* displaying productivity charts
* showing tracked time from the last 7 days
* showing task distribution by status
* visualizing productivity data using Recharts

### PdfUpload

Responsible for:

* selecting PDF files
* drag & drop uploads
* validating uploaded files
* uploading files to Supabase Storage
* displaying upload status

### ProfileDialog

Responsible for:

* managing user profile
* uploading and removing avatars
* changing display name
* changing account password
* synchronizing profile data with Supabase

### TaskFilesList

Responsible for:

* fetching uploaded files
* displaying task attachments
* previewing PDF files
* downloading files
* deleting uploaded documents

### TaskList

Responsible for:

* creating tasks
* assigning statuses and priorities
* adding task descriptions
* assigning due dates
* filtering and sorting tasks
* managing attached files

### Timer

Responsible for:

* tracking task duration
* start, pause and stop functionality
* displaying elapsed time

### ThemeToggle

Responsible for:

* switching between light and dark mode
* saving user theme preferences
* updating the global application theme

## 📄 Task Attachments

TickTrack allows authenticated users to upload PDF documents directly to individual tasks.

Each uploaded document is:

* linked to a specific task
* isolated per authenticated user
* stored in Supabase Storage
* indexed in PostgreSQL
* protected by Row Level Security (RLS)

### Features

* upload PDF files
* automatic validation (PDF only)
* download attachments
* delete attachments
* private storage using Supabase Storage
* metadata stored in Supabase Database
* maximum file size: 10 MB
* safe file name sanitization
* color-coded success and error messages
* automatic input reset after invalid file selection
* drag & drop uploads
* built-in PDF preview

### Storage structure

```
task-files/
    user-id/
        task-id/
            file.pdf
```

## 🔒 Security

TickTrack protects user data using several Supabase security features:

* Supabase Authentication
* Row Level Security (RLS)
* protected Storage buckets
* authenticated file uploads
* ownership validation
* PDF MIME type validation
* maximum upload size validation
* sanitized file paths for secure storage
* user-specific task isolation
* secure password updates
* avatar ownership validation
* protected avatar storage

## 🌐 Deployment

TickTrack is deployed using `Netlify` .

`Cloudflare` is used for:

* custom domain management
* DNS configuration
* automatic SSL certificates
* HTTPS
* performance optimizations
* CDN

## 🧹 Code Quality

The project follows modern React and TypeScript best practices.

Implemented improvements include:

* strict TypeScript configuration
* ESLint integration
* React Hooks dependency validation
* reusable React components
* asynchronous error handling
* client-side file validation
* upload error handling
* reusable upload components
* sanitized storage paths
* strongly typed Supabase responses
* responsive task management interface
* dashboard statistics
* overdue task highlighting
* automated type checking using `npm run typecheck`
* fixed TypeScript project configuration for successful type checking
* separated productivity charts into a reusable component
* centralized theme management
* persistent user theme preferences
* system color scheme detection
* reusable theme toggle component
* shadcn/ui component architecture
* reusable dialog components
* reusable toast notifications
* path aliases for cleaner imports
* improved responsive layouts
* reusable profile management component
* image upload validation

These improvements increase maintainability, readability and long-term scalability of the application.

## 📋 Requirements

Before running the project locally, make sure you have:

* `Node.js` 20+
* `npm` 10+
* a Supabase project
* Supabase Storage bucket named `task-files`
* Supabase Storage bucket named `avatars`
* configured `RLS` policies for Storage buckets

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

4. Create the environment variables:

```bash
cp .env.example .env.public
```

or manually create:

```text
.env.public
```

## 🧪 Available Scripts

* `npm run dev` – start the development server
* `npm run build` – build the app for production
* `npm run preview` – preview the production build
* `npm run lint` – lint code with ESLint
* `npm run typecheck` – run TypeScript type checking

## 🔐 Supabase Environment Variables

Create a `.env.public` file in your project/ directory:

```bash
VITE_SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_PUBLIC_ANON_KEY"
```

## 🗄️ Database

TickTrack stores application data in a Supabase PostgreSQL database. The application uses relational tables linked by foreign keys to manage projects, tasks, tracked work sessions and attached documents.

### Main tables

#### `profiles` 

Stores additional user profile information.

Fields include:

* user id
* display name
* public avatar URL stored in Supabase Storage
* created_at
* updated_at

#### `projects` 

Stores user-created projects.

Fields include:

* project name
* owner (`user_id`)
* creation timestamp

#### `tasks` 

Stores tasks assigned to projects.

Fields include:

* task name
* associated project (`project_id`)
* owner (`user_id`)
* status (`todo`,       `in_progress`,       `done`)
* priority (`low`,       `medium`,       `high`)
* optional description
* optional due date
* completion timestamp (`completed_at`)
* creation timestamp

#### `time_sessions` 

Stores tracked work sessions created by the timer.

Each session contains:

* related task (`task_id`)
* related project (`project_id`)
* owner (`user_id`)
* session start and end time
* tracked duration (seconds)
* creation timestamp

These records are used to calculate:

* total tracked time
* average task time
* average session duration
* number of sessions
* productivity dashboard statistics
* productivity charts

#### `task_files` 

Stores metadata for PDF documents attached to tasks.

Fields include:

* related task (`task_id`)
* owner (`user_id`)
* file name
* storage path
* creation timestamp

The `task_files` table stores metadata only. Uploaded files themselves are stored in Supabase Storage. The actual PDF files are stored in **Supabase Storage** , while only their metadata is stored in PostgreSQL.

### Relationships

The database uses foreign keys to maintain relationships between entities:

* one user can own multiple projects
* one project can contain multiple tasks
* one task can have multiple time sessions
* one task can have multiple attached PDF files
* one profile can reference one avatar stored in Supabase Storage

## 🕒 Optional: Keeping Supabase Awake (CRON, GitHub Actions)

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

The application icon ( `favicon` ) was generated using `Craiyon` , an AI-powered tool that creates images based on short text prompts. `Craiyon` uses generative models to produce graphics in various styles, making it easy to generate simple illustrations, icons, or visual concepts. The image used in this project was created specifically for the application and does not depict any real persons or objects.

## 🚧 Future Improvements

Planned features include:

* support for additional file types
* task comments
* Kanban board based on task statuses
* custom task statuses
* task reminders and notifications
* avatar cropping before upload
* profile preferences
* export to PDF
* team collaboration

## 🌐 Live Demo

No installation is required. Simply open the link and sign up to start using the application. The **TickTrack** app is deployed and available online at:

[https://ticktrack.work](https://ticktrack.work)

You can access the full Progressive Web App ( `PWA` ) in your browser.
