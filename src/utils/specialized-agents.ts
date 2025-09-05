import { supabase } from '@/integrations/supabase/client';

// Base Agent Interface
interface Agent {
  name: string;
  canHandle: (query: string) => number; // 0-1 confidence score
  process: (query: string, context?: any) => Promise<AgentResponse>;
}

interface AgentResponse {
  success: boolean;
  data: any;
  message: string;
  confidence: number;
  processingTime: number;
  source: string;
}

// Dining Agent - Handles all food/dining queries
export class DiningAgent implements Agent {
  name = 'dining';

  canHandle(query: string): number {
    const diningKeywords = [
      'dining', 'food', 'eat', 'restaurant', 'cafe', 'menu', 'meal',
      'lunch', 'dinner', 'breakfast', 'snack', 'cafeteria', 'hours',
      'maverick cafe', 'connection cafe', 'hungry', 'vegetarian', 'vegan'
    ];
    
    const queryLower = query.toLowerCase();
    const matches = diningKeywords.filter(keyword => queryLower.includes(keyword));
    return Math.min(matches.length * 0.3, 1.0);
  }

  async process(query: string): Promise<AgentResponse> {
    const startTime = Date.now();
    
    try {
      // Get dining locations with current status
      const { data: locations, error } = await supabase
        .from('dining_locations')
        .select('*')
        .order('name');

      if (error) throw error;

      // Get today's menus if available
      const { data: menus } = await supabase
        .from('menus')
        .select('*')
        .eq('menu_date', new Date().toISOString().split('T')[0]);

      let response = "🍽️ **Campus Dining Information:**\n\n";
      
      if (locations && locations.length > 0) {
        locations.forEach(location => {
          const status = location.is_open ? '🟢 Open' : '🔴 Closed';
          response += `**${location.name}** (${location.campus_area})\n`;
          response += `Status: ${status}\n`;
          
          if (location.hours && Array.isArray(location.hours) && location.hours.length > 0) {
            const firstHour = location.hours[0];
            const hourText = typeof firstHour === 'object' && firstHour !== null && 'text' in firstHour 
              ? (firstHour as any).text 
              : 'Check website for hours';
            response += `Hours: ${hourText}\n`;
          }
          response += '\n';
        });
      }

      // Add menu information if available
      if (menus && menus.length > 0) {
        response += "📋 **Today's Featured Items:**\n";
        menus.forEach(menu => {
          if (menu.items && typeof menu.items === 'object') {
            Object.entries(menu.items).forEach(([category, items]) => {
              if (Array.isArray(items) && items.length > 0) {
                response += `• ${category}: ${items.slice(0, 3).join(', ')}\n`;
              }
            });
          }
        });
      }

      response += "\nFor real-time hours and menus, check the UTA dining website!";

      return {
        success: true,
        data: { locations, menus },
        message: response,
        confidence: 0.9,
        processingTime: Date.now() - startTime,
        source: 'dining_agent'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: 'I had trouble getting dining information. Please try again or check the UTA dining website.',
        confidence: 0.1,
        processingTime: Date.now() - startTime,
        source: 'dining_agent'
      };
    }
  }
}

// Academic Agent - Handles courses, faculty, programs
export class AcademicAgent implements Agent {
  name = 'academic';

  canHandle(query: string): number {
    const academicKeywords = [
      'course', 'class', 'professor', 'faculty', 'degree', 'program',
      'major', 'credit', 'prerequisite', 'semester', 'schedule',
      'registration', 'syllabus', 'grade', 'gpa', 'transcript',
      'advisor', 'department', 'college', 'research'
    ];
    
    const queryLower = query.toLowerCase();
    const matches = academicKeywords.filter(keyword => queryLower.includes(keyword));
    return Math.min(matches.length * 0.25, 1.0);
  }

