import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import Sidebar from "@/components/sidebar";
import RiskChart from "@/components/risk-chart";

export default function RiskAssessment() {
  const [timeRange, setTimeRange] = useState("24");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: riskTimeline = [], isLoading: timelineLoading } = useQuery({
    queryKey: [`/api/risk/timeline?hours=${timeRange}`],
  });

  const { data: riskAssessments = [], isLoading: assessmentsLoading } = useQuery({
    queryKey: ['/api/risk/assessments'],
  });

  const getCurrentRiskScore = () => {
    if (riskTimeline.length === 0) return 0;
    return riskTimeline[riskTimeline.length - 1]?.riskScore || 0;
  };

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { level: 'Critical', color: 'text-red-400', bg: 'bg-red-500/20' };
    if (score >= 60) return { level: 'High', color: 'text-orange-400', bg: 'bg-orange-500/20' };
    if (score >= 40) return { level: 'Medium', color: 'text-amber-400', bg: 'bg-amber-500/20' };
    return { level: 'Low', color: 'text-green-400', bg: 'bg-green-500/20' };
  };

  const currentRiskScore = getCurrentRiskScore();
  const riskLevel = getRiskLevel(currentRiskScore);

  const riskFactors = [
    { name: 'Authentication Anomalies', score: 65, trend: 'up' },
    { name: 'Network Behavior', score: 45, trend: 'down' },
    { name: 'Data Access Patterns', score: 78, trend: 'up' },
    { name: 'Geographic Locations', score: 32, trend: 'stable' },
    { name: 'Device Trust Score', score: 89, trend: 'down' },
    { name: 'Threat Intelligence', score: 55, trend: 'up' },
  ];

  if (timelineLoading || assessmentsLoading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-4xl text-blue-400 mb-4"></i>
              <p className="text-gray-400">Loading risk assessment...</p>
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
              <h1 className="text-2xl font-semibold text-white">Risk Assessment</h1>
              <p className="text-gray-400 text-sm">Comprehensive risk analysis and monitoring</p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40 security-elevated border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="security-surface border-gray-700">
                  <SelectItem value="1">Last Hour</SelectItem>
                  <SelectItem value="24">Last 24 Hours</SelectItem>
                  <SelectItem value="168">Last Week</SelectItem>
                  <SelectItem value="720">Last Month</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="search"
                placeholder="Search assessments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="security-elevated border-gray-600 w-80 text-white placeholder:text-gray-400"
              />
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Risk Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="security-card border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Current Risk Score</p>
                    <p className={`text-3xl font-bold ${riskLevel.color}`}>{currentRiskScore}</p>
                    <span className={`text-sm px-2 py-1 rounded ${riskLevel.bg} ${riskLevel.color}`}>
                      {riskLevel.level}
                    </span>
                  </div>
                  <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                    <i className="fas fa-chart-line text-amber-500 text-xl"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="security-card border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">High Risk Events</p>
                    <p className="text-3xl font-bold text-red-400">12</p>
                    <p className="text-red-400 text-sm">
                      <i className="fas fa-arrow-up mr-1"></i>+3 today
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <i className="fas fa-exclamation-triangle text-red-500 text-xl"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="security-card border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Assessments Today</p>
                    <p className="text-3xl font-bold text-white">847</p>
                    <p className="text-green-400 text-sm">
                      <i className="fas fa-check mr-1"></i>All processed
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <i className="fas fa-tasks text-blue-500 text-xl"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="security-card border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">ML Accuracy</p>
                    <p className="text-3xl font-bold text-green-400">94.2%</p>
                    <p className="text-green-400 text-sm">
                      <i className="fas fa-robot mr-1"></i>Model performing well
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <i className="fas fa-brain text-green-500 text-xl"></i>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Risk Timeline Chart */}
            <RiskChart data={riskTimeline} />

            {/* Risk Factors */}
            <Card className="security-card border-gray-700">
              <CardHeader className="border-b border-gray-700">
                <CardTitle className="text-xl font-semibold text-white">Risk Factors Analysis</CardTitle>
                <p className="text-gray-400 text-sm mt-1">Individual risk component breakdown</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {riskFactors.map((factor, index) => {
                    const factorRiskLevel = getRiskLevel(factor.score);
                    const trendIcon = {
                      up: 'fas fa-arrow-up text-red-400',
                      down: 'fas fa-arrow-down text-green-400',
                      stable: 'fas fa-minus text-gray-400'
                    };

                    return (
                      <div key={index} className="p-4 security-elevated rounded-lg border border-gray-600">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-white">{factor.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm ${factorRiskLevel.color}`}>{factor.score}</span>
                            <i className={`${trendIcon[factor.trend]} text-xs`}></i>
                          </div>
                        </div>
                        <Progress 
                          value={factor.score} 
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Low</span>
                          <span>High</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Risk Assessments */}
          <Card className="security-card border-gray-700">
            <CardHeader className="border-b border-gray-700">
              <CardTitle className="text-xl font-semibold text-white">Recent Risk Assessments</CardTitle>
              <p className="text-gray-400 text-sm mt-1">Latest automated risk evaluations</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[
                  { entity: 'john.doe@corp.com', type: 'User', score: 72, factors: ['Location anomaly', 'Multiple failed logins'], time: '2 minutes ago' },
                  { entity: 'API-Server-001', type: 'System', score: 45, factors: ['High CPU usage', 'Unusual network traffic'], time: '5 minutes ago' },
                  { entity: 'Database-Prod-01', type: 'Resource', score: 89, factors: ['Unauthorized access attempt', 'Privilege escalation'], time: '8 minutes ago' },
                  { entity: 'sarah.chen@corp.com', type: 'User', score: 28, factors: ['Normal behavior pattern'], time: '12 minutes ago' },
                ].map((assessment, index) => {
                  const assessmentRiskLevel = getRiskLevel(assessment.score);
                  return (
                    <div key={index} className="flex items-center justify-between p-4 security-elevated rounded-lg border border-gray-600">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 ${assessmentRiskLevel.bg} rounded-lg flex items-center justify-center`}>
                          <i className={`fas ${assessment.type === 'User' ? 'fa-user' : assessment.type === 'System' ? 'fa-server' : 'fa-database'} ${assessmentRiskLevel.color}`}></i>
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{assessment.entity}</h3>
                          <p className="text-sm text-gray-400">{assessment.type} Assessment</p>
                          <div className="flex items-center space-x-2 mt-1">
                            {assessment.factors.map((factor, factorIndex) => (
                              <span key={factorIndex} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                                {factor}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${assessmentRiskLevel.color}`}>{assessment.score}</div>
                        <div className={`text-xs px-2 py-1 rounded ${assessmentRiskLevel.bg} ${assessmentRiskLevel.color}`}>
                          {assessmentRiskLevel.level}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{assessment.time}</div>
                      </div>
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
