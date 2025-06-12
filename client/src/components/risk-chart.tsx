import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef } from "react";

interface RiskChartProps {
  data: Array<{ timestamp: string; riskScore: number }>;
}

export default function RiskChart({ data }: RiskChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;

    const canvas = chartRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;
    const padding = 40;

    // Calculate bounds
    const maxScore = Math.max(...data.map(d => d.riskScore), 100);
    const minScore = Math.min(...data.map(d => d.riskScore), 0);

    // Draw grid lines
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i * (height - 2 * padding)) / 5;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw the risk score line
    if (data.length > 1) {
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      data.forEach((point, index) => {
        const x = padding + (index * (width - 2 * padding)) / (data.length - 1);
        const y = height - padding - ((point.riskScore - minScore) * (height - 2 * padding)) / (maxScore - minScore);
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();

      // Draw points
      ctx.fillStyle = '#F59E0B';
      data.forEach((point, index) => {
        const x = padding + (index * (width - 2 * padding)) / (data.length - 1);
        const y = height - padding - ((point.riskScore - minScore) * (height - 2 * padding)) / (maxScore - minScore);
        
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      });
    }

    // Draw labels
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '12px Inter';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 5; i++) {
      const score = maxScore - (i * (maxScore - minScore)) / 5;
      const y = padding + (i * (height - 2 * padding)) / 5;
      ctx.fillText(score.toFixed(0), padding - 10, y + 3);
    }

  }, [data]);

  return (
    <Card className="security-card border-gray-700">
      <CardHeader className="border-b border-gray-700">
        <CardTitle className="text-xl font-semibold text-white">Risk Assessment Timeline</CardTitle>
        <p className="text-gray-400 text-sm mt-1">24-hour risk score trend</p>
      </CardHeader>
      <CardContent className="p-6">
        {data.length === 0 ? (
          <div className="h-64 security-elevated rounded-lg flex items-center justify-center border border-gray-600">
            <div className="text-center">
              <i className="fas fa-chart-line text-4xl text-gray-500 mb-4"></i>
              <p className="text-gray-400">No risk data available</p>
            </div>
          </div>
        ) : (
          <div className="h-64 relative">
            <canvas
              ref={chartRef}
              className="w-full h-full"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        )}
        <div className="mt-4 flex justify-between text-sm text-gray-400">
          <span>Current: {data.length > 0 ? data[data.length - 1]?.riskScore : 0}</span>
          <span>Peak: {data.length > 0 ? Math.max(...data.map(d => d.riskScore)) : 0}</span>
          <span>Average: {data.length > 0 ? Math.round(data.reduce((sum, d) => sum + d.riskScore, 0) / data.length) : 0}</span>
        </div>
      </CardContent>
    </Card>
  );
}
