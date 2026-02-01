import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Settings, Shield } from 'lucide-react';
import CalendarView from './CalendarView';
import ClaimQueue from './ClaimQueue';
import AdminPanel from './AdminPanel';
import UserSettingsDialog from './UserSettingsDialog';
import type { UserRole } from '../backend';

interface AuthenticatedViewProps {
  userRole: UserRole;
}

export default function AuthenticatedView({ userRole }: AuthenticatedViewProps) {
  const [activeTab, setActiveTab] = useState('calendar');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const isAdmin = userRole === 'admin';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-end mb-4">
        <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="queue">Claim Queue</TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="admin">
              <Shield className="w-4 h-4 mr-2" />
              Admin
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
          <CalendarView />
        </TabsContent>

        <TabsContent value="queue" className="mt-6">
          <ClaimQueue />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="admin" className="mt-6">
            <AdminPanel />
          </TabsContent>
        )}
      </Tabs>

      <UserSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
