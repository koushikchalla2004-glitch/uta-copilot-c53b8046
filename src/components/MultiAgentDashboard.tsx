import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { multiAgentCoordinator } from '@/utils/multi-agent-coordinator';
import { BarChart3, Clock, CheckCircle, Zap, Activity } from 'lucide-react';

export const MultiAgentDashboard: React.FC = () => {
  const [stats, setStats] = useState<Record<string, any>>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateStats = () => {
      const performanceStats = multiAgentCoordinator.getPerformanceStats();
      setStats(performanceStats);
      // Auto-show dashboard when there's activity
      if (Object.keys(performanceStats).length > 0) {
        setIsVisible(true);
      }
    };

    updateStats();
    const interval = setInterval(updateStats, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  if (!isVisible && Object.keys(stats).length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-50">
      {!isVisible ? (
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          variant="outline"
          className="bg-background/80 backdrop-blur-sm"
        >
          <Activity className="w-4 h-4 mr-2" />
          Agent Stats
        </Button>
      ) : (
        <Card className="w-80 bg-background/95 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Multi-Agent Performance
              </CardTitle>
              <Button
                onClick={() => setIsVisible(false)}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {Object.entries(stats).map(([agentName, agentStats]) => (
              <div key={agentName} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">
                    {agentName.replace('_', ' ')} Agent
                  </span>
                  <Badge 
                    variant="outline" 
                    className="text-xs"
                  >
                    {agentStats.callCount} calls
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span>{Math.round(agentStats.avgTime)}ms avg</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>{Math.round(agentStats.successRate * 100)}% success</span>
                  </div>
                </div>
                
                {/* Performance bar */}
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div 
                    className="bg-primary rounded-full h-1.5 transition-all"
                    style={{ 
                      width: `${Math.min((agentStats.successRate * 100), 100)}%` 
                    }}
                  />
                </div>
              </div>
            ))}
            
            {Object.keys(stats).length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-4">
                <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                No agent activity yet.
                <br />
                Ask a question to see the multi-agent system in action!
              </div>
            )}
            
            <div className="pt-2 border-t border-border/50 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Real-time performance metrics</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Live</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};