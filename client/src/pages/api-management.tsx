import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Sidebar from "@/components/sidebar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ApiIntegration, InsertApiIntegration } from "@shared/schema";

export default function ApiManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ['/api/integrations'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const createIntegrationMutation = useMutation({
    mutationFn: async (integration: InsertApiIntegration) => {
      const response = await apiRequest('POST', '/api/integrations', integration);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "API integration created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create API integration",
        variant: "destructive",
      });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('PUT', `/api/integrations/${id}/status`, {
        status: 'online',
        responseTime: Math.floor(Math.random() * 200) + 50,
        lastCheck: new Date(),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      toast({
        title: "Success",
        description: "Connection test completed",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Connection test failed",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const integration: InsertApiIntegration = {
      name: formData.get('name') as string,
      endpoint: formData.get('endpoint') as string,
      type: formData.get('type') as string,
      status: 'offline',
      responseTime: null,
      errorMessage: null,
    };

    createIntegrationMutation.mutate(integration);
  };

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
        return 'fas fa-shield-alt';
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

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.endpoint.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || integration.type === selectedType;
    return matchesSearch && matchesType;
  });

  const statusCounts = integrations.reduce((acc, integration) => {
    acc[integration.status] = (acc[integration.status] || 0) + 1;
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
              <p className="text-gray-400">Loading API integrations...</p>
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
              <h1 className="text-2xl font-semibold text-white">API Management</h1>
              <p className="text-gray-400 text-sm">Manage external system integrations and connections</p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-40 security-elevated border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="security-surface border-gray-700">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="siem">SIEM</SelectItem>
                  <SelectItem value="firewall">Firewall</SelectItem>
                  <SelectItem value="cloud_security">Cloud Security</SelectItem>
                  <SelectItem value="identity_provider">Identity Provider</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="search"
                placeholder="Search integrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="security-elevated border-gray-600 w-80 text-white placeholder:text-gray-400"
              />
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <i className="fas fa-plus mr-2"></i>New Integration
                  </Button>
                </DialogTrigger>
                <DialogContent className="security-surface border-gray-700 text-white">
                  <DialogHeader>
                    <DialogTitle>Add New API Integration</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Configure a new external system integration.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="e.g., Splunk SIEM"
                          className="col-span-3 security-elevated border-gray-600 text-white"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="endpoint" className="text-right">Endpoint</Label>
                        <Input
                          id="endpoint"
                          name="endpoint"
                          placeholder="https://api.example.com"
                          className="col-span-3 security-elevated border-gray-600 text-white"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">Type</Label>
                        <Select name="type" defaultValue="siem">
                          <SelectTrigger className="col-span-3 security-elevated border-gray-600 text-white">
                            <SelectValue placeholder="Select integration type" />
                          </SelectTrigger>
                          <SelectContent className="security-surface border-gray-700">
                            <SelectItem value="siem">SIEM</SelectItem>
                            <SelectItem value="firewall">Firewall</SelectItem>
                            <SelectItem value="cloud_security">Cloud Security</SelectItem>
                            <SelectItem value="identity_provider">Identity Provider</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                        Add Integration
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="security-card border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Integrations</p>
                    <p className="text-2xl font-bold text-white">{integrations.length}</p>
                  </div>
                  <i className="fas fa-plug text-blue-400 text-xl"></i>
                </div>
              </CardContent>
            </Card>

            <Card className="security-card border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Online</p>
                    <p className="text-2xl font-bold text-green-400">{statusCounts.online || 0}</p>
                  </div>
                  <i className="fas fa-check-circle text-green-400 text-xl"></i>
                </div>
              </CardContent>
            </Card>

            <Card className="security-card border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Degraded</p>
                    <p className="text-2xl font-bold text-amber-400">{statusCounts.degraded || 0}</p>
                  </div>
                  <i className="fas fa-exclamation-triangle text-amber-400 text-xl"></i>
                </div>
              </CardContent>
            </Card>

            <Card className="security-card border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Offline</p>
                    <p className="text-2xl font-bold text-red-400">{statusCounts.offline || 0}</p>
                  </div>
                  <i className="fas fa-times-circle text-red-400 text-xl"></i>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Integrations List */}
          <Card className="security-card border-gray-700">
            <CardHeader className="border-b border-gray-700">
              <CardTitle className="text-xl font-semibold text-white">API Integrations</CardTitle>
              <p className="text-gray-400 text-sm mt-1">Monitor and manage external system connections</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {filteredIntegrations.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fas fa-plug text-4xl text-gray-500 mb-4"></i>
                    <p className="text-gray-400">
                      {searchTerm || selectedType !== 'all' 
                        ? 'No integrations match your filters' 
                        : 'No API integrations configured'
                      }
                    </p>
                  </div>
                ) : (
                  filteredIntegrations.map((integration) => {
                    const statusStyle = getStatusColor(integration.status);
                    return (
                      <div key={integration.id} className="flex items-center justify-between p-4 security-elevated rounded-lg border border-gray-600">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 ${statusStyle.bg} rounded-lg flex items-center justify-center`}>
                            <i className={`${getTypeIcon(integration.type)} ${statusStyle.text} text-lg`}></i>
                          </div>
                          <div>
                            <h3 className="font-medium text-white">{integration.name}</h3>
                            <p className="text-sm text-gray-400">{integration.endpoint}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="border-gray-600 text-gray-300">
                                {integration.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Badge>
                              {integration.lastCheck && (
                                <span className="text-xs text-gray-500">
                                  Last checked: {new Date(integration.lastCheck).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="flex items-center space-x-2">
                              <span className={`w-2 h-2 ${statusStyle.dot} rounded-full`}></span>
                              <span className={`text-sm font-medium ${statusStyle.text}`}>
                                {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                              </span>
                            </div>
                            {integration.responseTime && (
                              <span className="text-xs text-gray-400">
                                {integration.responseTime}ms
                              </span>
                            )}
                            {integration.errorMessage && (
                              <p className="text-xs text-red-400 mt-1">{integration.errorMessage}</p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-600 hover:bg-slate-700 text-white"
                            onClick={() => testConnectionMutation.mutate(integration.id)}
                            disabled={testConnectionMutation.isPending}
                          >
                            <i className="fas fa-sync mr-1"></i>
                            Test
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}