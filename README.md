# 🌸 HerFlow — Menstrual Cycle Tracking & AI Health Companion

HerFlow is a full-stack web application that helps users track their menstrual cycles, understand their cycle patterns, and get personalized AI-powered insights.

It combines cycle calculations, period predictions, data visualization, and a RAG-based AI assistant powered by Google Gemini.

---

## 🚀 Features

### 🔐 User Authentication

- User registration and login using email and password
- Passwords securely stored using bcrypt
- JWT-based authentication for protected routes
- Each user's data is kept separate and accessible only to them

### 📅 Period & Flow Tracking

- Add current and previous period dates
- Automatically calculate period duration
- Log daily flow levels

### 📊 Cycle Analysis & Prediction

- Calculate average cycle length from previous cycles
- Predict the approximate date of the next period
- Identify different cycle phases
- Estimate the fertility window
- Calculate cycle regularity and variation
- Generate basic rule-based health observations

### 🤖 AI Health Assistant

HerFlow includes an AI assistant called **"Clarity with HerFlow"**.

- Uses Google Gemini for AI-generated responses
- Uses **RAG (Retrieval-Augmented Generation)** for relevant user-specific context
- Converts relevant information into **embeddings**
- Uses **cosine similarity** to find relevant information
- Keeps retrieved information user-specific
- Supports multi-turn conversations
- Includes appropriate medical disclaimers

### 📈 Visual Analytics

- Interactive cycle phase progress indicator
- Period duration charts
- Monthly flow distribution charts
- Calendar showing cycle history and flow information

### 📧 Period Reminders

- Automatically checks upcoming predicted periods
- Sends an email reminder **2 days before the predicted period**
- Uses `node-cron` for scheduled background tasks
- Prevents duplicate reminder emails

---

## 🧠 RAG Pipeline

The AI assistant follows this basic flow:

```text
User asks a question
        ↓
Relevant user data is retrieved
        ↓
Data is converted into embeddings
        ↓
Cosine similarity finds relevant information
        ↓
Relevant context is added to the prompt
        ↓
Google Gemini generates the response
        ↓
Personalized AI answer

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Frontend** | React.js, Vite |
| **Styling** | Tailwind CSS |
| **Animations** | Framer Motion |
| **Charts** | Chart.js, react-chartjs-2 |
| **Backend** | Node.js, Express.js |
| **Authentication** | JWT, bcryptjs |
| **Database** | MongoDB, Mongoose |
| **AI** | Google Gemini API |
| **RAG** | Embeddings, Vector Search, Cosine Similarity |
| **Scheduling** | node-cron |
| **Email** | Nodemailer |

---

## 🏗️ Project Structure


HerFlow/
│
├── frontend/
│   └── React.js application
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── models/
│   ├── middleware/
│   └── config/
│
└── README.md
