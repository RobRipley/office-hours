import { useState, useEffect } from 'react';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { TIME_ZONES } from '../lib/timeZones';

interface UserSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserSettingsDialog({ open, onOpenChange }: UserSettingsDialogProps) {
  const { data: userProfile } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const [selectedTimeZone, setSelectedTimeZone] = useState('');

  useEffect(() => {
    if (userProfile?.homeTimeZone) {
      setSelectedTimeZone(userProfile.homeTimeZone.id);
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTimeZone) {
      toast.error('Please select a time zone');
      return;
    }

    if (!userProfile) {
      toast.error('Profile not loaded');
      return;
    }

    const timeZone = TIME_ZONES.find((tz) => tz.id === selectedTimeZone);
    if (!timeZone) {
      toast.error('Invalid time zone selected');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        ...userProfile,
        homeTimeZone: {
          id: timeZone.id,
          name: timeZone.name,
          utcOffset: BigInt(Math.floor(timeZone.utcOffset * 100)),
        },
      });
      toast.success('Settings updated successfully!');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update settings');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>User Settings</DialogTitle>
            <DialogDescription>Update your preferences and time zone.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="settings-timezone">Home Time Zone</Label>
              <Select value={selectedTimeZone} onValueChange={setSelectedTimeZone}>
                <SelectTrigger id="settings-timezone">
                  <SelectValue placeholder="Select your time zone" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {TIME_ZONES.map((tz) => (
                    <SelectItem key={tz.id} value={tz.id}>
                      {tz.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveProfile.isPending}>
              {saveProfile.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
