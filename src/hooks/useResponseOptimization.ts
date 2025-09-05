import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CacheEntry {
  response_data: any;
  expires_at: string;
  hit_count: number;
}

interface FAQTemplate {
  keywords: string[];
  question: string;
  answer: string;
  category: string;
  priority: number;
}

export const useResponseOptimization = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Generate cache key from query
  const generateCacheKey = (query: string): string => {
    return query.toLowerCase().trim().replace(/\s+/g, '_');
  };

  // Check FAQ templates for instant responses
  const checkFAQTemplates = useCallback(async (query: string): Promise<string | null> => {
    try {
      const queryWords = query.toLowerCase().split(/\s+/);
      
      const { data: templates, error } = await supabase
        .from('faq_templates')
        .select('*')
        .order('priority', { ascending: false });

      if (error) throw error;

      // Find best matching template
      let bestMatch: FAQTemplate | null = null;
      let bestScore = 0;

      for (const template of templates || []) {
        const matchingKeywords = template.keywords.filter(keyword =>
          queryWords.some(word => word.includes(keyword) || keyword.includes(word))
        );
        
        const score = matchingKeywords.length / template.keywords.length;
        if (score > bestScore && score > 0.3) {
          bestMatch = template;
          bestScore = score;
        }
      }

      return bestMatch?.answer || null;
    } catch (error) {
      console.error('Error checking FAQ templates:', error);
      return null;
    }
  }, []);

  // Check response cache
  const checkCache = useCallback(async (query: string): Promise<any> => {
    try {
      const cacheKey = generateCacheKey(query);
      
      const { data, error } = await supabase
        .from('response_cache')
        .select('*')
        .eq('query_key', cacheKey)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) return null;

      // Update hit count
      await supabase
        .from('response_cache')
        .update({ hit_count: data.hit_count + 1 })
        .eq('id', data.id);

      return data.response_data;
    } catch (error) {
      console.error('Error checking cache:', error);
      return null;
    }
  }, []);

  // Store response in cache
  const storeInCache = useCallback(async (query: string, response: any, category?: string): Promise<void> => {
    try {
      const cacheKey = generateCacheKey(query);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // Cache for 24 hours

      await supabase
        .from('response_cache')
        .upsert({
          query_key: cacheKey,
          response_data: response,
          category,
          expires_at: expiresAt.toISOString(),
          hit_count: 1
        });
    } catch (error) {
      console.error('Error storing in cache:', error);
    }
  }, []);

  // Search local database first
  const searchLocalData = useCallback(async (query: string): Promise<any> => {
    try {
      const searchTerms = query.toLowerCase();
      
      // Search dining locations
      if (searchTerms.includes('dining') || searchTerms.includes('food') || searchTerms.includes('eat')) {
        const { data: dining } = await supabase
          .from('dining_locations')
          .select('*')
          .ilike('name', `%${searchTerms.split(' ')[0]}%`);
        
        if (dining && dining.length > 0) {
          return {
            type: 'dining',
            results: dining,
            source: 'local_database'
          };
        }
      }

      // Search buildings
      if (searchTerms.includes('building') || searchTerms.includes('hall') || searchTerms.includes('center')) {
        const { data: buildings } = await supabase
          .from('buildings')
          .select('*')
          .or(`name.ilike.%${searchTerms}%,code.ilike.%${searchTerms}%`);
        
        if (buildings && buildings.length > 0) {
          return {
            type: 'buildings',
            results: buildings,
            source: 'local_database'
          };
        }
      }

      // Search events
      if (searchTerms.includes('event') || searchTerms.includes('activity')) {
        const { data: events } = await supabase
          .from('events')
          .select('*')
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true })
          .limit(5);
        
        if (events && events.length > 0) {
          return {
            type: 'events',
            results: events,
            source: 'local_database'
          };
        }
      }

      // Search courses
      if (searchTerms.includes('course') || searchTerms.includes('class')) {
        const { data: courses } = await supabase
          .from('courses')
          .select('*')
          .or(`title.ilike.%${searchTerms}%,code.ilike.%${searchTerms}%`)
          .limit(5);
        
        if (courses && courses.length > 0) {
          return {
            type: 'courses',
            results: courses,
            source: 'local_database'
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error searching local data:', error);
      return null;
    }
  }, []);

  // Generate follow-up suggestions
  const generateFollowUpSuggestions = useCallback((query: string, response: any): string[] => {
    const suggestions = [];
    const queryLower = query.toLowerCase();

    if (queryLower.includes('dining') || queryLower.includes('food')) {
      suggestions.push('What are today\'s menu items?', 'Are there vegetarian options?', 'Show me all dining locations');
    } else if (queryLower.includes('event')) {
      suggestions.push('What events are happening this week?', 'How do I register for events?', 'Show me academic events');
    } else if (queryLower.includes('building') || queryLower.includes('location')) {
      suggestions.push('How do I get directions?', 'What are the building hours?', 'Show me nearby buildings');
    } else if (queryLower.includes('course') || queryLower.includes('class')) {
      suggestions.push('What are the prerequisites?', 'When is this course offered?', 'Show me similar courses');
    } else {
      suggestions.push('Tell me about campus dining', 'What events are happening today?', 'Help me find a building');
    }

    return suggestions.slice(0, 3);
  }, []);

  return {
    isLoading,
    setIsLoading,
    checkFAQTemplates,
    checkCache,
    storeInCache,
    searchLocalData,
    generateFollowUpSuggestions
  };
};