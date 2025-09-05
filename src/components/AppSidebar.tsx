import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  History,
  User,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Bot,
  Clock,
  Star,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
  isStarred?: boolean;
}

interface AppSidebarProps {
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  currentChatId?: string;
}

export function AppSidebar({ onNewChat, onSelectChat, currentChatId }: AppSidebarProps) {
  const { open, setOpen } = useSidebar();
  const { toast } = useToast();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: '1',
      title: 'Campus Navigation Help',
      lastMessage: 'How do I get to the library?',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      messageCount: 8,
      isStarred: true,
    },
    {
      id: '2', 
      title: 'Dining Options',
      lastMessage: 'What are the dining hours?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      messageCount: 5,
    },
    {
      id: '3',
      title: 'Parking Information',
      lastMessage: 'Where can I park on campus?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      messageCount: 12,
    },
  ]);
  
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You've been successfully logged out.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteChatSession = (chatId: string) => {
    setChatSessions(prev => prev.filter(chat => chat.id !== chatId));
    toast({
      title: "Chat deleted",
      description: "Chat session has been removed.",
    });
  };

  const toggleStarred = (chatId: string) => {
    setChatSessions(prev => 
      prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, isStarred: !chat.isStarred }
          : chat
      )
    );
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <Sidebar className={`${!open ? 'w-16' : 'w-80'} transition-all duration-300`} collapsible="icon">
      <SidebarHeader className="border-b border-border/40 pb-4">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-cyan-600 rounded-lg flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          {open && (
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground">UTA Copilot</h2>
              <p className="text-xs text-muted-foreground">AI Campus Assistant</p>
            </div>
          )}
        </div>
        
        {open && (
          <div className="px-4">
            <Button 
              onClick={onNewChat}
              className="w-full bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 hover:from-emerald-500 hover:via-teal-600 hover:to-cyan-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Quick Actions */}
        <SidebarGroup>
          {open && (
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-2">
              Quick Actions
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button 
                    onClick={onNewChat}
                    className="w-full justify-start hover:bg-muted/50 rounded-lg"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {open && <span>New Conversation</span>}
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Chat History */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-2 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <History className="w-3 h-3" />
              {open && "Recent Chats"}
            </span>
            {open && (
              <Badge variant="secondary" className="text-xs">
                {chatSessions.length}
              </Badge>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chatSessions.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton asChild>
                    <button
                      onClick={() => onSelectChat(chat.id)}
                      className={`w-full justify-start hover:bg-muted/50 rounded-lg p-2 ${
                        currentChatId === chat.id ? 'bg-muted' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2 w-full">
                        <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {open && (
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center gap-1">
                              <p className="text-sm font-medium truncate">{chat.title}</p>
                              {chat.isStarred && (
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {chat.lastMessage}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(chat.timestamp)}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleStarred(chat.id);
                                  }}
                                  className="opacity-60 hover:opacity-100"
                                >
                                  <Star 
                                    className={`w-3 h-3 ${
                                      chat.isStarred 
                                        ? 'text-yellow-500 fill-current' 
                                        : 'text-muted-foreground'
                                    }`} 
                                  />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteChatSession(chat.id);
                                  }}
                                  className="opacity-60 hover:opacity-100 text-destructive"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 pt-4">
        {/* User Profile */}
        <div className="px-4 py-2">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-r from-emerald-400 to-cyan-600 text-white text-sm">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            {open && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.user_metadata?.full_name || user?.email || 'UTA Student'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || 'student@uta.edu'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button className="w-full justify-start hover:bg-muted/50 rounded-lg">
                <User className="w-4 h-4" />
                {open && <span>Profile</span>}
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button className="w-full justify-start hover:bg-muted/50 rounded-lg">
                <Settings className="w-4 h-4" />
                {open && <span>Settings</span>}
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button 
                onClick={handleLogout}
                className="w-full justify-start hover:bg-muted/50 rounded-lg text-destructive"
              >
                <LogOut className="w-4 h-4" />
                {open && <span>Logout</span>}
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}