  async process(query: string): Promise<AgentResponse> {
    const startTime = Date.now();
    
    try {
      const queryLower = query.toLowerCase();
      let response = "📚 **Academic Information:**\n\n";
      let hasResults = false;

      // Search courses
      if (queryLower.includes('course') || queryLower.includes('class')) {
        const { data: courses } = await supabase
          .from('courses')
          .select('*')
          .or(`title.ilike.%${queryLower}%,code.ilike.%${queryLower}%`)
          .limit(5);
        
        if (courses && courses.length > 0) {
          response += "**Courses:**\n";
          courses.forEach(course => {
            response += `• **${course.code}**: ${course.title}\n`;
            response += `  Credits: ${course.credits || 'TBD'}\n`;
            if (course.prereqs) {
              response += `  Prerequisites: ${course.prereqs}\n`;
            }
            response += '\n';
          });
          hasResults = true;
        }
      }

      // Search faculty
      if (queryLower.includes('professor') || queryLower.includes('faculty')) {
        const { data: faculty } = await supabase
          .from('faculty')
          .select('*')
          .or(`name.ilike.%${queryLower}%,dept.ilike.%${queryLower}%`)
          .limit(3);
        
        if (faculty && faculty.length > 0) {
          response += "**Faculty:**\n";
          faculty.forEach(prof => {
            response += `• **${prof.name}** (${prof.dept})\n`;
            if (prof.office) response += `  Office: ${prof.office}\n`;
            if (prof.email) response += `  Email: ${prof.email}\n`;
            if (prof.research_areas && prof.research_areas.length > 0) {
              response += `  Research: ${prof.research_areas.join(', ')}\n`;
            }
            response += '\n';
          });
          hasResults = true;
        }
      }

      // Search programs
      if (queryLower.includes('program') || queryLower.includes('degree') || queryLower.includes('major')) {
        const { data: programs } = await supabase
          .from('programs')
          .select('*')
          .or(`name.ilike.%${queryLower}%,dept.ilike.%${queryLower}%`)
          .limit(3);
        
        if (programs && programs.length > 0) {
          response += "**Programs:**\n";
          programs.forEach(program => {
            response += `• **${program.name}** (${program.level})\n`;
            response += `  Department: ${program.dept}\n`;
            if (program.overview) {
              response += `  ${program.overview.substring(0, 100)}...\n`;
            }
            response += '\n';
          });
          hasResults = true;
        }
      }

      if (!hasResults) {
        response = "I didn't find specific academic information for your query. Try asking about specific courses, professors, or degree programs. You can also check the UTA course catalog online.";
      }

      return {
        success: hasResults,
        data: null,
        message: response,
        confidence: hasResults ? 0.8 : 0.3,
        processingTime: Date.now() - startTime,
        source: 'academic_agent'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: 'I had trouble searching academic information. Please try again or visit the UTA academic website.',
        confidence: 0.1,
        processingTime: Date.now() - startTime,
        source: 'academic_agent'
      };
    }
  }
}

// Event Agent - Handles campus events and activities
export class EventAgent implements Agent {
  name = 'event';

  canHandle(query: string): number {
    const eventKeywords = [
      'event', 'activity', 'happening', 'today', 'tomorrow', 'weekend',
      'calendar', 'schedule', 'meeting', 'workshop', 'seminar',
      'conference', 'party', 'social', 'club', 'organization'
    ];
    
    const queryLower = query.toLowerCase();
    const matches = eventKeywords.filter(keyword => queryLower.includes(keyword));
    return Math.min(matches.length * 0.3, 1.0);
  }

  async process(query: string): Promise<AgentResponse> {
    const startTime = Date.now();
    
    try {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .gte('start_time', now.toISOString())
        .lte('start_time', nextWeek.toISOString())
        .order('start_time', { ascending: true })
        .limit(10);

      if (error) throw error;

      let response = "📅 **Upcoming Campus Events:**\n\n";
      
      if (events && events.length > 0) {
        // Group events by date
        const eventsByDate = events.reduce((acc, event) => {
          const date = new Date(event.start_time).toDateString();
          if (!acc[date]) acc[date] = [];
          acc[date].push(event);
          return acc;
        }, {} as Record<string, any[]>);

        Object.entries(eventsByDate).forEach(([date, dayEvents]) => {
          const dateObj = new Date(date);
          const isToday = dateObj.toDateString() === now.toDateString();
          const isTomorrow = dateObj.toDateString() === tomorrow.toDateString();
          
          let dateLabel = date;
          if (isToday) dateLabel = "Today";
          else if (isTomorrow) dateLabel = "Tomorrow";
          else dateLabel = dateObj.toLocaleDateString();

          response += `**${dateLabel}:**\n`;
          
          dayEvents.forEach(event => {
            const time = new Date(event.start_time).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            });
            response += `• **${event.title}** - ${time}\n`;
            if (event.location) response += `  📍 ${event.location}\n`;
            if (event.description) {
              response += `  ${event.description.substring(0, 80)}...\n`;
            }
            response += '\n';
          });
        });
      } else {
        response = "No upcoming events found in the next week. Check the UTA events calendar for more information!";
      }

