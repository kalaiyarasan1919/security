import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/sidebar";
import StatsOverview from "@/components/stats-overview";
import ThreatFeedComponent from "@/components/threat-feed";
import PolicyDecisionPoint from "@/components/policy-decision-point";
import PolicyTable from "@/components/policy-table";
import RiskChart from "@/components/risk-chart";
import ApiStatus from "@/components/api-status";
import { useWebSocket } from "@/lib/websocket";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();
  const [alertCount, setAlertCount] = useState(3);

  // Fetch dashboard data
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: threats, isLoading: threatsLoading } = useQuery({
    queryKey: ['/api/threats'],
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: policies, isLoading: policiesLoading } = useQuery({
    queryKey: ['/api/policies'],
  });

  const { data: riskTimeline, isLoading: riskLoading } = useQuery({
    queryKey: ['/api/risk/timeline?hours=24'],
  });

  const { data: integrations, isLoading: integrationsLoading } = useQuery({
    queryKey: ['/api/integrations'],
  });

  // WebSocket for real-time updates
  useWebSocket((message) => {
    switch (message.type) {
      case 'threat_detected':
        toast({
          title: "New Threat Detected",
          description: message.data.title,
          variant: "destructive",
        });
        setAlertCount(prev => prev + 1);
        break;
      case 'policy_decision':
        // Handle real-time policy decisions
        break;
      case 'system_event':
        if (message.data.severity === 'high' || message.data.severity === 'critical') {
          toast({
            title: "System Alert",
            description: message.data.details?.message || "High severity system event detected",
            variant: "destructive",
          });
        }
        break;
    }
  });

  if (statsLoading || threatsLoading || policiesLoading || riskLoading || integrationsLoading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-4xl text-blue-400 mb-4"></i>
              <p className="text-gray-400">Loading dashboard...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header className="security-surface border-b border-gray-700 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white">Security Dashboard</h1>
              <p className="text-gray-400 text-sm">Real-time security policy enforcement and monitoring</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Search policies, threats..."
                  className="security-elevated border-gray-600 pl-10 w-80 text-white placeholder:text-gray-400"
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
              <Button variant="ghost" className="relative text-gray-400 hover:text-white">
                <i className="fas fa-bell text-lg"></i>
                {alertCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center text-white">
                    {alertCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Stats Overview */}
          <StatsOverview stats={stats || { activePolicies: 0, threatDetections: 0, riskScore: 0, systemHealth: 0 }} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Threat Intelligence Panel */}
            <ThreatFeedComponent threats={threats || []} />

            {/* Policy Decision Point */}
            <PolicyDecisionPoint 
              decisions={stats?.recentDecisions || []}
              stats={{
                currentLoad: Math.floor(Math.random() * 1000) + 500,
                responseTime: Math.floor(Math.random() * 50) + 10
              }}
            />
          </div>

          {/* Policy Management */}
          <PolicyTable policies={policies || []} />

          {/* Real-time Monitoring */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RiskChart data={riskTimeline || []} />
            <ApiStatus integrations={integrations || []} />
          </div>
        </div>
      </main>
    </div>
  );
}
