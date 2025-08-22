import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@dfinity/principal';
import type { UserProfile, Pin } from '../../backend/backend.did';

// User profile queries
export function useGetUserProfile() {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile'],
    queryFn: async () => {
      if (!actor) return null;
      const profileResult = await actor.getUserProfile();
      // The backend might return UserProfile, null, undefined, [] or [UserProfile].
      // We need to normalize it to UserProfile | null.
      if (
        profileResult === undefined ||
        profileResult === null ||
        (Array.isArray(profileResult) && profileResult.length === 0)
      ) {
        return null;
      }
      if (Array.isArray(profileResult)) {
        return profileResult[0]; // Assuming it's [UserProfile]
      }
      return profileResult; // This handles the case where it's already UserProfile
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUserProfileByPrincipal(principalId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', principalId],
    queryFn: async () => {
      if (!actor || !principalId) return null;

      try {
        const profileResult = await actor.getProfileByPrincipal(Principal.fromText(principalId));
        // The backend might return UserProfile, null, undefined, [] or [UserProfile].
        // We need to normalize it to UserProfile | null.
        if (
          profileResult === undefined ||
          profileResult === null ||
          (Array.isArray(profileResult) && profileResult.length === 0)
        ) {
          return null;
        }
        if (Array.isArray(profileResult)) {
          return profileResult[0]; // Assuming it's [UserProfile]
        }
        return profileResult; // This handles the case where it's already UserProfile
      } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!principalId,
  });
}

export function useGetPinsByOwner(principalId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Pin[]>({
    queryKey: ['pinsByOwner', principalId],
    queryFn: async () => {
      if (!actor || !principalId) return [];
      return actor.getPinsByOwner(Principal.fromText(principalId));
    },
    enabled: !!actor && !isFetching && !!principalId,
  });
}

export function useSaveUserProfile() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) {
        console.error('Actor not available for saving profile. Is user authenticated?');
        throw new Error('Actor not available');
      }
      try {
        const result = await actor.saveUserProfile(profile);
        return result;
      } catch (error) {
        console.error('Error saving user profile:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
}

// Admin check query
export function useIsCurrentUserAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCurrentUserAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCurrentUserAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// Pin queries
export function useGetAllPins() {
  const { actor, isFetching } = useActor();

  return useQuery<Pin[]>({
    queryKey: ['pins'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPins();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPin(id: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Pin | null>({
    queryKey: ['pin', id.toString()],
    queryFn: async () => {
      if (!actor) return null;
      const pinResult = await actor.getPin(id);
      // The backend might return Pin, null, undefined, [] or [Pin].
      // We need to normalize it to Pin | null.
      if (
        pinResult === undefined ||
        pinResult === null ||
        (Array.isArray(pinResult) && pinResult.length === 0)
      ) {
        return null;
      }
      if (Array.isArray(pinResult)) {
        return pinResult[0]; // Assuming it's [Pin]
      }
      return pinResult; // This handles the case where it's already Pin
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreatePin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      description,
      latitude,
      longitude,
      isPrivate,
    }: {
      name: string;
      description: string;
      latitude: string;
      longitude: string;
      isPrivate: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPin(name, description, latitude, longitude, isPrivate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pins'] });
      queryClient.invalidateQueries({ queryKey: ['pinsByOwner'] });
    },
  });
}

export function useUpdatePin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      description,
      latitude,
      longitude,
      isPrivate,
    }: {
      id: bigint;
      name: string;
      description: string;
      latitude: string;
      longitude: string;
      isPrivate: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePin(id, name, description, latitude, longitude, isPrivate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pins'] });
      queryClient.invalidateQueries({ queryKey: ['pinsByOwner'] });
    },
  });
}

export function useDeletePin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deletePin(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pins'] });
      queryClient.invalidateQueries({ queryKey: ['pinsByOwner'] });
    },
  });
}

// Legacy data queries (for backward compatibility)
export function useGetAllData() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['data'],
    queryFn: async () => {
      if (!actor) return [];
      // This would need to be implemented in the backend if needed
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, metadata }: { content: string; metadata: string }) => {
      if (!actor) throw new Error('Actor not available');
      // This would need to be implemented in the backend if needed
      throw new Error('createData not implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data'] });
    },
  });
}

export function useUpdateData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      content,
      metadata,
    }: {
      id: bigint;
      content: string;
      metadata: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      // This would need to be implemented in the backend if needed
      throw new Error('updateData not implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data'] });
    },
  });
}

export function useDeleteData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      // This would need to be implemented in the backend if needed
      throw new Error('deleteData not implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data'] });
    },
  });
}
