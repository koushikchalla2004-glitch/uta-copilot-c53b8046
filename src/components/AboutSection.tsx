import React from 'react';
import { motion } from 'framer-motion';
import { Github, Mail, MessageCircle, Star, Users, Zap, Shield, Smartphone } from 'lucide-react';
import { Button } from './ui/button';

const features = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Lightning Fast',
    description: 'Get answers in milliseconds with our optimized search algorithms.'
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Privacy First',
    description: 'Your data stays private. No tracking, no selling, no compromises.'
  },
  {
    icon: <Smartphone className="w-6 h-6" />,
    title: 'Mobile Ready',
    description: 'Works seamlessly across all devices with offline capabilities.'
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Student Built',
    description: 'Created by UTA students, for UTA students and faculty.'
  }
];

export const AboutSection = () => {
  return (
    <section id="about" className="py-20 px-4 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-inter-tight font-bold text-4xl md:text-5xl mb-6">
            About{' '}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              UTA Companion
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Your intelligent campus companion that makes navigating university life effortless. 
            Built with cutting-edge AI and 3D technology to serve the UTA community.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Features */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h3 className="font-inter-tight font-bold text-2xl mb-4">
                Why Choose UTA Companion?
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-8">
                We've reimagined how students interact with campus information. No more hunting 
                through multiple websites or apps—everything you need is here, powered by AI.
              </p>
            </div>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start space-x-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-hero p-2 text-white flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">{feature.title}</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Tech Stack */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="glass-card p-8 rounded-2xl"
          >
            <h3 className="font-inter-tight font-bold text-2xl mb-6">
              Built with Modern Tech
            </h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between">
                <span className="font-medium">React + TypeScript</span>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Three.js + WebGL</span>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Framer Motion</span>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Tailwind CSS</span>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--glass-border)]">
              <p className="text-sm text-muted-foreground mb-4">
                Open source and built in public. Check out our development process.
              </p>
              <Button variant="outline" className="w-full">
                <Github className="w-4 h-4 mr-2" />
                View on GitHub
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center glass-card p-12 rounded-2xl"
        >
          <h3 className="font-inter-tight font-bold text-2xl mb-4">
            Have Questions or Feedback?
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            We're constantly improving UTA Companion based on student feedback. 
            Reach out to us with suggestions, bug reports, or just to say hello!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="btn-hero">
              <Mail className="w-4 h-4 mr-2" />
              Send Feedback
            </Button>
            <Button variant="outline" className="glass-card border-[var(--glass-border)]">
              <MessageCircle className="w-4 h-4 mr-2" />
              Join Discord
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};