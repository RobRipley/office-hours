// Type definitions for backend canister
// These mirror the Motoko types and will be replaced by dfx-generated types

import { Principal } from '@dfinity/principal';

export interface TimeZone {
  id: string;
  name: string;
  utcOffset: bigint;
}

export interface UserProfile {
  principal: Principal;
  name: string;
  homeTimeZone: TimeZone;
}

export type Recurrence = 'weekly' | 'biweekly' | 'monthly';

export interface Shift {
  id: bigint;
  startTime: bigint;
  endTime: bigint;
  recurrence: Recurrence | null;
  notes: string;
  meetingLink: string;
  hostName: string;
}

export type UserRole = 'admin' | 'user' | 'guest';

export interface ShiftStats {
  totalShifts: bigint;
  claimedShifts: bigint;
  unclaimedShifts: bigint;
}

export interface AssociateSummary {
  name: string;
  claimedShifts: bigint;
}

export interface AdminSummary {
  shiftStats: ShiftStats;
  associateSummaries: AssociateSummary[];
}
