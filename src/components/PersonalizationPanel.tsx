import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Brain, MapPin, MessageSquare, GraduationCap, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { useUserPreferences } from '@/hooks/useUserPreferences';

interface PersonalizationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PersonalizationPanel: React.FC<PersonalizationPanelProps> = ({ isOpen, onClose }) => {
  const { preferences, savePreferences, isLoading } = useUserPreferences();

  if (isLoading) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : 300 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-0 right-0 h-full w-96 bg-background border-l border-border shadow-xl z-50 overflow-y-auto ${
        isOpen ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Personalization</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ×
          </button>
        </div>

        {/* Learning Preferences */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Brain className="w-4 h-4" />
              Learning & AI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Personalized Recommendations</Label>
              <Switch
                checked={preferences.learning.personalizedRecommendations}
                onCheckedChange={(checked) =>
                  savePreferences({
                    learning: { ...preferences.learning, personalizedRecommendations: checked }
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Learn from Usage</Label>
              <Switch
                checked={preferences.learning.adaptToUsage}
                onCheckedChange={(checked) =>
                  savePreferences({
                    learning: { ...preferences.learning, adaptToUsage: checked }
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Learn from Queries</Label>
              <Switch
                checked={preferences.learning.learnFromQueries}
                onCheckedChange={(checked) =>
                  savePreferences({
                    learning: { ...preferences.learning, learnFromQueries: checked }
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Campus Preferences */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4" />
              Campus Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Preferred Transport</Label>
              <Select
                value={preferences.campus.preferredTransport}
                onValueChange={(value: any) =>
                  savePreferences({
                    campus: { ...preferences.campus, preferredTransport: value }
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="walking">Walking</SelectItem>
                  <SelectItem value="shuttle">Shuttle</SelectItem>
                  <SelectItem value="car">Car</SelectItem>
                  <SelectItem value="bike">Bike</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Favorite Locations</Label>
              <div className="flex flex-wrap gap-1">
                {preferences.campus.favoriteLocations.map((location, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {location}
                  </Badge>
                ))}
                {preferences.campus.favoriteLocations.length === 0 && (
                  <span className="text-xs text-muted-foreground">
                    Ask about locations to learn your preferences
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Communication Preferences */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <MessageSquare className="w-4 h-4" />
              Communication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Response Style</Label>
              <Select
                value={preferences.communication.preferredResponseStyle}
                onValueChange={(value: any) =>
                  savePreferences({
                    communication: { ...preferences.communication, preferredResponseStyle: value }
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="concise">Concise</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Follow-up Suggestions</Label>
              <Switch
                checked={preferences.communication.followUpSuggestions}
                onCheckedChange={(checked) =>
                  savePreferences({
                    communication: { ...preferences.communication, followUpSuggestions: checked }
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Academic Profile */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <GraduationCap className="w-4 h-4" />
              Academic Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Academic Year</Label>
              <Select
                value={preferences.academic.year}
                onValueChange={(value: any) =>
                  savePreferences({
                    academic: { ...preferences.academic, year: value }
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="freshman">Freshman</SelectItem>
                  <SelectItem value="sophomore">Sophomore</SelectItem>
                  <SelectItem value="junior">Junior</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="graduate">Graduate</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Learned Interests</Label>
              <div className="flex flex-wrap gap-1">
                {preferences.academic.interests.map((interest, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {interest}
                  </Badge>
                ))}
                {preferences.academic.interests.length === 0 && (
                  <span className="text-xs text-muted-foreground">
                    Chat to build your interest profile
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Bell className="w-4 h-4" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Campus Alerts</Label>
              <Switch
                checked={preferences.notifications.campusAlerts}
                onCheckedChange={(checked) =>
                  savePreferences({
                    notifications: { ...preferences.notifications, campusAlerts: checked }
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Dining Updates</Label>
              <Switch
                checked={preferences.notifications.diningUpdates}
                onCheckedChange={(checked) =>
                  savePreferences({
                    notifications: { ...preferences.notifications, diningUpdates: checked }
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Event Reminders</Label>
              <Switch
                checked={preferences.notifications.eventReminders}
                onCheckedChange={(checked) =>
                  savePreferences({
                    notifications: { ...preferences.notifications, eventReminders: checked }
                  })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};