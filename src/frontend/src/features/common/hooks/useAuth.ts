import { useState, useEffect, useCallback } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { getInternetIdentityUrl } from '@common/constants/ii';
import { Identity } from '@dfinity/agent';

export interface AuthState {
  isAuthenticated: boolean;
  identity: Identity | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

// Implementation hook used by AuthProvider. Consumers should use the context hook.
export function useAuth(): AuthState {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const client = await AuthClient.create({
          idleOptions: {
            disableIdle: process.env.DFX_NETWORK !== 'ic',
          },
        });

        setAuthClient(client);

        if (await client.isAuthenticated()) {
          const identity = client.getIdentity();
          setIdentity(identity);
        }
      } catch (error) {
        console.error('Failed to initialize auth client:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async () => {
    if (!authClient) return;

    setIsLoading(true);

    try {
      const internetIdentityUrl = getInternetIdentityUrl();

      await authClient.login({
        identityProvider: internetIdentityUrl,
        onSuccess: () => {
          const identity = authClient.getIdentity();
          setIdentity(identity);
          setIsLoading(false);
        },
        onError: (error) => {
          console.error('Login failed:', error);
          setIsLoading(false);
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
    }
  }, [authClient]);

  const logout = useCallback(async () => {
    if (!authClient) return;

    await authClient.logout();
    setIdentity(null);
  }, [authClient]);

  return {
    isAuthenticated: !!identity,
    identity,
    isLoading,
    login,
    logout,
  };
}
