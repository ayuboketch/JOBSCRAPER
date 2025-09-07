// index.ts
import "dotenv/config";
import express2 from "express";

// routes.ts
import { createServer } from "http";

// storage.ts
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
dotenv.config();
var supabaseUrl = process.env.SUPABASE_URL;
var supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
var supabase = createClient(supabaseUrl, supabaseKey);
var SupabaseStorage = class {
  async getUser(id) {
    const { data, error } = await supabase.from("users").select("*").eq("id", id).single();
    if (error) return void 0;
    return data;
  }
  async getUserByEmail(email) {
    const { data, error } = await supabase.from("users").select("*").eq("email", email).single();
    if (error) return void 0;
    return data;
  }
  async createUser(user) {
    const { data, error } = await supabase.from("users").insert(user).select().single();
    if (error) throw error;
    return data;
  }
  async getCompanies(userId) {
    const { data, error } = await supabase.from("companies").select("*").eq("user_id", userId);
    if (error) throw error;
    return data || [];
  }
  async createCompany(company) {
    const { data, error } = await supabase.from("companies").insert({
      name: company.name,
      url: company.url,
      career_page_url: company.career_page_url,
      keywords: company.keywords,
      priority: company.priority || "medium",
      status: company.status || "active",
      check_interval_minutes: company.check_interval_minutes || 1440,
      user_id: company.user_id
    }).select().single();
    if (error) throw error;
    return data;
  }
  async deleteCompany(id, userId) {
    await supabase.from("jobs").delete().eq("company_id", id).eq("user_id", userId);
    const { error } = await supabase.from("companies").delete().eq("id", id).eq("user_id", userId);
    if (error) throw error;
  }
  async updateCompanyPriority(id, priority) {
    const { error } = await supabase.from("companies").update({ priority }).eq("id", id);
    if (error) throw error;
  }
  async getJobs(userId) {
    const { data, error } = await supabase.from("jobs").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (error) {
      console.log("Error fetching jobs:", error);
      return [];
    }
    return data || [];
  }
  async deleteJob(id, userId) {
    const { error } = await supabase.from("jobs").delete().eq("id", id).eq("user_id", userId);
    if (error) throw error;
  }
  async updateJobStatus(id, status, appliedAt) {
    const updateData = { status };
    if (appliedAt) updateData.applied_at = appliedAt;
    const { error } = await supabase.from("jobs").update(updateData).eq("id", id);
    if (error) throw error;
  }
};
var storage = new SupabaseStorage();

// ../shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  createdAt: timestamp("created_at").defaultNow()
});
var companies = pgTable("companies", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  careerPageUrl: text("career_page_url").notNull(),
  keywords: jsonb("keywords").$type().notNull(),
  priority: text("priority", { enum: ["high", "medium", "low"] }).default("medium"),
  status: text("status", { enum: ["active", "inactive"] }).default("active"),
  checkIntervalMinutes: integer("check_interval_minutes").default(1440),
  lastCheckedAt: timestamp("last_checked_at"),
  userId: varchar("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var jobs = pgTable("jobs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  salary: text("salary"),
  requirements: jsonb("requirements").$type(),
  matchedKeywords: jsonb("matched_keywords").$type().default([]),
  dateFound: timestamp("date_found").defaultNow(),
  appliedAt: timestamp("applied_at"),
  status: text("status", { enum: ["New", "Seen", "Applied", "Archived"] }).default("New"),
  priority: text("priority", { enum: ["high", "medium", "low"] }).default("medium"),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  lastCheckedAt: true
});
var insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  dateFound: true
});

