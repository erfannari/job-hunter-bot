# 🚀 How to Run Nari Georgia Jobs 24/7 in the Cloud (Free)

To keep the bot running 24/7 without needing your personal computer turned on, you can host it for **free ($0)** on any cloud provider.

---

## 🥇 Method 1: Koyeb / Railway / Render (Easiest — 2 Minutes, Zero Server Setup)

### Step 1: Push project to GitHub
1. Create a private GitHub repository (e.g. `georgia-job-hunter`).
2. Push your project code:
   ```bash
   git init
   git add .
   git commit -m "feat: initial release"
   git remote add origin https://github.com/YOUR_USERNAME/georgia-job-hunter.git
   git push -u origin main
   ```
*(Note: `.gitignore` protects your `.env` so secrets are never pushed to GitHub)*

### Step 2: Deploy to Koyeb or Railway
1. Go to [koyeb.com](https://www.koyeb.com/) or [railway.app](https://railway.app/).
2. Click **Create New Service** -> Select **GitHub Repository**.
3. Choose your `georgia-job-hunter` repository.
4. Add your **Environment Variables** in the web dashboard:
   - `TELEGRAM_BOT_TOKEN` = `8690660068:AAF663gIA67zwT7rmlOvFPQtacbt7VQD0vE`
   - `GEMINI_API_KEY` = `your_gemini_api_key`
   - `JOB_SCAN_INTERVAL_MINUTES` = `15`
   - `MIN_MATCH_SCORE` = `60`
   - `AI_PROVIDER` = `gemini`
5. Click **Deploy**!
   * The cloud service will build the `Dockerfile` and run the bot 24/7 forever.

---

## 🥈 Method 2: Fly.io (100% Free Forever)

Fly.io gives you free 24/7 VM instances that never sleep.

1. Install Fly CLI:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```
2. Login & Launch:
   ```bash
   fly auth login
   fly launch
   ```
3. Set your secrets:
   ```bash
   fly secrets set TELEGRAM_BOT_TOKEN="your_token" GEMINI_API_KEY="your_key"
   ```
4. Deploy:
   ```bash
   fly deploy
   ```

---

## 🥉 Method 3: Any Cheap Cloud VPS / Oracle Cloud Always Free ($0)

If you or your friend have an Ubuntu cloud server or Oracle Cloud Free instance:

1. Clone repo onto the server:
   ```bash
   git clone <repo_url>
   cd georgia-job-hunter
   ```
2. Create `.env`:
   ```bash
   cp .env.example .env
   nano .env # Add your tokens
   ```
3. Run with Docker Compose:
   ```bash
   docker compose up -d
   ```
   *The bot will start in a detached container and automatically restart if the server reboots!*
