import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Download, 
  Database, 
  Calendar, 
  MapPin, 
  Users, 
  BookOpen,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface IngestionJob {
  id: string;
  source: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  totalRecords: number;
  processedRecords: number;
  startTime: string;
  endTime?: string;
  error?: string;
}

const DATA_SOURCES = [
  {
    id: 'events',
    name: 'Events',
    icon: <Calendar className="w-5 h-5" />,
    description: 'Academic and campus events',
    url: 'https://calendar.uta.edu'
  },
  {
    id: 'dining',
    name: 'Dining',
    icon: <MapPin className="w-5 h-5" />,
    description: 'Dining locations and menus',
    url: 'https://dining.uta.edu'
  },
  {
    id: 'faculty',
    name: 'Faculty',
    icon: <Users className="w-5 h-5" />,
    description: 'Faculty directory and profiles',
    url: 'https://www.uta.edu/academics/faculty'
  },
  {
    id: 'courses',
    name: 'Courses (All / default CSE)',
    icon: <BookOpen className="w-5 h-5" />,
    description: 'Course catalog and schedules',
    url: 'https://catalog.uta.edu'
  },
  {
    id: 'courses_cse',
    name: 'Courses (CSE only)',
    icon: <BookOpen className="w-5 h-5" />,
    description: 'Computer Science & Engineering course catalog',
    url: 'https://catalog.uta.edu/coursedescriptions/cse/'
  }
];

export const DataIngestionPanel = () => {
  const [jobs, setJobs] = useState<IngestionJob[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const toggleSource = (sourceId: string) => {
    setSelectedSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const startIngestion = async () => {
    if (selectedSources.length === 0) {
      toast({
        title: "No sources selected",
        description: "Please select at least one data source to ingest.",
        variant: "destructive"
      });
      return;
    }

    setIsRunning(true);
    
    try {
      for (const sourceId of selectedSources) {
        const source = DATA_SOURCES.find(s => s.id === sourceId);
        if (!source) continue;

        const newJob: IngestionJob = {
          id: `${sourceId}-${Date.now()}`,
          source: source.name,
          status: 'pending',
          progress: 0,
          totalRecords: 0,
          processedRecords: 0,
          startTime: new Date().toISOString()
        };

        setJobs(prev => [...prev, newJob]);

        // Call the ingestion edge function
        const { data, error } = await supabase.functions.invoke('uta-data-ingestion', {
          body: { 
            source: sourceId,
            url: source.url,
            jobId: newJob.id
          }
        });

        if (error) {
          throw error;
        }

        // Update job status
        setJobs(prev => prev.map(job => 
          job.id === newJob.id 
            ? { ...job, status: 'completed', progress: 100, endTime: new Date().toISOString() }
            : job
        ));

        toast({
          title: "Ingestion complete",
          description: `Successfully ingested data from ${source.name}`,
        });
      }
    } catch (error: any) {
      console.error('Ingestion error:', error);
      toast({
        title: "Ingestion failed",
        description: error.message || "Failed to ingest data",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
      setSelectedSources([]);
    }
  };

  const getStatusIcon = (status: IngestionJob['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">Data Ingestion</h3>
        <p className="text-muted-foreground">
          Import and update UTA data from various sources
        </p>
      </div>

      {/* Data Sources */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-4 flex items-center">
          <Database className="w-5 h-5 mr-2" />
          Select Data Sources
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {DATA_SOURCES.map((source) => (
            <motion.div
              key={source.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedSources.includes(source.id)
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => toggleSource(source.id)}
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-md bg-primary/10">
                  {source.icon}
                </div>
                <div className="flex-1">
                  <h5 className="font-medium">{source.name}</h5>
                  <p className="text-sm text-muted-foreground">{source.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{source.url}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <Button 
          onClick={startIngestion}
          disabled={isRunning || selectedSources.length === 0}
          className="w-full"
        >
          <Download className="w-4 h-4 mr-2" />
          {isRunning ? 'Ingesting Data...' : 'Start Ingestion'}
        </Button>
      </Card>

      {/* Job History */}
      {jobs.length > 0 && (
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4">Recent Jobs</h4>
          <div className="space-y-3">
            {jobs.slice(-5).reverse().map((job) => (
              <div key={job.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(job.status)}
                  <div>
                    <p className="font-medium">{job.source}</p>
                    <p className="text-sm text-muted-foreground">
                      Started {new Date(job.startTime).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {job.status === 'running' && (
                    <Progress value={job.progress} className="w-24" />
                  )}
                  <Badge variant={
                    job.status === 'completed' ? 'default' :
                    job.status === 'failed' ? 'destructive' :
                    job.status === 'running' ? 'secondary' : 'outline'
                  }>
                    {job.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};