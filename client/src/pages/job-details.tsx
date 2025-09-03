import { ArrowLeft, ExternalLink, Trash2 } from 'lucide-react';
import { useLocation, useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { jobsApi, Job } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jobs } = useQuery<Job[]>({
    queryKey: ['/api/jobs']
  });

  const job = jobs?.find(j => j.id === parseInt(id || '0'));

  const deleteJobMutation = useMutation({
    mutationFn: jobsApi.delete,
    onSuccess: () => {
      toast({
        title: "Job deleted",
        description: "The job has been removed from your list.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      setLocation('/jobs');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete job.",
        variant: "destructive",
      });
    }
  });

  const applyJobMutation = useMutation({
    mutationFn: jobsApi.apply,
    onSuccess: () => {
      toast({
        title: "Application tracked",
        description: "Job status updated to Applied.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update job status.",
        variant: "destructive",
      });
    }
  });

  const handleApply = () => {
    if (job?.url) {
      window.open(job.url, '_blank');
      applyJobMutation.mutate(job.id);
    }
  };

  const handleDelete = () => {
    if (job && confirm('Are you sure you want to delete this job?')) {
      deleteJobMutation.mutate(job.id);
    }
  };

  if (!job) {
    return (
      <div className="p-4 pb-20">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/jobs')}
            data-testid="button-back"
            className="mr-3"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Job Details</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Job not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation('/jobs')}
          data-testid="button-back"
          className="mr-3"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Job Details</h1>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          {/* Job Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-job-title">
              {job.title}
            </h2>
            <div className="flex items-center space-x-4 text-muted-foreground mb-4">
              <span data-testid="text-company-name">{job.companyName}</span>
              <span>•</span>
              <span data-testid="text-date-found">{formatDate(job.dateFound)}</span>
            </div>
            {job.matchedKeywords && job.matchedKeywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {job.matchedKeywords.map((keyword, index) => (
                  <Badge key={index} className="text-xs bg-primary text-primary-foreground">
                    {keyword}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {/* Job Details */}
          <div className="space-y-4 mb-6">
            {job.salary && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">Salary</h3>
                <p className="text-muted-foreground" data-testid="text-salary">{job.salary}</p>
              </div>
            )}
            
            {job.appliedAt && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">Application Date</h3>
                <p className="text-muted-foreground" data-testid="text-applied-date">
                  {formatDate(job.appliedAt)}
                </p>
              </div>
            )}
            
            {job.description && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">Job Description</h3>
                <div className="text-muted-foreground space-y-2 max-h-64 overflow-y-auto" data-testid="text-description">
                  <div className="whitespace-pre-wrap">{job.description}</div>
                </div>
              </div>
            )}
            
            {job.requirements && job.requirements.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">Requirements</h3>
                <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                  {job.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            <Button 
              onClick={handleApply}
              disabled={applyJobMutation.isPending}
              data-testid="button-apply"
              className="w-full py-3"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              {applyJobMutation.isPending ? 'Updating...' : 'Apply for Job'}
            </Button>
            
            <Button 
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteJobMutation.isPending}
              data-testid="button-delete"
              className="w-full py-3"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleteJobMutation.isPending ? 'Deleting...' : 'Delete Job'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
