import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Sidebar from "@/components/sidebar";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    threatIntelligence: true,
    policyViolations: true,
    systemHealth: false,
  });

  const [security, setSecurity] = useState({
    mfaEnabled: true,
    sessionTimeout: "30",
    passwordExpiry: "90",
    loginAttempts: "5",
  });

  const [system, setSystem] = useState({
    logLevel: "info",
    dataRetention: "365",
    autoBackup: true,
    maintenanceMode: false,
  });

  const handleSaveNotifications = () => {
    toast({
      title: "Settings Saved",
      description: "Notification preferences have been updated",
    });
  };

  const handleSaveSecurity = () => {
    toast({
      title: "Settings Saved", 
      description: "Security settings have been updated",
    });
  };

  const handleSaveSystem = () => {
    toast({
      title: "Settings Saved",
      description: "System configuration has been updated",
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <header className="security-surface border-b border-gray-700 px-8 py-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">Settings</h1>
            <p className="text-gray-400 text-sm">Configure system preferences and security options</p>
          </div>
        </header>

        <div className="p-8">
          <Tabs defaultValue="notifications" className="space-y-6">
            <TabsList className="security-elevated border-gray-600">
              <TabsTrigger value="notifications" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <i className="fas fa-bell mr-2"></i>Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <i className="fas fa-shield-alt mr-2"></i>Security
              </TabsTrigger>
              <TabsTrigger value="system" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <i className="fas fa-cog mr-2"></i>System
              </TabsTrigger>
              <TabsTrigger value="integrations" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <i className="fas fa-plug mr-2"></i>Integrations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="notifications" className="space-y-6">
              <Card className="security-card border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <i className="fas fa-bell mr-2 text-blue-400"></i>
                    Notification Preferences
                  </CardTitle>
                  <p className="text-gray-400 text-sm">Configure how you receive alerts and notifications</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-white">Email Alerts</Label>
                      <p className="text-sm text-gray-400">Receive security alerts via email</p>
                    </div>
                    <Switch
                      checked={notifications.emailAlerts}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, emailAlerts: checked }))
                      }
                    />
                  </div>
                  
                  <Separator className="bg-gray-600" />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-white">SMS Alerts</Label>
                      <p className="text-sm text-gray-400">Critical alerts sent via SMS</p>
                    </div>
                    <Switch
                      checked={notifications.smsAlerts}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, smsAlerts: checked }))
                      }
                    />
                  </div>
                  
                  <Separator className="bg-gray-600" />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-white">Threat Intelligence</Label>
                      <p className="text-sm text-gray-400">New threat feed updates</p>
                    </div>
                    <Switch
                      checked={notifications.threatIntelligence}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, threatIntelligence: checked }))
                      }
                    />
                  </div>
                  
                  <Separator className="bg-gray-600" />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-white">Policy Violations</Label>
                      <p className="text-sm text-gray-400">Security policy breach notifications</p>
                    </div>
                    <Switch
                      checked={notifications.policyViolations}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, policyViolations: checked }))
                      }
                    />
                  </div>
                  
                  <Separator className="bg-gray-600" />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-white">System Health</Label>
                      <p className="text-sm text-gray-400">System performance alerts</p>
                    </div>
                    <Switch
                      checked={notifications.systemHealth}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, systemHealth: checked }))
                      }
                    />
                  </div>
                  
                  <div className="pt-4">
                    <Button onClick={handleSaveNotifications} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <i className="fas fa-save mr-2"></i>Save Notification Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card className="security-card border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <i className="fas fa-shield-alt mr-2 text-green-400"></i>
                    Security Configuration
                  </CardTitle>
                  <p className="text-gray-400 text-sm">Configure authentication and access control settings</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-white">Multi-Factor Authentication</Label>
                      <p className="text-sm text-gray-400">Require MFA for admin access</p>
                    </div>
                    <Switch
                      checked={security.mfaEnabled}
                      onCheckedChange={(checked) => 
                        setSecurity(prev => ({ ...prev, mfaEnabled: checked }))
                      }
                    />
                  </div>
                  
                  <Separator className="bg-gray-600" />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Session Timeout (minutes)</Label>
                      <Input
                        type="number"
                        value={security.sessionTimeout}
                        onChange={(e) => setSecurity(prev => ({ ...prev, sessionTimeout: e.target.value }))}
                        className="security-elevated border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Password Expiry (days)</Label>
                      <Input
                        type="number"
                        value={security.passwordExpiry}
                        onChange={(e) => setSecurity(prev => ({ ...prev, passwordExpiry: e.target.value }))}
                        className="security-elevated border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white">Max Login Attempts</Label>
                    <Select 
                      value={security.loginAttempts}
                      onValueChange={(value) => setSecurity(prev => ({ ...prev, loginAttempts: value }))}
                    >
                      <SelectTrigger className="security-elevated border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="security-surface border-gray-700">
                        <SelectItem value="3">3 attempts</SelectItem>
                        <SelectItem value="5">5 attempts</SelectItem>
                        <SelectItem value="10">10 attempts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="pt-4">
                    <Button onClick={handleSaveSecurity} className="bg-green-600 hover:bg-green-700 text-white">
                      <i className="fas fa-save mr-2"></i>Save Security Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              <Card className="security-card border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <i className="fas fa-cog mr-2 text-purple-400"></i>
                    System Configuration
                  </CardTitle>
                  <p className="text-gray-400 text-sm">Configure system-wide settings and preferences</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Log Level</Label>
                      <Select 
                        value={system.logLevel}
                        onValueChange={(value) => setSystem(prev => ({ ...prev, logLevel: value }))}
                      >
                        <SelectTrigger className="security-elevated border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="security-surface border-gray-700">
                          <SelectItem value="debug">Debug</SelectItem>
                          <SelectItem value="info">Info</SelectItem>
                          <SelectItem value="warn">Warning</SelectItem>
                          <SelectItem value="error">Error</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Data Retention (days)</Label>
                      <Input
                        type="number"
                        value={system.dataRetention}
                        onChange={(e) => setSystem(prev => ({ ...prev, dataRetention: e.target.value }))}
                        className="security-elevated border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  
                  <Separator className="bg-gray-600" />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-white">Automatic Backup</Label>
                      <p className="text-sm text-gray-400">Daily automated system backups</p>
                    </div>
                    <Switch
                      checked={system.autoBackup}
                      onCheckedChange={(checked) => 
                        setSystem(prev => ({ ...prev, autoBackup: checked }))
                      }
                    />
                  </div>
                  
                  <Separator className="bg-gray-600" />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-white">Maintenance Mode</Label>
                      <p className="text-sm text-gray-400">Temporarily disable system access</p>
                    </div>
                    <Switch
                      checked={system.maintenanceMode}
                      onCheckedChange={(checked) => 
                        setSystem(prev => ({ ...prev, maintenanceMode: checked }))
                      }
                    />
                  </div>
                  
                  <div className="pt-4">
                    <Button onClick={handleSaveSystem} className="bg-purple-600 hover:bg-purple-700 text-white">
                      <i className="fas fa-save mr-2"></i>Save System Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-6">
              <Card className="security-card border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <i className="fas fa-plug mr-2 text-orange-400"></i>
                    Integration Settings
                  </CardTitle>
                  <p className="text-gray-400 text-sm">Configure external system connections and API settings</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="p-4 security-elevated rounded-lg border border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-white">API Rate Limiting</h3>
                        <Switch defaultChecked />
                      </div>
                      <p className="text-sm text-gray-400">Limit API requests to prevent abuse</p>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <Input 
                          placeholder="1000 requests/hour" 
                          className="security-elevated border-gray-600 text-white text-xs"
                        />
                        <Input 
                          placeholder="100 requests/minute" 
                          className="security-elevated border-gray-600 text-white text-xs"
                        />
                      </div>
                    </div>
                    
                    <div className="p-4 security-elevated rounded-lg border border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-white">Webhook Notifications</h3>
                        <Switch defaultChecked />
                      </div>
                      <p className="text-sm text-gray-400">Send alerts to external systems</p>
                      <Input 
                        placeholder="https://your-webhook-url.com/alerts" 
                        className="mt-3 security-elevated border-gray-600 text-white"
                      />
                    </div>
                    
                    <div className="p-4 security-elevated rounded-lg border border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-white">Data Export</h3>
                        <Switch />
                      </div>
                      <p className="text-sm text-gray-400">Allow data export to external systems</p>
                      <div className="mt-3 flex space-x-2">
                        <Button size="sm" variant="outline" className="border-gray-600 text-white">
                          <i className="fas fa-download mr-1"></i>Export Policies
                        </Button>
                        <Button size="sm" variant="outline" className="border-gray-600 text-white">
                          <i className="fas fa-download mr-1"></i>Export Events
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                      <i className="fas fa-save mr-2"></i>Save Integration Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}