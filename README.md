# Multi-Agent Negotiation Simulator

A powerful, AI-driven platform for simulating and analyzing negotiation scenarios between automated agents. The simulator leverages Google's Gemini AI to generate highly realistic, human-like dialogue while using mathematical concession strategies to reach agreements.

## 🚀 Features

*   **Diverse Scenarios**: Simulate multiple business cases including **Job Offers**, **Vendor Pricing**, and **Budget Allocation**.
*   **Dynamic AI Personas**: Agents are powered by LLMs (Google Gemini) to negotiate using natural, conversational language.
*   **Configurable Strategies**: Choose between **Aggressive**, **Balanced**, and **Conservative** strategies for both Buyers and Sellers.
*   **Algorithmic Concessions**: Under the hood, the engine calculates realistic offer increments/decrements, ensuring smooth convergence or firm stalemates based on the chosen limits and strategies.
*   **Clean Financials**: Automatically rounds negotiation amounts over $1,000 to clean, realistic figures (e.g., $7,500 instead of $7,543).
*   **Detailed Analytics & Reports**: View the outcomes, final settled amounts, total rounds, and full chat transcripts of past negotiations.

## 🏗️ Architecture & Tech Stack

This project is split into a modern web frontend and a fast, asynchronous Python backend.

### Frontend
*   **Framework**: React (TypeScript) via Vite
*   **Styling**: Tailwind CSS
*   **Key Dependencies**: Axios for API communication, React Router for navigation.

### Backend
*   **Framework**: FastAPI (Python)
*   **Database**: MongoDB (async communication via Motor)
*   **AI Integration**: Google Generative AI (Gemini)
*   **Server**: Uvicorn

---

## 🛠️ Installation & Setup

### Prerequisites
*   [Node.js](https://nodejs.org/) (for the frontend)
*   [Python 3.10+](https://www.python.org/) (for the backend)
*   [MongoDB](https://www.mongodb.com/) (Local or Atlas)
*   A Google Gemini API Key

### 1. Backend Setup
1. Open a terminal and navigate to the `backend` directory.
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables. Create or edit the `.env` file in the `backend` folder:
   ```env
   MONGO_URI=your_mongodb_connection_string
   DATABASE_NAME=negotiation_db
   SECRET_KEY=your_secret_key
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   GEMINI_API_KEY=your_gemini_api_key
   GEMINI_MODEL=gemini-2.0-flash
   ```

### 2. Frontend Setup
1. Open a terminal and navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```

---

## 🏃‍♂️ How to Run the Application

You need to run both the backend and frontend servers simultaneously.

**Run the Backend:**
From the `backend` directory, run:
```bash
venv\Scripts\python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
*The API will be available at `http://localhost:8000`.*

**Run the Frontend:**
From the `frontend` directory, run:
```bash
npm run dev
```
*The web app will be available at `http://localhost:5173`.*

---

## 🌱 Seeding the Database (Agents & Users)

To run negotiations, your database needs Agents (the AI negotiators) and Users. We provide seed scripts to easily populate your database.

1. **Full Reset & Seed**: Clears all users, reports, and agents, and generates a fresh set.
   ```bash
   cd backend
   venv\Scripts\python scripts/reset_and_seed.py
   ```
2. **Seed Agents Only**: If you just want to populate the 18 core agents (covering every scenario and strategy) without deleting your users/reports.
   ```bash
   cd backend
   venv\Scripts\python scripts/seed_more_agents.py
   ```

*Default login created by the full reset script:*
*   **Email**: admin@example.com
*   **Password**: admin123

---

## 📖 Workflow: How to Use the Simulator

1. **Log In**: Open the frontend (`localhost:5173`) and log in using your user credentials (or the seeded admin account).
2. **Explore Agents**: Visit the **Agents** tab to view the available AI negotiators, their roles (Buyer/Seller), and their configured strategies.
3. **Start a Scenario**:
   * Navigate to the **Scenario** tab.
   * Select the type of negotiation (e.g., Job Offer).
   * Pick a Buyer agent and a Seller agent.
   * Input the starting financial constraints (e.g., the company's initial offer vs the candidate's target expectation).
   * Set the maximum number of rounds (e.g., 5, 10, 15).
4. **Watch the Simulation**: Click "Run Simulation". A chat interface will appear, and you can watch the AI agents barter back and forth in real-time until they reach an agreement or hit a stalemate.
5. **View Reports**: Go to the **Reports** tab to see historical data of all past negotiations, including the final settled amount and the status (Accepted, Rejected, or Failed).