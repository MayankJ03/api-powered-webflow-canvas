import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, MapPin, Timer, Trophy, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  userId: string;
  userName: string;
  userInitials: string;
  type: 'running' | 'walking' | 'cycling' | 'swimming';
  title: string;
  duration: number;
  distance: number;
  date: string;
  location: string;
  calories: number;
  achievements?: string[];
}

export const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  // Mock data generator
  const generateMockActivities = (pageNum: number, count: number = 10): ActivityItem[] => {
    const types: Array<'running' | 'walking' | 'cycling' | 'swimming'> = ['running', 'walking', 'cycling', 'swimming'];
    const users = [
      { name: 'Alex Johnson', initials: 'AJ' },
      { name: 'Sarah Smith', initials: 'SS' },
      { name: 'Mike Chen', initials: 'MC' },
      { name: 'Emma Davis', initials: 'ED' },
      { name: 'Ryan Wilson', initials: 'RW' },
    ];
    const locations = ['Central Park', 'Brooklyn Bridge', 'Times Square', 'High Line', 'Prospect Park'];
    
    return Array.from({ length: count }, (_, index) => {
      const type = types[Math.floor(Math.random() * types.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const distance = Math.random() * 10 + 1; // 1-11 km
      const duration = Math.random() * 3600 + 1800; // 30-90 minutes in seconds
      const date = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();
      
      const achievements = Math.random() > 0.7 ? [
        Math.random() > 0.5 ? 'Personal Best' : 'New Route',
        Math.random() > 0.5 ? '5K Club' : 'Early Bird'
      ].slice(0, Math.floor(Math.random() * 2) + 1) : undefined;

      return {
        id: `${pageNum}-${index}`,
        userId: `user-${Math.floor(Math.random() * 100)}`,
        userName: user.name,
        userInitials: user.initials,
        type,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} at ${location}`,
        duration: Math.floor(duration),
        distance: Math.round(distance * 100) / 100,
        date,
        location,
        calories: Math.floor(distance * 60 + duration / 60 * 8),
        achievements,
      };
    });
  };

  // Load initial activities
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setActivities(generateMockActivities(1, 15));
      setLoading(false);
    }, 1000);
  }, []);

  // Load more activities
  const loadMoreActivities = useCallback(() => {
    if (loading || !hasMore) return;

    setLoading(true);
    setTimeout(() => {
      const newActivities = generateMockActivities(page + 1, 10);
      setActivities(prev => [...prev, ...newActivities]);
      setPage(prev => prev + 1);
      setLoading(false);
      
      // Stop loading after 5 pages for demo
      if (page >= 4) {
        setHasMore(false);
      }
    }, 1500);
  }, [loading, hasMore, page]);

  // Intersection Observer API for infinite scroll
  useEffect(() => {
    const currentRef = loadingRef.current;
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loading) {
          loadMoreActivities();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
      }
    );

    if (currentRef) {
      observerRef.current.observe(currentRef);
    }

    return () => {
      if (observerRef.current && currentRef) {
        observerRef.current.unobserve(currentRef);
      }
    };
  }, [loadMoreActivities, hasMore, loading]);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getActivityIcon = (type: string): string => {
    switch (type) {
      case 'running': return '🏃‍♂️';
      case 'walking': return '🚶‍♂️';
      case 'cycling': return '🚴‍♂️';
      case 'swimming': return '🏊‍♂️';
      default: return '🏃‍♂️';
    }
  };

  const getActivityColor = (type: string): string => {
    switch (type) {
      case 'running': return 'bg-activity-running';
      case 'cycling': return 'bg-activity-cycling';
      case 'walking': return 'bg-activity-walking';
      case 'swimming': return 'bg-activity-swimming';
      default: return 'bg-primary';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Activity Feed</h2>
        <Badge variant="outline">
          {activities.length} activities
        </Badge>
      </div>

      {/* Activity Feed */}
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <Card 
            key={activity.id}
            className={cn(
              "transition-all duration-200 hover:shadow-soft animate-fade-in",
              index % 2 === 0 ? "animate-fade-in" : ""
            )}
            style={{
              animationDelay: `${(index % 10) * 100}ms`
            }}
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                {/* User Avatar */}
                <Avatar className="border-2 border-primary/20">
                  <AvatarFallback className={cn(
                    "text-white font-semibold",
                    getActivityColor(activity.type)
                  )}>
                    {activity.userInitials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {activity.userName}
                        </span>
                        <span className="text-lg">{getActivityIcon(activity.type)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {activity.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(activity.date)}
                    </div>
                  </div>

                  {/* Activity Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-primary" />
                      <div>
                        <div className="text-sm font-medium">
                          {formatDuration(activity.duration)}
                        </div>
                        <div className="text-xs text-muted-foreground">Duration</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-secondary" />
                      <div>
                        <div className="text-sm font-medium">
                          {activity.distance}km
                        </div>
                        <div className="text-xs text-muted-foreground">Distance</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-accent" />
                      <div>
                        <div className="text-sm font-medium">
                          {activity.calories}
                        </div>
                        <div className="text-xs text-muted-foreground">Calories</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-info" />
                      <div>
                        <div className="text-sm font-medium truncate">
                          {activity.location}
                        </div>
                        <div className="text-xs text-muted-foreground">Location</div>
                      </div>
                    </div>
                  </div>

                  {/* Achievements */}
                  {activity.achievements && activity.achievements.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {activity.achievements.map((achievement, i) => (
                        <Badge 
                          key={i} 
                          variant="secondary"
                          className="text-xs bg-gradient-accent"
                        >
                          🏆 {achievement}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Loading indicator for infinite scroll */}
      <div 
        ref={loadingRef}
        className="flex justify-center py-8"
      >
        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading more activities...</span>
          </div>
        )}
        {!hasMore && !loading && (
          <p className="text-muted-foreground text-center">
            🎉 You've reached the end! Start tracking to see more activities.
          </p>
        )}
      </div>
    </div>
  );
};