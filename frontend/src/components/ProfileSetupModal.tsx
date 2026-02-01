import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { TIME_ZONES } from '../lib/timeZones';

export default function ProfileSetupModal() {
  const { identity } = useInternetIdentity();
  const saveProfile = useSaveCallerUserProfile();
  const [name, setName] = useState('');
  const [selectedTimeZone, setSelectedTimeZone] = useState('America/Los_Angeles');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!selectedTimeZone) {
      toast.error('Please select your time zone');
      return;
    }

    if (!identity) {
      toast.error('Not authenticated');
      return;
    }

    const timeZone = TIME_ZONES.find((tz) => tz.id === selectedTimeZone);
    if (!timeZone) {
      toast.error('Invalid time zone selected');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        principal: identity.getPrincipal(),
        name: name.trim(),
        homeTimeZone: {
          id: timeZone.id,
          name: timeZone.name,
          utcOffset: BigInt(Math.floor(timeZone.utcOffset * 100)),
        },
      });
      toast.success('Profile created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create profile');
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => e.preventDefault()}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Welcome!</DialogTitle>
            <DialogDescription>Please set up your profile to continue.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name *</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Home Time Zone *</Label>
              <Select value={selectedTimeZone} onValueChange={setSelectedTimeZone}>
                <SelectTrigger id="timezone">
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
            <Button type="submit" disabled={saveProfile.isPending || !name.trim()}>
              {saveProfile.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Continue
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
