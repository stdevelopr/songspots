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
export interface Pin {
  'id' : bigint,
  'latitude' : string,
  'owner' : Principal,
  'name' : string,
  'description' : string,
  'isPrivate' : boolean,
  'longitude' : string,
  'musicLink' : string,
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
  'name' : string,
  'profilePicture' : [] | [string],
}
export type UserRole = { 'admin' : null } |
  { 'user' : null } |
  { 'guest' : null };
export interface _SERVICE {
  'assignRole' : ActorMethod<[Principal, UserRole], undefined>,
  'createPin' : ActorMethod<
    [string, string, string, string, string, boolean],
    undefined
  >,
  'deletePin' : ActorMethod<[bigint], undefined>,
  'fileDelete' : ActorMethod<[string], undefined>,
  'fileList' : ActorMethod<[], Array<FileMetadata>>,
  'fileUpload' : ActorMethod<
    [string, string, Uint8Array | number[], boolean],
    undefined
  >,
  'getAllPins' : ActorMethod<[], Array<Pin>>,
  'getApprovalStatus' : ActorMethod<[Principal], ApprovalStatus>,
  'getCurrentUserApprovalStatus' : ActorMethod<[], ApprovalStatus>,
  'getCurrentUserRole' : ActorMethod<[], UserRole>,
  'getPin' : ActorMethod<[bigint], [] | [Pin]>,
  'getPinsByOwner' : ActorMethod<[Principal], Array<Pin>>,
  'getProfileByPrincipal' : ActorMethod<[Principal], [] | [UserProfile]>,
  'getUserProfile' : ActorMethod<[], [] | [UserProfile]>,
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
  'updatePin' : ActorMethod<
    [bigint, string, string, string, string, string, boolean],
    undefined
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
