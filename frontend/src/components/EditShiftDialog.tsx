import { useState, useEffect } from 'react';
import { useEditShift } from '../hooks/useQueries';
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
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Shift } from '../backend';

interface EditShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: Shift;
}

export default function EditShiftDialog({ open, onOpenChange, shift }: EditShiftDialogProps) {
  const editShift = useEditShift();
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [hostName, setHostName] = useState('');

  useEffect(() => {
    if (shift) {
      const startDate = new Date(Number(shift.startTime) / 1_000_000);
      const endDate = new Date(Number(shift.endTime) / 1_000_000);

      setDate(startDate.toISOString().split('T')[0]);
      setStartTime(startDate.toTimeString().slice(0, 5));
      setEndTime(endDate.toTimeString().slice(0, 5));
      setNotes(shift.notes);
      setMeetingLink(shift.meetingLink);
      setHostName(shift.hostName);
    }
  }, [shift]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !startTime || !endTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    if (endDateTime <= startDateTime) {
      toast.error('End time must be after start time');
      return;
    }

    const startTimeNano = BigInt(startDateTime.getTime()) * BigInt(1_000_000);
    const endTimeNano = BigInt(endDateTime.getTime()) * BigInt(1_000_000);

    try {
      await editShift.mutateAsync({
        shiftId: shift.id,
        startTime: startTimeNano,
        endTime: endTimeNano,
        notes,
        meetingLink,
        hostName,
      });
      toast.success('Shift updated successfully!');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update shift');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Shift</DialogTitle>
            <DialogDescription>Update the shift details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-date">Date *</Label>
              <Input
                id="edit-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startTime">Start Time *</Label>
                <Input
                  id="edit-startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endTime">End Time *</Label>
                <Input
                  id="edit-endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-hostName">Host Name</Label>
              <Input
                id="edit-hostName"
                placeholder="Leave empty for unclaimed"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-meetingLink">Meeting Link</Label>
              <Input
                id="edit-meetingLink"
                type="url"
                placeholder="https://..."
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                placeholder="Add any additional information..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={editShift.isPending}>
              {editShift.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
