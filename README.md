# FutureMe - Meet the version of you who already made it.

FutureMe is an AI-powered personal reflection web application. Users input details about their current life, age, goals, struggles, and one-year vision, select a specific tone (Motivational, Brutally Honest, Calm Mentor, CEO Mode), and receive a structured personal reflection blueprint from their future self. Once generated, users can copy their blueprints and enter an active, contextual chat thread with their future identity.

## Project Structure

```text
futureme/
  frontend/
    index.html     # HTML Structure & Form Setup
    style.css      # Premium dark, glassmorphism CSS
    script.js      # Form Validation, Chat History & Copy APIs
  backend/
    server.js      # Express server & Gemini API implementation
    package.json   # Node dependencies & start scripts
    .env.example   # Environment template
    .env           # Configured API keys (ignored by git)
  README.md        # Documentation
```

## Setup & Running the Application

### 1. Configure the Gemini API Key
1. Obtain an API Key from Google AI Studio.
2. Open the file [backend/.env](file:///C:/Users/GILLELA%20SRAVIKA/.gemini/antigravity/scratch/futureme/backend/.env) (or copy `backend/.env.example` to `backend/.env`).
3. Replace the placeholder value with your actual Gemini API Key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   PORT=5000
   ```

### 2. Start the Backend Server
Open your terminal and execute:
```bash
cd backend
npm install
npm run dev
```
The server will boot and listen at `http://localhost:5000`.

### 3. Open the Frontend
Once the server is running, open your web browser and navigate to:
```text
http://localhost:5000
```
*(The Express backend automatically serves the frontend static directory directly).*

---

## API Routes Documentation

### 1. `POST /api/generate-futureme`
Generates the initial detailed reflection blueprint card.

- **Request Body**:
  ```json
  {
    "name": "Sravika",
    "age": "23",
    "goal": "Build a successful business",
    "struggle": "Lack of consistency",
    "oneYearVision": "Running a profitable business",
    "tone": "Brutally Honest"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "message": "A powerful 120-180 word message from the future self.",
      "futureIdentity": "Disciplined Global Founder",
      "nextMoves": [
        "Create an hourly time-block schedule for tomorrow.",
        "Remove all distracting workspace items.",
        "Ship the first iteration of your MVP before Friday."
      ],
      "habit": "Spend 15 minutes planning each evening.",
      "warning": "Procrastinating by reading theory instead of writing code.",
      "mantra": "Velocity over perfection."
    }
  }
  ```

### 2. `POST /api/chat-futureme`
Handles conversational query loops with your FutureMe profile.

- **Request Body**:
  ```json
  {
    "userProfile": {
      "name": "Sravika",
      "age": "23",
      "goal": "Build a successful business",
      "struggle": "Lack of consistency",
      "oneYearVision": "Running a profitable business",
      "tone": "Brutally Honest"
    },
    "chatHistory": [
      {
        "role": "user",
        "message": "Will I actually make it?"
      },
      {
        "role": "futureme",
        "message": "Only if your daily actions stop negotiating with your dreams."
      }
    ],
    "question": "What should I focus on this week?"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "reply": "Focus on shipping the basic backend structure. Stop reading tutorials..."
  }

---

## Netlify Deployment Guide (Serverless API)

This project has been pre-configured to deploy seamlessly on Netlify as a serverless app using Netlify Functions.

### 1. Project Netlify Configuration Files
The following configuration files are located at the root of the project:
* [netlify.toml](file:///C:/Users/GILLELA%20SRAVIKA/.gemini/antigravity/scratch/futureme/netlify.toml): Directs Netlify to serve `frontend/` as the static site and route `/api/*` requests to the serverless function.
* [package.json](file:///C:/Users/GILLELA%20SRAVIKA/.gemini/antigravity/scratch/futureme/package.json): Directs Netlify to install runtime dependencies for the serverless function.
* [functions/api.js](file:///C:/Users/GILLELA%20SRAVIKA/.gemini/antigravity/scratch/futureme/functions/api.js): The Express API endpoint wrapped in `serverless-http`.

### 2. Deploy to Netlify in 3 Steps

#### Option A: Deploy via GitHub (Recommended)
1. Initialize Git and push the project to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "deploy to netlify"
   # Create a repository on GitHub and link it:
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```
2. Log in to [Netlify Dashboard](https://app.netlify.com/) and click **Add new site** -> **Import an existing project** -> Select your GitHub repository.
3. Add your Gemini API Key:
   * Go to your site dashboard in Netlify -> **Site configuration** -> **Environment variables**.
   * Add a new variable named `GEMINI_API_KEY` and paste your Gemini API key value.
   * Trigger a deploy! Netlify will automatically compile the serverless function and launch the site.

#### Option B: Deploy via Netlify CLI (Command Line)
1. Install Netlify CLI globally if you haven't already:
   ```bash
   npm install -g netlify-cli
   ```
2. Log in to Netlify from your command line:
   ```bash
   netlify login
   ```
3. Run the production deployment command from the project root directory:
   ```bash
   netlify deploy --prod
   ```
4. Configure the environment variable:
   * Go to Netlify Dashboard -> Select your site -> Site Configuration -> Environment Variables.
   * Add `GEMINI_API_KEY=your_gemini_api_key`.
   * Redeploy to apply changes.
  ```
