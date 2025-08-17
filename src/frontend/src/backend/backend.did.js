export const idlFactory = ({ IDL }) => {
  const UserRole = IDL.Variant({
    'admin' : IDL.Null,
    'user' : IDL.Null,
    'guest' : IDL.Null,
  });
  const FileMetadata = IDL.Record({
    'path' : IDL.Text,
    'size' : IDL.Nat,
    'mimeType' : IDL.Text,
  });
  const Pin = IDL.Record({
    'id' : IDL.Nat,
    'latitude' : IDL.Text,
    'owner' : IDL.Principal,
    'name' : IDL.Text,
    'description' : IDL.Text,
    'isPrivate' : IDL.Bool,
    'longitude' : IDL.Text,
  });
  const ApprovalStatus = IDL.Variant({
    'pending' : IDL.Null,
    'approved' : IDL.Null,
    'rejected' : IDL.Null,
  });
  const UserProfile = IDL.Record({
    'name' : IDL.Text,
    'profilePicture' : IDL.Opt(IDL.Text),
  });
  const StreamingToken = IDL.Record({
    'resource' : IDL.Text,
    'index' : IDL.Nat,
  });
  const StreamingCallbackHttpResponse = IDL.Record({
    'token' : IDL.Opt(StreamingToken),
    'body' : IDL.Vec(IDL.Nat8),
  });
  const HeaderField = IDL.Tuple(IDL.Text, IDL.Text);
  const HttpRequest = IDL.Record({
    'url' : IDL.Text,
    'method' : IDL.Text,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
  });
  const StreamingCallback = IDL.Func(
      [StreamingToken],
      [StreamingCallbackHttpResponse],
      ['query'],
    );
  const StreamingStrategy = IDL.Variant({
    'Callback' : IDL.Record({
      'token' : StreamingToken,
      'callback' : StreamingCallback,
    }),
  });
  const HttpResponse = IDL.Record({
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
    'streaming_strategy' : IDL.Opt(StreamingStrategy),
    'status_code' : IDL.Nat16,
  });
  const UserInfo = IDL.Record({
    'principal' : IDL.Principal,
    'role' : UserRole,
    'approval' : ApprovalStatus,
  });
  return IDL.Service({
    'assignRole' : IDL.Func([IDL.Principal, UserRole], [], []),
    'createPin' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Bool],
        [],
        [],
      ),
    'deletePin' : IDL.Func([IDL.Nat], [], []),
    'fileDelete' : IDL.Func([IDL.Text], [], []),
    'fileList' : IDL.Func([], [IDL.Vec(FileMetadata)], ['query']),
    'fileUpload' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Vec(IDL.Nat8), IDL.Bool],
        [],
        [],
      ),
    'getAllPins' : IDL.Func([], [IDL.Vec(Pin)], ['query']),
    'getApprovalStatus' : IDL.Func(
        [IDL.Principal],
        [ApprovalStatus],
        ['query'],
      ),
    'getCurrentUserApprovalStatus' : IDL.Func([], [ApprovalStatus], ['query']),
    'getCurrentUserRole' : IDL.Func([], [UserRole], ['query']),
    'getPin' : IDL.Func([IDL.Nat], [IDL.Opt(Pin)], ['query']),
    'getPinsByOwner' : IDL.Func([IDL.Principal], [IDL.Vec(Pin)], ['query']),
    'getProfileByPrincipal' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(UserProfile)],
        ['query'],
      ),
    'getUserProfile' : IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
    'httpStreamingCallback' : IDL.Func(
        [StreamingToken],
        [StreamingCallbackHttpResponse],
        ['query'],
      ),
    'http_request' : IDL.Func([HttpRequest], [HttpResponse], ['query']),
    'initializeAuth' : IDL.Func([], [], []),
    'isCurrentUserAdmin' : IDL.Func([], [IDL.Bool], ['query']),
    'listUsers' : IDL.Func([], [IDL.Vec(UserInfo)], ['query']),
    'saveUserProfile' : IDL.Func([UserProfile], [], []),
    'setApproval' : IDL.Func([IDL.Principal, ApprovalStatus], [], []),
    'updatePin' : IDL.Func(
        [IDL.Nat, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Bool],
        [],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
