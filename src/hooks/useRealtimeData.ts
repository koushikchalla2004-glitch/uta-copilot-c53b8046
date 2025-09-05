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

interface NewsAlert {
  id: number;
  title: string;
  summary: string;
  category: string;
  published_at: string;
  source_url: string;
}

interface Building {
  id: number;
  name: string;
  code: string;
  category: string;
  hours: any;
}

export const useRealtimeData = () => {
  const [diningLocations, setDiningLocations] = useState<DiningLocation[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [newsAlerts, setNewsAlerts] = useState<NewsAlert[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let diningChannel: any;
    let eventsChannel: any;
    let newsChannel: any;

    const setupRealtimeSubscriptions = async () => {
      try {
        // Initial data fetch
        const [diningRes, eventsRes, newsRes, buildingsRes] = await Promise.all([
          supabase
            .from('dining_locations')
            .select('*')
            .order('name'),
          supabase
            .from('events')
            .select('*')
            .gte('start_time', new Date().toISOString())
            .order('start_time')
            .limit(10),
          supabase
            .from('news')
            .select('*')
            .order('published_at', { ascending: false })
            .limit(5),
          supabase
            .from('buildings')
            .select('*')
            .order('name')
        ]);

        if (diningRes.data) setDiningLocations(diningRes.data);
        if (eventsRes.data) setUpcomingEvents(eventsRes.data);
        if (newsRes.data) setNewsAlerts(newsRes.data);
        if (buildingsRes.data) setBuildings(buildingsRes.data);

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

        newsChannel = supabase
          .channel('news-updates')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'news'
            },
            (payload) => {
              console.log('News update:', payload);
              
              if (payload.eventType === 'INSERT') {
                setNewsAlerts(prev => {
                  const updated = [payload.new as NewsAlert, ...prev]
                    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
                    .slice(0, 5);
                  return updated;
                });
              } else if (payload.eventType === 'UPDATE') {
                setNewsAlerts(prev => 
                  prev.map(alert => 
                    alert.id === payload.new.id 
                      ? { ...alert, ...payload.new }
                      : alert
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
      if (newsChannel) supabase.removeChannel(newsChannel);
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

  const getRecentAlerts = (limit = 3) => {
    return newsAlerts.slice(0, limit);
  };

  const getBuildingHours = (buildingName: string) => {
    const building = buildings.find(b => 
      b.name.toLowerCase().includes(buildingName.toLowerCase()) ||
      (b.code && b.code.toLowerCase().includes(buildingName.toLowerCase()))
    );
    return building?.hours || null;
  };

  return {
    diningLocations,
    upcomingEvents,
    newsAlerts,
    buildings,
    isLoading,
    getOpenDiningLocations,
    getNextEvents,
    getTodaysEvents,
    getRecentAlerts,
    getBuildingHours
  };
};