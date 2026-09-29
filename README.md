# Phishing Email Detection & Awareness Dashboard

SignalDesk is a defensive cybersecurity course project that helps a learner analyze fictional email samples, understand why a message may be suspicious, and practice safer email habits.

## What it demonstrates

- Phishing fundamentals and social-engineering awareness
- Sender, subject, body, urgency, impersonation, and URL indicators
- Explainable risk scoring from 0-100
- Classifications: `SAFE`, `LOW_RISK`, `SUSPICIOUS`, `HIGH_RISK`
- PostgreSQL-backed analysis history
- Dashboard metrics and risk distribution
- Safe `.txt`/`.eml` sample loading
- Awareness playbooks, simulations, and training tips
- OpenAPI-first TypeScript contracts, Zod validation, structured logging, and responsive UI

## Safety boundary

This is a defensive learning tool. It uses fictional examples and reserved documentation domains. It does not send emails, contact real users, collect passwords, create credential-harvesting pages, crawl submitted URLs, or attack real systems.

## Run locally

This repository uses pnpm workspaces and a preconfigured PostgreSQL database.

```bash
pnpm install
pnpm --filter @workspace/db run push
pnpm --filter @workspace/api-spec run codegen
pnpm run typecheck
```

Run the API and web services through the configured Replit workflows, or locally with:

```bash
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/phishing-dashboard run dev
```

Open the web preview and use **Analyze email**. The app seeds three safe fictional examples into the database on first read.

## Detection pipeline

1. Normalize sender, subject, and body input.
2. Extract `https://` URLs without opening them.
3. Score urgency, credential requests, financial language, authority claims, sender mismatch, URL structure, and subject manipulation.
4. Convert the bounded score into a classification.
5. Return the indicators, URL findings, summary, and recommended next steps.
6. Persist the structured result for history and dashboard analytics.

The current engine is intentionally explainable and dependency-light. The `modelUsed` field and structured features provide a clean boundary for adding a local scikit-learn or ONNX model later without hiding the rule evidence.

## API surface

- `GET /api/healthz`
- `GET /api/analyses`
- `POST /api/analyses`
- `GET /api/dashboard/summary`
- `GET /api/samples`
- `GET /api/awareness/modules`

The source of truth is `lib/api-spec/openapi.yaml`. Generated React Query hooks live in `lib/api-client-react`.

## Project map

| Area | Location |
| --- | --- |
| Frontend | `artifacts/phishing-dashboard` |
| API | `artifacts/api-server` |
| Detection engine | `artifacts/api-server/src/lib/phishing-engine.ts` |
| Database schema | `lib/db/src/schema/analyses.ts` |
| Synthetic dataset | `data/synthetic-emails.json` |
| Report | `docs/project-report.md` |
| GitHub strategy | `docs/github-strategy.md` |
| Interview prep | `docs/resume-and-interview.md` |

## Portfolio positioning

This project is strongest when presented as an explainable SOC learning system rather than a claim of production-grade email filtering. The next safe extension is a local, offline model trained on a larger labeled synthetic dataset, evaluated against precision, recall, F1, and false-positive rate.