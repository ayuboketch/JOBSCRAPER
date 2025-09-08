import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertCompanySchema } from "../shared/schema";
import { createClient } from '@supabase/supabase-js';
import { z } from "zod";
import bcrypt from 'bcrypt';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Auth middleware
const authenticateUser = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.userId = user.id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, password, fullName } = insertUserSchema.parse(req.body);
      
      const { data, error } = await supabase.auth.signUp({
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
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.flatten() });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ user: data.user, session: data.session });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/auth/logout', authenticateUser, async (req, res) => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Companies routes
  app.get('/api/companies', authenticateUser, async (req: any, res) => {
    try {
      const companies = await storage.getCompanies(req.userId);
      res.json(companies);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/companies', authenticateUser, async (req: any, res) => {
    try {
      const { url, keywords, priority, checkInterval } = req.body;
      
      // Extract company name from URL
      const extractCompanyName = (url: string): string => {
        try {
          const domain = new URL(url).hostname;
          const parts = domain.replace('www.', '').split('.');
          return parts[0] ?? 'Unknown Company';
        } catch {
          return 'Unknown Company';
        }
      };
      
      const name = extractCompanyName(url);
      const keywordsArray = typeof keywords === 'string' 
        ? keywords.split(',').map(kw => kw.trim()).filter(Boolean) 
        : keywords;
      
      // Find career page URL
      let careerPageUrl = req.body.careerPageUrl || `${url}/careers`;
      
      const convertIntervalToMinutes = (interval: string): number => {
        const parts = interval.trim().split(" ");
        const value = parseInt(parts[0], 10);
        const unit = parts[1];
        
        switch (unit?.toLowerCase()) {
          case "hour": case "hours": return value * 60;
          case "day": case "days": return value * 60 * 24;
          case "week": case "weeks": return value * 60 * 24 * 7;
          default: return 1440; // Default to 1 day
        }
      };
      
      const company = await storage.createCompany({
        name,
        url,
        career_page_url: careerPageUrl,
        keywords: keywordsArray,
        priority,
        status: 'active',
        check_interval_minutes: convertIntervalToMinutes(checkInterval),
        user_id: req.userId
      });
      
      // Simulate job scraping results for now
      const mockJobs = [
        {
          title: `Frontend Developer at ${name}`,
          url: `${url}/jobs/frontend-developer`,
          description: `We are looking for a talented Frontend Developer to join our team. You will be responsible for building user-facing features and ensuring great user experience.`,
          salary: '$80,000 - $120,000',
          requirements: ['React', 'TypeScript', 'CSS'],
          matchedKeywords: keywordsArray.filter(k => ['frontend', 'react', 'javascript'].includes(k.toLowerCase())),
          dateFound: new Date().toISOString(),
          status: 'New',
          priority,
          companyId: company.id,
          user_id: req.userId
        },
        {
          title: `Software Engineer at ${name}`,
          url: `${url}/jobs/software-engineer`,
          description: `Join our engineering team to build scalable software solutions. Work with modern technologies and contribute to exciting projects.`,
          salary: '$90,000 - $140,000',
          requirements: ['JavaScript', 'Node.js', 'Database'],
          matchedKeywords: keywordsArray.filter(k => ['developer', 'engineer', 'javascript'].includes(k.toLowerCase())),
          dateFound: new Date().toISOString(),
          status: 'New',
          priority,
          companyId: company.id,
          user_id: req.userId
        }
      ].filter(job => job.matchedKeywords.length > 0 || keywordsArray.length === 0);
      
      // Insert jobs if any were found
      for (const job of mockJobs) {
        try {
          await supabase.from('jobs').insert(job);
        } catch (error) {
          console.error('Error inserting job:', error);
        }
      }
      
      res.json({ 
        success: true, 
        company, 
        jobsFound: mockJobs.length,
        jobs: mockJobs 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/companies/:id', authenticateUser, async (req: any, res) => {
    try {
      await storage.deleteCompany(parseInt(req.params.id), req.userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/companies/:id/priority', authenticateUser, async (req: any, res) => {
    try {
      const { priority } = req.body;
      await storage.updateCompanyPriority(parseInt(req.params.id), priority);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Jobs routes
  app.get('/api/jobs', authenticateUser, async (req: any, res) => {
    try {
      const jobs = await storage.getJobs(req.userId);
      res.json(jobs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/jobs/:id', authenticateUser, async (req: any, res) => {
    try {
      await storage.deleteJob(parseInt(req.params.id), req.userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/jobs/:id/apply', authenticateUser, async (req: any, res) => {
    try {
      await storage.updateJobStatus(parseInt(req.params.id), 'Applied', new Date().toISOString());
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Stats route
  app.get('/api/stats', authenticateUser, async (req: any, res) => {
    try {
      const [companies, jobs] = await Promise.all([
        storage.getCompanies(req.userId),
        storage.getJobs(req.userId)
      ]);

      const stats = {
        trackedCompanies: companies.length,
        totalJobs: jobs.length,
        searchedJobs: jobs.filter(job => job.matchedKeywords && job.matchedKeywords.length > 0).length,
        appliedJobs: jobs.filter(job => job.status === 'Applied').length,
        recentJobs: jobs.filter(job => {
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return new Date(job.dateFound) > dayAgo;
        }).length
      };

      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
