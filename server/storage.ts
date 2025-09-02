import { createClient } from '@supabase/supabase-js';
import type { User, InsertUser, Company, Job } from "@shared/schema";
import { Database } from '../types/database';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Companies
  getCompanies(userId: string): Promise<Company[]>;
  createCompany(company: any): Promise<Company>;
  deleteCompany(id: number, userId: string): Promise<void>;
  updateCompanyPriority(id: number, priority: string): Promise<void>;
  
  // Jobs
  getJobs(userId: string): Promise<Job[]>;
  deleteJob(id: number, userId: string): Promise<void>;
  updateJobStatus(id: number, status: string, appliedAt?: string): Promise<void>;
}

export class SupabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return undefined;
    return data as User;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) return undefined;
    return data as User;
  }

  async createUser(user: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(user as any)
      .select()
      .single();
    
    if (error) throw error;
    return data as User;
  }

  async getCompanies(userId: string): Promise<Company[]> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return (data || []) as Company[];
  }

  async createCompany(company: any): Promise<Company> {
    const { data, error } = await supabase
      .from('companies')
      .insert(company)
      .select()
      .single();
    
    if (error) throw error;
    return data as Company;
  }

  async deleteCompany(id: number, userId: string): Promise<void> {
    // First delete associated jobs
    await supabase
      .from('jobs')
      .delete()
      .eq('company_id', id)
      .eq('user_id', userId);
    
    // Then delete company
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) throw error;
  }

  async updateCompanyPriority(id: number, priority: string): Promise<void> {
    const { error } = await supabase
      .from('companies')
      .update({ priority } as any)
      .eq('id', id);
    
    if (error) throw error;
  }

  async getJobs(userId: string): Promise<Job[]> {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.log('Error fetching jobs:', error);
      return []; // Return empty array instead of throwing
    }
    return (data || []) as Job[];
  }

  async deleteJob(id: number, userId: string): Promise<void> {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) throw error;
  }

  async updateJobStatus(id: number, status: string, appliedAt?: string): Promise<void> {
    const updateData: any = { status };
    if (appliedAt) updateData.applied_at = appliedAt;
    
    const { error } = await supabase
      .from('jobs')
      .update(updateData as any)
      .eq('id', id);
    
    if (error) throw error;
  }
}

export const storage = new SupabaseStorage();
