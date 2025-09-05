import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command';
import { 
  Search, 
  MessageSquare, 
  Map, 
  Calendar, 
  UtensilsCrossed,
  Database,
  User,
  Settings,
  Sparkles,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const commands = [
  {
    group: "Navigation",
    items: [
      { icon: MessageSquare, label: "New Chat", description: "Start a new conversation", action: "/hero" },
      { icon: Map, label: "Campus Map", description: "Navigate around campus", action: "/map" },
      { icon: Calendar, label: "Events", description: "View campus events", action: "/events" },
      { icon: UtensilsCrossed, label: "Dining", description: "Find food options", action: "/dining" },
    ]
  },
  {
    group: "AI Features",
    items: [
      { icon: Sparkles, label: "Voice Mode", description: "Activate voice assistant", action: "voice" },
      { icon: Zap, label: "Quick Search", description: "Search campus info", action: "search" },
    ]
  },
  {
    group: "Settings",
    items: [
      { icon: User, label: "Profile", description: "Manage your profile", action: "/profile" },
      { icon: Settings, label: "Preferences", description: "App settings", action: "/settings" },
      { icon: Database, label: "Data Setup", description: "Admin panel", action: "/admin/data-setup" },
    ]
  }
];

export const ModernCommandPalette: React.FC<CommandPaletteProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) {
      setSearch('');
    }
  }, [isOpen]);

  const handleSelect = (action: string) => {
    if (action.startsWith('/')) {
      navigate(action);
    } else {
      // Handle special actions
      switch (action) {
        case 'voice':
          // Trigger voice mode
          break;
        case 'search':
          // Trigger search
          break;
      }
    }
    onClose();
  };

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (!isOpen) {
          // Open command palette
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <motion.div
        className="command-enter"
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Type a command or search..."
              value={search}
              onValueChange={setSearch}
            />
            <div className="ml-auto text-xs text-muted-foreground">
              ⌘K
            </div>
          </div>
          <CommandList>
            <CommandEmpty>
              <div className="flex flex-col items-center py-6">
                <Search className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No results found.</p>
              </div>
            </CommandEmpty>
            
            <motion.div className="stagger-children">
              {commands.map((group, groupIndex) => (
                <motion.div key={group.group}>
                  <CommandGroup heading={group.group}>
                    {group.items.map((item, itemIndex) => (
                      <CommandItem
                        key={item.action}
                        onSelect={() => handleSelect(item.action)}
                        className="flex items-center space-x-3 py-3"
                      >
                        <motion.div
                          className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <item.icon className="w-4 h-4" />
                        </motion.div>
                        <div className="flex-1">
                          <div className="font-medium">{item.label}</div>
                          <div className="text-xs text-muted-foreground">{item.description}</div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  {groupIndex < commands.length - 1 && <CommandSeparator />}
                </motion.div>
              ))}
            </motion.div>
          </CommandList>
        </Command>
      </motion.div>
    </CommandDialog>
  );
};