import ReactDOM from 'react-dom/client';
import { InternetIdentityProvider } from 'ic-use-internet-identity';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ResponsiveProvider } from './features/common/ResponsiveProvider';
import App from './App';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <InternetIdentityProvider
      loginOptions={{
        identityProvider:
          process.env.DFX_NETWORK === 'local'
            ? `http://umunu-kh777-77774-qaaca-cai.localhost:4943`
            : 'https://identity.ic0.app',
      }}
    >
      <ResponsiveProvider>
        <App />
      </ResponsiveProvider>
    </InternetIdentityProvider>
  </QueryClientProvider>
);
