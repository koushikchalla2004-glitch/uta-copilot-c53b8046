import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  User, 
  Clock, 
  Zap, 
  Brain, 
  Target, 
  ExternalLink,
  Copy,
  Check,
  MoreVertical,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
// TypewriterText component for response cards
const TypewriterText = ({ text, onComplete }: { text: string; onComplete: () => void }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  React.useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, Math.random() * 30 + 20);

      return () => clearTimeout(timeout);
    } else {
      onComplete();
    }
  }, [currentIndex, text, onComplete]);

  return <span>{formatMessageWithLinks(displayedText)}</span>;
};

interface ResponseCardProps {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  metadata?: {
    source?: string;
    strategy?: string;
    agents?: string[];
    confidence?: number;
    processingTime?: number;
    sentiment?: string;
    sentimentScore?: number;
    sources?: any[];
  };
  onRegenerate?: () => void;
}

const formatMessageWithLinks = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/g;
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  
  let parts = text.split(urlRegex);
  parts = parts.flatMap(part => {
    if (urlRegex.test(part)) {
      return [part];
    }
    return part.split(emailRegex);
  });
  
  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      const url = part.startsWith('http') ? part : `https://${part}`;
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 underline inline-flex items-center gap-1 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
          <ExternalLink className="w-3 h-3" />
        </a>
      );
    } else if (emailRegex.test(part)) {
      return (
        <a
          key={index}
          href={`mailto:${part}`}
          className="text-primary hover:text-primary/80 underline transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

const getCardVariant = (type: string, metadata?: ResponseCardProps['metadata']) => {
  if (type === 'user') return 'user';
  
  if (metadata?.source === 'multi_agent') return 'agent';
  if (metadata?.source === 'enhanced_ai') return 'enhanced';
  return 'standard';
};

const getSourceIcon = (source?: string) => {
  switch (source) {
    case 'multi_agent': return <Brain className="w-4 h-4" />;
    case 'enhanced_ai': return <Zap className="w-4 h-4" />;
    default: return <Bot className="w-4 h-4" />;
  }
};

const getConfidenceColor = (confidence?: number) => {
  if (!confidence) return 'secondary';
  if (confidence >= 0.8) return 'default';
  if (confidence >= 0.6) return 'secondary';
  return 'outline';
};

export const ResponseCard: React.FC<ResponseCardProps> = ({
  id,
  type,
  content,
  timestamp,
  isTyping = false,
  metadata,
  onRegenerate
}) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const variant = getCardVariant(type, metadata);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast({ title: "Copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const cardVariants = {
    user: "ml-auto max-w-[80%] bg-primary text-primary-foreground",
    agent: "mr-auto max-w-[85%] bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20",
    enhanced: "mr-auto max-w-[85%] bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20",
    standard: "mr-auto max-w-[85%] bg-muted/50"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`${cardVariants[variant as keyof typeof cardVariants]}`}
    >
      <Card className="shadow-sm border transition-all duration-200 hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {type === 'user' ? (
                <User className="w-5 h-5" />
              ) : (
                getSourceIcon(metadata?.source)
              )}
              <span className="font-medium text-sm">
                {type === 'user' ? 'You' : 'UTA Copilot'}
              </span>
              {metadata?.strategy && (
                <Badge variant="outline" className="text-xs">
                  {metadata.strategy}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {metadata?.confidence && (
                <Badge variant={getConfidenceColor(metadata.confidence)} className="text-xs">
                  {Math.round(metadata.confidence * 100)}%
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {type === 'assistant' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleCopy}>
                      {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </DropdownMenuItem>
                    {onRegenerate && (
                      <DropdownMenuItem onClick={onRegenerate}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerate
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="prose prose-sm max-w-none">
            {isTyping ? (
              <TypewriterText 
                text={content} 
                onComplete={() => {}} 
              />
            ) : (
              <div className="whitespace-pre-wrap leading-relaxed">
                {formatMessageWithLinks(content)}
              </div>
            )}
          </div>
          
          {/* Metadata Footer */}
          {metadata && type === 'assistant' && (
            <div className="mt-4 pt-3 border-t border-border/50">
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {metadata.agents && metadata.agents.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    <span>Agents: {metadata.agents.join(', ')}</span>
                  </div>
                )}
                {metadata.processingTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{metadata.processingTime}ms</span>
                  </div>
                )}
                {metadata.sources && metadata.sources.length > 0 && (
                  <div className="flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    <span>{metadata.sources.length} sources</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};