import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Bus, Home, Coffee, BookOpen, Users, Zap } from 'lucide-react';
import { Button } from './ui/button';

interface ExploreCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  image?: string;
  stats?: string;
}

const exploreCards: ExploreCard[] = [
  {
    id: 'dining',
    title: 'Campus Dining',
    description: 'Discover restaurants, cafes, and dining halls across campus with real-time hours and menus.',
    icon: <Coffee className="w-8 h-8" />,
    color: 'from-orange-500 to-red-500',
    stats: '15+ locations'
  },
  {
    id: 'events',
    title: 'Campus Events',
    description: 'Stay updated with lectures, concerts, sports events, and student organization activities.',
    icon: <Calendar className="w-8 h-8" />,
    color: 'from-blue-500 to-purple-500',
    stats: '200+ events monthly'
  },
  {
    id: 'transit',
    title: 'Transit & Parking',
    description: 'Navigate campus with shuttle schedules, parking availability, and walking directions.',
    icon: <Bus className="w-8 h-8" />,
    color: 'from-green-500 to-teal-500',
    stats: 'Live tracking'
  },
  {
    id: 'housing',
    title: 'Housing & Living',
    description: 'Explore residence halls, apartments, and campus housing options with virtual tours.',
    icon: <Home className="w-8 h-8" />,
    color: 'from-purple-500 to-pink-500',
    stats: '12 residence halls'
  },
  {
    id: 'academics',
    title: 'Academics',
    description: 'Access course catalogs, registration, advisor information, and academic resources.',
    icon: <BookOpen className="w-8 h-8" />,
    color: 'from-indigo-500 to-blue-500',
    stats: '180+ degree programs'
  },
  {
    id: 'student-life',
    title: 'Student Life',
    description: 'Connect with student organizations, clubs, recreation centers, and campus services.',
    icon: <Users className="w-8 h-8" />,
    color: 'from-teal-500 to-cyan-500',
    stats: '300+ organizations'
  }
];

export const ExploreSection = () => {
  return (
    <section id="explore" className="py-20 px-4 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-inter-tight font-bold text-4xl md:text-5xl mb-6">
            Explore{' '}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Campus Life
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to know about UTA campus, from dining and events to academics and student life.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {exploreCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="group"
            >
              <div className="glass-card p-8 h-full flex flex-col relative overflow-hidden">
                {/* Background gradient */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.color} opacity-10 rounded-full transform translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-300`} />
                
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.color} p-3 mb-6 text-white shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                  {card.icon}
                </div>

                {/* Content */}
                <div className="flex-1 relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-inter-tight font-bold text-xl group-hover:text-primary transition-colors">
                      {card.title}
                    </h3>
                    {card.stats && (
                      <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                        {card.stats}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {card.description}
                  </p>
                </div>

                {/* Action */}
                <Button 
                  variant="ghost" 
                  className="w-full group-hover:bg-primary/10 transition-all duration-200"
                >
                  Explore {card.title}
                  <Zap className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-20 glass-card p-8 rounded-2xl"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
                48K+
              </div>
              <div className="text-sm text-muted-foreground">Students</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
                420
              </div>
              <div className="text-sm text-muted-foreground">Acres</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
                180+
              </div>
              <div className="text-sm text-muted-foreground">Degree Programs</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
                #1
              </div>
              <div className="text-sm text-muted-foreground">In Innovation</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};