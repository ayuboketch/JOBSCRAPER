import { ArrowLeft } from 'lucide-react';
import { useLocation, useSearch } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { JobCard } from '@/components/job-card';
import { Job } from '@/lib/api';

export default function JobsList() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const urlParams = new URLSearchParams(search);
  const filter = urlParams.get('filter') || 'all';

  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ['/api/jobs']
  });

  const filteredJobs = jobs?.filter(job => {
    switch (filter) {
      case 'searched':
        return job.matchedKeywords && job.matchedKeywords.length > 0;
      case 'applied':
        return job.status === 'Applied';
      case 'recent':
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return new Date(job.dateFound) > dayAgo;
      default:
        return true;
    }
  }) || [];

  const handleJobClick = (jobId: number) => {
    setLocation(`/job/${jobId}`);
  };

  const handleFilterChange = (newFilter: string) => {
    setLocation(`/jobs?filter=${newFilter}`);
  };

  if (isLoading) {
    return (
      <div className="p-4 pb-20">
        <div className="space-y-4">
          <div className="h-8 bg-muted rounded animate-pulse"></div>
          <div className="h-12 bg-muted rounded animate-pulse"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded animate-pulse"></div>
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
        <h1 className="text-xl font-bold text-foreground">All Jobs</h1>
      </div>
      
      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
        <Button
          variant={filter === 'all' ? 'default' : 'ghost'}
          onClick={() => handleFilterChange('all')}
          data-testid="filter-all"
          className="flex-1 py-2 px-4"
        >
          All Jobs
        </Button>
        <Button
          variant={filter === 'searched' ? 'default' : 'ghost'}
          onClick={() => handleFilterChange('searched')}
          data-testid="filter-searched"
          className="flex-1 py-2 px-4"
        >
          Searched
        </Button>
        <Button
          variant={filter === 'applied' ? 'default' : 'ghost'}
          onClick={() => handleFilterChange('applied')}
          data-testid="filter-applied"
          className="flex-1 py-2 px-4"
        >
          Applied
        </Button>
      </div>
      
      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No jobs found for the selected filter.</p>
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onClick={() => handleJobClick(job.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
