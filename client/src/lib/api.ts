import { apiRequest } from "./queryClient";

export interface AuthResponse {
  user: any;
  session: any;
}

export interface Company {
  id: number;
  name: string;
  url: string;
  careerPageUrl: string;
  keywords: string[];
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'inactive';
  checkIntervalMinutes: number;
  lastCheckedAt: string | null;
  userId: string;
  createdAt: string;
}

export interface Job {
  id: number;
  title: string;
  url: string;
  description?: string;
  salary?: string;
  requirements?: string[];
  matchedKeywords: string[];
  dateFound: string;
  appliedAt?: string;
  status: 'New' | 'Seen' | 'Applied' | 'Archived';
  priority: 'high' | 'medium' | 'low';
  companyId: number;
  userId: string;
  companyName?: string;
}

export interface Stats {
  trackedCompanies: number;
  totalJobs: number;
  searchedJobs: number;
  appliedJobs: number;
  recentJobs: number;
}

// Auth API
export const authApi = {
  signup: async (email: string, password: string, fullName: string): Promise<AuthResponse> => {
    const res = await apiRequest('POST', '/api/auth/signup', { email, password, fullName });
    return res.json();
  },
  
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await apiRequest('POST', '/api/auth/login', { email, password });
    return res.json();
  },
  
  logout: async (): Promise<void> => {
    await apiRequest('POST', '/api/auth/logout');
  }
};

// Companies API
export const companiesApi = {
  getAll: async (): Promise<Company[]> => {
    const res = await apiRequest('GET', '/api/companies');
    return res.json();
  },
  
  create: async (data: {
    url: string;
    careerPageUrl?: string;
    keywords: string;
    priority: 'high' | 'medium' | 'low';
    checkInterval: string;
  }): Promise<any> => {
    const res = await apiRequest('POST', '/api/companies', data);
    return res.json();
  },
  
  delete: async (id: number): Promise<void> => {
    await apiRequest('DELETE', `/api/companies/${id}`);
  },
  
  updatePriority: async (id: number, priority: string): Promise<void> => {
    await apiRequest('PUT', `/api/companies/${id}/priority`, { priority });
  }
};

// Jobs API
export const jobsApi = {
  getAll: async (): Promise<Job[]> => {
    const res = await apiRequest('GET', '/api/jobs');
    return res.json();
  },
  
  delete: async (id: number): Promise<void> => {
    await apiRequest('DELETE', `/api/jobs/${id}`);
  },
  
  apply: async (id: number): Promise<void> => {
    await apiRequest('POST', `/api/jobs/${id}/apply`);
  }
};

// Stats API
export const statsApi = {
  get: async (): Promise<Stats> => {
    const res = await apiRequest('GET', '/api/stats');
    return res.json();
  }
};
