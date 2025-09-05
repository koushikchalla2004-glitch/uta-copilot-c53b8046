import React from 'react';
import { motion } from 'framer-motion';
import { UniqueMenu } from '@/components/UniqueMenu';
import { Sparkles, Users, Target, Heart, Award, Clock } from 'lucide-react';

const AboutPage = () => {
  const handleThemeToggle = () => {
    // Theme functionality removed
  };

  const features = [
    {
      icon: Target,
      title: "Mission-Driven",
      description: "Empowering students with intelligent assistance for a seamless campus experience."
    },
    {
      icon: Users,
      title: "Student-Centered",
      description: "Built by students, for students. We understand your unique campus needs."
    },
    {
      icon: Heart,
      title: "Always Learning",
      description: "Our AI continuously improves to provide better, more personalized assistance."
    },
    {
      icon: Clock,
      title: "24/7 Available",
      description: "Get help whenever you need it, whether it's 2 PM or 2 AM."
    }
  ];

  const stats = [
    { number: "10K+", label: "Students Helped" },
    { number: "50+", label: "Campus Services" },
    { number: "24/7", label: "Availability" },
    { number: "99%", label: "Satisfaction Rate" }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <UniqueMenu onThemeToggle={handleThemeToggle} isDark={false} />
      
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About UTA Copilot</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Your intelligent campus companion, designed to make university life easier, 
            more efficient, and more enjoyable for every student.
          </p>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-16 border border-gray-200"
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-center">Our Mission</h2>
          <p className="text-lg text-gray-700 text-center leading-relaxed max-w-4xl mx-auto">
            To transform the university experience by providing intelligent, personalized assistance 
            that helps students navigate campus life, access information instantly, and focus on what 
            matters most - their education and personal growth.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-gray-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-16 border border-gray-200"
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">By the Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* What We Do */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200"
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">What We Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Campus Navigation</h3>
              <p className="text-gray-700 mb-4">
                Find your way around campus with our intelligent mapping system. Get directions, 
                discover nearby amenities, and never get lost again.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Event Discovery</h3>
              <p className="text-gray-700 mb-4">
                Stay connected with campus life. Discover events, activities, and opportunities 
                that match your interests and academic goals.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Dining Services</h3>
              <p className="text-gray-700 mb-4">
                Find the best food options on campus. Check menus, hours, and get recommendations 
                based on your preferences and dietary needs.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Intelligent Assistance</h3>
              <p className="text-gray-700">
                Get instant answers to your questions about academics, campus services, 
                policies, and more through our advanced AI chat interface.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;