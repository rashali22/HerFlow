# 🌸 HerFlow — Menstrual Cycle Tracking & AI Health Companion 

**HerFlow** is a modern, privacy-first menstrual cycle tracking and health intelligence web application. It combines mathematical cycle analytics, statistical period predictions, daily flow logging, and a personalized **Retrieval-Augmented Generation (RAG)** AI assistant powered by Google Gemini.

---

## 🚀 Key Features

* **Authentication & Strict Data Isolation**: Email and password registration with bcrypt hashing, JWT authentication middleware, and database-level user isolation.
* **Period Tracking**: Log ongoing and past period dates with automatic duration calculation.
* **Daily Flow Logging**: Record day-to-day flow intensity (`None`, `Light`, `Medium`, `Heavy`) with intuitive interactive controls.
* **Predictive Cycle Intelligence**:
  * Historical and rolling average cycle length calculations (start-to-start).
  * Statistical next-period prediction.
  * Menstrual cycle phase detection (`Menstrual`, `Follicular`, `Ovulation`, `Luteal`).
  * Fertility window estimation.
  * Cycle regularity scoring and variance standard deviation.
  * Rule-based health pattern notices.
* **AI Health Assistant ("Clarity with HerFlow")**:
  * Context-aware RAG pipeline.
  * Gemini embedding generation and user-isolated vector similarity search.
  * Conversational Gemini 2.5 Flash LLM with an empathetic, supportive persona.
  * Safe medical disclaimers and multi-turn conversation support with question limits.
* **Visual Analytics & Data Trends**:
  * Animated circular cycle phase progress gauge.
  * Chart.js line charts for historical period duration trends.
  * Stacked bar charts for monthly flow intensity distributions.
  * Interactive cycle history calendar with flow tooltips.
* **Email Reminders**: Automated background cron job (`node-cron` + `Nodemailer`) alerting users 2 days prior to predicted period start with built-in idempotency guards.

---

## 🛠 Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React.js (v18) + Vite (v6) | Fast modern SPA frontend |
| **Styling** | Tailwind CSS | Responsive utility-first styling |
| **Animations** | Framer Motion | Smooth transitions, cards, and interactive elements |
| **Charts** | Chart.js + react-chartjs-2 | Visual cycle and flow trend charts |
| **HTTP Client** | Axios | REST API requests with JWT interceptor |
| **Backend** | Node.js + Express.js | Modular REST API server |
| **Authentication** | JWT (jsonwebtoken) + bcryptjs | Secure stateless authentication |
| **Database** | MongoDB + Mongoose | Document database with relational indexes |
| **LLM & Embeddings** | Google Gemini (`gemini-2.5-flash` / `gemini-embedding-001`) | Semantic embedding generation and RAG chat |
| **Vector Search** | In-Database / Cosine Similarity | Authenticated user-isolated vector similarity search |
| **Scheduling** | node-cron | Automated background period reminder checks |
| **Email** | Nodemailer | Transactional reminder notifications |

---

## 📐 Architecture & RAG Pipeline

```text
                                React.js + Vite (Frontend)
                                           │
                                Tailwind CSS + Framer Motion
                                           │
                                      Axios Client
                                           │ (JWT Bearer Token)
                                           ▼
                                Express.js REST API Server
                                           │
                                JWT Auth Middleware
                                           │
                ┌──────────────────────────┴──────────────────────────┐
                │                                                     │
                ▼                                                     ▼
        Business Controllers                                    AI RAG Controller
    (Periods, Flows, Insights)                                        │
                │                                                     ▼
                ▼                                              Gemini Embeddings
         Service Layer                                                │
  (cycleService / insightService)                                     ▼
        ┌───────┼───────┐                                   Vector Similarity Search
        ▼       ▼       ▼                                 (Strict User Data Scoped)
      Cycle   Pred.   Health                                          │
      Math    Math    Rules                                           ▼
        └───────┼───────┘                                    RAG Context Construction
                │                                                     │
                ▼                                                     ▼
         Mongoose Models                                      Gemini 2.5 Flash
   (User, Period, Flow, Insight)                                      │
                │                                                     ▼
                ▼                                             Personalized Answer
             MongoDB
```

