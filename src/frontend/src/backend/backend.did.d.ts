import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type ApprovalStatus = { 'pending' : null } |
  { 'approved' : null } |
  { 'rejected' : null };
export interface FileMetadata {
  'path' : string,
  'size' : bigint,
  'mimeType' : string,
}
export type HeaderField = [string, string];
export interface HttpRequest {
  'url' : string,
  'method' : string,
  'body' : Uint8Array | number[],
  'headers' : Array<HeaderField>,
}
export interface HttpResponse {
  'body' : Uint8Array | number[],
  'headers' : Array<HeaderField>,
  'streaming_strategy' : [] | [StreamingStrategy],
  'status_code' : number,
}
export type StreamingCallback = ActorMethod<
  [StreamingToken],
  StreamingCallbackHttpResponse
>;
export interface StreamingCallbackHttpResponse {
  'token' : [] | [StreamingToken],
  'body' : Uint8Array | number[],
}
export type StreamingStrategy = {
    'Callback' : { 'token' : StreamingToken, 'callback' : StreamingCallback }
  };
export interface StreamingToken { 'resource' : string, 'index' : bigint }
export interface UserInfo {
  'principal' : Principal,
  'role' : UserRole,
  'approval' : ApprovalStatus,
}
export interface UserProfile {
  'bio' : string,
  'name' : string,
  'profilePicture' : [] | [string],
  'socialMedia' : {
    'tiktok' : [] | [string],
    'twitter' : [] | [string],
    'instagram' : [] | [string],
    'website' : [] | [string],
    'facebook' : [] | [string],
    'spotify' : [] | [string],
    'youtube' : [] | [string],
    'github' : [] | [string],
  },
}
export type UserRole = { 'admin' : null } |
  { 'user' : null } |
  { 'guest' : null };
export interface Vibe {
  'id' : bigint,
  'latitude' : string,
  'owner' : Principal,
  'mood' : [] | [string],
  'name' : string,
  'description' : string,
  'isPrivate' : boolean,
  'longitude' : string,
  'address' : string,
  'musicLink' : string,
}
export interface _SERVICE {
  'assignRole' : ActorMethod<[Principal, UserRole], undefined>,
  'createVibe' : ActorMethod<
    [string, string, string, string, string, boolean, [] | [string]],
    undefined
  >,
  'createVibeWithAddress' : ActorMethod<
    [string, string, string, string, string, string, boolean, [] | [string]],
    undefined
  >,
  'deleteVibe' : ActorMethod<[bigint], undefined>,
  'fileDelete' : ActorMethod<[string], undefined>,
  'fileList' : ActorMethod<[], Array<FileMetadata>>,
  'fileUpload' : ActorMethod<
    [string, string, Uint8Array | number[], boolean],
    undefined
  >,
  'getAllVibes' : ActorMethod<[], Array<Vibe>>,
  'getApprovalStatus' : ActorMethod<[Principal], ApprovalStatus>,
  'getCurrentUserApprovalStatus' : ActorMethod<[], ApprovalStatus>,
  'getCurrentUserRole' : ActorMethod<[], UserRole>,
  'getProfileByPrincipal' : ActorMethod<[Principal], [] | [UserProfile]>,
  'getUserProfile' : ActorMethod<[], [] | [UserProfile]>,
  'getVibe' : ActorMethod<[bigint], [] | [Vibe]>,
  'getVibesByOwner' : ActorMethod<[Principal], Array<Vibe>>,
  'httpStreamingCallback' : ActorMethod<
    [StreamingToken],
    StreamingCallbackHttpResponse
  >,
  'http_request' : ActorMethod<[HttpRequest], HttpResponse>,
  'initializeAuth' : ActorMethod<[], undefined>,
  'isCurrentUserAdmin' : ActorMethod<[], boolean>,
  'listUsers' : ActorMethod<[], Array<UserInfo>>,
  'saveUserProfile' : ActorMethod<[UserProfile], undefined>,
  'setApproval' : ActorMethod<[Principal, ApprovalStatus], undefined>,
  'updateVibe' : ActorMethod<
    [
      bigint,
      string,
      string,
      string,
      string,
      string,
      boolean,
      [] | [string],
    ],
    undefined
  >,
  'updateVibeWithAddress' : ActorMethod<
    [
      bigint,
      string,
      string,
      string,
      string,
      string,
      string,
      boolean,
      [] | [string],
    ],
    undefined
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
