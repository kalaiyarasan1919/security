import { Card } from "@/components/ui/card";

interface StatsOverviewProps {
  stats: {
    activePolicies: number;
    threatDetections: number;
    riskScore: number;
    systemHealth: number;
  };
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="security-card p-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Active Policies</p>
            <p className="text-3xl font-bold mt-1 text-white">{stats.activePolicies}</p>
            <p className="text-green-400 text-sm mt-1">
              <i className="fas fa-arrow-up mr-1"></i>12% from last week
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
            <i className="fas fa-file-shield text-blue-400 text-xl"></i>
          </div>
        </div>
      </Card>

      <Card className="security-card p-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Threat Detections</p>
            <p className="text-3xl font-bold mt-1 text-white">{stats.threatDetections.toLocaleString()}</p>
            <p className="text-orange-400 text-sm mt-1">
              <i className="fas fa-arrow-up mr-1"></i>8% increase
            </p>
          </div>
          <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
            <i className="fas fa-exclamation-triangle text-orange-500 text-xl"></i>
          </div>
        </div>
      </Card>

      <Card className="security-card p-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Risk Score</p>
            <p className="text-3xl font-bold mt-1 text-white">{stats.riskScore}</p>
            <p className="text-amber-400 text-sm mt-1">
              {stats.riskScore > 70 ? 'High Risk' : stats.riskScore > 40 ? 'Medium Risk' : 'Low Risk'}
            </p>
          </div>
          <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
            <i className="fas fa-chart-line text-amber-500 text-xl"></i>
          </div>
        </div>
      </Card>

      <Card className="security-card p-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">System Health</p>
            <p className="text-3xl font-bold mt-1 text-white">{stats.systemHealth}%</p>
            <p className="text-green-400 text-sm mt-1">
              <i className="fas fa-check mr-1"></i>All systems operational
            </p>
          </div>
          <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
            <i className="fas fa-heartbeat text-green-500 text-xl"></i>
          </div>
        </div>
      </Card>
    </div>
  );
}
