import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CompanyCard } from '@/components/company-card';
import { companiesApi, jobsApi, Company, Job } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function TrackedCompanies() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      <div className="p-4 pb-20">
        <div className="space-y-4">
          <div className="h-8 bg-muted rounded animate-pulse"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation('/')}
          data-testid="button-back"
          className="mr-3"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Tracked Companies</h1>
      </div>
      
      <div className="space-y-4">
        {!companies || companies.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">No companies tracked yet.</p>
              <Button onClick={() => setLocation('/add-company')} data-testid="button-add-first-company">
                Add Your First Company
              </Button>
            </CardContent>
          </Card>
        ) : (
          companies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              jobCount={getJobCountForCompany(company.id)}
              onDelete={() => handleDeleteCompany(company.id, company.name)}
            />
          ))
        )}
      </div>
    </div>
  );
}
