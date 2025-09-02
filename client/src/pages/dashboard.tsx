import { Plus, Building, Search, Clock, Check, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { JobCard } from '@/components/job-card';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { statsApi, jobsApi, companiesApi, Job, Stats, Company } from '@/lib/api';

function TrackedCompaniesSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: companies, isLoading: companiesLoading } = useQuery<Company[]>({
    queryKey: ['/api/companies']
  });

  const { data: jobs } = useQuery<Job[]>({
    queryKey: ['/api/jobs']
  });

  const deleteCompanyMutation = useMutation({
    mutationFn: companiesApi.delete,
    onSuccess: () => {
      toast({
        title: "Company deleted",
        description: "Company and all associated jobs have been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete company.",
        variant: "destructive",
      });
    }
  });

  const getJobCountForCompany = (companyId: number) => {
    return jobs?.filter(job => job.companyId === companyId).length || 0;
  };

  const handleDeleteCompany = (companyId: number, companyName: string) => {
    if (confirm(`Are you sure you want to delete ${companyName}? This will also delete all associated jobs.`)) {
      deleteCompanyMutation.mutate(companyId);
    }
  };

  if (companiesLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-muted rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (!companies || companies.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">No companies tracked yet.</p>
          <Button onClick={() => window.location.href = '/add-company'} data-testid="button-add-first-company">
            Add Your First Company
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {companies.map((company) => (
        <Card key={company.id} data-testid={`card-company-${company.id}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-foreground mb-1">{company.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{company.careerPageUrl}</p>
                <div className="flex items-center space-x-4 text-xs">
                  <span className="text-chart-2">{getJobCountForCompany(company.id)} jobs found</span>
                  <span className="text-muted-foreground">Keywords: {company.keywords.join(', ')}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteCompany(company.id, company.name)}
                data-testid={`button-delete-company-${company.id}`}
                className="p-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ['/api/stats'],
    enabled: !!user
  });

  const { data: jobs, isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ['/api/jobs'],
    enabled: !!user
  });

  const recentJobs = jobs?.filter(job => {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return new Date(job.dateFound) > dayAgo;
  }).slice(0, 10) || [];

  const handleJobClick = (jobId: number) => {
    setLocation(`/job/${jobId}`);
  };

  if (statsLoading || jobsLoading) {
    return (
      <div className="p-4 pb-20">
        <div className="space-y-4">
          <div className="h-8 bg-muted rounded animate-pulse"></div>
          <div className="h-20 bg-muted rounded animate-pulse"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-muted rounded animate-pulse"></div>
            <div className="h-20 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Welcome back, {user?.fullName?.split(' ')[0] || 'there'}!
        </h1>
        <p className="text-muted-foreground">Here's what's happening with your job search</p>
      </div>
      
      {/* Add Company Button */}
      <div className="mb-8">
        <Button 
          onClick={() => setLocation('/add-company')}
          className="w-full p-4 h-auto flex items-center justify-center space-x-3 shadow-sm"
          data-testid="button-add-company"
        >
          <Plus className="h-5 w-5" />
          <span className="text-lg font-medium">Add Company</span>
        </Button>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary" data-testid="stat-companies">
              {stats?.trackedCompanies || 0}
            </div>
            <div className="text-sm text-muted-foreground">Tracked Companies</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-chart-2" data-testid="stat-jobs">
              {stats?.totalJobs || 0}
            </div>
            <div className="text-sm text-muted-foreground">Total Jobs Found</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Dashboard Actions */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Button
          variant="ghost"
          onClick={() => setLocation('/companies')}
          data-testid="button-tracked-companies"
          className="h-auto p-4 flex flex-col items-start space-y-2 bg-card border border-border hover:bg-accent"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <Building className="h-5 w-5 text-primary" />
            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
              {stats?.trackedCompanies || 0}
            </span>
          </div>
          <h3 className="font-medium text-foreground">Tracked Companies</h3>
          <p className="text-sm text-muted-foreground">Manage your companies</p>
        </Button>
        
        <Button
          variant="ghost"
          onClick={() => setLocation('/jobs?filter=searched')}
          data-testid="button-searched-jobs"
          className="h-auto p-4 flex flex-col items-start space-y-2 bg-card border border-border hover:bg-accent"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <Search className="h-5 w-5 text-chart-2" />
            <span className="text-xs bg-chart-2 text-white px-2 py-1 rounded-full">
              {stats?.searchedJobs || 0}
            </span>
          </div>
          <h3 className="font-medium text-foreground">Searched Jobs</h3>
          <p className="text-sm text-muted-foreground">Your keyword matches</p>
        </Button>
        
        <Button
          variant="ghost"
          onClick={() => setLocation('/jobs?filter=recent')}
          data-testid="button-recent-jobs"
          className="h-auto p-4 flex flex-col items-start space-y-2 bg-card border border-border hover:bg-accent"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <Clock className="h-5 w-5 text-chart-3" />
            <span className="text-xs bg-chart-3 text-white px-2 py-1 rounded-full">
              {stats?.recentJobs || 0}
            </span>
          </div>
          <h3 className="font-medium text-foreground">Recent Jobs</h3>
          <p className="text-sm text-muted-foreground">Latest discoveries</p>
        </Button>
        
        <Button
          variant="ghost"
          onClick={() => setLocation('/jobs?filter=applied')}
          data-testid="button-applied-jobs"
          className="h-auto p-4 flex flex-col items-start space-y-2 bg-card border border-border hover:bg-accent"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <Check className="h-5 w-5 text-chart-4" />
            <span className="text-xs bg-chart-4 text-white px-2 py-1 rounded-full">
              {stats?.appliedJobs || 0}
            </span>
          </div>
          <h3 className="font-medium text-foreground">Applied Jobs</h3>
          <p className="text-sm text-muted-foreground">Track applications</p>
        </Button>
      </div>
      
      {/* Recent Jobs Vertical List */}
      {recentJobs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Jobs</h2>
          <div className="space-y-3">
            {recentJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onClick={() => handleJobClick(job.id)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Tracked Companies Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Tracked Companies</h2>
        <TrackedCompaniesSection />
      </div>
    </div>
  );
}
