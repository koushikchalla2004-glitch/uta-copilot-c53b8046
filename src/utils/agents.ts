// Multi-agent system for specialized tasks

export interface AgentResponse {
  success: boolean;
  message: string;
  action?: string;
}

// Navigation Agent - handles directions and map navigation
export class NavigationAgent {
  static async getDirections(building: string, destination?: string): Promise<AgentResponse> {
    try {
      // If destination is provided, use it; otherwise use current location
      const origin = destination || 'current location';
      
      // Format building name for maps query
      const formattedBuilding = `${building} University of Texas at Arlington, TX`;
      
      // Create Google Maps URL
      const mapsUrl = `https://www.google.com/maps/dir/${encodeURIComponent(origin)}/${encodeURIComponent(formattedBuilding)}`;
      
      // Try different approaches to avoid popup blockers
      const link = document.createElement('a');
      link.href = mapsUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Temporarily add to DOM and click
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return {
        success: true,
        message: `Opening directions to ${building} in Google Maps`,
        action: 'navigation_opened'
      };
    } catch (error) {
      console.error('Navigation error:', error);
      return {
        success: false,
        message: `Unable to open directions to ${building}. Please try manually searching "${building} UTA" in Google Maps.`,
      };
    }
  }

  static async findBuilding(query: string): Promise<{ building: string | null; confidence: number }> {
    // Common building aliases and names
    const buildingMap: Record<string, string> = {
      'library': 'Central Library',
      'lib': 'Central Library',
      'central library': 'Central Library',
      'erb': 'Engineering Research Building',
      'engineering': 'Engineering Research Building',
      'engineering building': 'Engineering Research Building',
      'business': 'Business Building',
      'business building': 'Business Building',
      'mac': 'Maverick Activities Center',
      'maverick activities center': 'Maverick Activities Center',
      'gym': 'Maverick Activities Center',
      'rec center': 'Maverick Activities Center',
      'student union': 'University Center',
      'uc': 'University Center',
      'university center': 'University Center',
      'science': 'Science Hall',
      'science hall': 'Science Hall',
      'fine arts': 'Fine Arts Building',
      'art building': 'Fine Arts Building',
      'trimble hall': 'Trimble Hall',
      'trimble': 'Trimble Hall'
    };

    const lowerQuery = query.toLowerCase();
    
    // Direct match
    for (const [alias, building] of Object.entries(buildingMap)) {
      if (lowerQuery.includes(alias)) {
        return { building, confidence: 0.9 };
      }
    }

    // Partial match
    for (const [alias, building] of Object.entries(buildingMap)) {
      const words = alias.split(' ');
      if (words.some(word => lowerQuery.includes(word))) {
        return { building, confidence: 0.6 };
      }
    }

    return { building: null, confidence: 0 };
  }
}

// Reminder Agent - handles alarms and reminders
export class ReminderAgent {
  static async setReminder(eventTitle: string, datetime: string, type: 'event' | 'class' = 'event'): Promise<AgentResponse> {
    try {
      const eventDate = new Date(datetime);
      const now = new Date();
      
      if (eventDate <= now) {
        return {
          success: false,
          message: "Cannot set reminder for past events"
        };
      }

      // For web - use browser notifications
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          const timeDiff = eventDate.getTime() - now.getTime();
          
          // Set reminder 15 minutes before
          const reminderTime = Math.max(0, timeDiff - (15 * 60 * 1000));
          
          setTimeout(() => {
            new Notification(`UTA Reminder: ${eventTitle}`, {
              body: `Your ${type} "${eventTitle}" starts in 15 minutes`,
              icon: '/favicon.ico',
              tag: `uta-reminder-${eventTitle}`,
            });
          }, reminderTime);

          // Also add to localStorage for persistence
          const reminders = JSON.parse(localStorage.getItem('uta-reminders') || '[]');
          reminders.push({
            id: Date.now(),
            title: eventTitle,
            datetime: datetime,
            type: type,
            created: now.toISOString()
          });
          localStorage.setItem('uta-reminders', JSON.stringify(reminders));

          return {
            success: true,
            message: `Reminder set for "${eventTitle}" - you'll be notified 15 minutes before`,
            action: 'reminder_set'
          };
        }
      }

      // Fallback - add to calendar URL
      const calendarUrl = this.createCalendarEvent(eventTitle, datetime, type);
      window.open(calendarUrl, '_blank');
      
      return {
        success: true,
        message: `Opening calendar to add "${eventTitle}" reminder`,
        action: 'calendar_opened'
      };
    } catch (error) {
      return {
        success: false,
        message: `Unable to set reminder for "${eventTitle}"`
      };
    }
  }

  static createCalendarEvent(title: string, datetime: string, type: string): string {
    const date = new Date(datetime);
    const endDate = new Date(date.getTime() + (60 * 60 * 1000)); // 1 hour duration
    
    const formatDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `UTA ${type}: ${title}`,
      dates: `${formatDate(date)}/${formatDate(endDate)}`,
      details: `UTA ${type} reminder set via UTA Copilot`,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  static getActiveReminders(): any[] {
    return JSON.parse(localStorage.getItem('uta-reminders') || '[]');
  }
}

// Agent Router - determines which agent to use
export class AgentRouter {
  static async processQuery(query: string): Promise<{
    agent: string | null;
    action: string | null;
    params: any;
    confidence: number;
  }> {
    const lowerQuery = query.toLowerCase();

    // Navigation patterns
    const navigationPatterns = [
      'directions to',
      'how to get to',
      'where is',
      'navigate to',
      'find',
      'location of',
      'go to',
      'take me to'
    ];

    // Reminder patterns
    const reminderPatterns = [
      'remind me',
      'set reminder',
      'alarm for',
      'notify me',
      'don\'t forget',
      'schedule reminder'
    ];

    // Check for navigation intent
    for (const pattern of navigationPatterns) {
      if (lowerQuery.includes(pattern)) {
        const buildingMatch = await NavigationAgent.findBuilding(query);
        if (buildingMatch.building) {
          return {
            agent: 'navigation',
            action: 'get_directions',
            params: { building: buildingMatch.building },
            confidence: buildingMatch.confidence
          };
        }
      }
    }

    // Check for reminder intent
    for (const pattern of reminderPatterns) {
      if (lowerQuery.includes(pattern)) {
        return {
          agent: 'reminder',
          action: 'set_reminder',
          params: { query },
          confidence: 0.8
        };
      }
    }

    return {
      agent: null,
      action: null,
      params: {},
      confidence: 0
    };
  }
}