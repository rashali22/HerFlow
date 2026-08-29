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

## ⚙️ Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd HerFlow
```

### 2. Backend Setup

Navigate to the backend folder:

```bash
cd backend
```

Install the required dependencies:

```bash
npm install
```

Create a `.env` file inside the `backend` folder:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/herflow
JWT_SECRET=your_secret_jwt_key_here
GEMINI_API_KEY=your_google_gemini_api_key_here
FRONTEND_URL=http://localhost:5173
```

Start the backend server:

```bash
npm run dev
```

The backend will run on:

```text
http://localhost:5000
```

### 3. Frontend Setup

Open a new terminal and navigate to the frontend folder:

```bash
cd frontend
```

Install the required dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

The frontend will run on:

```text
http://localhost:5173
```

### 4. Run the Application

Make sure both the frontend and backend servers are running:

```text
Frontend → http://localhost:5173
Backend  → http://localhost:5000
```

Open the frontend URL in your browser to use HerFlow.

---

