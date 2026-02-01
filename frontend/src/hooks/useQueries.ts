import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, Shift, UserRole, Recurrence, AdminSummary } from '../backend';
import { Principal } from '@dfinity/principal';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserRole>({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Shift Queries
export function useGetShifts() {
  const { actor, isFetching } = useActor();

  return useQuery<Shift[]>({
    queryKey: ['shifts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getShifts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPublicShifts() {
  const { actor, isFetching } = useActor();

  return useQuery<Shift[]>({
    queryKey: ['publicShifts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPublicShifts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetClaimQueue() {
  const { actor, isFetching } = useActor();

  return useQuery<Shift[]>({
    queryKey: ['claimQueue'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getClaimQueue();
    },
    enabled: !!actor && !isFetching,
  });
}

// Shift Mutations
export function useCreateShift() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      startTime,
      endTime,
      recurrence,
      notes,
      meetingLink,
    }: {
      startTime: bigint;
      endTime: bigint;
      recurrence: Recurrence | null;
      notes: string;
      meetingLink: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createShift(startTime, endTime, recurrence, notes, meetingLink);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      queryClient.invalidateQueries({ queryKey: ['claimQueue'] });
      queryClient.invalidateQueries({ queryKey: ['publicShifts'] });
      queryClient.invalidateQueries({ queryKey: ['adminSummary'] });
    },
  });
}

export function useEditShift() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      shiftId,
      startTime,
      endTime,
      notes,
      meetingLink,
      hostName,
    }: {
      shiftId: bigint;
      startTime: bigint;
      endTime: bigint;
      notes: string;
      meetingLink: string;
      hostName: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editShift(shiftId, startTime, endTime, notes, meetingLink, hostName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      queryClient.invalidateQueries({ queryKey: ['claimQueue'] });
      queryClient.invalidateQueries({ queryKey: ['publicShifts'] });
      queryClient.invalidateQueries({ queryKey: ['adminSummary'] });
    },
  });
}

export function useDeleteShift() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shiftId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteShift(shiftId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      queryClient.invalidateQueries({ queryKey: ['claimQueue'] });
      queryClient.invalidateQueries({ queryKey: ['publicShifts'] });
      queryClient.invalidateQueries({ queryKey: ['adminSummary'] });
    },
  });
}

export function useClaimShift() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ shiftId, hostName }: { shiftId: bigint; hostName: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.claimShift(shiftId, hostName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      queryClient.invalidateQueries({ queryKey: ['claimQueue'] });
      queryClient.invalidateQueries({ queryKey: ['publicShifts'] });
      queryClient.invalidateQueries({ queryKey: ['adminSummary'] });
    },
  });
}

// Admin Queries
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAdminSummary() {
  const { actor, isFetching } = useActor();

  return useQuery<AdminSummary>({
    queryKey: ['adminSummary'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAdminSummary();
    },
    enabled: !!actor && !isFetching,
  });
}
