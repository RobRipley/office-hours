import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface AdminSummary {
  'shiftStats' : ShiftStats,
  'associateSummaries' : Array<AssociateSummary>,
}
export interface AssociateSummary {
  'name' : string,
  'claimedShifts' : bigint,
}
export type Recurrence = { 'weekly' : null } |
  { 'biweekly' : null } |
  { 'monthly' : null };
export interface Shift {
  'id' : bigint,
  'startTime' : bigint,
  'endTime' : bigint,
  'recurrence' : [] | [Recurrence],
  'notes' : string,
  'meetingLink' : string,
  'hostName' : string,
}
export interface ShiftStats {
  'totalShifts' : bigint,
  'claimedShifts' : bigint,
  'unclaimedShifts' : bigint,
}
export interface TimeZone {
  'id' : string,
  'name' : string,
  'utcOffset' : bigint,
}
export interface UserProfile {
  'principal' : Principal,
  'name' : string,
  'homeTimeZone' : TimeZone,
}
export type UserRole = { 'admin' : null } |
  { 'user' : null } |
  { 'guest' : null };
export interface _SERVICE {
  '_initializeAccessControlWithSecret' : ActorMethod<[string], undefined>,
  'assignCallerUserRole' : ActorMethod<[Principal, UserRole], undefined>,
  'claimShift' : ActorMethod<[bigint, string], undefined>,
  'createShift' : ActorMethod<[bigint, bigint, [] | [Recurrence], string, string], bigint>,
  'deleteShift' : ActorMethod<[bigint], undefined>,
  'editIndividualInstance' : ActorMethod<[bigint, bigint, bigint, string, string], undefined>,
  'editShift' : ActorMethod<[bigint, bigint, bigint, string, string, string], undefined>,
  'getAdminSummary' : ActorMethod<[], AdminSummary>,
  'getCallerUserProfile' : ActorMethod<[], [] | [UserProfile]>,
  'getCallerUserRole' : ActorMethod<[], UserRole>,
  'getClaimQueue' : ActorMethod<[], Array<Shift>>,
  'getPublicShifts' : ActorMethod<[], Array<Shift>>,
  'getShifts' : ActorMethod<[], Array<Shift>>,
  'getUserProfile' : ActorMethod<[Principal], [] | [UserProfile]>,
  'isCallerAdmin' : ActorMethod<[], boolean>,
  'saveCallerUserProfile' : ActorMethod<[UserProfile], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
