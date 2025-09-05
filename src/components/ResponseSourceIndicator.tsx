import React from 'react';
import { Clock, Zap, Database, Bot, Navigation, Lightbulb } from 'lucide-react';
import { Badge } from './ui/badge';

interface ResponseSourceIndicatorProps {
  source?: string;
  enhanced?: boolean;
}

export const ResponseSourceIndicator: React.FC<ResponseSourceIndicatorProps> = ({ 
  source, 
  enhanced 
}) => {
  const getSourceInfo = () => {
    switch (source) {
      case 'faq':
        return {
          icon: <Zap className="w-3 h-3" />,
          label: 'Instant',
          className: 'bg-green-500/10 text-green-600 border-green-500/20'
        };
      case 'cache':
        return {
          icon: <Clock className="w-3 h-3" />,
          label: 'Cached',
          className: 'bg-blue-500/10 text-blue-600 border-blue-500/20'
        };
      case 'local_database':
        return {
          icon: <Database className="w-3 h-3" />,
          label: 'Local Search',
          className: 'bg-purple-500/10 text-purple-600 border-purple-500/20'
        };
      case 'navigation_agent':
        return {
          icon: <Navigation className="w-3 h-3" />,
          label: 'Navigation',
          className: 'bg-orange-500/10 text-orange-600 border-orange-500/20'
        };
      case 'enhanced_ai':
        return {
          icon: <Lightbulb className="w-3 h-3" />,
          label: 'Enhanced AI',
          className: 'bg-violet-500/10 text-violet-600 border-violet-500/20'
        };
      default:
        return {
          icon: <Bot className="w-3 h-3" />,
          label: 'AI',
          className: 'bg-muted text-muted-foreground border-border'
        };
    }
  };

  if (!source && !enhanced) return null;

  const sourceInfo = getSourceInfo();

  return (
    <Badge 
      variant="outline" 
      className={`text-xs ${sourceInfo.className} ml-2`}
    >
      {sourceInfo.icon}
      <span className="ml-1">{sourceInfo.label}</span>
    </Badge>
  );
};