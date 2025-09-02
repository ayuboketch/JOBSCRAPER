import { Briefcase, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopNavigationProps {
  onMenuClick: () => void;
  onLogoClick: () => void;
}

export function TopNavigation({ onMenuClick, onLogoClick }: TopNavigationProps) {
  return (
    <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-40">
      <Button 
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        data-testid="button-menu"
        className="p-2 hover:bg-accent"
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      <Button
        variant="ghost"
        onClick={onLogoClick}
        data-testid="button-logo"
        className="flex items-center space-x-2 hover:bg-transparent"
      >
        <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
          <Briefcase className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-foreground">JobTracker</span>
      </Button>
      
      <div className="w-10"></div> {/* Spacer for centering */}
    </header>
  );
}
