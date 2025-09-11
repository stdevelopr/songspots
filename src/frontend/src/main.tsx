import ReactDOM from 'react-dom/client';
import { InternetIdentityProvider } from 'ic-use-internet-identity';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ResponsiveProvider } from './features/common';
import { ToastProvider } from './features/common';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { getInternetIdentityUrl } from '@common/constants/ii';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <InternetIdentityProvider
      loginOptions={{
        identityProvider: getInternetIdentityUrl(),
        // Internet Identity 2.0 features
        maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days in nanoseconds
        windowOpenerFeatures: "toolbar=0,location=0,menubar=0,width=500,height=500,left=100,top=100"
      }}
    >
      <ToastProvider>
        <ResponsiveProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ResponsiveProvider>
      </ToastProvider>
    </InternetIdentityProvider>
  </QueryClientProvider>
);
