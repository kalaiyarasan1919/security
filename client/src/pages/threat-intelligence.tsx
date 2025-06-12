import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/sidebar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ThreatFeed, InsertThreatFeed } from "@shared/schema";

export default function ThreatIntelligence() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");

  const { data: threats = [], isLoading } = useQuery({
    queryKey: ['/api/threats'],
    refetchInterval: 60000, // Refresh every minute for live threat data
  });

  const createThreatMutation = useMutation({
    mutationFn: async (threat: InsertThreatFeed) => {
      const response = await apiRequest('POST', '/api/threats', threat);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/threats'] });
      toast({
        title: "Success",
        description: "Threat feed created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create threat feed",
        variant: "destructive",
      });
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-600/20 text-red-400';
      case 'high':
        return 'bg-red-500/20 text-red-400';
      case 'medium':
        return 'bg-amber-500/20 text-amber-400';
      case 'low':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getThreatIcon = (threatType: string) => {
    switch (threatType.toLowerCase()) {
      case 'malware':
        return 'fas fa-virus';
      case 'apt':
        return 'fas fa-user-secret';
      case 'phishing':
        return 'fas fa-envelope-open-text';
      case 'ddos':
        return 'fas fa-broadcast-tower';
      case 'ransomware':
        return 'fas fa-lock';
      default:
        return 'fas fa-exclamation-triangle';
    }
  };

  const filteredThreats = threats.filter(threat => {
    const matchesSearch = threat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         threat.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = selectedSeverity === 'all' || threat.severity === selectedSeverity;
    return matchesSearch && matchesSeverity;
  });

  const severityCounts = threats.reduce((acc, threat) => {
    acc[threat.severity] = (acc[threat.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-4xl text-blue-400 mb-4"></i>
              <p className="text-gray-400">Loading threat intelligence...</p>
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
        <header className="security-surface border-b border-gray-700 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white">Threat Intelligence</h1>
              <p className="text-gray-400 text-sm">Real-time threat monitoring and analysis</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span className="text-sm text-gray-400">Live Feed Active</span>
              </div>
              <Input
                type="search"
                placeholder="Search threats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="security-elevated border-gray-600 w-80 text-white placeholder:text-gray-400"
              />
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Threat Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="security-card border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Threats</p>
                    <p className="text-2xl font-bold text-white">{threats.length}</p>
                  </div>
                  <i className="fas fa-shield-alt text-blue-400 text-2xl"></i>
                </div>
              </CardContent>
            </Card>

            <Card className="security-card border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Critical</p>
                    <p className="text-2xl font-bold text-red-400">{severityCounts.critical || 0}</p>
                  </div>
                  <i className="fas fa-exclamation-triangle text-red-400 text-2xl"></i>
                </div>
              </CardContent>
            </Card>

            <Card className="security-card border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">High</p>
                    <p className="text-2xl font-bold text-orange-400">{severityCounts.high || 0}</p>
                  </div>
                  <i className="fas fa-fire text-orange-400 text-2xl"></i>
                </div>
              </CardContent>
            </Card>

            <Card className="security-card border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Sources</p>
                    <p className="text-2xl font-bold text-green-400">
                      {new Set(threats.map(t => t.source)).size}
                    </p>
                  </div>
                  <i className="fas fa-rss text-green-400 text-2xl"></i>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center space-x-4">
            <span className="text-gray-400 text-sm">Filter by severity:</span>
            <div className="flex space-x-2">
              {['all', 'critical', 'high', 'medium', 'low'].map((severity) => (
                <Button
                  key={severity}
                  variant={selectedSeverity === severity ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSeverity(severity)}
                  className={selectedSeverity === severity 
                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                    : "border-gray-600 hover:bg-slate-700 text-gray-300"
                  }
                >
                  {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  {severity !== 'all' && severityCounts[severity] && (
                    <span className="ml-1 text-xs">({severityCounts[severity]})</span>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Threat Feed */}
          <Card className="security-card border-gray-700">
            <CardHeader className="border-b border-gray-700">
              <CardTitle className="text-xl font-semibold text-white">Active Threats</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {filteredThreats.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fas fa-shield-alt text-4xl text-gray-500 mb-4"></i>
                    <p className="text-gray-400">
                      {searchTerm || selectedSeverity !== 'all' 
                        ? 'No threats match your filters' 
                        : 'No active threats detected'
                      }
                    </p>
                  </div>
                ) : (
                  filteredThreats.map((threat) => (
                    <div key={threat.id} className="flex items-start space-x-4 p-4 security-elevated rounded-lg border border-gray-600">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 ${getSeverityColor(threat.severity)} rounded-lg flex items-center justify-center`}>
                          <i className={`${getThreatIcon(threat.threatType)} text-current`}></i>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-white">{threat.title}</h3>
                          <Badge className={getSeverityColor(threat.severity)}>
                            {threat.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            {threat.threatType}
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{threat.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>
                            <i className="fas fa-clock mr-1"></i>
                            {new Date(threat.createdAt!).toLocaleString()}
                          </span>
                          <span>
                            <i className="fas fa-globe mr-1"></i>
                            {threat.source}
                          </span>
                          <span>
                            <i className="fas fa-server mr-1"></i>
                            Affected: {threat.affectedSystems} systems
                          </span>
                          <Badge 
                            variant="outline" 
                            className={`ml-auto ${threat.status === 'active' ? 'border-green-500 text-green-400' : 'border-gray-500 text-gray-400'}`}
                          >
                            {threat.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
