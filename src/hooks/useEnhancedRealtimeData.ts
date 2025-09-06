import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Enhanced interfaces for new real-time data
interface ShuttleTracking {
  id: number;
  route_name: string;
  vehicle_id: string;
  lat: number;
  lng: number;
  next_stop: string;
  eta_minutes: number;
  capacity_status: 'low' | 'medium' | 'high';
  is_active: boolean;
  last_updated: string;
}

interface LiveAlert {
  id: number;
  alert_type: 'emergency' | 'weather' | 'maintenance' | 'traffic' | 'event';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  affected_areas: string[];
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

interface FacilityOccupancy {
  id: number;
  building_name: string;
  facility_name: string;
  facility_type: 'library' | 'gym' | 'lab' | 'computer_lab' | 'study_room' | 'parking_garage';
  current_occupancy: number;
  max_capacity: number;
  occupancy_percentage: number;
  status: 'open' | 'closed' | 'maintenance';
  last_updated: string;
}

interface ParkingAvailability {
  id: number;
  lot_name: string;
  lot_code: string;
  total_spaces: number;
  available_spaces: number;
  permit_type: string;
  lat: number;
  lng: number;
  is_open: boolean;
  hourly_rate: number;
  last_updated: string;
}

interface ServiceWaitTime {
  id: number;
  location_name: string;
  service_type: 'dining' | 'registrar' | 'financial_aid' | 'library_checkout' | 'bus_stop';
  estimated_wait_minutes: number;
  queue_length: number;
  status: 'open' | 'closed' | 'busy' | 'slow';
  last_updated: string;
}

export const useEnhancedRealtimeData = () => {
  const [shuttleData, setShuttleData] = useState<ShuttleTracking[]>([]);
  const [liveAlerts, setLiveAlerts] = useState<LiveAlert[]>([]);
  const [facilityOccupancy, setFacilityOccupancy] = useState<FacilityOccupancy[]>([]);
  const [parkingData, setParkingData] = useState<ParkingAvailability[]>([]);
  const [waitTimes, setWaitTimes] = useState<ServiceWaitTime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    let shuttleChannel: any;
    let alertsChannel: any;
    let facilityChannel: any;
    let parkingChannel: any;
    let waitTimesChannel: any;

    const setupEnhancedRealtimeSubscriptions = async () => {
      try {
        console.log('Setting up enhanced real-time subscriptions...');
        
        // Initial data fetch
        const [shuttleRes, alertsRes, facilityRes, parkingRes, waitTimesRes] = await Promise.all([
          supabase
            .from('shuttle_tracking')
            .select('*')
            .eq('is_active', true)
            .order('last_updated', { ascending: false }),
          supabase
            .from('live_alerts')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false }),
          supabase
            .from('facility_occupancy')
            .select('*')
            .eq('status', 'open')
            .order('last_updated', { ascending: false }),
          supabase
            .from('parking_availability')
            .select('*')
            .eq('is_open', true)
            .order('available_spaces', { ascending: false }),
          supabase
            .from('service_wait_times')
            .select('*')
            .neq('status', 'closed')
            .order('estimated_wait_minutes')
        ]);

        if (shuttleRes.data) setShuttleData(shuttleRes.data as ShuttleTracking[]);
        if (alertsRes.data) setLiveAlerts(alertsRes.data as LiveAlert[]);
        if (facilityRes.data) setFacilityOccupancy(facilityRes.data as FacilityOccupancy[]);
        if (parkingRes.data) setParkingData(parkingRes.data as ParkingAvailability[]);
        if (waitTimesRes.data) setWaitTimes(waitTimesRes.data as ServiceWaitTime[]);

        // Set up real-time subscriptions
        shuttleChannel = supabase
          .channel('shuttle-tracking-updates')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'shuttle_tracking'
            },
            (payload) => {
              console.log('Shuttle tracking update:', payload);
              setLastUpdate(new Date());
              
              if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                const newData = payload.new as ShuttleTracking;
                if (newData.is_active) {
                  setShuttleData(prev => {
                    const filtered = prev.filter(s => s.vehicle_id !== newData.vehicle_id);
                    return [...filtered, newData].sort((a, b) => 
                      new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime()
                    );
                  });
                }
              }
            }
          )
          .subscribe();

        alertsChannel = supabase
          .channel('live-alerts-updates')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'live_alerts'
            },
            (payload) => {
              console.log('Live alerts update:', payload);
              setLastUpdate(new Date());
              
              if (payload.eventType === 'INSERT') {
                const newAlert = payload.new as LiveAlert;
                if (newAlert.is_active) {
                  setLiveAlerts(prev => [newAlert, ...prev]);
                }
              } else if (payload.eventType === 'UPDATE') {
                setLiveAlerts(prev => 
                  prev.map(alert => 
                    alert.id === payload.new.id 
                      ? { ...alert, ...payload.new }
                      : alert
                  ).filter(alert => alert.is_active)
                );
              }
            }
          )
          .subscribe();

        facilityChannel = supabase
          .channel('facility-occupancy-updates')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'facility_occupancy'
            },
            (payload) => {
              console.log('Facility occupancy update:', payload);
              setLastUpdate(new Date());
              
              if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                const newData = payload.new as FacilityOccupancy;
                setFacilityOccupancy(prev => {
                  const filtered = prev.filter(f => f.id !== newData.id);
                  return [...filtered, newData].sort((a, b) => 
                    new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime()
                  );
                });
              }
            }
          )
          .subscribe();

        parkingChannel = supabase
          .channel('parking-availability-updates')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'parking_availability'
            },
            (payload) => {
              console.log('Parking availability update:', payload);
              setLastUpdate(new Date());
              
              if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                const newData = payload.new as ParkingAvailability;
                if (newData.is_open) {
                  setParkingData(prev => {
                    const filtered = prev.filter(p => p.id !== newData.id);
                    return [...filtered, newData].sort((a, b) => b.available_spaces - a.available_spaces);
                  });
                }
              }
            }
          )
          .subscribe();

        waitTimesChannel = supabase
          .channel('service-wait-times-updates')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'service_wait_times'
            },
            (payload) => {
              console.log('Service wait times update:', payload);
              setLastUpdate(new Date());
              
              if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                const newData = payload.new as ServiceWaitTime;
                setWaitTimes(prev => {
                  const filtered = prev.filter(w => w.id !== newData.id);
                  return [...filtered, newData].sort((a, b) => a.estimated_wait_minutes - b.estimated_wait_minutes);
                });
              }
            }
          )
          .subscribe();

        setIsLoading(false);
        console.log('Enhanced real-time subscriptions setup complete');
      } catch (error) {
        console.error('Error setting up enhanced real-time subscriptions:', error);
        setIsLoading(false);
      }
    };

    setupEnhancedRealtimeSubscriptions();

    return () => {
      if (shuttleChannel) supabase.removeChannel(shuttleChannel);
      if (alertsChannel) supabase.removeChannel(alertsChannel);
      if (facilityChannel) supabase.removeChannel(facilityChannel);
      if (parkingChannel) supabase.removeChannel(parkingChannel);
      if (waitTimesChannel) supabase.removeChannel(waitTimesChannel);
    };
  }, []);

  // Helper functions for AI context
  const getActiveShuttles = () => {
    return shuttleData.filter(shuttle => shuttle.is_active);
  };

  const getCriticalAlerts = () => {
    return liveAlerts.filter(alert => 
      alert.severity === 'critical' || alert.severity === 'high'
    );
  };

  const getBusyFacilities = () => {
    return facilityOccupancy.filter(facility => facility.occupancy_percentage > 70);
  };

  const getAvailableParking = () => {
    return parkingData.filter(lot => lot.available_spaces > 10);
  };

  const getShortWaitTimes = () => {
    return waitTimes.filter(service => service.estimated_wait_minutes <= 10);
  };

  const getShuttleByRoute = (routeName: string) => {
    return shuttleData.find(shuttle => 
      shuttle.route_name.toLowerCase().includes(routeName.toLowerCase())
    );
  };

  const getFacilityOccupancy = (facilityName: string) => {
    return facilityOccupancy.find(facility => 
      facility.facility_name.toLowerCase().includes(facilityName.toLowerCase()) ||
      facility.building_name?.toLowerCase().includes(facilityName.toLowerCase())
    );
  };

  const getParkingLot = (lotName: string) => {
    return parkingData.find(lot => 
      lot.lot_name.toLowerCase().includes(lotName.toLowerCase()) ||
      lot.lot_code?.toLowerCase().includes(lotName.toLowerCase())
    );
  };

  const getWaitTime = (locationName: string) => {
    return waitTimes.find(service => 
      service.location_name.toLowerCase().includes(locationName.toLowerCase())
    );
  };

  return {
    // Data
    shuttleData,
    liveAlerts,
    facilityOccupancy,
    parkingData,
    waitTimes,
    isLoading,
    lastUpdate,
    
    // Helper functions
    getActiveShuttles,
    getCriticalAlerts,
    getBusyFacilities,
    getAvailableParking,
    getShortWaitTimes,
    getShuttleByRoute,
    getFacilityOccupancy,
    getParkingLot,
    getWaitTime,
    
    // Summary stats
    summary: {
      activeShuttles: shuttleData.filter(s => s.is_active).length,
      activeAlerts: liveAlerts.filter(a => a.is_active).length,
      availableParkingSpots: parkingData.reduce((sum, lot) => sum + lot.available_spaces, 0),
      averageWaitTime: waitTimes.length > 0 
        ? Math.round(waitTimes.reduce((sum, w) => sum + w.estimated_wait_minutes, 0) / waitTimes.length)
        : 0
    }
  };
};