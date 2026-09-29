export const sampleEmails = [
  {
    id: "invoice-portal",
    label: "Synthetic phishing · fake invoice",
    sender: "billing-team@gmail.com",
    subject: "URGENT: Invoice review required today!!",
    content:
      "Hello team, our billing portal detected an issue with your payment. Confirm your account immediately to avoid suspension: https://secure-billing.example.net/verify",
  },
  {
    id: "security-alert",
    label: "Synthetic phishing · account alert",
    sender: "helpdesk@support-demo.invalid",
    subject: "Security alert for your mailbox",
    content:
      "We detected an unusual sign-in. Validate your mailbox within 2 hours or your access will be locked. Visit https://example.com/security to review the activity.",
  },
  {
    id: "campus-update",
    label: "Legitimate training sample",
    sender: "library@northbridge.example.org",
    subject: "Library hours for the fall term",
    content:
      "The library will close at 8 PM this Friday for scheduled maintenance. You do not need to take any action. Visit the library desk if you have questions.",
  },
];

export const awarenessModules = [
  {
    id: "pause-verify",
    title: "Pause, then verify",
    category: "Core habit",
    level: "Beginner",
    description: "Use a short pause to interrupt urgency before you click, reply, or pay.",
    steps: [
      "Stop when a message creates fear, urgency, or unusual pressure.",
      "Open the full sender address instead of trusting the display name.",
      "Verify the request using a phone number or bookmark you already trust.",
    ],
    tip: "A real deadline can survive a verification step.",
  },
  {
    id: "url-inspection",
    title: "Read links before opening",
    category: "URL safety",
    level: "Intermediate",
    description: "Learn to spot mismatched domains, deep subdomains, and risky URL structures.",
    steps: [
      "Hover over the link without clicking it.",
      "Read the registrable domain from right to left.",
      "Treat raw IPs, punycode, and unrelated domains as warning signs.",
    ],
    tip: "The brand name in a path does not make the domain trustworthy.",
  },
  {
    id: "reporting-playbook",
    title: "Report without spreading",
    category: "Playbook",
    level: "Intermediate",
    description: "A safe response flow for suspicious messages in a team or classroom.",
    steps: [
      "Do not forward the message to colleagues as a warning.",
      "Use the approved report-phishing workflow or security mailbox.",
      "If you clicked, report quickly and describe what happened honestly.",
    ],
    tip: "Fast reporting helps defenders contain risk; it is not an admission of failure.",
  },
  {
    id: "simulation-debrief",
    title: "Simulation debrief",
    category: "Simulation",
    level: "Advanced",
    description: "Practice explaining the signals you noticed in a safe fictional email.",
    steps: [
      "Name the sender, content, and URL signals separately.",
      "Choose the safest next action before discussing the message.",
      "Write one sentence explaining how the message tried to influence you.",
    ],
    tip: "The goal is better judgment, never blame or credential collection.",
  },
];