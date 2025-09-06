import { supabase } from '@/integrations/supabase/client';

export interface AgentResponse {
  success: boolean;
  data?: any;
  message: string;
  confidence: number;
  processingTime: number;
  source: string;
}

export interface Agent {
  name: string;
  canHandle(query: string): number;
  process(query: string): Promise<AgentResponse>;
}

// Real-time Transportation Agent
export class TransportationAgent implements Agent {
  name = 'Transportation Agent';

  canHandle(query: string): number {
    const transportKeywords = [
      'shuttle', 'bus', 'transport', 'ride', 'route', 'pickup', 'drop off',
      'campus loop', 'research shuttle', 'residence hall express', 'eta', 'arrival'
    ];
    
    const queryLower = query.toLowerCase();
    const matchCount = transportKeywords.filter(keyword => 
      queryLower.includes(keyword)
    ).length;
    
    return Math.min(matchCount * 0.3, 0.95);
  }

  async process(query: string): Promise<AgentResponse> {
    const startTime = Date.now();
    
    try {
      // Fetch real-time shuttle data
      const { data: shuttles, error } = await supabase
        .from('shuttle_tracking')
        .select('*')
        .eq('is_active', true)
        .order('last_updated', { ascending: false });

      if (error) throw error;

      let response = "🚌 **Campus Transportation - Live Updates:**\n\n";
      
      if (shuttles && shuttles.length > 0) {
        shuttles.forEach(shuttle => {
          const capacityEmoji = {
            'low': '🟢',
            'medium': '🟡', 
            'high': '🔴'
          }[shuttle.capacity_status] || '⚪';
          
          response += `**${shuttle.route_name}** ${capacityEmoji}\n`;
          response += `• Next Stop: ${shuttle.next_stop}\n`;
          response += `• ETA: ${shuttle.eta_minutes} minutes\n`;
          response += `• Capacity: ${shuttle.capacity_status}\n`;
          response += `• Last Updated: ${new Date(shuttle.last_updated).toLocaleTimeString()}\n\n`;
        });
        
        response += "💡 **Live Tips:**\n";
        response += "• Green = Plenty of space\n";
        response += "• Yellow = Getting full\n";
        response += "• Red = Very crowded\n";
      } else {
        response += "No active shuttles currently running. Check back later!";
      }

      const processingTime = Date.now() - startTime;
      
      return {
        success: true,
        data: { shuttles, realTime: true },
        message: response,
        confidence: 0.9,
        processingTime,
        source: 'transportation_agent_realtime'
      };
    } catch (error) {
      console.error('Transportation agent error:', error);
      return {
        success: false,
        message: 'I had trouble getting real-time transportation information. Please try again.',
        confidence: 0.1,
        processingTime: Date.now() - startTime,
        source: 'transportation_agent_error'
      };
    }
  }
}

// Real-time Campus Alerts Agent
export class AlertsAgent implements Agent {
  name = 'Alerts Agent';

  canHandle(query: string): number {
    const alertKeywords = [
      'alert', 'emergency', 'warning', 'weather', 'maintenance', 'closed',
      'traffic', 'incident', 'safety', 'urgent', 'important', 'notice'
    ];
    
    const queryLower = query.toLowerCase();
    const matchCount = alertKeywords.filter(keyword => 
      queryLower.includes(keyword)
    ).length;
    
    return Math.min(matchCount * 0.35, 0.95);
  }

  async process(query: string): Promise<AgentResponse> {
    const startTime = Date.now();
    
    try {
      const { data: alerts, error } = await supabase
        .from('live_alerts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      let response = "🚨 **Live Campus Alerts:**\n\n";
      
      if (alerts && alerts.length > 0) {
        alerts.forEach(alert => {
          const severityEmoji = {
            'critical': '🔴',
            'high': '🟠',
            'medium': '🟡',
            'low': '🟢'
          }[alert.severity] || '⚪';
          
          const typeEmoji = {
            'emergency': '🚨',
            'weather': '🌦️',
            'maintenance': '🔧',
            'traffic': '🚗',
            'event': '📅'
          }[alert.alert_type] || '📢';
          
          response += `${severityEmoji} ${typeEmoji} **${alert.title}**\n`;
          response += `${alert.message}\n`;
          
          if (alert.affected_areas?.length > 0) {
            response += `📍 Affected areas: ${alert.affected_areas.join(', ')}\n`;
          }
          
          if (alert.expires_at) {
            const expiresAt = new Date(alert.expires_at);
            response += `⏰ Expires: ${expiresAt.toLocaleString()}\n`;
          }
          
          response += "\n";
        });
        
        response += "Stay safe and check back for updates!";
      } else {
        response += "✅ No active alerts at this time. Campus operations are normal.";
      }

      const processingTime = Date.now() - startTime;
      
      return {
        success: true,
        data: { alerts, realTime: true },
        message: response,
        confidence: 0.9,
        processingTime,
        source: 'alerts_agent_realtime'
      };
    } catch (error) {
      console.error('Alerts agent error:', error);
      return {
        success: false,
        message: 'I had trouble getting current alert information. Please try again.',
        confidence: 0.1,
        processingTime: Date.now() - startTime,
        source: 'alerts_agent_error'
      };
    }
  }
}

// Real-time Parking Agent
export class ParkingAgent implements Agent {
  name = 'Parking Agent';

  canHandle(query: string): number {
    const parkingKeywords = [
      'parking', 'park', 'lot', 'garage', 'spaces', 'available', 'permit',
      'visitor', 'student', 'faculty', 'hourly', 'rate', 'cost'
    ];
    
    const queryLower = query.toLowerCase();
    const matchCount = parkingKeywords.filter(keyword => 
      queryLower.includes(keyword)
    ).length;
    
    return Math.min(matchCount * 0.4, 0.95);
  }

