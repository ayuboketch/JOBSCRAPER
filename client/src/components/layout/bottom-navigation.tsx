import { Home, Briefcase, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BottomNavigationProps {
  activeTab: 'dashboard' | 'jobs' | 'settings';
  onTabChange: (tab: 'dashboard' | 'jobs' | 'settings') => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <nav className="bg-card border-t border-border px-4 py-2 fixed bottom-0 left-0 right-0 z-30">
      <div className="flex justify-around">
        <Button
          variant="ghost"
          onClick={() => onTabChange('dashboard')}
          data-testid="tab-dashboard"
          className={`flex flex-col items-center py-2 px-4 h-auto ${
            activeTab === 'dashboard' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <Home className="h-5 w-5 mb-1" />
          <span className="text-xs font-medium">Dashboard</span>
        </Button>
        
        <Button
          variant="ghost"
          onClick={() => onTabChange('jobs')}
          data-testid="tab-jobs"
          className={`flex flex-col items-center py-2 px-4 h-auto ${
            activeTab === 'jobs' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <Briefcase className="h-5 w-5 mb-1" />
          <span className="text-xs">Jobs</span>
        </Button>
        
        <Button
          variant="ghost"
          onClick={() => onTabChange('settings')}
          data-testid="tab-settings"
          className={`flex flex-col items-center py-2 px-4 h-auto ${
            activeTab === 'settings' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <Settings className="h-5 w-5 mb-1" />
          <span className="text-xs">Settings</span>
        </Button>
      </div>
    </nav>
  );
}
