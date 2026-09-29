# Resume Proof and Interview Preparation

## Resume bullets

- Built a defensive phishing email detection dashboard with React, TypeScript, Express, PostgreSQL, Drizzle, and OpenAPI, supporting explainable scoring, URL inspection, analysis history, and awareness playbooks.
- Designed a bounded 0-100 rule-based NLP risk engine that detects urgency, credential requests, impersonation language, sender mismatches, suspicious URL structures, and financial pressure while returning human-readable evidence.
- Implemented a safe cybersecurity learning workflow using synthetic emails and reserved domains only; explicitly excluded outbound phishing, credential harvesting, live URL crawling, and real-user targeting.
- Added typed API contracts, Zod validation, structured logging, responsive dashboard analytics, and database persistence for repeatable SOC-style analysis.

## 30-second explanation

“SignalDesk is a defensive learning dashboard for phishing analysis. A user pastes a fictional email or loads a safe text/EML sample, and the API extracts sender, content, urgency, social-engineering, and URL features. It returns an explainable risk score and classification, stores the result, and shows history plus awareness guidance. I intentionally kept the first model deterministic and auditable so analysts can see why a message was flagged.”

## Interview questions and answer points

### Why rule-based first instead of a black-box model?

The project is educational and explainability matters. A deterministic baseline is easy to test, debug, and compare against a future local ML model. The API already returns structured evidence and a model label, so the model boundary can evolve without hiding the analyst reasoning.

### How would you evaluate a future ML model?

Create a larger labeled synthetic corpus, split it by campaign/template to reduce leakage, and report precision, recall, F1, confusion matrix, and false-positive rate. I would optimize for a useful operating point rather than accuracy alone because false positives create analyst workload.

### How are URLs handled safely?

The current system only extracts and parses URL text. It never makes an outbound request. It checks structural features such as raw IPs, punycode, deep subdomains, credential components, high-pressure hostnames, and mismatch with the sender domain.

### What are the limitations?

Text-only analysis cannot prove intent, cannot inspect attachments, and can miss well-written phishing. Sender spoofing and display-name deception need mail-header and authentication signals such as SPF, DKIM, and DMARC in a production system.

### What would you add next?

A local offline TF-IDF/logistic-regression baseline, email-header parsing, attachment metadata checks, threshold tuning, analyst feedback, and privacy-preserving aggregate metrics. I would keep live reputation lookups optional and controlled rather than making the core workflow depend on external services.

### What is the ethical boundary?

Use authorization, fictional data, isolated environments, no credentials, no outbound delivery, no impersonation of real organizations, and a clear debrief for any simulation. The goal is better detection and reporting behavior, not testing people without consent.