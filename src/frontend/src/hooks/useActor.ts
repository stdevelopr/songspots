import { useInternetIdentity } from 'ic-use-internet-identity';
import { createActor, canisterId } from '../backend';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ActorSubclass, Identity } from '@dfinity/agent';
import { _SERVICE } from '../backend/backend.did';
import { useEffect } from 'react';

const ACTOR_QUERY_KEY = 'actor';
export function useActor() {
    const { identity } = useInternetIdentity();
    const queryClient = useQueryClient();

    const actorQuery = useQuery<ActorSubclass<_SERVICE>>({
        queryKey: [ACTOR_QUERY_KEY, identity?.getPrincipal().toString()],
        queryFn: async () => {
            console.log('Creating actor...', { isAuthenticated: !!identity });
            
            if (!identity) {
                // Return anonymous actor if not authenticated
                console.log('Creating anonymous actor', canisterId);
                return await createActor(canisterId);
            }

            console.log('Creating authenticated actor with identity:', identity.getPrincipal().toString());
            
            const actorOptions = {
                agentOptions: {
                    identity: identity as unknown as Identity
                }
            };

            try {
                const actor = await createActor(canisterId, actorOptions);
                console.log('Actor created successfully, initializing auth...');
                await actor.initializeAuth();
                console.log('Auth initialized successfully');
                return actor;
            } catch (error) {
                console.error('Error creating authenticated actor:', error);
                throw error;
            }
        },
        // Only refetch when identity changes
        staleTime: Infinity,
        // This will cause the actor to be recreated when the identity changes
        enabled: true,
        retry: 3,
        retryDelay: 1000
    });

    // When the actor changes, invalidate dependent queries
    useEffect(() => {
        if (actorQuery.data) {
            queryClient.invalidateQueries({
                predicate: (query) => {
                    return !query.queryKey.includes(ACTOR_QUERY_KEY);
                }
            });
            queryClient.refetchQueries({
                predicate: (query) => {
                    return !query.queryKey.includes(ACTOR_QUERY_KEY);
                }
            });
        }
    }, [actorQuery.data, queryClient]);

    return {
        actor: actorQuery.data || null,
        isFetching: actorQuery.isFetching,
        isError: actorQuery.isError,
        error: actorQuery.error,
        isAuthenticated: !!identity
    };
}
