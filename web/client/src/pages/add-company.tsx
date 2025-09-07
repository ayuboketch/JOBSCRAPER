import { useState } from 'react';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { companiesApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function AddCompany() {
  const [, setLocation] = useLocation();
  const [url, setUrl] = useState('');
  const [keywords, setKeywords] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [checkInterval, setCheckInterval] = useState('1 day');
  const [scrapingStatus, setScrapingStatus] = useState<{
    isActive: boolean;
    step: number;
    jobsFound: number;
  }>({ isActive: false, step: 0, jobsFound: 0 });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addCompanyMutation = useMutation({
    mutationFn: companiesApi.create,
    onSuccess: (data) => {
      toast({
        title: "Company added successfully!",
        description: `Found ${data.jobsFound || 0} jobs for ${data.company?.name}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      
      setTimeout(() => {
        setLocation('/');
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add company",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
      setScrapingStatus({ isActive: false, step: 0, jobsFound: 0 });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim() || !keywords.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setScrapingStatus({ isActive: true, step: 1, jobsFound: 0 });
    
    // Simulate progress steps
    const progressSteps = [
      { step: 1, delay: 1000, message: "Validating URL" },
      { step: 2, delay: 2000, message: "Scraping job listings" },
      { step: 3, delay: 3000, message: "Processing results" },
      { step: 4, delay: 1000, message: "Saving to database" },
    ];

    for (const { step, delay } of progressSteps) {
      setTimeout(() => {
        setScrapingStatus(prev => ({ ...prev, step }));
      }, delay);
    }

    addCompanyMutation.mutate({
      url: url.trim(),
      keywords: keywords.trim(),
      priority,
      checkInterval
    });
  };

  const progressSteps = [
    { id: 1, label: "Validating URL" },
    { id: 2, label: "Scraping job listings" },
    { id: 3, label: "Processing results" },
    { id: 4, label: "Saving to database" },
  ];

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
        <h1 className="text-xl font-bold text-foreground">Add Company</h1>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="url" className="block text-sm font-medium text-foreground mb-1">
                Company Career Page URL
              </Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://company.com/careers"
                required
                data-testid="input-company-url"
              />
            </div>
            
            <div>
              <Label htmlFor="keywords" className="block text-sm font-medium text-foreground mb-1">
                Keywords (comma separated)
              </Label>
              <Input
                id="keywords"
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="frontend, developer, react, javascript"
                required
                data-testid="input-keywords"
              />
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-foreground mb-1">
                Priority
              </Label>
              <Select value={priority} onValueChange={(value: 'high' | 'medium' | 'low') => setPriority(value)}>
                <SelectTrigger data-testid="select-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-foreground mb-1">
                Check Interval
              </Label>
              <Select value={checkInterval} onValueChange={setCheckInterval}>
                <SelectTrigger data-testid="select-interval">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 hour">Every Hour</SelectItem>
                  <SelectItem value="6 hours">Every 6 Hours</SelectItem>
                  <SelectItem value="12 hours">Every 12 Hours</SelectItem>
                  <SelectItem value="1 day">Daily</SelectItem>
                  <SelectItem value="3 days">Every 3 Days</SelectItem>
                  <SelectItem value="1 week">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              type="submit"
              className="w-full py-3"
              disabled={addCompanyMutation.isPending || scrapingStatus.isActive}
              data-testid="button-start-tracking"
            >
              {addCompanyMutation.isPending ? 'Starting...' : 'Start Tracking'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Progress/Status Section */}
      {scrapingStatus.isActive && (
        <Card data-testid="card-scraping-status">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Tracking Progress</h3>
            
            <div className="space-y-4">
              {progressSteps.map((step) => (
                <div key={step.id} className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    scrapingStatus.step >= step.id
                      ? 'bg-primary'
                      : scrapingStatus.step === step.id - 1
                      ? 'bg-primary status-indicator'
                      : 'bg-muted'
                  }`}>
                    {scrapingStatus.step > step.id ? (
                      <Check className="h-3 w-3 text-primary-foreground" />
                    ) : scrapingStatus.step === step.id ? (
                      <Loader2 className="h-3 w-3 text-primary-foreground animate-spin" />
                    ) : (
                      <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                    )}
                  </div>
                  <span className={
                    scrapingStatus.step >= step.id ? 'text-foreground' : 'text-muted-foreground'
                  }>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Found <span className="font-medium text-foreground">{scrapingStatus.jobsFound}</span> jobs so far...
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
