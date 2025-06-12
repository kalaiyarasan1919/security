import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ThreatFeed } from "@shared/schema";

interface ThreatFeedProps {
  threats: ThreatFeed[];
}

export default function ThreatFeedComponent({ threats }: ThreatFeedProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-500/20 text-red-400';
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
      default:
        return 'fas fa-exclamation-triangle';
    }
  };

  return (
    <Card className="security-card border-gray-700 lg:col-span-2">
      <CardHeader className="border-b border-gray-700">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-white">Threat Intelligence</CardTitle>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <span className="text-sm text-gray-400">Live Feed Active</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {threats.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-shield-alt text-4xl text-gray-500 mb-4"></i>
              <p className="text-gray-400">No active threats detected</p>
            </div>
          ) : (
            threats.map((threat) => (
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
                      <i className="fas fa-eye mr-1"></i>
                      Affected: {threat.affectedSystems} systems
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
