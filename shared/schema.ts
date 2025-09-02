import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const companies = pgTable("companies", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  careerPageUrl: text("career_page_url").notNull(),
  keywords: jsonb("keywords").$type<string[]>().notNull(),
  priority: text("priority", { enum: ["high", "medium", "low"] }).default("medium"),
  status: text("status", { enum: ["active", "inactive"] }).default("active"),
  checkIntervalMinutes: integer("check_interval_minutes").default(1440),
  lastCheckedAt: timestamp("last_checked_at"),
  userId: varchar("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobs = pgTable("jobs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  salary: text("salary"),
  requirements: jsonb("requirements").$type<string[]>(),
  matchedKeywords: jsonb("matched_keywords").$type<string[]>().default([]),
  dateFound: timestamp("date_found").defaultNow(),
  appliedAt: timestamp("applied_at"),
  status: text("status", { enum: ["New", "Seen", "Applied", "Archived"] }).default("New"),
  priority: text("priority", { enum: ["high", "medium", "low"] }).default("medium"),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  lastCheckedAt: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  dateFound: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type User = typeof users.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type Job = typeof jobs.$inferSelect;
