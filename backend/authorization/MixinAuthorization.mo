import AccessControl "./access-control";

mixin(accessControlState : AccessControl.AccessControlState) {
  // Initialize auth with passphrase
  // - "charleshoskinson" (first time only) → admin
  // - "XRPto$10k" → regular user
  // - anything else → blocked (stays guest)
  public shared ({ caller }) func _initializeAccessControlWithSecret(userSecret : Text) : async () {
    AccessControl.initialize(accessControlState, caller, userSecret);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    // Admin-only check happens inside
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };
};
