import { useInternetIdentity } from 'ic-use-internet-identity';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ActorSubclass, Identity } from '@dfinity/agent';
import { createActor, canisterId } from '@backend';
import { _SERVICE } from '@backend/backend.did';
import { useEffect } from 'react';

const ACTOR_QUERY_KEY = 'actor';
export function useActor() {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const actorQuery = useQuery<ActorSubclass<_SERVICE>>({
    queryKey: [ACTOR_QUERY_KEY, identity?.getPrincipal().toString()],
    queryFn: async () => {
      // cleaned logs

      const isIC =
        process.env.DFX_NETWORK === 'ic' ||
        window.location.hostname.endsWith('.icp0.io') ||
        window.location.hostname.endsWith('.raw.icp0.io');

      const host = isIC ? window.location.origin : 'http://localhost:4943';

      if (!identity) {
        // Return anonymous actor if not authenticated
        // cleaned logs
        return await createActor(canisterId, {
          agentOptions: {
            // IC in prod: same-origin boundary; local dev: replica
            host,
          },
        });
      }

      // cleaned logs

      const actorOptions = {
        agentOptions: {
          // IC in prod: same-origin boundary; local dev: replica
          host,
          identity: identity as unknown as Identity,
        },
      };

      try {
        const actor = await createActor(canisterId, actorOptions);
        // cleaned logs
        await actor.initializeAuth();
        // cleaned logs
        
        // Test authentication by calling a simple authenticated method
        try {
          await actor.getCurrentUserRole();
          // cleaned logs
        } catch (authError) {
          console.error('Authentication verification failed:', authError);
          // Clear identity and force re-login
          throw new Error('Authentication failed - please log in again');
        }
        
        return actor;
      } catch (error) {
        console.error('Error creating authenticated actor:', error);
        
        // Check for signature verification failures or other auth errors
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isAuthError = errorMessage.includes('Authentication failed') ||
                           errorMessage.includes('Invalid signature') ||
                           errorMessage.includes('verification failed') ||
                           errorMessage.includes('EcdsaP256 signature could not be verified');
        
        if (isAuthError) {
          // cleaned logs
          try {
            await clear();
            // cleaned logs
          } catch (clearError) {
            console.error('Failed to clear authentication:', clearError);
          }
          // Throw a user-friendly error
          throw new Error('Authentication expired - please log in again');
        }
        throw error;
      }
    },
    // Only refetch when identity changes
    staleTime: Infinity,
    // This will cause the actor to be recreated when the identity changes
    enabled: true,
    retry: (failureCount, error) => {
      // Don't retry if authentication failed - user needs to re-login
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Authentication expired') || 
          errorMessage.includes('Authentication failed')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000,
  });

  // When the actor changes, invalidate dependent queries
  useEffect(() => {
    if (actorQuery.data) {
      queryClient.invalidateQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        },
      });
      queryClient.refetchQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        },
      });
    }
  }, [actorQuery.data, queryClient]);

  return {
    actor: actorQuery.data || null,
    isFetching: actorQuery.isFetching,
    isError: actorQuery.isError,
    error: actorQuery.error,
    isAuthenticated: !!identity,
  };
}
