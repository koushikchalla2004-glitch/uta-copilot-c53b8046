import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Map, 
  Search, 
  Calendar, 
  Utensils, 
  Navigation as NavigationIcon,
  MapPin,
  Route,
  Clock
} from 'lucide-react';

const MapDemo = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Building Search",
      description: "Find any building on campus instantly",
      example: "Search for 'Engineering Research Building' or 'ERB'"
    },
    {
      icon: <Route className="w-6 h-6" />,
      title: "Turn-by-Turn Directions",
      description: "Get walking, biking, or driving directions",
      example: "Navigate from your location to any campus building"
    },
    {
      icon: <NavigationIcon className="w-6 h-6" />,
      title: "Real-Time Location",
      description: "Uses your current location for accurate routing",
      example: "Enable location access for personalized directions"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Building Hours",
      description: "View operating hours and accessibility info",
      example: "Check if the library is open right now"
    }
  ];

  const quickActions = [
    {
      label: "View Full Campus Map",
      action: () => navigate('/map'),
      variant: "default" as const
    },
    {
      label: "Search Buildings",
      action: () => navigate('/map'),
      variant: "outline" as const
    },
    {
      label: "Find Dining",
      action: () => navigate('/dining'),
      variant: "outline" as const
    },
    {
      label: "Campus Events",
      action: () => navigate('/events'),
      variant: "outline" as const
    }
  ];

  return (
    <div className="min-h-screen p-8 space-y-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 mb-12"
        >
          <h1 className="text-4xl font-bold">
            Interactive Campus Map
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Navigate UTA campus with real-time directions, building search, and location services
          </p>
          <Badge variant="secondary" className="text-sm">
            <Map className="w-4 h-4 mr-1" />
            Powered by Mapbox
          </Badge>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-primary/10 w-fit">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                  <p className="text-xs text-primary font-medium">
                    {feature.example}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Demo Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">How to Test the Map</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">Getting Started:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Click "View Full Campus Map" below</li>
                  <li>Allow location access when prompted</li>
                  <li>Search for buildings like "Library" or "MAC"</li>
                  <li>Click on building markers to see details</li>
                  <li>Select walking/biking/driving mode</li>
                  <li>Click "Get Directions" for turn-by-turn navigation</li>
                </ol>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">Map Features:</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>3D building visualization</li>
                  <li>Interactive building markers</li>
                  <li>Real-time route calculation</li>
                  <li>Multiple transportation modes</li>
                  <li>Zoom and pan controls</li>
                  <li>Building information popups</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              onClick={action.action}
              size="lg"
              className="min-w-[160px]"
            >
              {action.label}
            </Button>
          ))}
        </motion.div>

        {/* Sample Buildings Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="p-6 mt-12">
            <h3 className="text-lg font-semibold mb-4">Sample Campus Buildings</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="space-y-1">
                <p className="font-medium">Academic</p>
                <p className="text-muted-foreground">Engineering Research Building (ERB)</p>
                <p className="text-muted-foreground">Business Building (BUS)</p>
                <p className="text-muted-foreground">Science Hall (SH)</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium">Recreation</p>
                <p className="text-muted-foreground">Maverick Activities Center (MAC)</p>
                <p className="text-muted-foreground">Physical Education Building (PE)</p>
                <p className="text-muted-foreground">Tennis Center</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium">Student Services</p>
                <p className="text-muted-foreground">University Center (UC)</p>
                <p className="text-muted-foreground">Student Services Building (SSB)</p>
                <p className="text-muted-foreground">Library (LIB)</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium">Housing</p>
                <p className="text-muted-foreground">Residence Hall West</p>
                <p className="text-muted-foreground">Residence Hall East</p>
                <p className="text-muted-foreground">Arlington Hall</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default MapDemo;