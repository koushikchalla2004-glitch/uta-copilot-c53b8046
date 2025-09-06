import React, { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { RealtimeDashboard } from '@/components/RealtimeDashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const RealtimeTestPage: React.FC = () => {
  const { toast } = useToast();
  const [isDark, setIsDark] = useState(false);

  const handleThemeToggle = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const simulateShuttleUpdate = async () => {
    try {
      const { error } = await supabase
        .from('shuttle_tracking')
        .update({ 
          eta_minutes: Math.floor(Math.random() * 15) + 1,
          capacity_status: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          last_updated: new Date().toISOString()
        })
        .eq('vehicle_id', 'BUS001');

      if (error) throw error;
      
      toast({
        title: "Shuttle Updated",
        description: "Simulated real-time shuttle data update",
      });
    } catch (error) {
      console.error('Error updating shuttle:', error);
    }
  };

  const simulateAlert = async () => {
    try {
      const alertTypes = ['weather', 'maintenance', 'traffic', 'event'];
      const severities = ['low', 'medium', 'high'];
      
      const { error } = await supabase
        .from('live_alerts')
        .insert({
          alert_type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
          severity: severities[Math.floor(Math.random() * severities.length)],
          title: `Test Alert ${Date.now()}`,
          message: 'This is a simulated alert for testing real-time updates.',
          affected_areas: ['campus_center', 'parking_lots'],
          expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours
        });

      if (error) throw error;
      
      toast({
        title: "Alert Created",
        description: "Simulated new campus alert",
      });
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  };

  const updateParkingData = async () => {
    try {
      const { data: lots } = await supabase
        .from('parking_availability')
        .select('id, total_spaces')
        .limit(1)
        .single();

      if (lots) {
        const newAvailable = Math.floor(Math.random() * lots.total_spaces);
        
        const { error } = await supabase
          .from('parking_availability')
          .update({ 
            available_spaces: newAvailable,
            last_updated: new Date().toISOString()
          })
          .eq('id', lots.id);

        if (error) throw error;
        
        toast({
          title: "Parking Updated",
          description: `Available spaces changed to ${newAvailable}`,
        });
      }
    } catch (error) {
      console.error('Error updating parking:', error);
    }
  };

  const updateFacilityOccupancy = async () => {
    try {
      const { data: facility } = await supabase
        .from('facility_occupancy')
        .select('id, max_capacity')
        .limit(1)
        .single();

      if (facility) {
        const newOccupancy = Math.floor(Math.random() * facility.max_capacity);
        
        const { error } = await supabase
          .from('facility_occupancy')
          .update({ 
            current_occupancy: newOccupancy,
            last_updated: new Date().toISOString()
          })
          .eq('id', facility.id);

        if (error) throw error;
        
        toast({
          title: "Facility Updated",
          description: `Occupancy changed to ${newOccupancy} people`,
        });
      }
    } catch (error) {
      console.error('Error updating facility:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation onThemeToggle={handleThemeToggle} isDark={isDark} />
      
      <div className="pt-16">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Real-time Data Testing
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Test the live campus data updates and real-time synchronization features
              </p>
            </div>
          </div>
        </div>

        {/* Test Controls */}
        <div className="container mx-auto px-4 py-8">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🧪 Test Controls
                <Badge variant="secondary">Simulate Updates</Badge>
              </CardTitle>
              <CardDescription>
                Click these buttons to simulate real-time data updates and watch the dashboard respond instantly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button onClick={simulateShuttleUpdate} variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                  <span className="text-2xl">🚌</span>
                  <span>Update Shuttle</span>
                </Button>
                
                <Button onClick={simulateAlert} variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                  <span className="text-2xl">🚨</span>
                  <span>Create Alert</span>
                </Button>
                
                <Button onClick={updateParkingData} variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                  <span className="text-2xl">🅿️</span>
                  <span>Update Parking</span>
                </Button>
                
                <Button onClick={updateFacilityOccupancy} variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                  <span className="text-2xl">🏢</span>
                  <span>Update Facility</span>
                </Button>
              </div>
              
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">💡 How to Test:</h4>
                <ol className="text-sm text-muted-foreground space-y-1">
                  <li>1. Click any test button above to simulate data changes</li>
                  <li>2. Watch the dashboard below update in real-time</li>
                  <li>3. Try the chat interface to ask about current data</li>
                  <li>4. Open multiple tabs to see live synchronization</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Real-time Dashboard */}
          <RealtimeDashboard />
        </div>
      </div>
      
      <Footer onThemeToggle={handleThemeToggle} isDark={isDark} />
    </div>
  );
};

export default RealtimeTestPage;