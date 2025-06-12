import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/sidebar";
import { useWebSocket } from "@/lib/websocket";
import { useToast } from "@/hooks/use-toast";
import type { SystemEvent, PolicyDecision } from "@shared/schema";

export default function RealTimeMonitor() {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(true);
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [decisions, setDecisions] = useState<PolicyDecision[]>([]);
  const [metrics, setMetrics] = useState({
    requestsPerSecond: 0,
    avgResponseTime: 0,
    errorRate: 0,
    activeConnections: 0
  });

  // Fetch initial data
  const { data: systemEvents = [] } = useQuery({
    queryKey: ['/api/events?limit=20'],
    refetchInterval: isRecording ? 5000 : false,
  });

  const { data: recentDecisions = [] } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    select: (data: any) => data.recentDecisions || [],
    refetchInterval: isRecording ? 3000 : false,
  });

  // WebSocket for real-time updates
  useWebSocket((message) => {
    if (!isRecording) return;

    switch (message.type) {
      case 'system_event':
        setEvents(prev => [message.data, ...prev.slice(0, 19)]);
        
        // Update metrics simulation
        setMetrics(prev => ({
          ...prev,
          requestsPerSecond: Math.floor(Math.random() * 100) + 50,
          avgResponseTime: Math.floor(Math.random() * 50) + 10,
          errorRate: Math.random() * 5,
          activeConnections: Math.floor(Math.random() * 200) + 100
        }));
        break;
        
      case 'policy_decision':
        setDecisions(prev => [message.data, ...prev.slice(0, 14)]);
        break;
        
      case 'threat_detected':
        toast({
          title: "Real-time Alert",
          description: `New threat detected: ${message.data.title}`,
          variant: "destructive",
        });
        break;
    }
  });

  // Initialize events from API data
  useEffect(() => {
    if (Array.isArray(systemEvents) && systemEvents.length > 0) {
      setEvents(systemEvents as SystemEvent[]);
    }
  }, [systemEvents]);

  useEffect(() => {
    if (Array.isArray(recentDecisions) && recentDecisions.length > 0) {
      setDecisions(recentDecisions as PolicyDecision[]);
    }
  }, [recentDecisions]);

  // Simulate metrics updates
  useEffect(() => {
    if (!isRecording) return;
    
    const interval = setInterval(() => {
      setMetrics(prev => ({
        requestsPerSecond: Math.floor(Math.random() * 100) + 50,
        avgResponseTime: Math.floor(Math.random() * 50) + 10,
        errorRate: Math.random() * 5,
        activeConnections: Math.floor(Math.random() * 200) + 100
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [isRecording]);

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-red-500/20 text-red-400';
      case 'high':
        return 'bg-orange-500/20 text-orange-400';
      case 'medium':
        return 'bg-amber-500/20 text-amber-400';
      case 'low':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'allow':
        return 'bg-green-500/20 text-green-400';
      case 'deny':
        return 'bg-red-500/20 text-red-400';
      case 'mfa_required':
        return 'bg-amber-500/20 text-amber-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <header className="security-surface border-b border-gray-700 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white">Real-time Monitor</h1>
              <p className="text-gray-400 text-sm">Live system monitoring and event tracking</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 ${isRecording ? 'bg-red-400' : 'bg-gray-400'} rounded-full ${isRecording ? 'animate-pulse' : ''}`}></span>
                <span className="text-sm text-gray-400">{isRecording ? 'Recording' : 'Paused'}</span>
              </div>
              <Button
                onClick={() => setIsRecording(!isRecording)}
                className={isRecording ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
              >
                <i className={`fas ${isRecording ? 'fa-pause' : 'fa-play'} mr-2`}></i>
                {isRecording ? 'Pause' : 'Resume'}
              </Button>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Real-time Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="security-card border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Requests/sec</p>
                    <p className="text-2xl font-bold text-white">{metrics.requestsPerSecond}</p>
                    <Progress value={(metrics.requestsPerSecond / 150) * 100} className="h-1 mt-2" />
                  </div>
                  <i className="fas fa-tachometer-alt text-blue-400 text-xl"></i>
                </div>
              </CardContent>
            </Card>

            <Card className="security-card border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Avg Response</p>
                    <p className="text-2xl font-bold text-white">{metrics.avgResponseTime}ms</p>
                    <Progress value={(metrics.avgResponseTime / 60) * 100} className="h-1 mt-2" />
                  </div>
                  <i className="fas fa-clock text-green-400 text-xl"></i>
                </div>
              </CardContent>
            </Card>

            <Card className="security-card border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Error Rate</p>
                    <p className="text-2xl font-bold text-white">{metrics.errorRate.toFixed(1)}%</p>
                    <Progress value={metrics.errorRate * 20} className="h-1 mt-2" />
                  </div>
                  <i className="fas fa-exclamation-triangle text-amber-400 text-xl"></i>
                </div>
              </CardContent>
            </Card>

            <Card className="security-card border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Connections</p>
                    <p className="text-2xl font-bold text-white">{metrics.activeConnections}</p>
                    <Progress value={(metrics.activeConnections / 300) * 100} className="h-1 mt-2" />
                  </div>
                  <i className="fas fa-users text-purple-400 text-xl"></i>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* System Events Stream */}
            <Card className="security-card border-gray-700">
              <CardHeader className="border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-white">System Events</CardTitle>
                  <Badge variant="outline" className="border-blue-500 text-blue-400">
                    Live Feed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-96 overflow-y-auto">
                  {events.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <i className="fas fa-stream text-4xl text-gray-500 mb-4"></i>
                        <p className="text-gray-400">No events to display</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 p-4">
                      {events.map((event, index) => (
                        <div key={event.id || index} className="flex items-center space-x-3 p-3 hover:bg-gray-800/50 rounded-lg">
                          <div className={`w-2 h-2 ${getSeverityColor(event.severity).split(' ')[0]} rounded-full`}></div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-white text-sm font-medium">{event.eventType}</span>
                              <Badge className={getSeverityColor(event.severity)} size="sm">
                                {event.severity}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-400">{event.source}</p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(event.createdAt!).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Policy Decisions Stream */}
            <Card className="security-card border-gray-700">
              <CardHeader className="border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-white">Policy Decisions</CardTitle>
                  <Badge variant="outline" className="border-green-500 text-green-400">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-96 overflow-y-auto">
                  {decisions.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <i className="fas fa-gavel text-4xl text-gray-500 mb-4"></i>
                        <p className="text-gray-400">No decisions to display</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 p-4">
                      {decisions.map((decision, index) => (
                        <div key={decision.id || index} className="flex items-center space-x-3 p-3 hover:bg-gray-800/50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <Badge className={getDecisionColor(decision.decision)} size="sm">
                                {decision.decision.replace('_', ' ').toUpperCase()}
                              </Badge>
                              {decision.riskScore && (
                                <span className="text-xs text-gray-400">
                                  Risk: {Math.round(decision.riskScore)}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              User: {decision.userId || 'System'}
                            </p>
                            {decision.reason && (
                              <p className="text-xs text-gray-500 mt-1">{decision.reason}</p>
                            )}
                          </div>
                          <div className="text-right">
                            {decision.responseTime && (
                              <span className="text-xs text-green-400">{decision.responseTime}ms</span>
                            )}
                            <div className="text-xs text-gray-500">
                              {new Date(decision.createdAt!).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Timeline */}
          <Card className="security-card border-gray-700">
            <CardHeader className="border-b border-gray-700">
              <CardTitle className="text-xl font-semibold text-white">Activity Timeline</CardTitle>
              <p className="text-gray-400 text-sm mt-1">Chronological view of all system activities</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[...events, ...decisions]
                  .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
                  .slice(0, 10)
                  .map((item, index) => {
                    const isEvent = 'eventType' in item;
                    return (
                      <div key={index} className="flex items-start space-x-4 p-4 security-elevated rounded-lg border border-gray-600">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <i className={`fas ${isEvent ? 'fa-cog' : 'fa-gavel'} text-blue-400 text-sm`}></i>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-white">
                              {isEvent ? (item as SystemEvent).eventType : `Policy Decision: ${(item as PolicyDecision).decision}`}
                            </h3>
                            <Badge className={isEvent ? getSeverityColor((item as SystemEvent).severity) : getDecisionColor((item as PolicyDecision).decision)}>
                              {isEvent ? (item as SystemEvent).severity : (item as PolicyDecision).decision}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400">
                            {isEvent 
                              ? `Source: ${(item as SystemEvent).source}`
                              : `User: ${(item as PolicyDecision).userId || 'System'} | Risk: ${(item as PolicyDecision).riskScore}`
                            }
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(item.createdAt!).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}