// routes.ts
import { createClient as createClient2 } from "@supabase/supabase-js";
import { z } from "zod";
var supabaseUrl2 = process.env.SUPABASE_URL;
var supabaseKey2 = process.env.SUPABASE_SERVICE_ROLE_KEY;
var supabase2 = createClient2(supabaseUrl2, supabaseKey2);
var authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "No authorization token provided" });
    }
    const { data: { user }, error } = await supabase2.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }
    req.userId = user.id;
    next();
  } catch (error) {
    res.status(401).json({ error: "Authentication failed" });
  }
};
async function registerRoutes(app2) {
  app2.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, fullName } = insertUserSchema.parse(req.body);
      const { data, error } = await supabase2.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      res.json({ user: data.user, session: data.session });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.flatten() });
      }
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const { data, error } = await supabase2.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      res.json({ user: data.user, session: data.session });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/auth/logout", authenticateUser, async (req, res) => {
    try {
      const { error } = await supabase2.auth.signOut();
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/companies", authenticateUser, async (req, res) => {
    try {
      const companies2 = await storage.getCompanies(req.userId);
      res.json(companies2);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/companies", authenticateUser, async (req, res) => {
    try {
      const { url, keywords, priority, checkInterval } = req.body;
      const extractCompanyName = (url2) => {
        try {
          const domain = new URL(url2).hostname;
          const parts = domain.replace("www.", "").split(".");
          return parts[0] ?? "Unknown Company";
        } catch {
          return "Unknown Company";
        }
      };
      const name = extractCompanyName(url);
      const keywordsArray = typeof keywords === "string" ? keywords.split(",").map((kw) => kw.trim()).filter(Boolean) : keywords;
      let careerPageUrl = req.body.careerPageUrl || `${url}/careers`;
      const convertIntervalToMinutes = (interval) => {
        const parts = interval.trim().split(" ");
        const value = parseInt(parts[0], 10);
        const unit = parts[1];
        switch (unit?.toLowerCase()) {
          case "hour":
          case "hours":
            return value * 60;
          case "day":
          case "days":
            return value * 60 * 24;
          case "week":
          case "weeks":
            return value * 60 * 24 * 7;
          default:
            return 1440;
        }
      };
      const company = await storage.createCompany({
        name,
        url,
        career_page_url: careerPageUrl,
        keywords: keywordsArray,
        priority,
        status: "active",
        check_interval_minutes: convertIntervalToMinutes(checkInterval),
        user_id: req.userId
      });
      const mockJobs = [
        {
          title: `Frontend Developer at ${name}`,
          url: `${url}/jobs/frontend-developer`,
          description: `We are looking for a talented Frontend Developer to join our team. You will be responsible for building user-facing features and ensuring great user experience.`,
          salary: "$80,000 - $120,000",
          requirements: ["React", "TypeScript", "CSS"],
          matchedKeywords: keywordsArray.filter((k) => ["frontend", "react", "javascript"].includes(k.toLowerCase())),
          dateFound: (/* @__PURE__ */ new Date()).toISOString(),
          status: "New",
          priority,
          companyId: company.id,
          user_id: req.userId
        },
        {
          title: `Software Engineer at ${name}`,
          url: `${url}/jobs/software-engineer`,
          description: `Join our engineering team to build scalable software solutions. Work with modern technologies and contribute to exciting projects.`,
          salary: "$90,000 - $140,000",
          requirements: ["JavaScript", "Node.js", "Database"],
          matchedKeywords: keywordsArray.filter((k) => ["developer", "engineer", "javascript"].includes(k.toLowerCase())),
          dateFound: (/* @__PURE__ */ new Date()).toISOString(),
          status: "New",
          priority,
          companyId: company.id,
          user_id: req.userId
        }
      ].filter((job) => job.matchedKeywords.length > 0 || keywordsArray.length === 0);
      for (const job of mockJobs) {
        try {
          await supabase2.from("jobs").insert(job);
        } catch (error) {
          console.error("Error inserting job:", error);
        }
      }
      res.json({
        success: true,
        company,
        jobsFound: mockJobs.length,
        jobs: mockJobs
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.delete("/api/companies/:id", authenticateUser, async (req, res) => {
    try {
      await storage.deleteCompany(parseInt(req.params.id), req.userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.put("/api/companies/:id/priority", authenticateUser, async (req, res) => {
    try {
      const { priority } = req.body;
      await storage.updateCompanyPriority(parseInt(req.params.id), priority);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/jobs", authenticateUser, async (req, res) => {
    try {
      const jobs2 = await storage.getJobs(req.userId);
      res.json(jobs2);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.delete("/api/jobs/:id", authenticateUser, async (req, res) => {
    try {
      await storage.deleteJob(parseInt(req.params.id), req.userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/jobs/:id/apply", authenticateUser, async (req, res) => {
    try {
      await storage.updateJobStatus(parseInt(req.params.id), "Applied", (/* @__PURE__ */ new Date()).toISOString());
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/stats", authenticateUser, async (req, res) => {
    try {
      const [companies2, jobs2] = await Promise.all([
        storage.getCompanies(req.userId),
        storage.getJobs(req.userId)
      ]);
      const stats = {
        trackedCompanies: companies2.length,
        totalJobs: jobs2.length,
        searchedJobs: jobs2.filter((job) => job.matchedKeywords && job.matchedKeywords.length > 0).length,
        appliedJobs: jobs2.filter((job) => job.status === "Applied").length,
        recentJobs: jobs2.filter((job) => {
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1e3);
          return new Date(job.dateFound) > dayAgo;
        }).length
      };
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// viteServer.ts
import express from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

// index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path2 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path2.startsWith("/api")) {
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0"
  }, () => {
    log(`serving on http://localhost:${port}`);
  });
})();
//# sourceMappingURL=index.js.map
