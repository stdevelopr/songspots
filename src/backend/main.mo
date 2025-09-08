import MultiUserSystem "auth-multi-user/management";
import Map "mo:base/OrderedMap";
import Nat "mo:base/Nat";
import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import FileStorage "file-storage/file-storage";
import Http "file-storage/http";

persistent actor {
  // Initialize the multi-user system state
  let multiUserState = MultiUserSystem.initState();

  // Initialize auth (first caller becomes admin, others become users)
  public shared ({ caller }) func initializeAuth() : async () {
    MultiUserSystem.initializeAuth(multiUserState, caller);
  };

  public query ({ caller }) func getCurrentUserRole() : async MultiUserSystem.UserRole {
    MultiUserSystem.getUserRole(multiUserState, caller);
  };

  public query ({ caller }) func isCurrentUserAdmin() : async Bool {
    MultiUserSystem.isAdmin(multiUserState, caller);
  };

  // Requires admin privilege to execute
  public shared ({ caller }) func assignRole(user : Principal, newRole : MultiUserSystem.UserRole) : async () {
    MultiUserSystem.assignRole(multiUserState, caller, user, newRole);
  };

  // Requires admin privilege to execute
  public shared ({ caller }) func setApproval(user : Principal, approval : MultiUserSystem.ApprovalStatus) : async () {
    MultiUserSystem.setApproval(multiUserState, caller, user, approval);
  };

  public query ({ caller = _ }) func getApprovalStatus(user : Principal) : async MultiUserSystem.ApprovalStatus {
    MultiUserSystem.getApprovalStatus(multiUserState, user);
  };

  public query ({ caller }) func getCurrentUserApprovalStatus() : async MultiUserSystem.ApprovalStatus {
    MultiUserSystem.getApprovalStatus(multiUserState, caller);
  };

  // Requires admin privilege to execute
  public query ({ caller }) func listUsers() : async [MultiUserSystem.UserInfo] {
    MultiUserSystem.listUsers(multiUserState, caller);
  };

  // ** Application-specific user profile management **
  public type UserProfile = {
    bio : Text;
    name : Text;
    profilePicture : ?Text; // Keep as optional Text for simplicity
    // Social media links (all optional)
    socialMedia : {
      facebook : ?Text;
      instagram : ?Text;
      tiktok : ?Text;
      twitter : ?Text;
      website : ?Text;
      youtube : ?Text;
      spotify : ?Text;
      github : ?Text;
    };
    // Other user's metadata if needed
  };

  transient let principalMap = Map.Make<Principal>(Principal.compare);
  var userProfilesStable : [(Principal, UserProfile)] = [];
  transient var userProfiles = principalMap.empty<UserProfile>();

  public query ({ caller }) func getUserProfile() : async ?UserProfile {
    principalMap.get(userProfiles, caller);
  };

  public shared ({ caller }) func saveUserProfile(profile : UserProfile) : async () {
    if (not (MultiUserSystem.hasPermission(multiUserState, caller, #user, false))) {
      Debug.trap("Unauthorized: Only authenticated users can save profiles");
    };
    userProfiles := principalMap.put(userProfiles, caller, profile);
  };

  // New query to fetch a user's profile by principal
  public query func getProfileByPrincipal(principal : Principal) : async ?UserProfile {
    principalMap.get(userProfiles, principal);
  };

  // File storage for profile pictures
  var storage = FileStorage.new();

  public query func fileList() : async [FileStorage.FileMetadata] {
    FileStorage.list(storage);
  };

  public func fileUpload(path : Text, mimeType : Text, chunk : Blob, complete : Bool) : async () {
    FileStorage.upload(storage, path, mimeType, chunk, complete);
  };

  public func fileDelete(path : Text) : async () {
    FileStorage.delete(storage, path);
  };

  public query func http_request(request : Http.HttpRequest) : async Http.HttpResponse {
    FileStorage.fileRequest(storage, request, httpStreamingCallback);
  };

  public query func httpStreamingCallback(token : Http.StreamingToken) : async Http.StreamingCallbackHttpResponse {
    FileStorage.httpStreamingCallback(storage, token);
  };

  // ** Start of application specific logic, TODO: adapt to your needs **
  // This is an example to how to protect data creation, update and deletion

  type Vibe = {
    id : Nat;
    name : Text;
    description : Text;
    musicLink : Text;
    latitude : Text;
    longitude : Text;
    owner : Principal;
    isPrivate : Bool;
    mood : ?Text; // Optional mood field (energetic, chill, creative, etc.)
  };

  transient let vibeMap = Map.Make<Nat>(Nat.compare);
  var vibesStable : [(Nat, Vibe)] = [];
  var nextVibeIdStable : Nat = 0;
  transient var vibes : Map.Map<Nat, Vibe> = vibeMap.empty<Vibe>();
  transient var nextVibeId : Nat = 0;

  public shared ({ caller }) func createVibe(name : Text, description : Text, musicLink : Text, latitude : Text, longitude : Text, isPrivate : Bool, mood : ?Text) : async () {
    if (not (MultiUserSystem.hasPermission(multiUserState, caller, #user, false))) {
      Debug.trap("Unauthorized: Only authenticated users can create vibes");
    };
    let newVibe : Vibe = {
      id = nextVibeId;
      name;
      description;
      musicLink;
      latitude;
      longitude;
      owner = caller;
      isPrivate;
      mood;
    };
    vibes := vibeMap.put(vibes, nextVibeId, newVibe);
    nextVibeId += 1;
  };

  public shared ({ caller }) func updateVibe(id : Nat, name : Text, description : Text, musicLink : Text, latitude : Text, longitude : Text, isPrivate : Bool, mood : ?Text) : async () {
    if (not (MultiUserSystem.hasPermission(multiUserState, caller, #user, false))) {
      Debug.trap("Unauthorized: Only authenticated users can update vibes");
    };
    let updatedVibe : Vibe = {
      id;
      name;
      description;
      musicLink;
      latitude;
      longitude;
      owner = caller;
      isPrivate;
      mood;
    };
    vibes := vibeMap.put(vibes, id, updatedVibe);
  };

  public shared ({ caller }) func deleteVibe(id : Nat) : async () {
    if (not (MultiUserSystem.hasPermission(multiUserState, caller, #user, false))) {
      Debug.trap("Unauthorized: Only authenticated users can delete vibes");
    };
    switch (vibeMap.get(vibes, id)) {
      case null {
        Debug.trap("Vibe not found");
      };
      case (?vibe) {
        if (vibe.owner != caller) {
          Debug.trap("Unauthorized: Only the vibe owner can delete the vibe");
        };
        vibes := vibeMap.delete(vibes, id);
      };
    };
  };

  public query ({ caller }) func getVibe(id : Nat) : async ?Vibe {
    switch (vibeMap.get(vibes, id)) {
      case null { null };
      case (?vibe) {
        if (vibe.isPrivate and vibe.owner != caller) {
          null;
        } else {
          ?vibe;
        };
      };
    };
  };

  public query ({ caller }) func getAllVibes() : async [Vibe] {
    Iter.toArray(
      Iter.filter(
        vibeMap.vals(vibes),
        func(vibe : Vibe) : Bool {
          not vibe.isPrivate or vibe.owner == caller;
        },
      )
    );
  };

  public query ({ caller }) func getVibesByOwner(owner : Principal) : async [Vibe] {
    Iter.toArray(
      Iter.filter(
        vibeMap.vals(vibes),
        func(vibe : Vibe) : Bool {
          vibe.owner == owner and (not vibe.isPrivate or caller == owner);
        },
      )
    );
  };

  system func preupgrade() {
    userProfilesStable := Iter.toArray(principalMap.entries(userProfiles));
    vibesStable := Iter.toArray(vibeMap.entries(vibes));
    nextVibeIdStable := nextVibeId;
  };

  system func postupgrade() {
    userProfiles := principalMap.fromIter(userProfilesStable.vals());
    vibes := vibeMap.fromIter(vibesStable.vals());
    nextVibeId := nextVibeIdStable;
    
    // Clear stable arrays to save memory
    userProfilesStable := [];
    vibesStable := [];
  };
};
