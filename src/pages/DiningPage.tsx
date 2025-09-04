import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

interface DiningLocation {
  id: number;
  name: string;
  campus_area: string | null;
  hours: any;
  is_open: boolean;
}

export default function DiningPage() {
  const [locations, setLocations] = useState<DiningLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Set initial theme
    document.documentElement.classList.toggle('dark', isDark);
    
    const fetchDiningLocations = async () => {
      try {
        const { data, error } = await supabase
          .from('dining_locations')
          .select('id,name,campus_area,hours,is_open')
          .order('name');

        if (error) {
          console.error('Error fetching dining locations:', error);
          setError('Failed to load dining locations');
        } else {
          setLocations(data || []);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDiningLocations();
  }, [isDark]);

  const handleThemeToggle = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation onThemeToggle={handleThemeToggle} isDark={isDark} />
        <main className="max-w-4xl mx-auto p-6">
          <div className="text-center text-muted-foreground">Loading dining locations...</div>
        </main>
        <Footer onThemeToggle={handleThemeToggle} isDark={isDark} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation onThemeToggle={handleThemeToggle} isDark={isDark} />
        <main className="max-w-4xl mx-auto p-6">
          <div className="text-center text-destructive">{error}</div>
        </main>
        <Footer onThemeToggle={handleThemeToggle} isDark={isDark} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation onThemeToggle={handleThemeToggle} isDark={isDark} />
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Campus Dining
        </h1>
        <div className="grid md:grid-cols-2 gap-6">
          {locations.map((loc) => (
            <div key={loc.id} className="glass-card p-6 hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-lg text-foreground">{loc.name}</h2>
                <span 
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    loc.is_open 
                      ? 'bg-accent/20 text-accent border border-accent/30' 
                      : 'bg-muted text-muted-foreground border border-border'
                  }`}
                >
                  {loc.is_open ? 'Open' : 'Closed'}
                </span>
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                <span className="font-medium">Area:</span> {loc.campus_area || 'Not specified'}
              </div>
              <details className="group">
                <summary className="cursor-pointer text-sm text-primary hover:text-primary/80 transition-colors">
                  View Hours
                </summary>
                <div className="mt-3 p-3 bg-muted/50 rounded-lg border border-border">
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(loc.hours, null, 2)}
                  </pre>
                </div>
              </details>
            </div>
          ))}
        </div>
        {locations.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            No dining locations found.
          </div>
        )}
      </main>
      <Footer onThemeToggle={handleThemeToggle} isDark={isDark} />
    </div>
  );
}