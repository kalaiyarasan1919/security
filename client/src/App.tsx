import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import PolicyManagement from "@/pages/policy-management";
import ThreatIntelligence from "@/pages/threat-intelligence";
import RiskAssessment from "@/pages/risk-assessment";
import RealTimeMonitor from "@/pages/real-time-monitor";
import ApiManagement from "@/pages/api-management";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/policies" component={PolicyManagement} />
      <Route path="/threats" component={ThreatIntelligence} />
      <Route path="/risk" component={RiskAssessment} />
      <Route path="/monitor" component={RealTimeMonitor} />
      <Route path="/api" component={ApiManagement} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
