import { useState } from 'react';
import { useActor } from '../hooks/useActor';
import { useQueryClient } from '@tanstack/react-query';
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
import { Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function PassphraseModal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [passphrase, setPassphrase] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passphrase.trim()) {
      toast.error('Please enter the passphrase');
      return;
    }

    if (!actor) {
      toast.error('Actor not available');
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the backend to verify passphrase and grant access
      await actor._initializeAccessControlWithSecret(passphrase.trim());
      
      // Invalidate queries to refresh user role
      queryClient.invalidateQueries({ queryKey: ['currentUserRole'] });
      toast.success('Access granted!');
    } catch (error: any) {
      toast.error('Invalid passphrase. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Access Required
            </DialogTitle>
            <DialogDescription>
              Please enter the team passphrase to access the scheduling system.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="passphrase">Passphrase</Label>
              <Input
                id="passphrase"
                type="password"
                placeholder="Enter passphrase"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                autoFocus
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || !passphrase.trim()}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
