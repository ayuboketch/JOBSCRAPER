import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Company } from '@/lib/api';

interface CompanyCardProps {
  company: Company;
  jobCount?: number;
  onDelete: () => void;
}

export function CompanyCard({ company, jobCount = 0, onDelete }: CompanyCardProps) {
  const formatInterval = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days === 1 ? '' : 's'}`;
    if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'}`;
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  };

  const formatLastChecked = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  return (
    <Card data-testid={`card-company-${company.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-foreground mb-1">{company.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">{company.careerPageUrl}</p>
            <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-3">
              <span>Keywords: {company.keywords.join(', ')}</span>
              <span>•</span>
              <span>Check: {formatInterval(company.checkIntervalMinutes)}</span>
            </div>
            <div className="flex items-center space-x-4 text-xs">
              <span className="text-chart-2">{jobCount} jobs found</span>
              <span className="text-muted-foreground">
                Last checked: {formatLastChecked(company.lastCheckedAt)}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            data-testid={`button-delete-company-${company.id}`}
            className="p-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
