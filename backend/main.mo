import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import VarArray "mo:core/VarArray";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  type TimeZone = {
    id : Text;
    name : Text;
    utcOffset : Int;
  };

  public type Recurrence = {
    #weekly;
    #biweekly;
    #monthly;
  };

  type Shift = {
    id : Nat;
    startTime : Time.Time;
    endTime : Time.Time;
    recurrence : ?Recurrence;
    notes : Text;
    meetingLink : Text;
    hostName : Text;
  };

  module Shift {
    public func compare(shift1 : Shift, shift2 : Shift) : Order.Order {
      Int.compare(shift1.startTime, shift2.startTime);
    };
  };

  type ModifiedShift = {
    originalShiftId : Nat;
    modifiedShift : Shift;
  };

  public type UserProfile = {
    principal : Principal;
    name : Text;
    homeTimeZone : TimeZone;
  };

  module UserProfile {
    public func compare(userProfile1 : UserProfile, userProfile2 : UserProfile) : Order.Order {
      Text.compare(userProfile1.name, userProfile2.name);
    };
  };

  type ShiftStats = {
    totalShifts : Nat;
    claimedShifts : Nat;
    unclaimedShifts : Nat;
  };

  type AssociateSummary = {
    name : Text;
    claimedShifts : Nat;
  };

  type AdminSummary = {
    shiftStats : ShiftStats;
    associateSummaries : [AssociateSummary];
  };

  let shifts = Map.empty<Nat, Shift>();
  let modifiedShifts = Map.empty<Nat, ModifiedShift>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let accessControlState = AccessControl.initState();

  include MixinAuthorization(accessControlState);

  var nextShiftId = 0;

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createShift(startTime : Time.Time, endTime : Time.Time, recurrence : ?Recurrence, notes : Text, meetingLink : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create shifts");
    };
    let shiftId = nextShiftId;
    let newShift : Shift = {
      id = shiftId;
      startTime;
      endTime;
      recurrence;
      notes;
      meetingLink;
      hostName = "";
    };
    shifts.add(shiftId, newShift);
    nextShiftId += 1;
    shiftId;
  };

  public shared ({ caller }) func editShift(shiftId : Nat, startTime : Time.Time, endTime : Time.Time, notes : Text, meetingLink : Text, hostName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can edit shifts");
    };
    switch (shifts.get(shiftId)) {
      case (null) { Runtime.trap("Shift not found") };
      case (?shift) {
        let updatedShift : Shift = {
          id = shift.id;
          startTime;
          endTime;
          recurrence = shift.recurrence;
          notes;
          meetingLink;
          hostName;
        };
        shifts.add(shiftId, updatedShift);
      };
    };
  };

  public shared ({ caller }) func deleteShift(shiftId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete shifts");
    };
    if (not shifts.containsKey(shiftId)) {
      Runtime.trap("Shift not found");
    };
    shifts.remove(shiftId);
  };

  public shared ({ caller }) func editIndividualInstance(shiftId : Nat, startTime : Time.Time, endTime : Time.Time, notes : Text, meetingLink : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can edit shift instances");
    };
    switch (shifts.get(shiftId)) {
      case (null) { Runtime.trap("Shift not found") };
      case (?shift) {
        let modifiedShift : Shift = {
          id = shift.id;
          startTime;
          endTime;
          recurrence = shift.recurrence;
          notes;
          meetingLink;
          hostName = shift.hostName;
        };
        let newModifiedShift : ModifiedShift = {
          originalShiftId = shiftId;
          modifiedShift;
        };
        modifiedShifts.add(shiftId, newModifiedShift);
      };
    };
  };

  public shared ({ caller }) func claimShift(shiftId : Nat, hostName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can claim shifts");
    };
    switch (shifts.get(shiftId)) {
      case (null) { Runtime.trap("Shift not found") };
      case (?existingShift) {
        if (existingShift.hostName != "") {
          Runtime.trap("Shift already claimed");
        };
        let updatedShift : Shift = {
          id = existingShift.id;
          startTime = existingShift.startTime;
          endTime = existingShift.endTime;
          recurrence = existingShift.recurrence;
          notes = existingShift.notes;
          meetingLink = existingShift.meetingLink;
          hostName;
        };
        shifts.add(shiftId, updatedShift);
      };
    };
  };

  public query ({ caller }) func getShifts() : async [Shift] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view full calendar");
    };
    shifts.values().toArray().sort();
  };

  public query ({ caller }) func getClaimQueue() : async [Shift] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view claim queue");
    };
    let now = Time.now();
    let sixWeeksFromNow = now + (6 * 7 * 24 * 60 * 60 * 1_000_000_000);

    let unclaimedShifts = List.empty<Shift>();

    shifts.values().forEach(
      func(shift) {
        if (shift.hostName == "" and shift.startTime > now and shift.startTime <= sixWeeksFromNow) {
          unclaimedShifts.add(shift);
        };

        // Handle recurring instances - only add if unclaimed
        switch (shift.recurrence) {
          case (null) {};
          case (?recurrence) {
            if (shift.hostName == "") {
              var instanceTime = shift.startTime;
              while (instanceTime <= sixWeeksFromNow) {
                if (instanceTime > now) {
                  let instance : Shift = {
                    id = shift.id;
                    startTime = instanceTime;
                    endTime = instanceTime + (shift.endTime - shift.startTime);
                    recurrence = shift.recurrence;
                    notes = shift.notes;
                    meetingLink = shift.meetingLink;
                    hostName = shift.hostName;
                  };
                  unclaimedShifts.add(instance);
                };
                instanceTime += switch (recurrence) {
                  case (#weekly) { 7 * 24 * 60 * 60 * 1_000_000_000 };
                  case (#biweekly) { 14 * 24 * 60 * 60 * 1_000_000_000 };
                  case (#monthly) { 30 * 24 * 60 * 60 * 1_000_000_000 };
                };
              };
            };
          };
        };
      }
    );

    func quickSort(varArray : [var Shift], low : Int, high : Int) {
      if (low < high) {
        let pivotIndex = partition(varArray, low, high);
        if (low < pivotIndex - 1) {
          quickSort(varArray, low, pivotIndex - 1);
        };
        if (pivotIndex + 1 < high) {
          quickSort(varArray, pivotIndex + 1, high);
        };
      };
    };

    func partition(varArray : [var Shift], low : Int, high : Int) : Int {
      let pivot = varArray[high.toNat()];
      var i = low - 1;

      for (j in Nat.range(low.toNat(), (high + 1).toNat())) {
        if (Shift.compare(varArray[j], pivot) == #less) {
          i += 1;
          let temp = varArray[j];
          varArray[j] := varArray[i.toNat()];
          varArray[i.toNat()] := temp;
        };
      };

      let temp = varArray[high.toNat()];
      varArray[high.toNat()] := varArray[(i + 1).toNat()];
      varArray[(i + 1).toNat()] := temp;

      i + 1;
    };

    let result = unclaimedShifts.toArray();
    let size = result.size();
    if (size > 1) {
      let varResult = VarArray.tabulate<Shift>(size, func(i) { result[i] });
      quickSort(varResult, 0, (size - 1).toInt());
      varResult.toArray();
    } else {
      result;
    };
  };

  public query func getPublicShifts() : async [Shift] {
    let now = Time.now();
    let upcomingShifts = List.empty<Shift>();

    shifts.values().forEach(
      func(shift) {
        if (shift.hostName != "" and shift.startTime > now) {
          upcomingShifts.add(shift);
        };
      }
    );

    func quickSort(varArray : [var Shift], low : Int, high : Int) {
      if (low < high) {
        let pivotIndex = partition(varArray, low, high);
        if (low < pivotIndex - 1) {
          quickSort(varArray, low, pivotIndex - 1);
        };
        if (pivotIndex + 1 < high) {
          quickSort(varArray, pivotIndex + 1, high);
        };
      };
    };

    func partition(varArray : [var Shift], low : Int, high : Int) : Int {
      let pivot = varArray[high.toNat()];
      var i = low - 1;

      for (j in Nat.range(low.toNat(), (high + 1).toNat())) {
        if (Shift.compare(varArray[j], pivot) == #less) {
          i += 1;
          let temp = varArray[j];
          varArray[j] := varArray[i.toNat()];
          varArray[i.toNat()] := temp;
        };
      };

      let temp = varArray[high.toNat()];
      varArray[high.toNat()] := varArray[(i + 1).toNat()];
      varArray[(i + 1).toNat()] := temp;

      i + 1;
    };

    let result = upcomingShifts.toArray();
    let size = result.size();
    if (size > 1) {
      let varResult = VarArray.tabulate<Shift>(size, func(i) { result[i] });
      quickSort(varResult, 0, (size - 1).toInt());
      varResult.toArray();
    } else {
      result;
    };
  };

  public query ({ caller }) func getAdminSummary() : async AdminSummary {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can access admin summary");
    };

    let now = Time.now();
    let sixWeeksFromNow = now + (6 * 7 * 24 * 60 * 60 * 1_000_000_000);

    var claimedShifts = 0;
    var totalShifts = 0;

    // Calculate shift stats
    shifts.values().forEach(
      func(shift) {
        if (shift.startTime > now and shift.startTime <= sixWeeksFromNow) {
          totalShifts += 1;
          if (shift.hostName != "") {
            claimedShifts += 1;
          };
        };

        // Handle recurring instances
        switch (shift.recurrence) {
          case (null) {};
          case (?recurrence) {
            var instanceTime = shift.startTime;
            while (instanceTime <= sixWeeksFromNow) {
              if (instanceTime > now) {
                totalShifts += 1;
                if (shift.hostName != "") {
                  claimedShifts += 1;
                };
              };
              instanceTime += switch (recurrence) {
                case (#weekly) { 7 * 24 * 60 * 60 * 1_000_000_000 };
                case (#biweekly) { 14 * 24 * 60 * 60 * 1_000_000_000 };
                case (#monthly) { 30 * 24 * 60 * 60 * 1_000_000_000 };
              };
            };
          };
        };
      }
    );

    // Calculate associate summaries
    let associateSummaries = List.empty<AssociateSummary>();
    userProfiles.values().forEach(
      func(user) {
        var userClaimedCount = 0;

        shifts.values().forEach(
          func(shift) {
            if (shift.startTime > now and shift.startTime <= sixWeeksFromNow) {
              if (shift.hostName == user.name) {
                userClaimedCount += 1;
              };
            };

            // Handle recurring instances
            switch (shift.recurrence) {
              case (null) {};
              case (?recurrence) {
                var instanceTime = shift.startTime;
                while (instanceTime <= sixWeeksFromNow) {
                  if (instanceTime > now and shift.hostName == user.name) {
                    userClaimedCount += 1;
                  };
                  instanceTime += switch (recurrence) {
                    case (#weekly) { 7 * 24 * 60 * 60 * 1_000_000_000 };
                    case (#biweekly) { 14 * 24 * 60 * 60 * 1_000_000_000 };
                    case (#monthly) { 30 * 24 * 60 * 60 * 1_000_000_000 };
                  };
                };
              };
            };
          }
        );

        if (userClaimedCount > 0) {
          let associateSummary : AssociateSummary = {
            name = user.name;
            claimedShifts = userClaimedCount;
          };
          associateSummaries.add(associateSummary);
        };
      }
    );

    let shiftStats : ShiftStats = {
      totalShifts;
      claimedShifts;
      unclaimedShifts = totalShifts - claimedShifts;
    };

    {
      shiftStats;
      associateSummaries = associateSummaries.toArray();
    };
  };
};
