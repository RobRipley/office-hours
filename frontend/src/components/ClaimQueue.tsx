import { useState, useMemo } from 'react';
import { useGetClaimQueue, useClaimShift, useGetCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { TIME_ZONES, formatDateTimeInTimeZone } from '../lib/timeZones';

export default function ClaimQueue() {
  const { data: queue = [], isLoading } = useGetClaimQueue();
  const { data: userProfile } = useGetCallerUserProfile();
  const claimShift = useClaimShift();
  const [claimNames, setClaimNames] = useState<Record<string, string>>({});

  const activeTimeZone = useMemo(() => {
    if (userProfile?.homeTimeZone) {
      const tz = TIME_ZONES.find((t) => t.id === userProfile.homeTimeZone.id);
      if (tz) return tz;
    }
    return TIME_ZONES.find((t) => t.id === 'UTC')!;
  }, [userProfile]);

  const handleClaim = async (shiftId: bigint) => {
    const name = claimNames[shiftId.toString()]?.trim();
    if (!name) {
      toast.error('Please enter your name');
      return;
    }

    try {
      await claimShift.mutateAsync({ shiftId, hostName: name });
      toast.success('Shift claimed successfully!');
      setClaimNames((prev) => {
        const updated = { ...prev };
        delete updated[shiftId.toString()];
        return updated;
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to claim shift');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold">Claim Queue</h2>
        <p className="text-muted-foreground mt-1">Unclaimed shifts in the next 6 weeks</p>
      </div>

      {queue.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No unclaimed shifts available at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Date & Time</TableHead>
                  <TableHead className="w-[35%]">Name</TableHead>
                  <TableHead className="w-[25%]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queue.map((shift) => (
                  <TableRow key={shift.id.toString()}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          {formatDateTimeInTimeZone(shift.startTime, activeTimeZone)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Enter your name"
                        value={claimNames[shift.id.toString()] || ''}
                        onChange={(e) =>
                          setClaimNames((prev) => ({
                            ...prev,
                            [shift.id.toString()]: e.target.value,
                          }))
                        }
                        disabled={claimShift.isPending}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleClaim(shift.id)}
                        disabled={claimShift.isPending || !claimNames[shift.id.toString()]?.trim()}
                        size="sm"
                      >
                        {claimShift.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Claim'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
