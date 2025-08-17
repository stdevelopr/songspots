import React from 'react';
import { useInternetIdentity } from 'ic-use-internet-identity';
import { useState } from 'react';

export function LoginButton() {
    const { login, clear, identity } = useInternetIdentity();
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // Identity might be present even if loginStatus is idle, since is saved in local storage
    const isAuthenticated = !!identity;
    const disabled = isLoggingIn;

    // Determine button text based on both the loginStatus and identity presence
    const text = isLoggingIn ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login';

    const handleAuth = async () => {
        if (isAuthenticated) {
            await clear();
        } else {
            setIsLoggingIn(true);
            try {
                await login();
            } catch (error: any) {
                console.error('Login error:', error);
                // If we get "already authenticated" but the UI doesn't show it,
                // it's a state inconsistency - clear and try again
                if (error.message === 'User is already authenticated') {
                    await clear();
                    setTimeout(() => {
                        login();
                    }, 300);
                }
            } finally {
                setIsLoggingIn(false);
            }
        }
    };

    return (
        <button
            onClick={handleAuth}
            disabled={disabled}
            className={`px-4 py-1.5 rounded-full transition-colors text-sm font-medium ${
                isAuthenticated
                    ? 'bg-white bg-opacity-20 hover:bg-opacity-30 text-white backdrop-blur-sm'
                    : 'bg-white bg-opacity-90 hover:bg-white text-purple-700 hover:text-purple-800'
            } disabled:opacity-50`}
        >
            {text}
        </button>
    );
}

export default LoginButton;
