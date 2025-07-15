import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActivityTracker } from '@/components/ActivityTracker';
import { ActivityChart } from '@/components/ActivityChart';
import { ActivityFeed } from '@/components/ActivityFeed';
import { 
  Activity, 
  BarChart3, 
  Users, 
  Zap, 
  Target, 
  Award,
  Smartphone,
  Wifi,
  Eye,
  Cpu
} from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState('tracker');

  // API Features showcase
  const features = [
    {
      icon: <Activity className="h-5 w-5" />,
      title: "Geolocation API",
      description: "Real-time GPS tracking for outdoor activities",
      status: "active"
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Canvas API", 
      description: "Custom charts and route visualizations",
      status: "active"
    },
    {
      icon: <Eye className="h-5 w-5" />,
      title: "Intersection Observer",
      description: "Infinite scroll and lazy loading",
      status: "active"
    },
    {
      icon: <Wifi className="h-5 w-5" />,
      title: "Network Information",
      description: "Adaptive performance based on connection",
      status: "active"
    },
    {
      icon: <Cpu className="h-5 w-5" />,
      title: "Background Tasks",
      description: "Efficient data processing during idle time",
      status: "active"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap className="h-8 w-8" />
              <h1 className="text-4xl md:text-6xl font-bold">FitTrack Pro</h1>
            </div>
            <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-3xl mx-auto">
              Smart fitness tracking powered by modern Web APIs. Track activities, visualize progress, and stay motivated with real-time insights.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                🏃‍♂️ Activity Tracking
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                📊 Data Visualization
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                🌐 Network Optimized
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Web APIs Showcase */}
        <Card className="mb-8 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              Advanced Web APIs Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="text-primary">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{feature.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {feature.description}
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className="bg-success/10 text-success border-success/20"
                  >
                    ✓
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-primary text-primary-foreground shadow-primary">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary-foreground/80">Active Users</p>
                  <p className="text-3xl font-bold">12.5K</p>
                  <p className="text-xs text-primary-foreground/70">+15% this week</p>
                </div>
                <Users className="h-8 w-8 text-primary-foreground/80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-secondary text-secondary-foreground shadow-secondary">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-foreground/80">Total Distance</p>
                  <p className="text-3xl font-bold">47.2K</p>
                  <p className="text-xs text-secondary-foreground/70">kilometers tracked</p>
                </div>
                <Target className="h-8 w-8 text-secondary-foreground/80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-accent text-accent-foreground shadow-soft">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-accent-foreground/80">Achievements</p>
                  <p className="text-3xl font-bold">1,847</p>
                  <p className="text-xs text-accent-foreground/70">badges earned</p>
                </div>
                <Award className="h-8 w-8 text-accent-foreground/80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main App Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tracker" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Tracker
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="feed" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Feed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tracker" className="space-y-6">
            <ActivityTracker />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <ActivityChart />
          </TabsContent>

          <TabsContent value="feed" className="space-y-6">
            <ActivityFeed />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-muted-foreground border-t pt-8">
          <p>
            Built with React, TypeScript, and modern Web APIs for TAP Invest Assignment
          </p>
          <p className="mt-2">
            Showcasing: Geolocation • Canvas • Intersection Observer • Network Information • Background Tasks
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
