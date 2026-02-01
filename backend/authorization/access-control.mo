import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

module {
  public type UserRole = {
    #admin;
    #user;
    #guest;
  };

  public type AccessControlState = {
    var adminAssigned : Bool;
    userRoles : Map.Map<Principal, UserRole>;
  };

  public func initState() : AccessControlState {
    {
      var adminAssigned = false;
      userRoles = Map.empty<Principal, UserRole>();
    };
  };

  // Passphrases
  let adminToken = "charleshoskinson";
  let userToken = "XRPto$10k";

  // Initialize with passphrase check
  // - Admin passphrase (first time only) → admin
  // - User passphrase → user
  // - Wrong passphrase → stays guest (blocked)
  public func initialize(state : AccessControlState, caller : Principal, userProvidedToken : Text) {
    if (caller.isAnonymous()) { return };
    switch (state.userRoles.get(caller)) {
      case (?_) {}; // Already registered, do nothing
      case (null) {
        if (not state.adminAssigned and userProvidedToken == adminToken) {
          // First admin
          state.userRoles.add(caller, #admin);
          state.adminAssigned := true;
        } else if (userProvidedToken == userToken) {
          // Valid user passphrase
          state.userRoles.add(caller, #user);
        };
        // Wrong passphrase = not added = stays guest (blocked)
      };
    };
  };

  public func getUserRole(state : AccessControlState, caller : Principal) : UserRole {
    if (caller.isAnonymous()) { return #guest };
    switch (state.userRoles.get(caller)) {
      case (?role) { role };
      case (null) { #guest }; // Not registered = guest
    };
  };

  public func assignRole(state : AccessControlState, caller : Principal, user : Principal, role : UserRole) {
    if (not (isAdmin(state, caller))) {
      Runtime.trap("Unauthorized: Only admins can assign user roles");
    };
    state.userRoles.add(user, role);
  };

  public func hasPermission(state : AccessControlState, caller : Principal, requiredRole : UserRole) : Bool {
    let userRole = getUserRole(state, caller);
    if (userRole == #admin or requiredRole == #guest) { true } else { userRole == requiredRole };
  };

  public func isAdmin(state : AccessControlState, caller : Principal) : Bool {
    getUserRole(state, caller) == #admin;
  };
};
