import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Job } from '@/lib/api';

interface JobCardProps {
  job: Job;
  onClick: () => void;
  variant?: 'default' | 'horizontal';
}

export function JobCard({ job, onClick, variant = 'default' }: JobCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-chart-1 text-white';
      case 'Applied': return 'bg-chart-4 text-white';
      case 'Seen': return 'bg-chart-2 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'Found just now';
    if (diffHours < 24) return `Found ${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays === 1) return 'Found 1 day ago';
    return `Found ${diffDays} days ago`;
  };

  if (variant === 'horizontal') {
    return (
      <Card 
        className="cursor-pointer hover:bg-accent transition-colors flex-shrink-0"
        style={{ width: '280px' }}
        onClick={onClick}
        data-testid={`card-job-${job.id}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-foreground line-clamp-2">{job.title}</h3>
            <Badge className={`text-xs ml-2 ${getStatusColor(job.status)}`}>
              {job.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{job.companyName}</p>
          <p className="text-xs text-muted-foreground">{formatDate(job.dateFound)}</p>
          {job.matchedKeywords && job.matchedKeywords.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {job.matchedKeywords.slice(0, 3).map((keyword, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="cursor-pointer hover:bg-accent transition-all duration-200 hover:shadow-md"
      onClick={onClick}
      data-testid={`card-job-${job.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-foreground line-clamp-2 flex-1 mr-2">{job.title}</h3>
          <Badge className={`text-xs ${getStatusColor(job.status)}`}>
            {job.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-2">
          {job.companyName} {job.salary && `• ${job.salary}`}
        </p>
        <p className="text-xs text-muted-foreground mb-3">{formatDate(job.dateFound)}</p>
        {job.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {job.description.substring(0, 100)}...
          </p>
        )}
        {job.matchedKeywords && job.matchedKeywords.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.matchedKeywords.map((keyword, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
