# Project Report: Phishing Email Detection & Awareness Dashboard

## 1. Problem statement

Email is a common initial-access path because social engineering can bypass technical controls by persuading people to click, reply, or disclose information. Learners need a safe way to practice reading signals without sending phishing emails or collecting credentials.

## 2. Objective

Build a small, industry-oriented defensive system that combines email security fundamentals, explainable detection, risk analytics, and awareness education.

## 3. Users

- Cybersecurity students practicing SOC analysis
- Instructors demonstrating phishing indicators
- Small teams building a basic awareness exercise

## 4. Functional requirements

- Accept sender, subject, body, and safe text/EML sample input.
- Detect urgency, authority pressure, credential language, financial themes, sender patterns, and URL structure.
- Return a risk score, classification, evidence, URL findings, and recommendations.
- Persist analyses and show history, summary counts, and distribution.
- Provide awareness modules covering pause-and-verify, URL inspection, reporting, and safe simulations.

## 5. Threat model

### In scope

- Message-level indicators visible in submitted text
- Suspicious domains, raw IP addresses, punycode, deep subdomains, and sender/link mismatch
- Social-engineering patterns such as fear, urgency, account-lockout threats, and payment pressure

### Out of scope

- Delivering email or contacting recipients
- Opening external links or checking live reputation feeds
- Credential capture or login-page simulation
- Malware execution, attachment detonation, or real-user targeting

## 6. Architecture

The React/Vite client calls an Express API through generated OpenAPI hooks. The API validates input with generated Zod schemas, runs the local explainable engine, persists structured results in PostgreSQL via Drizzle, and returns a result the client can render in the analysis console, history page, and dashboard.

The awareness content is static, safe, and focused on behavior. The sample emails use fictional identities and reserved domains.

## 7. Scoring model

| Signal group | Example contribution |
| --- | ---: |
| Urgency/consequence language | Up to 22 |
| Credential or verification language | Up to 28 |
| Financial/payment language | Up to 20 |
| Authority or impersonation language | Up to 14 |
| Consumer mailbox paired with organization claim | 15 |
| Suspicious URL structure | Up to 30 |
| Attention-grabbing subject formatting | 5 |

The score is bounded at 100. Thresholds are:

- `0-19`: `SAFE`
- `20-39`: `LOW_RISK`
- `40-64`: `SUSPICIOUS`
- `65-100`: `HIGH_RISK`

These thresholds are educational heuristics, not a security guarantee. A real enterprise filter would require calibration against a representative labeled dataset and continuous monitoring of false positives.

## 8. Testing and verification

The project has been checked with:

- Workspace TypeScript typecheck
- API server typecheck and build
- Frontend typecheck
- Database schema push
- API health, summary, samples, history, and high-risk POST checks
- Live preview verification across the overview page

## 9. Future improvements

1. Add a larger synthetic labeled corpus with stratified train/test splits.
2. Train a local TF-IDF + logistic regression baseline and compare it to the rule ensemble.
3. Add precision, recall, F1, confusion matrix, and threshold tuning to the analytics page.
4. Add attachment metadata analysis without opening attachments.
5. Add role-based awareness completion metrics without storing sensitive personal data.
6. Add offline export of anonymized analysis results for classroom review.

## 10. Ethical statement

The project is designed for authorized, defensive education. Any future simulation should use consent, fictional identities, an isolated environment, clear debriefing, and no credential collection.