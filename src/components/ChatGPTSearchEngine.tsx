import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Send, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const ChatGPTSearchEngine = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Location keywords for automatic map navigation
  const locationKeywords = [
    'where is', 'location', 'directions', 'navigate', 'find', 'building', 'hall', 'center',
    'library', 'gym', 'dining', 'cafeteria', 'parking', 'office', 'department'
  ];

  const buildingAliases = {
    'library': 'Central Library',
    'lib': 'Central Library',
    'central library': 'Central Library',
    'mac': 'Maverick Activities Center',
    'maverick activities': 'Maverick Activities Center',
    'gym': 'Maverick Activities Center',
    'fitness': 'Maverick Activities Center',
    'erb': 'Engineering Research Building',
    'engineering': 'Engineering Research Building',
    'uc': 'University Center',
    'university center': 'University Center',
    'student union': 'University Center',
    'business': 'Business Building',
    'bus': 'Business Building',
    'science': 'Science Hall',
    'sh': 'Science Hall',
    'ssb': 'Student Services Building',
    'student services': 'Student Services Building',
    'arlington hall': 'Arlington Hall',
    'ah': 'Arlington Hall',
    'dorm': 'Arlington Hall'
  };

  const detectLocationQuery = (query: string): boolean => {
    const lowerQuery = query.toLowerCase();
    return locationKeywords.some(keyword => lowerQuery.includes(keyword)) ||
           Object.keys(buildingAliases).some(alias => lowerQuery.includes(alias));
  };

  const findBuildingFromQuery = async (query: string): Promise<any | null> => {
    const lowerQuery = query.toLowerCase();
    
    // Check aliases first
    for (const [alias, buildingName] of Object.entries(buildingAliases)) {
      if (lowerQuery.includes(alias)) {
        const { data } = await supabase
          .from('buildings')
          .select('*')
          .ilike('name', `%${buildingName}%`)
          .limit(1);
        
        if (data && data.length > 0) {
          return data[0];
        }
      }
    }

    // Search by name or code
    const { data } = await supabase
      .from('buildings')
      .select('*')
      .or(`name.ilike.%${query}%,code.ilike.%${query}%`)
      .limit(1);
    
    return data && data.length > 0 ? data[0] : null;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);

    try {
      // Check if this is a location query
      if (detectLocationQuery(query)) {
        const building = await findBuildingFromQuery(query);
        
        if (building) {
          toast({
            title: "Navigating to Map",
            description: `Showing ${building.name} on campus map`,
          });
          
          // Navigate to map with building data
          navigate('/map', { 
            state: { 
              selectedBuilding: building,
              searchQuery: query 
            } 
          });
          return;
        } else {
          toast({
            title: "Building not found",
            description: "Redirecting to map for manual search",
          });
          navigate('/map', { state: { searchQuery: query } });
          return;
        }
      }

      // For other queries, call the AI search function
      const { data, error } = await supabase.functions.invoke('ai-search', {
        body: { query }
      });

      if (error) {
        throw error;
      }

      // Display the AI response
      toast({
        title: "AI Response",
        description: data.response || "No response received",
        duration: 10000, // Show for 10 seconds so user can read it
      });
      
      // Clear the search
      setQuery('');

    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6">
      {/* Logo and Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-glow rounded-full flex items-center justify-center shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
          UTA Copilot
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Ask me anything about campus life, classes, dining, or university services
        </p>
      </motion.div>

      {/* Search Interface */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full max-w-3xl"
      >
        <form onSubmit={handleSearch} className="relative mb-8">
          <div className="relative flex items-center">
            <Input
              type="text"
              placeholder="Ask me anything about UTA campus..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full text-lg py-6 px-6 pr-20 rounded-full border-2 border-muted focus:border-primary bg-background shadow-lg"
              disabled={isSearching}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!query.trim() || isSearching}
              className="absolute right-2 w-12 h-12 rounded-full bg-primary hover:bg-primary-glow transition-all duration-200"
            >
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </form>

      </motion.div>
    </div>
  );
};