      return {
        success: events && events.length > 0,
        data: events,
        message: response,
        confidence: 0.85,
        processingTime: Date.now() - startTime,
        source: 'event_agent'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: 'I had trouble getting event information. Please check the UTA events calendar.',
        confidence: 0.1,
        processingTime: Date.now() - startTime,
        source: 'event_agent'
      };
    }
  }
}

// Service Agent - Handles campus services (WiFi, parking, etc.)
export class ServiceAgent implements Agent {
  name = 'service';

  canHandle(query: string): number {
    const serviceKeywords = [
      'wifi', 'internet', 'network', 'parking', 'permit', 'library',
      'computer', 'lab', 'printing', 'help', 'support', 'it',
      'technology', 'email', 'password', 'account', 'id', 'card'
    ];
    
    const queryLower = query.toLowerCase();
    const matches = serviceKeywords.filter(keyword => queryLower.includes(keyword));
    return Math.min(matches.length * 0.35, 1.0);
  }

  async process(query: string): Promise<AgentResponse> {
    const startTime = Date.now();
    const queryLower = query.toLowerCase();
    
    let response = "🛠️ **Campus Services:**\n\n";
    let hasResults = false;

    // WiFi Help
    if (queryLower.includes('wifi') || queryLower.includes('internet') || queryLower.includes('network')) {
      response += "**WiFi Access:**\n";
      response += "• **UTA-WiFi**: Use your NetID and password\n";
      response += "• **UTA-Guest**: For visitors (no login required)\n";
      response += "• **eduroam**: For students/staff from partner institutions\n\n";
      response += "**Troubleshooting:**\n";
      response += "• Forget and reconnect to the network\n";
      response += "• Contact OIT Help Desk: 817-272-2208\n\n";
      hasResults = true;
    }

    // Parking Help
    if (queryLower.includes('parking') || queryLower.includes('permit')) {
      response += "**Parking Information:**\n";
      response += "• Daily parking: Available in most lots\n";
      response += "• Semester permits: Purchase online through MyMav\n";
      response += "• Visitor parking: Available near major buildings\n";
      response += "• Parking Services: 817-272-3923\n\n";
      hasResults = true;
    }

    // Library Services
    if (queryLower.includes('library')) {
      response += "**Library Services:**\n";
      response += "• Multiple libraries across campus\n";
      response += "• 24/7 study spaces available\n";
      response += "• Computer labs and printing services\n";
      response += "• Research assistance and tutoring\n";
      response += "• Contact: 817-272-3000\n\n";
      hasResults = true;
    }

    // IT Support
    if (queryLower.includes('computer') || queryLower.includes('it') || queryLower.includes('email') || queryLower.includes('password')) {
      response += "**IT Support:**\n";
      response += "• OIT Help Desk: 817-272-2208\n";
      response += "• Online support: oit.uta.edu\n";
      response += "• Computer labs in library and academic buildings\n";
      response += "• Email support for NetID issues\n\n";
      hasResults = true;
    }

    if (!hasResults) {
      response = "For campus services, contact the main UTA information line at 817-272-2011 or visit the specific department's website.";
    } else {
      response += "For more detailed information, visit the respective department websites or contact UTA directly.";
    }

    return {
      success: hasResults,
      data: null,
      message: response,
      confidence: hasResults ? 0.9 : 0.4,
      processingTime: Date.now() - startTime,
      source: 'service_agent'
    };
  }
}