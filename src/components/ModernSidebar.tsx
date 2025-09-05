import React from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { 
  MessageSquare, 
  Map, 
  Calendar, 
  UtensilsCrossed, 
  Database,
  User,
  Settings,
  Home,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  path: string;
  description: string;
}

const sidebarItems: SidebarItem[] = [
  { icon: Home, label: 'Dashboard', path: '/hero', description: 'Main interface' },
  { icon: MessageSquare, label: 'Chat', path: '/chat', description: 'AI Assistant' },
  { icon: Map, label: 'Campus Map', path: '/map', description: 'Navigate campus' },
  { icon: Calendar, label: 'Events', path: '/events', description: 'Campus events' },
  { icon: UtensilsCrossed, label: 'Dining', path: '/dining', description: 'Food options' },
  { icon: Database, label: 'Data Setup', path: '/admin/data-setup', description: 'Admin panel' },
  { icon: User, label: 'Profile', path: '/profile', description: 'User settings' },
];

interface ModernSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export const ModernSidebar: React.FC<ModernSidebarProps> = ({ 
  isCollapsed = false,
  onToggle 
}) => {
  return (
    <motion.aside
      className={cn(
        "modern-sidebar h-screen fixed left-0 top-0 z-40",
        isCollapsed ? "w-16" : "w-64"
      )}
      animate={{ width: isCollapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="p-4">
        {/* Logo Section */}
        <motion.div
          className="flex items-center space-x-3 mb-8"
          animate={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
        >
          <div className="relative">
            <div className="w-10 h-10 professional-gradient rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-foreground" />
            </div>
            <div className="absolute inset-0 rounded-xl border border-white/30 animate-pulse-professional" />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-lg font-bold text-foreground">UTA Copilot</h2>
              <p className="text-xs text-muted-foreground">AI Assistant</p>
            </motion.div>
          )}
        </motion.div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {sidebarItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "sidebar-item group",
                    isActive && "active"
                  )
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <motion.div
                    className="ml-3 flex-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="text-xs opacity-60">{item.description}</div>
                  </motion.div>
                )}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        {/* Status Indicator */}
        {!isCollapsed && (
          <motion.div
            className="mt-8 p-3 glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-foreground">AI Online</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Ready to assist you
            </div>
          </motion.div>
        )}
      </div>
    </motion.aside>
  );
};