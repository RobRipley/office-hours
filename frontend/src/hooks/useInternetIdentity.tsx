import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Identity } from '@dfinity/agent';

type LoginStatus = 'idle' | 'logging-in' | 'logged-in' | 'error';

interface InternetIdentityContextType {
  identity: Identity | null;
  loginStatus: LoginStatus;
  login: () => Promise<void>;
  clear: () => Promise<void>;
}

const InternetIdentityContext = createContext<InternetIdentityContextType | null>(null);

const II_URL = process.env.II_URL || 
  (process.env.DFX_NETWORK === 'local' 
    ? 'http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943'
    : 'https://identity.internetcomputer.org');

export function InternetIdentityProvider({ children }: { children: ReactNode }) {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [loginStatus, setLoginStatus] = useState<LoginStatus>('idle');

  useEffect(() => {
    AuthClient.create().then(async (client) => {
      setAuthClient(client);
      if (await client.isAuthenticated()) {
        const id = client.getIdentity();
        if (id.getPrincipal().isAnonymous() === false) {
          setIdentity(id);
          setLoginStatus('logged-in');
        }
      }
    });
  }, []);

  const login = useCallback(async () => {
    if (!authClient) return;
    setLoginStatus('logging-in');
    
    try {
      await new Promise<void>((resolve, reject) => {
        authClient.login({
          identityProvider: II_URL,
          onSuccess: () => {
            const id = authClient.getIdentity();
            setIdentity(id);
            setLoginStatus('logged-in');
            resolve();
          },
          onError: (error) => {
            setLoginStatus('error');
            reject(new Error(error));
          },
        });
      });
    } catch (error) {
      setLoginStatus('error');
      throw error;
    }
  }, [authClient]);

  const clear = useCallback(async () => {
    if (!authClient) return;
    await authClient.logout();
    setIdentity(null);
    setLoginStatus('idle');
  }, [authClient]);

  return (
    <InternetIdentityContext.Provider value={{ identity, loginStatus, login, clear }}>
      {children}
    </InternetIdentityContext.Provider>
  );
}

export function useInternetIdentity() {
  const context = useContext(InternetIdentityContext);
  if (!context) {
    throw new Error('useInternetIdentity must be used within InternetIdentityProvider');
  }
  return context;
}
