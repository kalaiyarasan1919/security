import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ApiIntegration } from "@shared/schema";

interface ApiStatusProps {
  integrations: ApiIntegration[];
}

export default function ApiStatus({ integrations }: ApiStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online':
        return { bg: 'bg-green-500/20', text: 'text-green-400', dot: 'bg-green-400' };
      case 'offline':
        return { bg: 'bg-red-500/20', text: 'text-red-400', dot: 'bg-red-400' };
      case 'degraded':
        return { bg: 'bg-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-400' };
      default:
        return { bg: 'bg-gray-500/20', text: 'text-gray-400', dot: 'bg-gray-400' };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'siem':
        return 'fas fa-plug';
      case 'firewall':
        return 'fas fa-fire';
      case 'cloud_security':
        return 'fas fa-cloud';
      case 'identity_provider':
        return 'fas fa-user-shield';
      default:
        return 'fas fa-plug';
    }
  };

  return (
    <Card className="security-card border-gray-700">
      <CardHeader className="border-b border-gray-700">
        <CardTitle className="text-xl font-semibold text-white">API Endpoints Status</CardTitle>
        <p className="text-gray-400 text-sm mt-1">External system integrations</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {integrations.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-plug text-4xl text-gray-500 mb-4"></i>
              <p className="text-gray-400">No API integrations configured</p>
            </div>
          ) : (
            integrations.map((integration) => {
              const statusStyle = getStatusColor(integration.status);
              return (
                <div key={integration.id} className="flex items-center justify-between p-4 security-elevated rounded-lg border border-gray-600">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${statusStyle.bg} rounded-lg flex items-center justify-center`}>
                      <i className={`${getTypeIcon(integration.type)} ${statusStyle.text} text-sm`}></i>
                    </div>
                    <div>
                      <p className="font-medium text-white">{integration.name}</p>
                      <p className="text-xs text-gray-400">{integration.endpoint}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 ${statusStyle.dot} rounded-full`}></span>
                    <span className={`text-sm ${statusStyle.text}`}>
                      {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                    </span>
                    {integration.responseTime && (
                      <span className="text-xs text-gray-500 ml-2">
                        {integration.responseTime}ms
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
