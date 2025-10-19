
# AIxCyber Financial Simulator — Copilot Instructions

This repo is for a full-stack financial simulation game with advanced AI, cybersecurity, and gamification features. The project is organized in phases; see prompts in the root for implementation details.

## Architecture Overview
- **Backend:** Express.js (Node), MongoDB (Mongoose), JWT auth, error/CORS/rate limiting middleware, WebSocket (Socket.io)
- **Frontend:** React 18 + Vite, Tailwind CSS, React Router v6, Context API, axios API client, TypeScript recommended
- **Directory Structure:**
  - `/backend`: Express app, models, services, routes, middleware, config
  - `/frontend`: React app, components, pages, context, hooks, services, styles
  - `/database`: Mongoose schemas, seeders, assets.json, locations.json, missions.json, achievements.json
  - `/docs`: Prompts, architecture, API specs

## Developer Workflows
- **Backend:**
  - Install: `cd backend; npm install`
  - Run: `npm start` (or `nodemon app.js`)
  - Test: `npm test` (if tests exist)
  - Env: Copy `.env.example` to `.env` and fill secrets
- **Frontend:**
  - Install: `cd frontend; npm install`
  - Run: `npm run dev`
  - Build: `npm run build`
  - Test: `npm test` (if tests exist)

## Key Patterns & Conventions
- **Models:** Use Mongoose schemas with indexes, validation, timestamps, and relationships. See `/database/models/*.js` for User, Portfolio, Transaction, CyberThreat, Achievement, News, Leaderboard, Avatar.
- **API:** RESTful endpoints under `/backend/routes`, grouped by domain (auth, user, portfolio, market, news, security, leaderboard, missions, rewards).
- **Frontend:** Organize by feature (components, pages, context, hooks, services, utils, styles). Use Context API for state (Game, User, Notification, Market, AI).
- **Integration:** Use axios for API calls, Socket.io for real-time updates, and Tailwind for styling/themes.
- **Testing:** Place backend tests in `/backend/tests`, frontend tests in `/frontend/__tests__`.
- **Gamification:** Missions, achievements, XP, levels, reputation, and leaderboards are tracked in MongoDB and surfaced via API and React components.

## External Dependencies
- MongoDB, Socket.io, bcrypt, speakeasy (2FA), OpenAI/LLM APIs, finnhub/alpha_vantage, NewsAPI, Twitter API, Recharts, Framer Motion, Konva.js/Pixi.js

## Agent Guidance
- Scaffold new features by phase (see `/docs/prompts.md` or root prompt file)
- Reference model and API specs before implementing endpoints/components
- Use Conventional Commits: `feat:`, `fix:`, `chore:`
- Prefer incremental PRs focused on one feature/domain
- If blocked, ask for missing files, upstream repo, or example implementation

---
_Update this file as new phases/components are added. Reference concrete files and commands for each major feature._
