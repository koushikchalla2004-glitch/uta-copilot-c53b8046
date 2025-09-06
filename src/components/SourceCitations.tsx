import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, MapPin, Calendar, Book, Users, Utensils, Info } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

interface SourceData {
  title?: string;
  url?: string;
  description?: string;
  type?: 'dining' | 'events' | 'buildings' | 'academics' | 'services' | 'general';
  location?: string;
  date?: string;
  confidence?: number;
}

interface SourceCitationsProps {
  sources?: SourceData[];
  sourceType?: string;
  agentsUsed?: string[];
  strategy?: string;
  confidence?: number;
  processingTime?: number;
}

export const SourceCitations: React.FC<SourceCitationsProps> = ({
  sources = [],
  sourceType,
  agentsUsed = [],
  strategy,
  confidence,
  processingTime
}) => {
  if (!sources.length && !sourceType && !agentsUsed.length) return null;

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'dining': return <Utensils className="w-3 h-3" />;
      case 'events': return <Calendar className="w-3 h-3" />;
      case 'buildings': return <MapPin className="w-3 h-3" />;
      case 'academics': return <Book className="w-3 h-3" />;
      case 'services': return <Users className="w-3 h-3" />;
      default: return <Info className="w-3 h-3" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="mt-3 space-y-2"
    >
      {/* Source Citations */}
      {sources.length > 0 && (
        <Card className="bg-muted/30 border-muted-foreground/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Sources ({sources.length})
              </span>
            </div>
            
            <div className="space-y-2">
              {sources.slice(0, 3).map((source, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                  className="flex items-start gap-2 p-2 bg-background/50 rounded-md hover:bg-background/70 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getTypeIcon(source.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {source.title && (
                        <span className="text-xs font-medium text-foreground truncate">
                          {source.title}
                        </span>
                      )}
                      
                      {source.confidence && (
                        <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                          {Math.round(source.confidence * 100)}%
                        </Badge>
                      )}
                    </div>
                    
                    {source.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {source.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {source.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {source.location}
                        </span>
                      )}
                      
                      {source.date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {source.date}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {source.url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 flex-shrink-0"
                      onClick={() => window.open(source.url, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  )}
                </motion.div>
              ))}
              
              {sources.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-6 text-xs text-muted-foreground"
                >
                  +{sources.length - 3} more sources
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};