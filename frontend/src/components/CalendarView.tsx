import { useState, useMemo } from 'react';
import { useGetShifts, useDeleteShift, useGetCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ChevronLeft, ChevronRight, Edit, Trash2, Loader2, Clock, Globe } from 'lucide-react';
import CreateShiftDialog from './CreateShiftDialog';
import EditShiftDialog from './EditShiftDialog';
import type { Shift } from '../backend';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { TIME_ZONES, type TimeZone, formatTimeInTimeZone, getDateInTimeZone, isSameDay } from '../lib/timeZones';

export default function CalendarView() {
  const { data: shifts = [], isLoading } = useGetShifts();
  const { data: userProfile } = useGetCallerUserProfile();
  const deleteShift = useDeleteShift();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<bigint | null>(null);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewTimeZone, setViewTimeZone] = useState<string>('');

  // Initialize view timezone from user profile
  useMemo(() => {
    if (userProfile?.homeTimeZone && !viewTimeZone) {
      setViewTimeZone(userProfile.homeTimeZone.id);
    }
  }, [userProfile, viewTimeZone]);

  const activeTimeZone = useMemo(() => {
    const tz = TIME_ZONES.find((t) => t.id === viewTimeZone);
    return tz || TIME_ZONES.find((t) => t.id === 'UTC')!;
  }, [viewTimeZone]);

  const handleEdit = (shift: Shift) => {
    setSelectedShift(shift);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (shiftId: bigint) => {
    setShiftToDelete(shiftId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (shiftToDelete === null) return;

    try {
      await deleteShift.mutateAsync(shiftToDelete);
      toast.success('Shift deleted successfully');
      setDeleteDialogOpen(false);
      setShiftToDelete(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete shift');
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: (Date | null)[] = [];

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [currentDate]);

  // Expand recurring shifts and group by day
  const shiftsByDay = useMemo(() => {
    const map = new Map<string, Shift[]>();
    const now = Date.now();
    const sixMonthsFromNow = now + 6 * 30 * 24 * 60 * 60 * 1000;

    shifts.forEach((shift) => {
      const instances: Shift[] = [];

      // Add the original shift
      instances.push(shift);

      // Generate recurring instances
      if (shift.recurrence) {
        const duration = Number(shift.endTime - shift.startTime);
        let instanceTime = Number(shift.startTime) / 1_000_000;

        const increment =
          shift.recurrence === 'weekly'
            ? 7 * 24 * 60 * 60 * 1000
            : shift.recurrence === 'biweekly'
            ? 14 * 24 * 60 * 60 * 1000
            : 30 * 24 * 60 * 60 * 1000;

        instanceTime += increment;

        while (instanceTime <= sixMonthsFromNow) {
          instances.push({
            ...shift,
            startTime: BigInt(instanceTime * 1_000_000),
            endTime: BigInt((instanceTime + duration / 1_000_000) * 1_000_000),
          });
          instanceTime += increment;
        }
      }

      // Group instances by day
      instances.forEach((instance) => {
        const date = getDateInTimeZone(instance.startTime, activeTimeZone);
        const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        if (!map.has(key)) {
          map.set(key, []);
        }
        map.get(key)!.push(instance);
      });
    });

    // Sort shifts within each day
    map.forEach((dayShifts) => {
      dayShifts.sort((a, b) => Number(a.startTime - b.startTime));
    });

    return map;
  }, [shifts, activeTimeZone]);

  const getShiftsForDay = (day: Date | null): Shift[] => {
    if (!day) return [];
    const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
    return shiftsByDay.get(key) || [];
  };

  const isToday = (day: Date | null): boolean => {
    if (!day) return false;
    const today = new Date();
    return isSameDay(day, today);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold">Schedule</h2>
          <p className="text-muted-foreground mt-1">Manage all office hour shifts</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Shift
        </Button>
      </div>

      {/* Time Zone Selector */}
      <Card className="mb-6 bg-white dark:bg-card">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <Globe className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <Label htmlFor="view-timezone" className="text-sm font-medium mb-1 block">
                Time Zone
              </Label>
              <Select value={viewTimeZone} onValueChange={setViewTimeZone}>
                <SelectTrigger id="view-timezone" className="w-full max-w-md">
                  <SelectValue placeholder="Select time zone" />
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
        </CardContent>
      </Card>

      {/* Calendar Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <h3 className="text-xl font-semibold ml-4">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
        </div>
        <Select value="month" disabled>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Calendar Grid */}
      <Card className="bg-white dark:bg-card rounded-lg overflow-hidden border">
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b bg-muted/30">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
              <div key={day} className="p-3 text-center font-medium text-sm border-r last:border-r-0">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const dayShifts = getShiftsForDay(day);
              const isTodayCell = isToday(day);

              return (
                <div
                  key={index}
                  className={`min-h-[140px] border-r border-b last:border-r-0 p-2 ${
                    !day ? 'bg-muted/20' : isTodayCell ? 'bg-blue-50 dark:bg-blue-950/20' : 'bg-white dark:bg-card'
                  }`}
                >
                  {day && (
                    <>
                      <div
                        className={`text-sm font-medium mb-2 ${
                          isTodayCell
                            ? 'inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {day.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayShifts.slice(0, 4).map((shift, idx) => (
                          <div
                            key={`${shift.id}-${idx}`}
                            className={`text-xs p-1.5 rounded transition-colors cursor-pointer border-l-2 ${
                              shift.hostName
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-900/50 border-green-600'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border-gray-400'
                            }`}
                            onClick={() => handleEdit(shift)}
                          >
                            <div className="font-semibold truncate">{shift.hostName || 'Unclaimed'}</div>
                            <div className="flex items-center gap-1 text-[11px] opacity-90">
                              <Clock className="w-3 h-3" />
                              {formatTimeInTimeZone(shift.startTime, activeTimeZone)}
                            </div>
                            {shift.notes && (
                              <div className="text-[11px] opacity-80 truncate mt-0.5">{shift.notes}</div>
                            )}
                          </div>
                        ))}
                        {dayShifts.length > 4 && (
                          <div className="text-xs text-muted-foreground pl-1">+{dayShifts.length - 4} more</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <CreateShiftDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      {selectedShift && (
        <EditShiftDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} shift={selectedShift} />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shift</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this shift? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
