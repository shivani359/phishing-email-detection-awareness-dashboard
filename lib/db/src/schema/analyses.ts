import { createInsertSchema } from "drizzle-zod";
import { integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const analysesTable = pgTable("email_analyses", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  sender: text("sender").notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  riskScore: integer("risk_score").notNull(),
  classification: text("classification").notNull(),
  summary: text("summary").notNull(),
  indicators: jsonb("indicators").$type<string[]>().notNull(),
  urls: jsonb("urls").$type<Array<{ url: string; risk: string; reason: string }>>().notNull(),
  recommendations: jsonb("recommendations").$type<string[]>().notNull(),
  modelUsed: text("model_used").notNull(),
});

export const insertAnalysisSchema = createInsertSchema(analysesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analysesTable.$inferSelect;