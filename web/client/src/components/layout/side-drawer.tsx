import { X, User, Settings, Palette, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { useToast } from '@/hooks/use-toast';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

export function SideDrawer({ isOpen, onClose, onNavigate }: SideDrawerProps) {
  const { user, logout } = useAuth();
  const { toggleTheme } = useTheme();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleThemeToggle = () => {
    toggleTheme();
    toast({
      title: "Theme changed",
      description: "The app theme has been updated.",
    });
  };

  const userInitials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50"
          onClick={onClose}
          data-testid="overlay-drawer"
        />
      )}
      
      {/* Drawer */}
      <div 
        className={`fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        data-testid="drawer-side"
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Menu</h2>
            <Button 
              variant="ghost"
              size="icon"
              onClick={onClose}
              data-testid="button-close-drawer"
              className="p-1 hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* User Profile Section */}
          {user && (
            <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg mb-6">
              <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-medium text-sm">
                  {userInitials}
                </span>
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">{user.fullName || 'User'}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          )}
          
          {/* Menu Items */}
          <nav className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => onNavigate('account')}
              data-testid="button-account"
            >
              <User className="mr-3 h-4 w-4" />
              Account
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => onNavigate('settings')}
              data-testid="button-settings"
            >
              <Settings className="mr-3 h-4 w-4" />
              Settings
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleThemeToggle}
              data-testid="button-theme"
            >
              <Palette className="mr-3 h-4 w-4" />
              Change Theme
            </Button>
            
            <hr className="border-border my-4" />
            
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Log Out
            </Button>
          </nav>
        </div>
      </div>
    </>
  );
}
