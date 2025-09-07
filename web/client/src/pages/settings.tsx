import { ArrowLeft, Sun, Moon, Bell, BellOff } from 'lucide-react';
import { useLocation } from 'wouter';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/hooks/use-theme';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    toast({
      title: "Theme updated",
      description: `Switched to ${newTheme} mode`,
    });
  };

  const handleNotificationChange = (type: 'email' | 'push', enabled: boolean) => {
    if (type === 'email') {
      setEmailNotifications(enabled);
    } else {
      setPushNotifications(enabled);
    }
    toast({
      title: "Settings updated",
      description: `${type} notifications ${enabled ? 'enabled' : 'disabled'}`,
    });
  };

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
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
      </div>
      
      <div className="space-y-6">
        {/* Notifications */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-foreground mb-4">Notifications</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">Email notifications</span>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                  data-testid="switch-email-notifications"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BellOff className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">Push notifications</span>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                  data-testid="switch-push-notifications"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Theme */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-foreground mb-4">Appearance</h3>
            <div className="space-y-3">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => handleThemeChange('light')}
                data-testid="button-light-theme"
                className="w-full flex items-center justify-between p-3"
              >
                <span>Light Mode</span>
                <Sun className="h-4 w-4" />
              </Button>
              
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => handleThemeChange('dark')}
                data-testid="button-dark-theme"
                className="w-full flex items-center justify-between p-3"
              >
                <span>Dark Mode</span>
                <Moon className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Account */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-foreground mb-4">Account</h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => toast({ title: "Feature coming soon", description: "Password change will be available soon." })}
                data-testid="button-change-password"
                className="w-full text-left justify-start p-3"
              >
                Change Password
              </Button>
              
              <Button
                variant="outline"
                onClick={() => toast({ title: "Feature coming soon", description: "Data export will be available soon." })}
                data-testid="button-export-data"
                className="w-full text-left justify-start p-3"
              >
                Export Data
              </Button>
              
              <Button
                variant="destructive"
                onClick={() => toast({ title: "Feature coming soon", description: "Account deletion will be available soon." })}
                data-testid="button-delete-account"
                className="w-full text-left justify-start p-3"
              >
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
