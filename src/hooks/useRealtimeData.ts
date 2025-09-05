import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DiningLocation {
  id: number;
  name: string;
  campus_area: string;
  is_open: boolean;
  hours: any;
  updated_at: string;
}

interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  start_time: string;
  end_time: string;
  source_url: string;
  tags: string[];
}

export const useRealtimeData = () => {
  const [diningLocations, setDiningLocations] = useState<DiningLocation[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let diningChannel: any;
    let eventsChannel: any;

    const setupRealtimeSubscriptions = async () => {
      try {
        // Initial data fetch
        const [diningRes, eventsRes] = await Promise.all([
          supabase
            .from('dining_locations')
            .select('*')
            .order('name'),
          supabase
            .from('events')
            .select('*')
            .gte('start_time', new Date().toISOString())
            .order('start_time')
            .limit(10)
        ]);

        if (diningRes.data) setDiningLocations(diningRes.data);
        if (eventsRes.data) setUpcomingEvents(eventsRes.data);

        // Set up realtime subscriptions
        diningChannel = supabase
          .channel('dining-updates')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'dining_locations'
            },
            (payload) => {
              console.log('Dining update:', payload);
              
              if (payload.eventType === 'UPDATE') {
                setDiningLocations(prev => 
                  prev.map(location => 
                    location.id === payload.new.id 
                      ? { ...location, ...payload.new }
                      : location
                  )
                );
              } else if (payload.eventType === 'INSERT') {
                setDiningLocations(prev => [...prev, payload.new as DiningLocation]);
              }
            }
          )
          .subscribe();

        eventsChannel = supabase
          .channel('events-updates')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'events'
            },
            (payload) => {
              console.log('Events update:', payload);
              
              if (payload.eventType === 'INSERT') {
                const newEvent = payload.new as Event;
                // Only add if it's a future event
                if (new Date(newEvent.start_time) > new Date()) {
                  setUpcomingEvents(prev => {
                    const updated = [...prev, newEvent]
                      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                      .slice(0, 10);
                    return updated;
                  });
                }
              } else if (payload.eventType === 'UPDATE') {
                setUpcomingEvents(prev => 
                  prev.map(event => 
                    event.id === payload.new.id 
                      ? { ...event, ...payload.new }
                      : event
                  )
                );
              }
            }
          )
          .subscribe();

        setIsLoading(false);
      } catch (error) {
        console.error('Error setting up realtime subscriptions:', error);
        setIsLoading(false);
      }
    };

    setupRealtimeSubscriptions();

    return () => {
      if (diningChannel) supabase.removeChannel(diningChannel);
      if (eventsChannel) supabase.removeChannel(eventsChannel);
    };
  }, []);

  // Helper functions for AI context
  const getOpenDiningLocations = () => {
    return diningLocations.filter(location => location.is_open);
  };

  const getNextEvents = (limit = 5) => {
    const now = new Date();
    return upcomingEvents
      .filter(event => new Date(event.start_time) > now)
      .slice(0, limit);
  };

  const getTodaysEvents = () => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    return upcomingEvents.filter(event => {
      const eventTime = new Date(event.start_time);
      return eventTime >= startOfDay && eventTime <= endOfDay;
    });
  };

  return {
    diningLocations,
    upcomingEvents,
    isLoading,
    getOpenDiningLocations,
    getNextEvents,
    getTodaysEvents
  };
};