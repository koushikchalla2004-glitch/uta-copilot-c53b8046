import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  BookOpen, 
  Users, 
  Home,
  ChevronDown,
  Star,
  ExternalLink,
  Bookmark,
  Share2,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  category: string;
  confidence: number;
  url: string;
  source: string;
}

interface Facet {
  id: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}

const mockResults: SearchResult[] = [
  {
    id: '1',
    title: 'Maverick Activities Center Hours',
    snippet: 'Open Monday-Friday 6am-11pm, Saturday-Sunday 8am-10pm. Full fitness center with cardio equipment, weights, and group fitness classes.',
    category: 'Recreation',
    confidence: 95,
    url: '/mac-hours',
    source: 'UTA Recreation'
  },
  {
    id: '2',
    title: 'Computer Science Degree Requirements',
    snippet: 'Bachelor of Science in Computer Science requires 120 credit hours including core curriculum, major requirements, and electives.',
    category: 'Academics',
    confidence: 92,
    url: '/cs-requirements',
    source: 'Academic Catalog'
  },
  {
    id: '3',
    title: 'Campus Dining Options',
    snippet: 'Multiple dining halls and restaurants across campus including Connection Cafe, Panda Express, and Starbucks locations.',
    category: 'Dining',
    confidence: 88,
    url: '/dining',
    source: 'UTA Dining'
  }
];

export const SearchEngine = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [facets, setFacets] = useState<Facet[]>([
    { id: 'events', label: 'Events', icon: <Calendar className="w-4 h-4" />, active: false },
    { id: 'dining', label: 'Dining', icon: <MapPin className="w-4 h-4" />, active: false },
    { id: 'courses', label: 'Courses', icon: <BookOpen className="w-4 h-4" />, active: true },
    { id: 'advisors', label: 'Advisors', icon: <Users className="w-4 h-4" />, active: false },
    { id: 'housing', label: 'Housing', icon: <Home className="w-4 h-4" />, active: false },
  ]);
  const [showResults, setShowResults] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedResult, setSelectedResult] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleFacet = (facetId: string) => {
    setFacets(prev => prev.map(facet => 
      facet.id === facetId 
        ? { ...facet, active: !facet.active }
        : facet
    ));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowResults(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedResult(prev => 
          prev === null ? 0 : Math.min(prev + 1, mockResults.length - 1)
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedResult(prev => 
          prev === null ? mockResults.length - 1 : Math.max(prev - 1, 0)
        );
        break;
      case 'Enter':
        if (selectedResult !== null) {
          e.preventDefault();
          // Handle result selection
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedResult(null);
        break;
    }
  };

  useEffect(() => {
    if (showResults && selectedResult !== null) {
      const resultElement = document.getElementById(`result-${selectedResult}`);
      if (resultElement) {
        resultElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedResult, showResults]);

  return (
    <section id="search" className="py-20 px-4 relative overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-inter-tight font-bold text-4xl md:text-5xl mb-6">
            Find Anything on{' '}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Campus
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our intelligent search understands context and delivers personalized results for your academic journey.
          </p>
        </motion.div>

        {/* Search Interface */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          {/* Facet Chips */}
          <div className="flex flex-wrap gap-3 justify-center">
            {facets.map((facet) => (
              <motion.button
                key={facet.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleFacet(facet.id)}
                className={`facet-chip ${facet.active ? 'active' : ''}`}
              >
                {facet.icon}
                <span className="ml-2">{facet.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative">
            <div className="search-pill flex items-center">
              <Search className="w-5 h-5 text-muted-foreground mr-3" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Search courses, events, dining, housing..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 border-none bg-transparent focus:ring-0 focus:outline-none text-lg placeholder:text-muted-foreground"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="ml-2 p-2"
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>

            {/* Keyboard hints */}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2 text-xs text-muted-foreground">
              <kbd className="px-2 py-1 bg-muted rounded text-xs">↑</kbd>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">↓</kbd>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">↵</kbd>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">⎋</kbd>
            </div>
          </form>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-card p-6 space-y-4"
              >
                <h3 className="font-semibold text-lg mb-4">Smart Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Date Range</label>
                    <select className="w-full glass-card p-2 rounded-lg border border-[var(--glass-border)]">
                      <option>Any time</option>
                      <option>Today</option>
                      <option>This week</option>
                      <option>This month</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <select className="w-full glass-card p-2 rounded-lg border border-[var(--glass-border)]">
                      <option>Entire campus</option>
                      <option>On-campus only</option>
                      <option>Off-campus</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Price Range</label>
                    <select className="w-full glass-card p-2 rounded-lg border border-[var(--glass-border)]">
                      <option>Any price</option>
                      <option>Free</option>
                      <option>Under $25</option>
                      <option>$25-$100</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Search Results */}
        <AnimatePresence>
          {showResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-8 space-y-4"
            >
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  Found {mockResults.length} results for "{searchQuery}"
                </p>
                <Button variant="ghost" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Sort by relevance
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {mockResults.map((result, index) => (
                <motion.div
                  key={result.id}
                  id={`result-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`glass-card p-6 cursor-pointer transition-all duration-200 hover:shadow-xl group ${
                    selectedResult === index ? 'ring-2 ring-primary' : ''
                  }`}
                  onMouseEnter={() => setSelectedResult(index)}
                  onMouseLeave={() => setSelectedResult(null)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {result.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {result.source}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <div className="w-16 bg-muted rounded-full h-1.5">
                            <div 
                              className="bg-primary h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${result.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {result.confidence}%
                          </span>
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                        {result.title}
                      </h3>
                      
                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        {result.snippet}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{result.url}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Bookmark className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};