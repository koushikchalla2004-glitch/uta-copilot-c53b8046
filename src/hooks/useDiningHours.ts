import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DiningLocation {
  id: number;
  name: string;
  campus_area: string;
  isCurrentlyOpen: boolean;
  nextStatusChange: string | null;
  parsedHours: Array<{
    day: string;
    open: string;
    close: string;
  }>;
  todaysMenu?: any;
  lastUpdated: string;
}

interface DiningHoursData {
  success: boolean;
  timestamp: string;
  centralTime: string;
  locations: DiningLocation[];
  summary: {
    total: number;
    open: number;
    closed: number;
  };
}

export const useDiningHours = (autoRefresh = true, refreshInterval = 300000) => { // 5 minutes default
  const [data, setData] = useState<DiningHoursData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetchDiningHours = useCallback(async (location?: string, includeMenus = false) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching dining hours...', { location, includeMenus });
      
      const { data: response, error } = await supabase.functions.invoke('dining-hours', {
        body: { location, includeMenus }
      });

      if (error) {
        throw new Error(error.message || 'Failed to fetch dining hours');
      }

      if (response?.success) {
        setData(response);
        setLastFetch(new Date());
        console.log('Dining hours updated:', response.summary);
      } else {
        throw new Error(response?.error || 'Invalid response from dining service');
      }
    } catch (err) {
      console.error('Error fetching dining hours:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dining hours');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    // Initial fetch
    fetchDiningHours();

    // Set up interval for periodic updates
    const interval = setInterval(() => {
      fetchDiningHours();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchDiningHours]);

  // Real-time updates using Supabase channels
  useEffect(() => {
    const channel = supabase
      .channel('dining-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'dining_locations'
        },
        (payload) => {
          console.log('Dining location updated:', payload);
          // Refresh data when dining locations are updated
          fetchDiningHours();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDiningHours]);

  // Helper functions
  const getLocationByName = useCallback((name: string) => {
    if (!data?.locations) return null;
    return data.locations.find(loc => 
      loc.name.toLowerCase().includes(name.toLowerCase())
    );
  }, [data]);

  const getOpenLocations = useCallback(() => {
    if (!data?.locations) return [];
    return data.locations.filter(loc => loc.isCurrentlyOpen);
  }, [data]);

  const getClosedLocations = useCallback(() => {
    if (!data?.locations) return [];
    return data.locations.filter(loc => !loc.isCurrentlyOpen);
  }, [data]);

  const isLocationOpen = useCallback((name: string) => {
    const location = getLocationByName(name);
    return location?.isCurrentlyOpen || false;
  }, [getLocationByName]);

  const getNextStatusChange = useCallback((name: string) => {
    const location = getLocationByName(name);
    return location?.nextStatusChange || null;
  }, [getLocationByName]);

  // Calculate time since last update
  const timeSinceUpdate = lastFetch ? Date.now() - lastFetch.getTime() : null;
  const needsRefresh = timeSinceUpdate ? timeSinceUpdate > refreshInterval : true;

  return {
    // Data
    data,
    loading,
    error,
    lastFetch,
    needsRefresh,
    
    // Actions
    refresh: fetchDiningHours,
    
    // Helper functions
    getLocationByName,
    getOpenLocations,
    getClosedLocations,
    isLocationOpen,
    getNextStatusChange,
    
    // Quick access to summary
    summary: data?.summary || { total: 0, open: 0, closed: 0 },
    locations: data?.locations || [],
    timestamp: data?.timestamp
  };
};