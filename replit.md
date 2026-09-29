# Phishing Email Detection & Awareness Dashboard

Defensive cybersecurity dashboard for explainable phishing analysis, risk analytics, and safe security-awareness practice.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the Express API on the configured API workflow
- `pnpm --filter @workspace/phishing-dashboard run dev` — run the Vite dashboard on the configured web workflow
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes to the development database

## Stack

- React + Vite + TypeScript
- Express 5 API with OpenAPI-first contracts
- PostgreSQL + Drizzle ORM
- React Query generated hooks and Zod validation
- Explainable rule-based NLP signal ensemble with an ML-ready model boundary

## Where things live

- `artifacts/phishing-dashboard/src/App.tsx` — dashboard routes and user workflows
- `artifacts/phishing-dashboard/src/index.css` — SignalDesk visual system and responsive layout
- `artifacts/api-server/src/lib/phishing-engine.ts` — sender, content, urgency, and URL scoring engine
- `artifacts/api-server/src/lib/content.ts` — fictional samples and awareness modules
- `artifacts/api-server/src/routes/phishing.ts` — analysis, history, summary, samples, and awareness API
- `lib/db/src/schema/analyses.ts` — persisted analysis record
- `lib/api-spec/openapi.yaml` — source-of-truth API contract
- `data/synthetic-emails.json` — safe, fictional dataset examples
- `docs/` — project report, GitHub strategy, and interview/resume preparation

## Architecture decisions

- The first model is explainable and deterministic so a beginner can trace every score back to a visible signal.
- URL inspection never fetches or opens external URLs; it only parses the submitted text locally.
- The app seeds fictional examples only and explicitly avoids credential collection, live phishing, or real-user targeting.
- The analysis record stores structured indicators, URL findings, and recommendations so the UI can teach the reasoning, not only show a verdict.

## Product

SignalDesk lets a student paste or safely load a `.txt`/`.eml` sample, enter sender details, inspect suspicious URLs, detect manipulation language, receive a risk classification, review history, and practice awareness playbooks. The dashboard summarizes recent activity and risk distribution.

## Gotchas

- Keep the OpenAPI spec and generated clients in sync after any API change.
- Do not add live URL crawling, credential capture, outbound email, or real-user simulation.
- Uploaded samples are read locally in the browser; only the entered text is sent to the analysis API when the user submits the form.