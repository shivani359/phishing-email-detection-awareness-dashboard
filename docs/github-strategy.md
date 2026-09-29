# GitHub and LinkedIn Strategy

## Repository structure

Keep the repository easy to scan:

```text
artifacts/
  api-server/
  phishing-dashboard/
lib/
  api-spec/
  db/
data/
docs/
screenshots/
README.md
```

## Suggested repository description

> Explainable phishing email detection and security awareness dashboard built with React, TypeScript, Express, PostgreSQL, Drizzle, and OpenAPI.

## Suggested topics

`cybersecurity` `phishing-detection` `email-security` `soc` `threat-detection` `machine-learning` `security-awareness` `typescript` `react` `postgresql`

## Commit plan

Use focused commits when publishing the project:

1. `feat: scaffold defensive phishing dashboard`
2. `feat: add explainable email risk engine`
3. `feat: persist analysis history and dashboard metrics`
4. `feat: add awareness playbooks and synthetic samples`
5. `docs: add project report and interview notes`

## Screenshots to include

- Overview with seeded risk distribution
- Analysis form with a synthetic sample loaded
- High-risk result showing evidence and URL inspection
- History detail panel
- Awareness lab modules

Never include real email addresses, personal data, live malicious URLs, credentials, or screenshots of third-party systems.

## LinkedIn post outline

> Built SignalDesk, a defensive phishing email detection and awareness dashboard for my cybersecurity course project.
>
> It combines explainable sender/content/URL signals, a 0-100 risk score, PostgreSQL-backed analysis history, and awareness playbooks. The project uses synthetic samples and reserved domains only: no real phishing, credential collection, or external URL crawling.
>
> What I learned: threat scoring is only useful when the analyst can explain the evidence, understand false positives, and choose a safe next action.

Add a short screen recording or the screenshots in `screenshots/`, plus the GitHub link.