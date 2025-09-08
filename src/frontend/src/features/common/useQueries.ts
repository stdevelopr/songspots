import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@dfinity/principal';
import type { UserProfile, Vibe } from '../../backend/backend.did';

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

export function useGetVibesByOwner(principalId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Vibe[]>({
    queryKey: ['vibesByOwner', principalId],
    queryFn: async () => {
      if (!actor || !principalId) return [];
      return actor.getVibesByOwner(Principal.fromText(principalId));
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

// Vibe queries
export function useGetAllVibes() {
  const { actor, isFetching } = useActor();

  return useQuery<Vibe[]>({
    queryKey: ['vibes'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVibes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetVibe(id: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Vibe | null>({
    queryKey: ['vibe', id.toString()],
    queryFn: async () => {
      if (!actor) return null;
      const vibeResult = await actor.getVibe(id);
      // The backend might return Vibe, null, undefined, [] or [Vibe].
      // We need to normalize it to Vibe | null.
      if (
        vibeResult === undefined ||
        vibeResult === null ||
        (Array.isArray(vibeResult) && vibeResult.length === 0)
      ) {
        return null;
      }
      if (Array.isArray(vibeResult)) {
        return vibeResult[0]; // Assuming it's [Vibe]
      }
      return vibeResult; // This handles the case where it's already Vibe
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateVibe() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      description,
      musicLink,
      latitude,
      longitude,
      isPrivate,
    }: {
      name: string;
      description: string;
      musicLink: string;
      latitude: string;
      longitude: string;
      isPrivate: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createVibe(name, description, musicLink, latitude, longitude, isPrivate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vibes'] });
      queryClient.invalidateQueries({ queryKey: ['vibesByOwner'] });
    },
  });
}

export function useUpdateVibe() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      description,
      musicLink,
      latitude,
      longitude,
      isPrivate,
    }: {
      id: bigint;
      name: string;
      description: string;
      musicLink: string;
      latitude: string;
      longitude: string;
      isPrivate: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateVibe(id, name, description, musicLink, latitude, longitude, isPrivate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vibes'] });
      queryClient.invalidateQueries({ queryKey: ['vibesByOwner'] });
    },
  });
}

export function useDeleteVibe() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteVibe(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vibes'] });
      queryClient.invalidateQueries({ queryKey: ['vibesByOwner'] });
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

// Legacy pin aliases for backward compatibility
export const useGetAllPins = useGetAllVibes;
export const useGetPin = useGetVibe;
export const useCreatePin = useCreateVibe;
export const useUpdatePin = useUpdateVibe;
export const useDeletePin = useDeleteVibe;
export const useGetPinsByOwner = useGetVibesByOwner;
