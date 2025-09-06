import { useInternetIdentity } from 'ic-use-internet-identity';
import { createActor, canisterId } from '../../backend';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ActorSubclass, Identity } from '@dfinity/agent';
import { _SERVICE } from '../../backend/backend.did';
import { useEffect } from 'react';

const ACTOR_QUERY_KEY = 'actor';
export function useActor() {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const actorQuery = useQuery<ActorSubclass<_SERVICE>>({
    queryKey: [ACTOR_QUERY_KEY, identity?.getPrincipal().toString()],
    queryFn: async () => {
      console.log('Creating actor...', { isAuthenticated: !!identity });

      const isIC =
        process.env.DFX_NETWORK === 'ic' ||
        window.location.hostname.endsWith('.icp0.io') ||
        window.location.hostname.endsWith('.raw.icp0.io');

      const host = isIC ? window.location.origin : 'http://localhost:4943';

      if (!identity) {
        // Return anonymous actor if not authenticated
        console.log('Creating anonymous actor', canisterId);
        return await createActor(canisterId, {
          agentOptions: {
            // IC in prod: same-origin boundary; local dev: replica
            host,
          },
        });
      }

      console.log(
        'Creating authenticated actor with identity:',
        identity.getPrincipal().toString()
      );

      const actorOptions = {
        agentOptions: {
          // IC in prod: same-origin boundary; local dev: replica
          host,
          identity: identity as unknown as Identity,
        },
      };

      try {
        const actor = await createActor(canisterId, actorOptions);
        console.log('Actor created successfully, initializing auth...');
        await actor.initializeAuth();
        console.log('Auth initialized successfully');
        
        // Test authentication by calling a simple authenticated method
        try {
          await actor.getCurrentUserRole();
          console.log('Authentication verification successful');
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
          console.log('Authentication/signature error detected - clearing invalid authentication state');
          try {
            await clear();
            console.log('Authentication state cleared successfully');
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