---

## 📂 Project Structure

```text
herflow/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB Mongoose connection
│   ├── controllers/
│   │   ├── authController.js        # Register, login, profile, preferences
│   │   ├── periodController.js      # Period CRUD operations
│   │   ├── flowController.js        # Daily flow CRUD operations
│   │   ├── insightController.js     # Computed analytics & chart datasets
│   │   ├── predictionController.js  # Prediction & fertility status
│   │   └── aiController.js          # RAG chat handler
│   ├── middleware/
│   │   └── authMiddleware.js        # JWT verification middleware
│   ├── models/
│   │   ├── User.js                  # User schema with bcrypt pre-save
│   │   ├── Period.js                # Period schema with compound index
│   │   ├── DailyFlow.js             # Flow schema (date + intensity 0-3)
│   │   ├── CycleInsight.js          # Aggregate cycle metrics
│   │   └── Embedding.js             # User-isolated semantic embeddings
│   ├── routes/
│   │   ├── authRoutes.js            # /api/auth
│   │   ├── periodRoutes.js          # /api/periods
│   │   ├── flowRoutes.js            # /api/flows
│   │   ├── insightRoutes.js         # /api/insights
│   │   ├── predictionRoutes.js      # /api/predictions
│   │   └── aiRoutes.js              # /api/ai
│   ├── services/
│   │   ├── cycleService.js          # Statistical calculations & cycle logic
│   │   ├── insightService.js        # User insight aggregation & datasets
│   │   ├── embeddingService.js      # Gemini embeddings & vector similarity
│   │   ├── aiService.js             # RAG prompt construction & Gemini LLM
│   │   ├── emailService.js          # Nodemailer transporter & HTML email
│   │   └── cronService.js           # node-cron scheduler (daily check)
│   ├── utils/
│   │   └── math.js                  # Cosine similarity & standard deviation
│   ├── .env.example
│   ├── package.json
│   └── server.js                    # Express app entry point
│
├── frontend/
│   ├── public/
│   │   └── favicon.svg              # HerFlow SVG brand icon
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Responsive desktop/mobile nav with active pill
│   │   │   ├── ProtectedRoute.jsx   # Route auth guard
│   │   │   ├── CircularProgressBar.jsx # Animated SVG circular phase gauge
│   │   │   ├── LineChart.jsx        # Chart.js period duration trend chart
│   │   │   ├── FlowChart.jsx        # Chart.js stacked flow intensity chart
│   │   │   └── AuroraText.jsx       # Animated gradient text effect
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # React auth context & token management
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx      # Parallax hero, feature cards, CTAs
│   │   │   ├── LoginPage.jsx        # Dual-mode Sign In / Register card
│   │   │   ├── DashboardPage.jsx    # Period tracking, flow logging, cycle calendar
│   │   │   ├── InsightsPage.jsx     # Pro metrics, phase gauge, charts
│   │   │   ├── ClarityPage.jsx      # Interactive Gemini RAG AI chat
│   │   │   └── NotFoundPage.jsx     # 404 page
│   │   ├── services/
│   │   │   └── api.js               # Axios client with JWT interceptor
│   │   ├── App.jsx                  # Main router config
│   │   ├── index.css                # Tailwind CSS and theme tokens
│   │   └── main.jsx                 # React root render
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
│
├── package.json                     # Workspace orchestration script
└── README.md
```

## 💻 Getting Started

### 1. Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher)
* [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URI)
* [Google Gemini API Key](https://aistudio.google.com/)

---

### 2. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Configure your `.env` variables:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/herflow
   JWT_SECRET=your_secret_jwt_key_here
   GEMINI_API_KEY=your_google_gemini_api_key_here
   FRONTEND_URL=http://localhost:5173
   ```
5. Start the backend server:
   ```bash
   npm run dev
   ```
   *The server runs on `http://localhost:5000`.*

---

### 3. Frontend Setup
1. In a separate terminal, navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will be live on `http://localhost:5173`.*

---

