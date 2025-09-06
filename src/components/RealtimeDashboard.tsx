import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEnhancedRealtimeData } from '@/hooks/useEnhancedRealtimeData';
import { Skeleton } from '@/components/ui/skeleton';

export const RealtimeDashboard: React.FC = () => {
  const {
    shuttleData,
    liveAlerts,
    facilityOccupancy,
    parkingData,
    waitTimes,
    isLoading,
    lastUpdate,
    summary
  } = useEnhancedRealtimeData();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Live Campus Data</h2>
          <p className="text-muted-foreground">
            Real-time information updated every few seconds
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Last updated</p>
          <p className="text-sm font-medium">{lastUpdate.toLocaleTimeString()}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Shuttles</p>
                <p className="text-2xl font-bold">{summary.activeShuttles}</p>
              </div>
              <div className="text-2xl">🚌</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold">{summary.activeAlerts}</p>
              </div>
              <div className="text-2xl">🚨</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Parking Spots</p>
                <p className="text-2xl font-bold">{summary.availableParkingSpots}</p>
              </div>
              <div className="text-2xl">🅿️</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Wait Time</p>
                <p className="text-2xl font-bold">{summary.averageWaitTime}m</p>
              </div>
              <div className="text-2xl">⏱️</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Live Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🚨 Live Alerts
              <Badge variant={liveAlerts.length > 0 ? "destructive" : "secondary"}>
                {liveAlerts.length}
              </Badge>
            </CardTitle>
            <CardDescription>Current campus alerts and notices</CardDescription>
          </CardHeader>
          <CardContent>
            {liveAlerts.length > 0 ? (
              <div className="space-y-3">
                {liveAlerts.slice(0, 3).map((alert) => {
                  const severityColor = {
                    'critical': 'destructive',
                    'high': 'destructive', 
                    'medium': 'secondary',
                    'low': 'outline'
                  }[alert.severity] as 'destructive' | 'secondary' | 'outline';

                  return (
                    <div key={alert.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{alert.title}</h4>
                        <Badge variant={severityColor} className="text-xs">
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {alert.message}
                      </p>
                      {alert.affected_areas?.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Areas: {alert.affected_areas.join(', ')}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-2xl mb-2">✅</div>
                <p className="text-sm">No active alerts</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shuttle Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🚌 Shuttle Tracking
              <Badge variant="secondary">{shuttleData.length}</Badge>
            </CardTitle>
            <CardDescription>Real-time shuttle locations and ETAs</CardDescription>
          </CardHeader>
          <CardContent>
            {shuttleData.length > 0 ? (
              <div className="space-y-3">
                {shuttleData.map((shuttle) => {
                  const capacityColor = {
                    'low': 'secondary',
                    'medium': 'outline',
                    'high': 'destructive'
                  }[shuttle.capacity_status] as 'secondary' | 'outline' | 'destructive';

                  return (
                    <div key={shuttle.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{shuttle.route_name}</h4>
                        <Badge variant={capacityColor} className="text-xs">
                          {shuttle.capacity_status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Next: {shuttle.next_stop}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ETA: {shuttle.eta_minutes} minutes
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-2xl mb-2">🚌</div>
                <p className="text-sm">No active shuttles</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Parking Availability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🅿️ Parking
              <Badge variant="secondary">{parkingData.length}</Badge>
            </CardTitle>
            <CardDescription>Live parking availability</CardDescription>
          </CardHeader>
          <CardContent>
            {parkingData.length > 0 ? (
              <div className="space-y-3">
                {parkingData.slice(0, 4).map((lot) => {
                  const availabilityPercentage = (lot.available_spaces / lot.total_spaces) * 100;
                  const statusColor = availabilityPercentage > 30 ? 'secondary' : 
                                    availabilityPercentage > 10 ? 'outline' : 'destructive';

                  return (
                    <div key={lot.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{lot.lot_name}</h4>
                        <Badge variant={statusColor} className="text-xs">
                          {availabilityPercentage.toFixed(0)}%
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {lot.available_spaces}/{lot.total_spaces} spaces
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {lot.permit_type} • ${lot.hourly_rate}/hr
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-2xl mb-2">🅿️</div>
                <p className="text-sm">No parking data</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Facility Occupancy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🏢 Facilities
              <Badge variant="secondary">{facilityOccupancy.length}</Badge>
            </CardTitle>
            <CardDescription>Current facility occupancy levels</CardDescription>
          </CardHeader>
          <CardContent>
            {facilityOccupancy.length > 0 ? (
              <div className="space-y-3">
                {facilityOccupancy.slice(0, 4).map((facility) => {
                  const occupancy = facility.occupancy_percentage;
                  const statusColor = occupancy > 80 ? 'destructive' : 
                                    occupancy > 60 ? 'outline' : 'secondary';

                  return (
                    <div key={facility.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{facility.facility_name}</h4>
                        <Badge variant={statusColor} className="text-xs">
                          {occupancy.toFixed(0)}%
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {facility.current_occupancy}/{facility.max_capacity} people
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {facility.building_name}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-2xl mb-2">🏢</div>
                <p className="text-sm">No facility data</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Wait Times */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⏱️ Wait Times
              <Badge variant="secondary">{waitTimes.length}</Badge>
            </CardTitle>
            <CardDescription>Current service wait times</CardDescription>
          </CardHeader>
          <CardContent>
            {waitTimes.length > 0 ? (
              <div className="space-y-3">
                {waitTimes.slice(0, 4).map((service) => {
                  const waitColor = service.estimated_wait_minutes <= 5 ? 'secondary' :
                                   service.estimated_wait_minutes <= 15 ? 'outline' : 'destructive';

                  return (
                    <div key={service.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{service.location_name}</h4>
                        <Badge variant={waitColor} className="text-xs">
                          {service.estimated_wait_minutes}m
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {service.queue_length} people in line
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {service.service_type.replace('_', ' ')} • {service.status}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-2xl mb-2">⏱️</div>
                <p className="text-sm">No wait time data</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};