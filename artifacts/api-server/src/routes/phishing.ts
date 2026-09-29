import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, analysesTable } from "@workspace/db";
import {
  CreateAnalysisBody,
  CreateAnalysisResponse,
  DashboardSummary,
  GetDashboardSummaryResponse,
  ListAnalysesResponse,
  ListAwarenessModulesResponse,
  ListSampleEmailsResponse,
} from "@workspace/api-zod";
import { analyzeEmail } from "../lib/phishing-engine";
import { awarenessModules, sampleEmails } from "../lib/content";

const router: IRouter = Router();
let seedPromise: Promise<void> | null = null;

async function ensureSeedData(): Promise<void> {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    const existing = await db.select({ id: analysesTable.id }).from(analysesTable).limit(1);
    if (existing.length > 0) return;
    const seeded = sampleEmails.map((sample) => ({
      sender: sample.sender,
      subject: sample.subject,
      content: sample.content,
      ...analyzeEmail(sample),
    }));
    await db.insert(analysesTable).values(seeded);
  })().catch((error) => {
    seedPromise = null;
    throw error;
  });
  return seedPromise;
}

router.get("/analyses", async (_req, res): Promise<void> => {
  await ensureSeedData();
  const rows = await db.select().from(analysesTable).orderBy(desc(analysesTable.createdAt)).limit(50);
  res.json(ListAnalysesResponse.parse(rows));
});

router.post("/analyses", async (req, res): Promise<void> => {
  const parsed = CreateAnalysisBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const analysis = analyzeEmail(parsed.data);
  const [created] = await db
    .insert(analysesTable)
    .values({ ...parsed.data, ...analysis })
    .returning();
  res.status(201).json(CreateAnalysisResponse.parse(created));
});

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  await ensureSeedData();
  const rows = await db.select().from(analysesTable);
  const counts = new Map<string, number>();
  for (const row of rows) counts.set(row.classification, (counts.get(row.classification) ?? 0) + 1);
  const last24h = Date.now() - 24 * 60 * 60 * 1000;
  const summary: DashboardSummary = {
    totalAnalyzed: rows.length,
    highRiskCount: counts.get("HIGH_RISK") ?? 0,
    suspiciousCount: (counts.get("SUSPICIOUS") ?? 0) + (counts.get("HIGH_RISK") ?? 0),
    safeCount: (counts.get("SAFE") ?? 0) + (counts.get("LOW_RISK") ?? 0),
    averageRisk: rows.length === 0 ? 0 : Math.round((rows.reduce((total, row) => total + row.riskScore, 0) / rows.length) * 10) / 10,
    last24hCount: rows.filter((row) => row.createdAt.getTime() >= last24h).length,
    classificationBreakdown: ["SAFE", "LOW_RISK", "SUSPICIOUS", "HIGH_RISK"].map((classification) => ({
      classification: classification as DashboardSummary["classificationBreakdown"][number]["classification"],
      count: counts.get(classification) ?? 0,
    })),
  };
  res.json(GetDashboardSummaryResponse.parse(summary));
});

router.get("/samples", async (_req, res): Promise<void> => {
  res.json(ListSampleEmailsResponse.parse(sampleEmails));
});

router.get("/awareness/modules", async (_req, res): Promise<void> => {
  res.json(ListAwarenessModulesResponse.parse(awarenessModules));
});

export default router;