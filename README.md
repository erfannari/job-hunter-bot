# Nari Georgia Jobs (@NariGeorgiaJobsBot)

Personal Telegram job-hunting agent designed to discover, filter, and alert on the **latest relevant jobs in Georgia** (Tbilisi, Batumi, Kutaisi & remote for Georgia), focusing on **Frontend Engineering** (Angular, Vue, Nuxt, HTML/CSS) and **Design** (UI/UX, Product Design).

---

## 🚀 Quick Start

### 1. Requirements
- Node.js 18+
- Telegram Bot Token from [@BotFather](https://t.me/BotFather)

### 2. Setup

```bash
# Clone or navigate to the directory
cd georgia-job-hunter

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### 3. Configure `.env`
Edit `.env` and fill in:
```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrSTUvwxYZ
```

### 4. Running the Bot

```bash
# Development (with hot reload)
npm run dev

# Typecheck
npm run typecheck

# Build and Production Run
npm run build
npm run start
```

---

## 🤖 Supported Commands

- `/start` — Welcome message and target profile overview
- `/help` — List of all available bot commands
- `/jobs` — View active matching jobs
- `/latest` — View newly discovered jobs
- `/saved` — View bookmarked jobs
- `/settings` — Inspect current search & filtering settings
- `/stats` — Check uptime and system metrics

---

## 🌐 Target Job Sources

The scraper/feed architecture is configured to support:
1. **Jobs.ge** (`https://jobs.ge/en/`) — Primary Georgian job board.
2. **HR.ge** (`https://www.hr.ge/`) — Popular Georgian recruitment platform.
3. **HeadHunter Georgia** (`https://tbilisi.headhunter.ge/`) — Georgian tech and regional vacancies.
4. **LinkedIn Jobs** (`https://www.linkedin.com/jobs/`) — Tech vacancies with location set to Georgia.

---

## 🤖 How to Use the Bot

1. Open Telegram on your phone or desktop.
2. Search for `@NariGeorgiaJobsBot` or open `https://t.me/NariGeorgiaJobsBot`.
3. Press **Start** or send `/start` to see the welcome screen and target profile overview.
4. **Available Commands:**
   - `/start` — View introduction and active search criteria.
   - `/help` — Overview of bot commands and how scoring works.
   - `/settings` — Inspect current search settings (Frontend 4+ yrs, UI/UX, Georgia locations).
   - `/stats` — Check bot uptime and tracked job metrics.
   - `/jobs` & `/latest` — View current matching vacancies.
   - `/saved` — View jobs you have saved for later.

---

## 🗺️ Roadmap

- [x] **Phase 1:** Foundation (grammY bot, TypeScript, environment configuration, command handlers).
- [ ] **Phase 2:** Job and Search Query data models, normalizers, and profile configuration.
- [ ] **Phase 3:** First real Georgian job source integration (e.g., Jobs.ge).
- [ ] **Phase 4:** PostgreSQL database and duplicate detection.
- [ ] **Phase 5:** Interactive Telegram notifications with inline action buttons (Apply, Save, Ignore).
- [ ] **Phase 6:** AI analysis and schema-validated match scoring.
- [ ] **Phase 7:** Additional job sources (HR.ge, HeadHunter Georgia, LinkedIn).
- [ ] **Phase 8:** Automated scheduler & periodic scanning.
- [ ] **Phase 9:** Dashboard (Nuxt).