  async process(query: string): Promise<AgentResponse> {
    const startTime = Date.now();
    
    try {
      const { data: parking, error } = await supabase
        .from('parking_availability')
        .select('*')
        .eq('is_open', true)
        .order('available_spaces', { ascending: false });

      if (error) throw error;

      let response = "🅿️ **Live Parking Availability:**\n\n";
      
      if (parking && parking.length > 0) {
        parking.forEach(lot => {
          const availabilityPercentage = (lot.available_spaces / lot.total_spaces) * 100;
          const statusEmoji = availabilityPercentage > 30 ? '🟢' : 
                            availabilityPercentage > 10 ? '🟡' : '🔴';
          
          response += `${statusEmoji} **${lot.lot_name}**\n`;
          response += `• Available: ${lot.available_spaces}/${lot.total_spaces} spaces\n`;
          response += `• Permit: ${lot.permit_type}\n`;
          
          if (lot.hourly_rate) {
            response += `• Rate: $${lot.hourly_rate}/hour\n`;
          }
          
          response += `• Updated: ${new Date(lot.last_updated).toLocaleTimeString()}\n\n`;
        });
        
        response += "💡 **Quick Guide:**\n";
        response += "• 🟢 = Plenty available (30%+ spaces)\n";
        response += "• 🟡 = Limited (10-30% spaces)\n";
        response += "• 🔴 = Very few (<10% spaces)\n";
      } else {
        response += "No parking data available at this time.";
      }

      const processingTime = Date.now() - startTime;
      
      return {
        success: true,
        data: { parking, realTime: true },
        message: response,
        confidence: 0.9,
        processingTime,
        source: 'parking_agent_realtime'
      };
    } catch (error) {
      console.error('Parking agent error:', error);
      return {
        success: false,
        message: 'I had trouble getting real-time parking information. Please try again.',
        confidence: 0.1,
        processingTime: Date.now() - startTime,
        source: 'parking_agent_error'
      };
    }
  }
}

// Real-time Facility & Wait Times Agent
export class FacilityAgent implements Agent {
  name = 'Facility Agent';

  canHandle(query: string): number {
    const facilityKeywords = [
      'library', 'gym', 'lab', 'computer', 'study', 'room', 'busy', 'crowded',
      'wait', 'line', 'queue', 'registrar', 'financial aid', 'office hours',
      'occupancy', 'capacity', 'available', 'full'
    ];
    
    const queryLower = query.toLowerCase();
    const matchCount = facilityKeywords.filter(keyword => 
      queryLower.includes(keyword)
    ).length;
    
    return Math.min(matchCount * 0.35, 0.95);
  }

  async process(query: string): Promise<AgentResponse> {
    const startTime = Date.now();
    
    try {
      const [facilityRes, waitTimesRes] = await Promise.all([
        supabase
          .from('facility_occupancy')
          .select('*')
          .eq('status', 'open')
          .order('occupancy_percentage', { ascending: false }),
        supabase
          .from('service_wait_times')
          .select('*')
          .neq('status', 'closed')
          .order('estimated_wait_minutes')
      ]);

      if (facilityRes.error) throw facilityRes.error;
      if (waitTimesRes.error) throw waitTimesRes.error;

      let response = "🏢 **Live Facility Status & Wait Times:**\n\n";
      
      // Facility occupancy
      if (facilityRes.data && facilityRes.data.length > 0) {
        response += "📊 **Facility Occupancy:**\n";
        facilityRes.data.forEach(facility => {
          const occupancy = facility.occupancy_percentage;
          const statusEmoji = occupancy > 80 ? '🔴' : 
                            occupancy > 60 ? '🟡' : '🟢';
          
          response += `${statusEmoji} **${facility.facility_name}** (${facility.building_name})\n`;
          response += `• Occupancy: ${facility.current_occupancy}/${facility.max_capacity} (${occupancy.toFixed(0)}%)\n`;
          response += `• Type: ${facility.facility_type.replace('_', ' ')}\n\n`;
        });
      }
      
      // Wait times
      if (waitTimesRes.data && waitTimesRes.data.length > 0) {
        response += "⏱️ **Current Wait Times:**\n";
        waitTimesRes.data.forEach(service => {
          const waitEmoji = service.estimated_wait_minutes <= 5 ? '🟢' :
                           service.estimated_wait_minutes <= 15 ? '🟡' : '🔴';
          
          response += `${waitEmoji} **${service.location_name}**\n`;
          response += `• Wait: ~${service.estimated_wait_minutes} minutes\n`;
          response += `• Queue: ${service.queue_length} people\n`;
          response += `• Status: ${service.status}\n\n`;
        });
        
        response += "💡 **Wait Time Guide:**\n";
        response += "• 🟢 = Quick (≤5 min)\n";
        response += "• 🟡 = Moderate (6-15 min)\n";
        response += "• 🔴 = Long (>15 min)\n";
      }

      const processingTime = Date.now() - startTime;
      
      return {
        success: true,
        data: { 
          facilities: facilityRes.data, 
          waitTimes: waitTimesRes.data, 
          realTime: true 
        },
        message: response,
        confidence: 0.9,
        processingTime,
        source: 'facility_agent_realtime'
      };
    } catch (error) {
      console.error('Facility agent error:', error);
      return {
        success: false,
        message: 'I had trouble getting real-time facility information. Please try again.',
        confidence: 0.1,
        processingTime: Date.now() - startTime,
        source: 'facility_agent_error'
      };
    }
  }
}

// Export all enhanced real-time agents
export const enhancedRealtimeAgents = [
  new TransportationAgent(),
  new AlertsAgent(),
  new ParkingAgent(),
  new FacilityAgent()
];