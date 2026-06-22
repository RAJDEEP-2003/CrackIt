# 🎯 CrackIt — AI-Powered Interview Preparation Platform

> A full-stack AI application that analyzes your resume and job description to generate a personalized interview strategy, ATS-optimized resume, and mock interview experience.

![InterviewAI Demo](https://img.shields.io/badge/Status-Active-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-v24-green)
![React](https://img.shields.io/badge/React-19-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Local-green)
![Gemini](https://img.shields.io/badge/Gemini-2.5--flash--lite-orange)

---

## 🚀 What It Does

Most candidates go into interviews underprepared — they don't know what questions to expect, their resume isn't tailored, and they've never practiced answering under pressure.

**InterviewAI solves all three problems:**

1. **Upload your resume + paste a job description** → AI generates a complete interview strategy
2. **See your Match Score and ATS Score** → Know exactly how well your profile fits before applying
3. **Practice with Mock Interview mode** → Answer questions with a countdown timer, get AI feedback and scores
4. **Download a tailored resume** → AI rewrites your resume specifically for the job, ATS-optimized

---

## ✨ Features

### 📊 Interview Strategy Generation
- **Match Score** — How well your skills match the job requirements (0-100)
- **ATS Score** — How well your resume keywords match what ATS systems scan for (0-100)
- **Present Keywords** — Keywords from the job description already in your resume
- **Missing Keywords** — Keywords you need to add to pass ATS screening
- **Technical Questions** — Role-specific questions with interviewer intentions and model answers
- **Behavioral Questions** — STAR-method questions with guidance on what to cover
- **Skill Gaps** — Identified gaps with severity levels (High/Medium/Low)
- **Day-wise Preparation Roadmap** — Structured plan to prepare effectively

### 🎯 Mock Interview Mode
- Questions presented one at a time
- **2-minute countdown timer** per question (turns yellow at 60s, red at 30s)
- Auto-submits when time runs out
- AI evaluates your answer and gives:
  - Score out of 10
  - Detailed feedback
  - Strengths identified
  - Areas for improvement
  - Model answer for comparison
- Final score summary with average across all questions

### 📄 AI Resume Generation
- Rewrites your resume tailored to the specific job description
- ATS-optimized: single column, no tables, exact keyword matching
- Professional PDF download via Puppeteer
- Follows ATS best practices: action verbs, quantified achievements, relevant keywords

### 📈 Dashboard
- Total interviews prepared
- Average match score across all reports
- Best and worst scores
- Most common skill gaps (with frequency bar charts)
- Score distribution (High/Mid/Low)
- Quick access to recent interview reports

### 🔐 Authentication
- JWT-based authentication with HTTP-only cookies
- Token blacklisting on logout
- Protected routes on both frontend and backend
- Auto-redirect to login when session expires

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite | Build tool and dev server |
| React Router | Client-side routing |
| Axios | HTTP client with credentials |
| SCSS | Styling with variables and nesting |
| react-hot-toast | Toast notifications |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database and ODM |
| JWT | Authentication tokens |
| Multer | Resume file upload handling |
| pdf-parse | Extract text from uploaded PDF resumes |
| Puppeteer | Generate PDF resumes from HTML |
| dotenv | Environment variable management |
| nodemon | Development auto-restart |

### AI
| Technology | Purpose |
|---|---|
| Google Gemini 2.5 Flash Lite | Interview report generation, answer evaluation, resume writing |
| @google/genai SDK | Gemini API client |
| Zod | Structured output schema validation |
| zod-to-json-schema | Convert Zod schemas to JSON Schema for Gemini |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)               │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │  Auth    │  │  Home    │  │Interview │  │  Mock  │ │
│  │  Pages   │  │  Page    │  │  Report  │  │  Mode  │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Axios (withCredentials: true)          │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            │ HTTP + Cookie Auth
                            │
┌─────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js + Express)            │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Auth    │  │Interview │  │  File    │             │
│  │  Routes  │  │  Routes  │  │Middleware│             │
│  └──────────┘  └──────────┘  └──────────┘             │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │                  AI Service                      │  │
│  │  generateInterviewReport() → Zod Schema          │  │
│  │  evaluateAnswer()          → Zod Schema          │  │
│  │  generateResumePdf()       → HTML → Puppeteer    │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
┌───────────────┐           ┌───────────────────┐
│   MongoDB     │           │  Google Gemini API │
│  (Database)   │           │  (AI Processing)   │
└───────────────┘           └───────────────────┘
```

---

## 📁 Project Structure

```
interview-ai/
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── auth.controller.js   # Login, register, logout
│   │   │   └── interview.controller.js  # Report generation, evaluation
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js   # JWT verification
│   │   │   └── file.middleware.js   # Multer file upload
│   │   ├── models/
│   │   │   ├── user.model.js        # User schema
│   │   │   ├── blacklist.model.js   # Token blacklist
│   │   │   └── interviewReport.model.js  # Interview report schema
│   │   ├── routes/
│   │   │   ├── auth.routes.js       # /api/auth/*
│   │   │   └── interview.routes.js  # /api/interview/*
│   │   ├── services/
│   │   │   └── ai.service.js        # All Gemini AI functions
│   │   └── app.js                   # Express app setup
│   ├── server.js                    # Entry point
│   └── .env                         # Environment variables
│
└── Frontend/
    └── src/
        ├── features/
        │   ├── auth/
        │   │   ├── pages/           # Login, Register
        │   │   ├── hooks/           # useAuth.js
        │   │   ├── services/        # auth.api.js
        │   │   └── components/      # Protected.jsx
        │   └── interview/
        │       ├── pages/           # Home, Interview, MockInterview, Dashboard
        │       ├── hooks/           # useInterview.js
        │       ├── services/        # interview.api.js
        │       └── style/           # SCSS files
        ├── App.jsx
        ├── app.routes.jsx
        └── main.jsx
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Google Gemini API key ([get one here](https://aistudio.google.com/apikey))

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/interview-ai.git
cd interview-ai
```

### 2. Setup Backend
```bash
cd Backend
npm install
```

Create `.env` file:
```env
GOOGLE_GENAI_API_KEY=your_gemini_api_key_here
MONGO_URI=mongodb://localhost:27017/interview-ai
JWT_SECRET=your_strong_secret_key_here
PUPPETEER_EXECUTABLE_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
```

Start backend:
```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd Frontend
npm install
npm run dev
```

### 4. Open in browser
```
http://localhost:5173
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/get-me` | Get current user |

### Interview
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/interview/` | Generate interview report (with resume PDF upload) |
| GET | `/api/interview/` | Get all reports for logged in user |
| GET | `/api/interview/report/:id` | Get specific report by ID |
| POST | `/api/interview/resume/pdf/:id` | Generate tailored resume PDF |
| POST | `/api/interview/mock/evaluate` | Evaluate mock interview answer |

---

## 🧠 How the AI Works

### Interview Report Generation
```
User Input: Resume PDF + Job Description
     ↓
pdf-parse extracts text from PDF
     ↓
Gemini 2.5 Flash Lite receives:
  - Resume text
  - Job description
  - Structured Zod schema for output
     ↓
Returns structured JSON with:
  - matchScore, atsScore
  - presentKeywords, missingKeywords
  - technicalQuestions (with intention + model answer)
  - behavioralQuestions (with intention + model answer)
  - skillGaps (with severity)
  - preparationPlan (day-by-day)
  - title
     ↓
Saved to MongoDB
```

### Mock Interview Evaluation
```
User Answer + Question + Job Context
     ↓
Gemini evaluates and returns:
  - score (1-10)
  - feedback
  - strengths[]
  - improvements[]
  - modelAnswer
```

### Resume PDF Generation
```
Resume + Job Description
     ↓
Gemini generates ATS-optimized HTML resume
     ↓
Puppeteer converts HTML to PDF
     ↓
PDF sent to user as download
```

---

## 🎨 Key Technical Decisions

**Why Zod for AI outputs?**
Gemini's structured output with Zod schemas ensures the AI always returns valid, typed JSON — no parsing errors, no hallucinated fields.

**Why HTTP-only cookies for auth?**
More secure than localStorage — XSS attacks can't steal the token since JavaScript can't access HTTP-only cookies.

**Why Puppeteer for PDF generation?**
HTML/CSS gives full control over resume formatting. Puppeteer renders it exactly like a browser would, producing professional-quality PDFs.

**Why pdf-parse for resume reading?**
Extracts clean text from uploaded PDF resumes, which is then sent to Gemini for analysis.

---

## 📸 Screenshots

### Home Page — Generate Interview Strategy
Upload your resume and paste the job description to get started.
![Home Page](./screenshots/home.png)

### Interview Report — Match Score & ATS Score
See your match score, ATS score, present and missing keywords, skill gaps.
![Interview Report](./screenshots/report.png)

### Mock Interview Mode — Practice with Timer
Answer questions with a 2-minute countdown timer. Get AI feedback after each answer.
![Mock Interview](./screenshots/mock.png)

### Preparation Roadmap — Day-by-Day Plan
AI generates a personalized day-wise preparation plan showing exactly what to study each day, which resources to use, and what to focus on to maximize your chances.
![Roadmap](./screenshots/roadmap.png)

### Dashboard — See All Stats
See all stats and compare your performance across interviews.
![Dashboard](./screenshots/dashboard.png)

---

## 🔮 Future Improvements

- [ ] TypeScript migration (frontend + backend)
- [ ] Unit and integration tests (Jest + Supertest)
- [ ] Real-time progress with WebSockets during AI generation
- [ ] Job queue with Bull/Redis for AI processing
- [ ] Email interview report after generation
- [ ] Share interview plan via unique link
- [ ] Voice-based mock interview mode

---

## 👨‍💻 Author
**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Name](https://linkedin.com/in/yourprofile)
- Email: your@email.com

---

## 📄 License

MIT License — feel free to use this project as inspiration for your own work.
