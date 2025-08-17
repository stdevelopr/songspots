import ReactDOM from 'react-dom/client';
import { InternetIdentityProvider } from 'ic-use-internet-identity';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <InternetIdentityProvider
      loginOptions={{
        identityProvider:
          process.env.DFX_NETWORK === 'local'
            ? `http://uzt4z-lp777-77774-qaabq-cai.localhost:4943`
            : 'https://identity.ic0.app',
      }}
    >
      <App />
    </InternetIdentityProvider>
  </QueryClientProvider>
);
