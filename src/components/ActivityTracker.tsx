import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, MapPin, Timer, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Position {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface ActivityData {
  id: string;
  type: 'running' | 'walking' | 'cycling';
  startTime: number;
  endTime?: number;
  duration: number;
  distance: number;
  positions: Position[];
  isActive: boolean;
}

export const ActivityTracker: React.FC = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<ActivityData | null>(null);
  const [location, setLocation] = useState<Position | null>(null);
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const watchIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const backgroundTaskRef = useRef<number | null>(null);
  const { toast } = useToast();

  // Network Information API
  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setNetworkInfo({
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
      });

      const updateNetworkInfo = () => {
        setNetworkInfo({
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
        });
      };

      connection.addEventListener('change', updateNetworkInfo);
      return () => connection.removeEventListener('change', updateNetworkInfo);
    }
  }, []);

  // Background Tasks API for processing location data
  const processLocationData = (positions: Position[]) => {
    if ('requestIdleCallback' in window) {
      backgroundTaskRef.current = requestIdleCallback((deadline) => {
        while (deadline.timeRemaining() > 0 && positions.length > 0) {
          // Process location data in chunks during idle time
          const batch = positions.splice(0, 10);
          // Calculate distance, speed, etc.
          console.log('Processing location batch:', batch.length);
        }
      });
    }
  };

  // Geolocation API
  const startTracking = (activityType: 'running' | 'walking' | 'cycling') => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support location tracking.",
        variant: "destructive",
      });
      return;
    }

    const activity: ActivityData = {
      id: Date.now().toString(),
      type: activityType,
      startTime: Date.now(),
      duration: 0,
      distance: 0,
      positions: [],
      isActive: true,
    };

    setCurrentActivity(activity);
    setIsTracking(true);
    setIsPaused(false);
    startTimeRef.current = Date.now();

    const options = {
      enableHighAccuracy: true,
      timeout: networkInfo?.effectiveType === 'slow-2g' ? 10000 : 5000,
      maximumAge: networkInfo?.effectiveType === 'slow-2g' ? 30000 : 10000,
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newPosition: Position = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: Date.now(),
        };

        setLocation(newPosition);
        
        setCurrentActivity(prev => {
          if (!prev) return null;
          const updatedPositions = [...prev.positions, newPosition];
          
          // Calculate distance using Haversine formula
          let totalDistance = 0;
          for (let i = 1; i < updatedPositions.length; i++) {
            const dist = calculateDistance(
              updatedPositions[i-1].latitude,
              updatedPositions[i-1].longitude,
              updatedPositions[i].latitude,
              updatedPositions[i].longitude
            );
            totalDistance += dist;
          }

          const updated = {
            ...prev,
            positions: updatedPositions,
            distance: totalDistance,
            duration: Date.now() - prev.startTime,
          };

          // Process data in background
          processLocationData([...updatedPositions]);
          
          return updated;
        });
      },
      (error) => {
        toast({
          title: "Location Error",
          description: `Could not get your location: ${error.message}`,
          variant: "destructive",
        });
      },
      options
    );

    toast({
      title: "Activity Started",
      description: `Started tracking ${activityType}`,
    });
  };

  const pauseTracking = () => {
    setIsPaused(true);
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const resumeTracking = () => {
    setIsPaused(false);
    // Restart geolocation tracking
    if (currentActivity) {
      startTracking(currentActivity.type);
    }
  };

  const stopTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (backgroundTaskRef.current) {
      cancelIdleCallback(backgroundTaskRef.current);
      backgroundTaskRef.current = null;
    }

    setCurrentActivity(prev => prev ? { ...prev, endTime: Date.now(), isActive: false } : null);
    setIsTracking(false);
    setIsPaused(false);

    toast({
      title: "Activity Completed",
      description: "Your activity has been saved!",
    });
  };

  // Haversine formula for distance calculation
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const hours = Math.floor(mins / 60);
    return `${hours.toString().padStart(2, '0')}:${(mins % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(2)}km`;
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'running': return 'activity-running';
      case 'cycling': return 'activity-cycling';
      case 'walking': return 'activity-walking';
      default: return 'primary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Network Status */}
      {networkInfo && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-info" />
                <span className="text-sm font-medium">Network: {networkInfo.effectiveType}</span>
              </div>
              <Badge variant="outline">
                {networkInfo.downlink}Mbps
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-primary" />
            Activity Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isTracking ? (
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="activity"
                onClick={() => startTracking('running')}
                className="flex-col h-20"
              >
                <div className="text-lg">🏃‍♂️</div>
                <span>Running</span>
              </Button>
              <Button
                variant="activity"
                onClick={() => startTracking('walking')}
                className="flex-col h-20"
              >
                <div className="text-lg">🚶‍♂️</div>
                <span>Walking</span>
              </Button>
              <Button
                variant="activity"
                onClick={() => startTracking('cycling')}
                className="flex-col h-20"
              >
                <div className="text-lg">🚴‍♂️</div>
                <span>Cycling</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Current Activity Stats */}
              {currentActivity && (
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {formatDuration(currentActivity.duration)}
                    </div>
                    <div className="text-sm text-muted-foreground">Duration</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-secondary">
                      {formatDistance(currentActivity.distance)}
                    </div>
                    <div className="text-sm text-muted-foreground">Distance</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-accent">
                      {currentActivity.positions.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Points</div>
                  </div>
                </div>
              )}

              {/* Control Buttons */}
              <div className="flex gap-3">
                {!isPaused ? (
                  <Button onClick={pauseTracking} variant="warning" className="flex-1">
                    <Pause className="h-4 w-4" />
                    Pause
                  </Button>
                ) : (
                  <Button onClick={resumeTracking} variant="success" className="flex-1">
                    <Play className="h-4 w-4" />
                    Resume
                  </Button>
                )}
                <Button onClick={stopTracking} variant="destructive" className="flex-1">
                  <Square className="h-4 w-4" />
                  Stop
                </Button>
              </div>
            </div>
          )}

          {/* Current Location */}
          {location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};