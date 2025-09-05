import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Navigation, 
  MapPin, 
  Search, 
  Route,
  Clock,
  Car,
  Bike,
  PersonStanding,
  RefreshCw,
  Loader
} from 'lucide-react';

interface Building {
  id: number;
  name: string;
  code?: string;
  category?: string;
  lat?: number;
  lng?: number;
  hours?: any;
}

interface DirectionsResult {
  distance: number;
  duration: number;
  geometry: any;
  instructions: string[];
}

export const CampusMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [directions, setDirections] = useState<DirectionsResult | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [transportMode, setTransportMode] = useState<'walking' | 'driving' | 'cycling'>('walking');
  const [isLoading, setIsLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { toast } = useToast();

  // UTA Campus center coordinates
  const UTA_CENTER: [number, number] = [-97.1131, 32.7357];

  useEffect(() => {
    initializeData();
    getUserLocation();
  }, []);

  const initializeData = async () => {
    setIsLoading(true);
    await loadBuildings();
    await initializeMap();
    setIsLoading(false);
  };

  const addSampleData = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('add-sample-buildings');
      
      if (error) {
        throw error;
      }

      toast({
        title: "Sample Data Added",
        description: `Added ${data.buildingsAdded} UTA buildings to the map`,
      });

      // Reload buildings after adding sample data
      await loadBuildings();
      
      // Refresh map markers
      if (map.current && mapLoaded) {
        addBuildingMarkers();
      }
    } catch (error: any) {
      console.error('Error adding sample data:', error);
      toast({
        title: "Error",
        description: "Failed to add sample data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadBuildings = async () => {
    try {
      const { data, error } = await supabase
        .from('buildings')
        .select('*')
        .not('lat', 'is', null)
        .not('lng', 'is', null);

      if (error) {
        console.error('Error loading buildings:', error);
        return;
      }

      console.log('Loaded buildings:', data?.length || 0);
      setBuildings(data || []);
      
      if (!data || data.length === 0) {
        toast({
          title: "No Buildings Found",
          description: "Click 'Add Sample Data' to populate the map with UTA buildings",
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error loading buildings:', error);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [
            position.coords.longitude,
            position.coords.latitude
          ];
          setUserLocation(coords);
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  };

  const initializeMap = async () => {
    if (!mapContainer.current) return;

    try {
      // Get Mapbox token from Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      
      if (error) {
        console.error('Error getting Mapbox token:', error);
        return;
      }

      mapboxgl.accessToken = data.token;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12', // Better, clearer style
        center: UTA_CENTER,
        zoom: 16, // Closer zoom for better detail
        pitch: 0, // Flat view for clarity
        bearing: 0,
        maxZoom: 20,
        minZoom: 14
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      // Add geolocate control
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          showUserHeading: true
        }),
        'top-right'
      );

      map.current.on('load', () => {
        setMapLoaded(true);
        addBuildingMarkers();
        toast({
          title: "Map Loaded",
          description: "Campus map is ready to use",
        });
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      toast({
        title: "Map Error",
        description: "Failed to load map. Please refresh the page.",
        variant: "destructive"
      });
    }
  };

  const addBuildingMarkers = () => {
    if (!map.current || !mapLoaded) return;

    console.log('Adding markers for', buildings.length, 'buildings');

    buildings.forEach((building) => {
      if (!building.lat || !building.lng) return;

      // Create marker element with better styling
      const markerEl = document.createElement('div');
      markerEl.className = 'building-marker';
      markerEl.style.cssText = `
        width: 40px;
        height: 40px;
        background: #FF6B35;
        border: 3px solid white;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: bold;
        color: white;
        box-shadow: 0 4px 8px rgba(0,0,0,0.4);
        transition: all 0.3s ease;
      `;
      markerEl.textContent = building.code || building.name.substring(0, 2).toUpperCase();

      // Add hover effects
      markerEl.addEventListener('mouseenter', () => {
        markerEl.style.transform = 'scale(1.2)';
        markerEl.style.boxShadow = '0 6px 12px rgba(0,0,0,0.6)';
      });
      
      markerEl.addEventListener('mouseleave', () => {
        markerEl.style.transform = 'scale(1)';
        markerEl.style.boxShadow = '0 4px 8px rgba(0,0,0,0.4)';
      });

      // Create enhanced popup
      const popup = new mapboxgl.Popup({
        offset: 35,
        closeButton: true,
        maxWidth: '300px'
      }).setHTML(`
        <div style="font-family: system-ui; padding: 12px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #2563eb;">
            ${building.code ? `${building.code} - ` : ''}${building.name}
          </h3>
          <div style="margin-bottom: 8px;">
            <span style="display: inline-block; background: #f3f4f6; color: #374151; padding: 2px 8px; border-radius: 12px; font-size: 12px;">
              ${building.category || 'Building'}
            </span>
          </div>
          <p style="margin: 0; font-size: 13px; color: #6b7280;">
            Click marker for directions and details
          </p>
        </div>
      `);

      // Create marker
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([building.lng, building.lat])
        .setPopup(popup)
        .addTo(map.current!);

      // Add click handler
      markerEl.addEventListener('click', () => {
        setSelectedBuilding(building);
        map.current?.flyTo({
          center: [building.lng!, building.lat!],
          zoom: 18,
          essential: true
        });
      });
    });
  };

  const add3DBuildings = () => {
    if (!map.current) return;

    map.current.addSource('buildings-3d', {
      type: 'vector',
      url: 'mapbox://mapbox.3d-buildings'
    });

    map.current.addLayer({
      id: 'buildings-3d-layer',
      source: 'buildings-3d',
      'source-layer': 'building',
      type: 'fill-extrusion',
      minzoom: 14,
      paint: {
        'fill-extrusion-color': [
          'interpolate',
          ['linear'],
          ['get', 'height'],
          0, 'hsl(var(--muted))',
          50, 'hsl(var(--primary))',
          100, 'hsl(var(--primary))'
        ],
        'fill-extrusion-height': ['get', 'height'],
        'fill-extrusion-base': ['get', 'min_height'],
        'fill-extrusion-opacity': 0.8
      }
    });
  };

  const getDirections = async (destination: Building) => {
    if (!userLocation) {
      toast({
        title: "Location needed",
        description: "Please enable location access to get directions.",
        variant: "destructive"
      });
      return;
    }

    if (!destination.lat || !destination.lng) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/${transportMode}/${userLocation[0]},${userLocation[1]};${destination.lng},${destination.lat}?geometries=geojson&access_token=${mapboxgl.accessToken}`
      );

      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        setDirections({
          distance: route.distance,
          duration: route.duration,
          geometry: route.geometry,
          instructions: route.legs[0]?.steps?.map((step: any) => step.maneuver.instruction) || []
        });

        // Add route to map
        if (map.current?.getSource('route')) {
          map.current.removeLayer('route');
          map.current.removeSource('route');
        }

        map.current?.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: route.geometry
          }
        });

        map.current?.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': 'hsl(var(--primary))',
            'line-width': 5,
            'line-opacity': 0.75
          }
        });

        // Fit map to route
        const coordinates = route.geometry.coordinates;
        const bounds = coordinates.reduce((bounds: mapboxgl.LngLatBounds, coord: [number, number]) => {
          return bounds.extend(coord);
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

        map.current?.fitBounds(bounds, { padding: 50 });

        toast({
          title: "Directions found",
          description: `${Math.round(route.distance / 1000 * 100) / 100} km, ${Math.round(route.duration / 60)} minutes`
        });
      }
    } catch (error) {
      console.error('Error getting directions:', error);
      toast({
        title: "Directions error",
        description: "Failed to get directions. Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredBuildings = buildings.filter(building =>
    building.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    building.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDuration = (seconds: number) => {
    const minutes = Math.round(seconds / 60);
    return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  const formatDistance = (meters: number) => {
    return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`;
  };

  return (
    <div className="relative w-full h-screen">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader className="w-8 h-8 animate-spin mx-auto" />
            <p className="text-lg font-medium">Loading Campus Map...</p>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Enhanced Search Panel */}
      <Card className="absolute top-4 left-4 w-80 p-4 bg-background/95 backdrop-blur shadow-xl">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Campus Buildings</h3>
            {buildings.length === 0 && (
              <Button
                onClick={addSampleData}
                size="sm"
                disabled={isLoading}
                className="text-xs"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Add Sample Data
              </Button>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search buildings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {filteredBuildings.slice(0, 10).map((building) => (
              <div
                key={building.id}
                className="p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => {
                  setSelectedBuilding(building);
                  if (building.lat && building.lng) {
                    map.current?.flyTo({
                      center: [building.lng, building.lat],
                      zoom: 17,
                      essential: true
                    });
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">
                      {building.code && `${building.code} - `}{building.name}
                    </p>
                    {building.category && (
                      <Badge variant="outline" className="text-xs mt-1">
                        {building.category}
                      </Badge>
                    )}
                  </div>
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Selected Building Panel */}
      {selectedBuilding && (
        <Card className="absolute top-4 right-4 w-80 p-4 bg-background/95 backdrop-blur">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-lg">
                {selectedBuilding.code && `${selectedBuilding.code} - `}
                {selectedBuilding.name}
              </h3>
              {selectedBuilding.category && (
                <Badge variant="outline" className="mt-2">
                  {selectedBuilding.category}
                </Badge>
              )}
            </div>

            <div className="flex space-x-2">
              <Button
                variant={transportMode === 'walking' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTransportMode('walking')}
              >
                <PersonStanding className="w-4 h-4 mr-1" />
                Walk
              </Button>
              <Button
                variant={transportMode === 'cycling' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTransportMode('cycling')}
              >
                <Bike className="w-4 h-4 mr-1" />
                Bike
              </Button>
              <Button
                variant={transportMode === 'driving' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTransportMode('driving')}
              >
                <Car className="w-4 h-4 mr-1" />
                Drive
              </Button>
            </div>

            <Button
              onClick={() => getDirections(selectedBuilding)}
              className="w-full"
              disabled={!userLocation}
            >
              <Route className="w-4 h-4 mr-2" />
              Get Directions
            </Button>

            {directions && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatDuration(directions.duration)}
                  </div>
                  <div className="flex items-center">
                    <Navigation className="w-4 h-4 mr-1" />
                    {formatDistance(directions.distance)}
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground max-h-32 overflow-y-auto">
                  {directions.instructions.slice(0, 5).map((instruction, index) => (
                    <p key={index} className="mb-1">
                      {index + 1}. {instruction}
                    </p>
                  ))}
                  {directions.instructions.length > 5 && (
                    <p className="text-primary">+ {directions.instructions.length - 5} more steps</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};