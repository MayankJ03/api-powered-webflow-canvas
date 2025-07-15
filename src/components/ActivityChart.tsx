import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Activity, MapPin } from 'lucide-react';

interface ChartData {
  date: string;
  running: number;
  walking: number;
  cycling: number;
}

interface RoutePoint {
  lat: number;
  lng: number;
}

export const ActivityChart: React.FC = () => {
  const chartCanvasRef = useRef<HTMLCanvasElement>(null);
  const routeCanvasRef = useRef<HTMLCanvasElement>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [routeData, setRouteData] = useState<RoutePoint[]>([]);

  // Mock data generation
  useEffect(() => {
    const generateMockData = () => {
      const data: ChartData[] = [];
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      
      days.forEach(day => {
        data.push({
          date: day,
          running: Math.floor(Math.random() * 60) + 10,
          walking: Math.floor(Math.random() * 90) + 20,
          cycling: Math.floor(Math.random() * 45) + 5,
        });
      });
      
      setChartData(data);
    };

    const generateMockRoute = () => {
      const route: RoutePoint[] = [];
      let lat = 40.7128;
      let lng = -74.0060;
      
      for (let i = 0; i < 50; i++) {
        route.push({
          lat: lat + (Math.random() - 0.5) * 0.01,
          lng: lng + (Math.random() - 0.5) * 0.01,
        });
        lat += (Math.random() - 0.5) * 0.001;
        lng += (Math.random() - 0.5) * 0.001;
      }
      
      setRouteData(route);
    };

    generateMockData();
    generateMockRoute();
  }, []);

  // Canvas API - Activity Chart
  useEffect(() => {
    const canvas = chartCanvasRef.current;
    if (!canvas || chartData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    ctx.scale(dpr, dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    const padding = 40;
    const chartWidth = rect.width - padding * 2;
    const chartHeight = rect.height - padding * 2;

    // Find max value for scaling
    const maxValue = Math.max(
      ...chartData.flatMap(d => [d.running, d.walking, d.cycling])
    );

    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(rect.width - padding, y);
      ctx.stroke();
    }

    // Draw bars
    const barWidth = chartWidth / chartData.length / 3 - 5;
    const colors = {
      running: '#dc2626', // red
      walking: '#16a34a', // green
      cycling: '#2563eb', // blue
    };

    chartData.forEach((data, index) => {
      const x = padding + (chartWidth / chartData.length) * index;
      
      Object.entries(colors).forEach((color, colorIndex) => {
        const [activity, activityColor] = color;
        const value = data[activity as keyof typeof data] as number;
        const barHeight = (value / maxValue) * chartHeight;
        const barX = x + barWidth * colorIndex + colorIndex * 2;
        const barY = rect.height - padding - barHeight;

        ctx.fillStyle = activityColor;
        ctx.fillRect(barX, barY, barWidth, barHeight);
      });

      // Draw labels
      ctx.fillStyle = '#374151';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        data.date,
        x + (barWidth * 1.5),
        rect.height - padding + 20
      );
    });

    // Draw legend
    Object.entries(colors).forEach(([activity, color], index) => {
      ctx.fillStyle = color;
      ctx.fillRect(padding + index * 80, 15, 15, 15);
      
      ctx.fillStyle = '#374151';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(
        activity.charAt(0).toUpperCase() + activity.slice(1),
        padding + index * 80 + 20,
        27
      );
    });

  }, [chartData]);

  // Canvas API - Route Visualization
  useEffect(() => {
    const canvas = routeCanvasRef.current;
    if (!canvas || routeData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    ctx.scale(dpr, dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Find bounds
    const minLat = Math.min(...routeData.map(p => p.lat));
    const maxLat = Math.max(...routeData.map(p => p.lat));
    const minLng = Math.min(...routeData.map(p => p.lng));
    const maxLng = Math.max(...routeData.map(p => p.lng));

    const padding = 20;
    const width = rect.width - padding * 2;
    const height = rect.height - padding * 2;

    // Draw background
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw route
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    routeData.forEach((point, index) => {
      const x = padding + ((point.lng - minLng) / (maxLng - minLng)) * width;
      const y = padding + ((maxLat - point.lat) / (maxLat - minLat)) * height;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw start point
    if (routeData.length > 0) {
      const startPoint = routeData[0];
      const startX = padding + ((startPoint.lng - minLng) / (maxLng - minLng)) * width;
      const startY = padding + ((maxLat - startPoint.lat) / (maxLat - minLat)) * height;

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(startX, startY, 6, 0, 2 * Math.PI);
      ctx.fill();

      // Draw end point
      const endPoint = routeData[routeData.length - 1];
      const endX = padding + ((endPoint.lng - minLng) / (maxLng - minLng)) * width;
      const endY = padding + ((maxLat - endPoint.lat) / (maxLat - minLat)) * height;

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(endX, endY, 6, 0, 2 * Math.PI);
      ctx.fill();
    }

  }, [routeData]);

  const totalActivities = chartData.reduce((sum, day) => 
    sum + day.running + day.walking + day.cycling, 0
  );

  return (
    <div className="space-y-6">
      {/* Activity Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Activities</p>
                <p className="text-2xl font-bold text-primary">{totalActivities}</p>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold text-secondary">
                  {Math.floor(totalActivities * 0.7)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Distance</p>
                <p className="text-2xl font-bold text-accent">
                  {(totalActivities * 2.5).toFixed(1)}km
                </p>
              </div>
              <MapPin className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Weekly Activity</span>
            <Badge variant="outline">Minutes</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <canvas
              ref={chartCanvasRef}
              className="w-full h-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Route Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Recent Route
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <canvas
              ref={routeCanvasRef}
              className="w-full h-full rounded-lg"
            />
          </div>
          <div className="flex items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-success rounded-full"></div>
              <span>Start</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-destructive rounded-full"></div>
              <span>End</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};