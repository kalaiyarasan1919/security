import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { PolicyDecision } from "@shared/schema";

interface PolicyDecisionPointProps {
  decisions: PolicyDecision[];
  stats: {
    currentLoad: number;
    responseTime: number;
  };
}

export default function PolicyDecisionPoint({ decisions, stats }: PolicyDecisionPointProps) {
  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'allow':
        return { icon: 'fas fa-check', color: 'bg-green-500', textColor: 'text-white' };
      case 'deny':
        return { icon: 'fas fa-times', color: 'bg-red-500', textColor: 'text-white' };
      case 'mfa_required':
        return { icon: 'fas fa-pause', color: 'bg-amber-500', textColor: 'text-black' };
      default:
        return { icon: 'fas fa-question', color: 'bg-gray-500', textColor: 'text-white' };
    }
  };

  const getDecisionText = (decision: string) => {
    switch (decision) {
      case 'allow':
        return 'Access Granted';
      case 'deny':
        return 'Access Denied';
      case 'mfa_required':
        return 'MFA Required';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card className="security-card border-gray-700">
      <CardHeader className="border-b border-gray-700">
        <CardTitle className="text-xl font-semibold text-white">Policy Decision Point</CardTitle>
        <p className="text-gray-400 text-sm mt-1">Real-time policy evaluations</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Current Load</span>
              <span className="text-sm font-medium text-white">{stats.currentLoad} req/min</span>
            </div>
            <Progress value={Math.min((stats.currentLoad / 1000) * 100, 100)} className="h-2" />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Average Response Time</span>
              <span className="text-sm font-medium text-green-400">{stats.responseTime}ms</span>
            </div>
            <Progress value={Math.min((stats.responseTime / 100) * 100, 100)} className="h-2" />
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-sm text-white">Recent Decisions</h3>
            {decisions.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm">No recent decisions</p>
              </div>
            ) : (
              decisions.map((decision) => {
                const { icon, color, textColor } = getDecisionIcon(decision.decision);
                return (
                  <div key={decision.id} className="flex items-center space-x-3 p-3 security-elevated rounded-lg">
                    <div className={`w-6 h-6 ${color} rounded-full flex items-center justify-center`}>
                      <i className={`${icon} text-xs ${textColor}`}></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{getDecisionText(decision.decision)}</p>
                      <p className="text-xs text-gray-400">
                        {decision.userId ? `User: ${decision.userId}` : `Risk: ${decision.riskScore}`}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(decision.createdAt!).toLocaleTimeString()}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
