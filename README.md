<div align="center">

# Christian Neal Paredes — Portfolio

<em>My fullstack portfolio website</em>

[![Live Site](https://img.shields.io/badge/live-christiannealparedes.onrender.com-red?style=flat-square)](https://christiannealparedes.onrender.com/)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-149ECA?style=flat-square&logo=react&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Render](https://img.shields.io/badge/Deployed_on-Render-46E3B7?style=flat-square&logo=render&logoColor=white)

</div>

<p align="center">
  <img src="frontend/public/projects/portfolio-website.png" alt="Portfolio preview" width="800">
</p>

## Overview

This repo is a monorepo with two independently deployable pieces:

|                 |                                                                                                                                              |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **`frontend/`** | Vite + React 19 + TypeScript single-page site. Framer Motion for scroll animations, Tailwind CSS 4 for styling.                              |
| **`backend/`**  | Express 5 + TypeScript API. Persists contact form submissions to PostgreSQL and sends a notification email via [Resend](https://resend.com). |

The site is one long scroll made up of five sections — **Hero, Projects, Skills,
About, Contact** — plus a min-duration boot loader that waits for images before
revealing the page. Each section has its own route (`/`, `/projects`, `/skills`,
`/about`, `/contact`); all of them render the same page, and `useSectionSync`
keeps the URL and scroll position in sync as you navigate.

## Tech stack

- **Frontend:** React 19, TypeScript, Vite, React Router, Tailwind CSS 4, Framer Motion, React Icons, oxlint
- **Backend:** Node.js, Express 5, TypeScript, node-postgres (`pg`), Resend, tsx
- **Database:** PostgreSQL ([Neon](https://neon.tech) in production)
- **Infra:** Node.js runtime on [Render](https://render.com), deployed via GitHub Actions

## Project structure

```
portfolio/
├── frontend/
│   ├── public/              # static assets (project screenshots, photos, resume.pdf)
│   └── src/
│       ├── router.tsx       # React Router route tree
│       ├── layouts/         # RootLayout — Navbar/Footer/Loader shell around <Outlet />
│       ├── components/      # Navbar, Footer, Loader
│       ├── pages/           # home/ (renders all sections), hero/, projects/, skills/,
│       │                    # about/, contact/, error/ (ErrorPage, NotFound)
│       ├── data/            # projects.ts, skills.ts, panels.ts, sections.ts (content lives as data)
│       ├── services/        # contact.service.ts — talks to the backend API
│       ├── hooks/           # useScrollReveal, useSectionSync (syncs route <-> scroll position)
│       └── types/
└── backend/
    ├── render.yaml          # Render Blueprint (Node runtime)
    └── src/
        ├── server.ts             # Express app, health/db-check routes
        ├── db.ts                 # pg Pool + table init
        ├── routes/contact.route.ts
        ├── controllers/contactController.ts
        └── providers/            # contact.provider.ts (DB), mailer.provider.ts (Resend)
```

## Getting started

Requires Node.js 22+ and a PostgreSQL database (a free [Neon](https://neon.tech) instance works well).

### Backend

```bash
cd backend
npm install
cp .env.example .env   # see Environment variables below
npm run dev             # tsx watch, http://localhost:<PORT>
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # see Environment variables below
npm run dev             # vite dev server
```

Other scripts (run inside `frontend/` or `backend/`):

| Command         | Frontend                          | Backend                        |
| --------------- | --------------------------------- | ------------------------------ |
| `npm run dev`   | Vite dev server with HMR          | `tsx watch` on `src/server.ts` |
| `npm run build` | Type-check + Vite build → `dist/` | `tsc` compile → `dist/`        |
| `npm start`     | —                                 | Run compiled `dist/server.js`  |
| `npm run lint`  | oxlint                            | —                              |

### Environment variables

**`backend/.env`**

| Variable         | Description                                                   |
| ---------------- | ------------------------------------------------------------- |
| `DATABASE_URL`   | Postgres connection string                                    |
| `PORT`           | Port the API listens on                                       |
| `NODE_ENV`       | `development` / `production` — controls SSL behavior for `pg` |
| `CLIENT_ORIGIN`  | Allowed CORS origin for the frontend                          |
| `RESEND_API_KEY` | API key from [Resend](https://resend.com)                     |
| `MAIL_TO`        | Address that receives contact form submissions                |

**`frontend/.env`**

| Variable       | Description                                                   |
| -------------- | ------------------------------------------------------------- |
| `VITE_API_URL` | Base URL of the backend API, e.g. `http://localhost:5000/api` |

## API

| Method | Endpoint        | Description                                                                               |
| ------ | --------------- | ----------------------------------------------------------------------------------------- |
| `GET`  | `/api/health`   | Liveness check                                                                            |
| `GET`  | `/api/db-check` | Verifies the database connection                                                          |
| `POST` | `/api/contact`  | Body: `{ name, email, message }`. Saves the message to Postgres and emails it via Resend. |

On startup the backend creates the `messages` table if it doesn't already exist.

## Deployment

The backend runs on Render's native Node.js runtime (no Docker), defined in
[`backend/render.yaml`](backend/render.yaml) (set the Render Blueprint's file
path to `backend/render.yaml`): Render installs dependencies, compiles TypeScript
with `npm run build`, and starts `dist/server.js`. Neon is the managed Postgres
provider.

Deployments are driven by GitHub Actions
([`.github/workflows/render.yaml`](.github/workflows/render.yaml)):

- **Pull requests / pushes** touching `backend/` run `npm ci` and `npm run build`.
- **Pushes to `main`** then call the Render API to deploy that commit and wait
  until `/api/health` passes and the deploy is live. Render's own auto-deploy is
  disabled so there is a single deploy path.

Required repo secrets: `RENDER_API_KEY` and `RENDER_SERVICE_ID` (the `srv-…` id
from the backend service's dashboard URL). Runtime secrets (`DATABASE_URL`,
`CLIENT_ORIGIN`, `RESEND_API_KEY`, `MAIL_TO`) are set in the Render dashboard.

## Author

**Christian Neal Paredes**
[GitHub](https://github.com/ThomasDelamort) · [Live site](https://christiannealparedes.onrender.com/)
</content>
