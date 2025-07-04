import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { useAuth } from "./hooks/useAuth";
import { WebSocketProvider } from "./lib/websocket";
import ErrorBoundary from "./components/ErrorBoundary";

// Pages
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import TaskDetail from "@/pages/TaskDetail";
import LoadingSpinner from "@/components/LoadingSpinner";

function AuthenticatedApp() {
  return (
    <WebSocketProvider>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/task/:id" component={TaskDetail} />
        <Route component={() => <Redirect to="/" />} />
      </Switch>
    </WebSocketProvider>
  );
}

function Router() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Login />;
  }

  return <AuthenticatedApp />;
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <TooltipProvider>
            <div className="min-h-screen bg-background text-foreground">
              <Toaster />
              <Router />
            </div>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
