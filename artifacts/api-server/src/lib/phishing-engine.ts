import { URL } from "node:url";

export type UrlFinding = {
  url: string;
  risk: "CLEAN" | "SUSPICIOUS" | "MALICIOUS";
  reason: string;
};

export type PhishingAnalysis = {
  riskScore: number;
  classification: "SAFE" | "LOW_RISK" | "SUSPICIOUS" | "HIGH_RISK";
  summary: string;
  indicators: string[];
  urls: UrlFinding[];
  recommendations: string[];
  modelUsed: string;
};

const urgencyPatterns = [
  /\b(urgent|immediately|act now|within \d+ hours?|final notice|last warning)\b/i,
  /\b(account will be (closed|suspended|locked)|avoid suspension)\b/i,
  /\b(you must|action required|respond today)\b/i,
];

const credentialPatterns = [
  /\b(password|passcode|login|sign[- ]?in|verify your identity|one[- ]?time code|otp|mfa)\b/i,
  /\b(confirm|validate|unlock|restore) (your )?(account|access|mailbox)\b/i,
];

const financialPatterns = [
  /\b(invoice|payment|wire transfer|bank|refund|gift card|payroll|transaction)\b/i,
  /\b(update|confirm) (your )?(billing|payment|banking)\b/i,
];

const impersonationPatterns = [
  /\b(help desk|support team|security team|administrator|ceo|finance director)\b/i,
  /\b(unusual activity|suspicious sign[- ]?in|security alert)\b/i,
];

const safeDemoHosts = new Set(["example.com", "example.org", "example.net", "demo.invalid"]);

function extractUrls(text: string): string[] {
  return Array.from(text.matchAll(/\bhttps?:\/\/[^\s<>"')\]]+/gi)).map((match) =>
    match[0].replace(/[.,;:!?]+$/, ""),
  );
}

function analyzeUrl(rawUrl: string, senderDomain: string): UrlFinding {
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.toLowerCase();
    const reasons: string[] = [];

    if (safeDemoHosts.has(host)) {
      return { url: rawUrl, risk: "CLEAN", reason: "Fictional training domain used for safe demonstrations." };
    }

    if (host.includes("xn--")) reasons.push("Uses an internationalized/punycode hostname.");
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) reasons.push("Uses a raw IP address instead of a recognizable domain.");
    if (host.split(".").length > 3) reasons.push("Uses a deep subdomain structure that can hide the real organization.");
    if (/^(login|secure|verify|account|update|support|billing)[-.]/i.test(host)) {
      reasons.push("Hostname starts with a high-pressure account or verification term.");
    }
    if (parsed.username || parsed.password) reasons.push("Contains embedded credentials in the URL.");
    if (senderDomain && !host.endsWith(senderDomain) && !host.endsWith(`.${senderDomain}`)) {
      reasons.push("Link domain does not match the sender's domain.");
    }

    if (reasons.some((reason) => reason.includes("credentials") || reason.includes("IP address") || reason.includes("punycode"))) {
      return { url: rawUrl, risk: "MALICIOUS", reason: reasons.join(" ") };
    }
    if (reasons.length > 0) return { url: rawUrl, risk: "SUSPICIOUS", reason: reasons.join(" ") };
    return { url: rawUrl, risk: "CLEAN", reason: "No structural URL indicators detected." };
  } catch {
    return { url: rawUrl, risk: "SUSPICIOUS", reason: "Could not parse the URL safely; treat it as untrusted." };
  }
}

function senderDomain(sender: string): string {
  const match = sender.match(/@([a-z0-9.-]+\.[a-z]{2,})\b/i);
  return match?.[1]?.toLowerCase() ?? "";
}

export function analyzeEmail(input: { sender: string; subject: string; content: string }): PhishingAnalysis {
  const text = `${input.subject}\n${input.content}`;
  const indicators: string[] = [];
  let score = 0;
  const domain = senderDomain(input.sender);

  const urgencyHits = urgencyPatterns.filter((pattern) => pattern.test(text)).length;
  if (urgencyHits > 0) {
    score += Math.min(22, urgencyHits * 11);
    indicators.push("Urgency or consequence language pressures the recipient to act quickly.");
  }

  const credentialHits = credentialPatterns.filter((pattern) => pattern.test(text)).length;
  if (credentialHits > 0) {
    score += Math.min(28, credentialHits * 14);
    indicators.push("The message asks for or references account access, credentials, or verification.");
  }

  const financialHits = financialPatterns.filter((pattern) => pattern.test(text)).length;
  if (financialHits > 0) {
    score += Math.min(20, financialHits * 10);
    indicators.push("Financial or payment-related language increases social-engineering risk.");
  }

  const impersonationHits = impersonationPatterns.filter((pattern) => pattern.test(text)).length;
  if (impersonationHits > 0) {
    score += Math.min(14, impersonationHits * 7);
    indicators.push("The sender uses authority or security-alert language that is common in impersonation attempts.");
  }

  const senderLooksFree = /@(gmail|outlook|hotmail|protonmail)\./i.test(input.sender);
  const claimsCorporate = /\b(company|corporate|employee|payroll|internal|administrator|help desk)\b/i.test(text);
  if (senderLooksFree && claimsCorporate) {
    score += 15;
    indicators.push("A consumer mailbox is paired with an organizational or support-team claim.");
  }

  if (/display|from/i.test(input.sender) && !domain) {
    score += 8;
    indicators.push("Sender format is incomplete or difficult to attribute to a domain.");
  }

  const urls = extractUrls(text).map((url) => analyzeUrl(url, domain));
  const suspiciousUrls = urls.filter((url) => url.risk !== "CLEAN");
  if (suspiciousUrls.length > 0) {
    score += Math.min(30, suspiciousUrls.reduce((total, url) => total + (url.risk === "MALICIOUS" ? 18 : 10), 0));
    indicators.push(`${suspiciousUrls.length} URL${suspiciousUrls.length === 1 ? "" : "s"} need careful verification before opening.`);
  }

  if (/[A-Z]{5,}/.test(input.subject) || /!{2,}/.test(input.subject)) {
    score += 5;
    indicators.push("Subject formatting uses attention-grabbing capitalization or punctuation.");
  }

  score = Math.min(100, score);
  const classification =
    score >= 65 ? "HIGH_RISK" : score >= 40 ? "SUSPICIOUS" : score >= 20 ? "LOW_RISK" : "SAFE";

  if (classification === "SAFE") {
    indicators.push("No high-confidence phishing signals were found in this sample.");
  }

  const recommendations =
    classification === "SAFE"
      ? ["Continue normal email hygiene.", "Verify unexpected requests through a separate trusted channel."]
      : [
          "Do not click links or open attachments until the request is independently verified.",
          "Check the sender's full address and compare the link domain with the claimed organization.",
          "Report the message to your security team or mark it as phishing.",
        ];

  const summary =
    classification === "HIGH_RISK"
      ? "Multiple high-impact indicators suggest this message is likely phishing."
      : classification === "SUSPICIOUS"
        ? "Several social-engineering or URL indicators warrant manual review."
        : classification === "LOW_RISK"
          ? "A few weak indicators were detected; verify context before acting."
          : "This sample looks consistent with a routine legitimate message.";

  return {
    riskScore: score,
    classification,
    summary,
    indicators,
    urls,
    recommendations,
    modelUsed: "Explainable rule-based NLP ensemble",
  };
}