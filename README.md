# WizerQuiz ⚡

A fast, timed trivia quiz app built with **React + Vite + Tailwind CSS**, powered by the [Open Trivia Database](https://opentdb.com) API. Features full user authentication, a per-question countdown timer, score tracking, and answer review.

---

## 🚀 Live Demo

> Replace with your deployed URL after deploying to Vercel or Netlify
> **https://wizer-quiz.vercel.app**

---

## 📸 Screenshots

| Login | Quiz | Results |
|-------|------|---------|
| Auth gate with Sign Up / Log In | Timed question with answer feedback | Score donut + answer review |

---

## ✨ Features

- 🔐 **Authentication** — Sign Up, Log In, Forgot Password, Reset Password (localStorage-based)
- ⏱️ **Countdown Timer** — 20-second SVG ring per question; auto-submits on timeout
- 🧠 **Quiz Engine** — Fetches live questions from Open Trivia DB API
- 🎯 **Answer Feedback** — Correct/wrong colours revealed after each selection
- 📊 **Score & Results** — Animated donut chart with percentage rating
- 🔍 **Answer Review** — Full post-quiz review of every question
- ⚙️ **Configurable** — Choose amount, category, difficulty, and question type
- 📱 **Responsive** — Works on mobile and desktop
- 🌑 **Dark Theme** — Custom dark UI with volt-green accent

---

## 🗂️ Project Structure

```
wizer-quiz/
├── public/
│   └── _redirects              # Netlify SPA fix
├── src/
│   ├── components/
│   │   ├── AuthForm.jsx         # Login, SignUp, ForgotPassword, ResetPassword forms
│   │   ├── QuizUI.jsx           # ProgressBar, AnswerButton, DiffBadge, ScoreDonut
│   │   └── TimerRing.jsx        # SVG countdown ring component
│   ├── hooks/
│   │   ├── useAuth.js           # Auth state machine
│   │   ├── useQuiz.js           # Quiz state machine (home→loading→quiz→results)
│   │   └── useTimer.js          # Per-question countdown timer logic
│   ├── pages/
│   │   ├── Home.jsx             # Settings configuration screen
│   │   ├── Loading.jsx          # Shimmer skeleton while fetching
│   │   ├── Quiz.jsx             # Active question view with timer
│   │   └── Results.jsx          # Final score + answer review
│   ├── services/
│   │   ├── authService.js       # localStorage auth (signUp, logIn, reset)
│   │   └── triviaApi.js         # Open Trivia DB API calls
│   ├── App.jsx                  # Root — auth gate + screen router
│   ├── App.css                  # Minimal overrides
│   ├── index.css                # Tailwind directives + global keyframes
│   └── main.jsx                 # Vite entry point
├── index.html                   # HTML shell + Google Fonts
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── vercel.json                  # Vercel SPA rewrite rule
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite 5 | Build tool & dev server |
| Tailwind CSS 3 | Utility-first styling |
| Open Trivia DB | Free trivia questions API |
| localStorage | Auth persistence (no backend) |

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v18 or higher
- npm v9 or higher

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR-USERNAME/wizer-quiz.git

# 2. Navigate into the project
cd wizer-quiz

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

Open **http://localhost:5173** in your browser.

### Build for Production

```bash
npm run build
```

The output goes into the `dist/` folder, ready for deployment.

---

## 🔐 Authentication

Authentication is handled entirely in the browser using `localStorage` — no backend or database is required.

| Action | How it works |
|---|---|
| **Sign Up** | Saves user to `localStorage`, auto-logs in |
| **Log In** | Matches email + password against stored users |
| **Forgot Password** | Generates a reset token, displays it on screen |
| **Reset Password** | Validates token, updates stored password |

> **Note:** In a production app, replace `authService.js` with real API calls to a backend (e.g. Firebase Auth, Supabase, or a custom Node.js server).

---

## ⏱️ Timer

- Each question has a **20-second countdown**
- The ring turns **yellow** under 10 seconds and **red** under 5 seconds
- A **ping dot** pulses when 5 or fewer seconds remain
- If time runs out the correct answer is **automatically revealed** and a "Time's up!" banner appears
- The timer **resets** every time the user clicks Next Question

---

## 🌐 API

This app uses the **[Open Trivia Database](https://opentdb.com)** — a free, no-auth-required trivia API.

**Endpoints used:**

```
GET https://opentdb.com/api_category.php
    → Fetches all available categories

GET https://opentdb.com/api.php?amount=10&category=9&difficulty=medium&type=multiple
    → Fetches quiz questions with optional filters
```

**API Response Codes:**

| Code | Meaning |
|---|---|
| 0 | Success |
| 1 | No results for that query |
| 2 | Invalid parameter |

---

## 🚢 Deployment

### Deploy to Vercel

```bash
# Push to GitHub first
git add .
git commit -m "ready to deploy"
git push

# Then connect repo at vercel.com — auto-detects Vite
```

### Deploy to Netlify

1. Connect repo at netlify.com
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Ensure `public/_redirects` contains: `/* /index.html 200`

### Auto-deploy on push

Both Vercel and Netlify redeploy automatically whenever you push to `main`.

---

## 📋 5-Week Development Plan

| Week | Focus | Status |
|---|---|---|
| Week 1 | Project setup, Tailwind config, API research | ✅ Done |
| Week 2 | Core quiz logic, API fetch, question display | ✅ Done |
| Week 3 | Scoring, state management, results screen | ✅ Done |
| Week 4 | UI polish, responsiveness, loading/error states | ✅ Done |
| Week 5 | Auth, timer, testing, deployment | ✅ Done |

---

## 🔮 Future Enhancements

- [ ] Backend auth with Firebase or Supabase
- [ ] Score history / leaderboard per user
- [ ] Adjustable timer duration in settings
- [ ] Sound effects on correct / wrong answers
- [ ] Streak counter and bonus points for speed
- [ ] Share results to social media
- [ ] Offline support with PWA

---

## 👤 Author

**Your Name**
- GitHub: [@your-username](https://github.com/your-username)
- Project: [WizerQuiz](https://github.com/your-username/wizer-quiz)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

> Data provided by [Open Trivia Database](https://opentdb.com) — free to use.
