# FutureScope 🚀

[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)](https://expressjs.com/)
[![Gemini](https://img.shields.io/badge/Gemini_AI-3.5_Flash-4285F4?logo=google-gemini)](https://ai.google.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?logo=firebase)](https://firebase.google.com/)

**FutureScope** is a high-performance, premium digital monograph and blogging platform designed for technology enthusiasts, software engineers, and visionary founders. Crafted with a luxury design aesthetic, it merges deep technological discourse with state-of-the-art AI-assisted reading features powered by Google's Gemini 3.5.

**🔗 Live Deployment:** [https://bloggii.netlify.netlify.app/](https://bloggii.netlify.app/)

---

## ✨ Core Features

*   **🎨 Premium Editorial Design & Aesthetics:**
    *   Curated dark/light layouts (defaults to Elegant Dark Mode).
    *   Dynamic neon glow styling, glowing mesh background, and fluid micro-animations using Framer Motion (`motion/react`).
    *   Custom typography and fully responsive layouts.
*   **🤖 Google Gemini 3.5 Flash AI Engine:**
    *   **Synapse Intelligence Newsletter:** Subscribing triggers real-time, personalized technological forecasting based on the user's email.
    *   **Executive Article Summarization:** Instantly generates executive markdown summaries detailing the "Synapse Summary" and "Key Trend Spots" of articles.
    *   **Interactive Tech Explainer:** Deep-dives into complex computer science concepts with custom analogies, architectural details, and future impact analysis.
*   **⚡ Interactive Monograph Reader:**
    *   In-memory state management for likes, bookmarks, and sessions.
    *   **Session footprint tracking:** Automatically compiles the user's reading history under "Recently Read Specs".
    *   Full comments feed synced with the Node.js/Express backend.
*   **🎙️ Multimedia Integration:**
    *   **FutureScope Podcasts:** Built-in audio controller to play high-density podcast episodes.
    *   **Visionary Council Spotlight:** Showcase of leading writers and computer science researchers.
    *   **Community Discussions Hub:** Fully styled discussion cards and group chat boards.
*   **🔒 Firebase Authentication:**
    *   Google Sign-In integration for verified writer profiles and premium user interactions.

---

## 🛠️ Tech Stack

*   **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Motion (Framer Motion v12).
*   **Backend:** Node.js, Express, TSX, ESBuild.
*   **AI SDK:** `@google/genai` (Google Gemini 3.5 Flash).
*   **Database/Auth:** Firebase (Auth, Analytics).

---

## 📂 Codebase Architecture

```text
├── server.ts                 # Express server with REST API routes & Gemini integration
├── package.json              # Script configurations & dependency list
├── index.html                # Entry HTML file
├── vite.config.ts            # Vite compiler configurations
├── tsconfig.json             # TypeScript rules configuration
├── src/
│   ├── main.tsx              # React mounting root
│   ├── App.tsx               # Main landing frame & central state coordinator
│   ├── index.css             # Main styling system, neon design tokens, & layout styles
│   ├── firebase.ts           # Firebase connection configuration
│   ├── types.ts              # System-wide TypeScript type definitions
│   ├── components/           # UI Components
│   │   ├── Navbar.tsx        # Responsive navigation, search, and authentication buttons
│   │   ├── ArticleModal.tsx  # In-depth reader with AI summarizer & comments section
│   │   ├── PodcastSection.tsx# Audio podcast catalog & controls
│   │   ├── CommunitySection.tsx# Discussion feed & community boards
│   │   └── ProfileDrawer.tsx # User settings drawer
│   └── data/
│       └── blogData.ts       # Central local database containing curated blog posts
```

---

## 🚀 Running Locally

Follow these steps to set up and run the project locally.

### Prerequisites
*   Node.js (v18 or higher recommended)
*   NPM or Yarn

### 1. Clone the repository and install dependencies
```bash
git clone <repository-url>
cd S63_TEJRAJ_CAPSTONE_BLOGGING
npm install
```

### 2. Set up environment variables
Create a `.env` file in the root directory and specify the following details:
```env
GEMINI_API_KEY=your_gemini_api_key_here
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### 3. Spin up the development server
Start the Express server which hosts both the API endpoints and the Vite development middleware:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to view the application.

### 4. Build for Production
To bundle the frontend using Vite and compile the Express server with esbuild:
```bash
npm run build
npm run start
```
