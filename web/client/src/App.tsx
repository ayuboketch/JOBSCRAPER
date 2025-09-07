import { Switch, Route, Redirect, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";

// Layout components
import { TopNavigation } from "@/components/layout/top-navigation";
import { SideDrawer } from "@/components/layout/side-drawer";
import { BottomNavigation } from "@/components/layout/bottom-navigation";

// Pages
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Dashboard from "@/pages/dashboard";
import AddCompany from "@/pages/add-company";
import JobDetails from "@/pages/job-details";
import JobsList from "@/pages/jobs-list";
import TrackedCompanies from "@/pages/tracked-companies";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function AuthenticatedApp() {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'jobs' | 'settings'>('dashboard');
  
  // Update active tab based on current location
  useEffect(() => {
    if (location === '/dashboard' || location === '/') {
      setActiveTab('dashboard');
    } else if (location.startsWith('/jobs')) {
      setActiveTab('jobs');
    } else if (location.startsWith('/settings')) {
      setActiveTab('settings');
    }
  }, [location]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/signup" component={Signup} />
        <Route path="/login" component={Login} />
        <Route>
          <Redirect to="/login" />
        </Route>
      </Switch>
    );
  }

  const handleNavigate = (view: string) => {
    setIsDrawerOpen(false);
    if (view === 'settings') {
      setLocation('/settings');
    } else if (view === 'dashboard') {
      setLocation('/dashboard');
    }
  };

  const handleTabChange = (tab: 'dashboard' | 'jobs' | 'settings') => {
    switch (tab) {
      case 'dashboard':
        setLocation('/dashboard');
        break;
      case 'jobs':
        setLocation('/jobs');
        break;
      case 'settings':
        setLocation('/settings');
        break;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNavigation 
        onMenuClick={() => setIsDrawerOpen(true)}
        onLogoClick={() => setLocation('/dashboard')}
      />
      
      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onNavigate={handleNavigate}
      />
      
      <main className="flex-1 overflow-y-auto">
        <Switch>
          <Route path="/">
            <Redirect to="/dashboard" />
          </Route>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/add-company" component={AddCompany} />
          <Route path="/job/:id" component={JobDetails} />
          <Route path="/jobs" component={JobsList} />
          <Route path="/companies" component={TrackedCompanies} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </main>
      
      <BottomNavigation 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
}

export default function App() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then(() => console.log("Service Worker registered successfully."))
        .catch(err => console.error("Service Worker registration failed:", err));
    }
  }, []); 

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AuthProvider>
            <AuthenticatedApp />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
