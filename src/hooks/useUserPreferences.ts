import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserPreferences {
  learning: {
    personalizedRecommendations: boolean;
    adaptToUsage: boolean;
    learnFromQueries: boolean;
  };
  campus: {
    favoriteLocations: string[];
    preferredTransport: 'walking' | 'shuttle' | 'car' | 'bike';
    homeBase: string;
  };
  communication: {
    preferredResponseStyle: 'concise' | 'detailed' | 'casual' | 'formal';
    voiceEnabled: boolean;
    followUpSuggestions: boolean;
  };
  academic: {
    year: 'freshman' | 'sophomore' | 'junior' | 'senior' | 'graduate' | 'faculty' | 'staff';
    college: string;
    interests: string[];
  };
  notifications: {
    campusAlerts: boolean;
    diningUpdates: boolean;
    eventReminders: boolean;
  };
}

const DEFAULT_PREFERENCES: UserPreferences = {
  learning: {
    personalizedRecommendations: true,
    adaptToUsage: true,
    learnFromQueries: true,
  },
  campus: {
    favoriteLocations: [],
    preferredTransport: 'walking',
    homeBase: '',
  },
  communication: {
    preferredResponseStyle: 'detailed',
    voiceEnabled: false,
    followUpSuggestions: true,
  },
  academic: {
    year: 'freshman',
    college: '',
    interests: [],
  },
  notifications: {
    campusAlerts: true,
    diningUpdates: false,
    eventReminders: true,
  },
};

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const stored = localStorage.getItem(`preferences_${user.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async (newPreferences: Partial<UserPreferences>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updated = { ...preferences, ...newPreferences };
      setPreferences(updated);
      localStorage.setItem(`preferences_${user.id}`, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const learnFromQuery = (query: string, category?: string) => {
    if (!preferences.learning.learnFromQueries) return;

    // Extract interests and preferences from queries
    const interests = [...preferences.academic.interests];
    const locations = [...preferences.campus.favoriteLocations];

    // Simple keyword extraction for learning
    const keywords = query.toLowerCase().split(' ').filter(word => word.length > 3);
    
    // Learn from dining queries
    if (query.toLowerCase().includes('dining') || query.toLowerCase().includes('food')) {
      if (!interests.includes('dining')) {
        interests.push('dining');
      }
    }

    // Learn from location queries
    const locationKeywords = ['library', 'gym', 'recreation', 'student union', 'bookstore'];
    locationKeywords.forEach(location => {
      if (query.toLowerCase().includes(location) && !locations.includes(location)) {
        locations.push(location);
      }
    });

    // Update preferences if we learned something new
    if (interests.length !== preferences.academic.interests.length || 
        locations.length !== preferences.campus.favoriteLocations.length) {
      savePreferences({
        academic: { ...preferences.academic, interests },
        campus: { ...preferences.campus, favoriteLocations: locations }
      });
    }
  };

  const getPersonalizedSuggestions = (): string[] => {
    const suggestions: string[] = [];
    
    if (preferences.academic.interests.includes('dining')) {
      suggestions.push("What's open for lunch today?");
    }
    
    if (preferences.campus.favoriteLocations.includes('library')) {
      suggestions.push("Library hours and study spaces");
    }

    if (preferences.academic.year === 'freshman') {
      suggestions.push("Campus orientation information");
      suggestions.push("First-year resources");
    }

    return suggestions;
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  return {
    preferences,
    isLoading,
    savePreferences,
    learnFromQuery,
    getPersonalizedSuggestions,
  };
};