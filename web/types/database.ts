export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: number;
          name: string;
          url: string;
          career_page_url: string;
          keywords: string[];
          priority: 'high' | 'medium' | 'low';
          status: 'active' | 'inactive';
          check_interval_minutes: number;
          last_checked_at: string | null;
          user_id: string;
          created_at: string;
        };
        Insert: {
          name: string;
          url: string;
          career_page_url: string;
          keywords: string[];
          priority?: 'high' | 'medium' | 'low';
          status?: 'active' | 'inactive';
          check_interval_minutes?: number;
          user_id: string;
        };
        Update: {
          name?: string;
          url?: string;
          career_page_url?: string;
          keywords?: string[];
          priority?: 'high' | 'medium' | 'low';
          status?: 'active' | 'inactive';
          check_interval_minutes?: number;
          last_checked_at?: string | null;
        };
      };
      jobs: {
        Row: {
          id: number;
          title: string;
          url: string;
          description: string | null;
          salary: string | null;
          requirements: string[] | null;
          matchedKeywords: string[];
          dateFound: string;
          appliedAt: string | null;
          status: 'New' | 'Seen' | 'Applied' | 'Archived';
          priority: 'high' | 'medium' | 'low';
          companyId: number;
          user_id: string;
          created_at: string;
        };
        Insert: {
          title: string;
          url: string;
          description?: string | null;
          salary?: string | null;
          requirements?: string[] | null;
          matchedKeywords?: string[];
          status?: 'New' | 'Seen' | 'Applied' | 'Archived';
          priority?: 'high' | 'medium' | 'low';
          companyId: number;
          user_id: string;
        };
        Update: {
          title?: string;
          url?: string;
          description?: string | null;
          salary?: string | null;
          requirements?: string[] | null;
          matchedKeywords?: string[];
          appliedAt?: string | null;
          status?: 'New' | 'Seen' | 'Applied' | 'Archived';
          priority?: 'high' | 'medium' | 'low';
        };
      };
    };
  };
}

export type Company = Database['public']['Tables']['companies']['Row'];
export type CompanyInsert = Database['public']['Tables']['companies']['Insert'];
export type Job = Database['public']['Tables']['jobs']['Row'];
export type JobInsert = Database['public']['Tables']['jobs']['Insert'];

export interface DatabaseTables {
  companies: Company;
  jobs: Job;
}

export function validateCompanyInsert(data: any): CompanyInsert {
  return data;
}
