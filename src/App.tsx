import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter, BrowserRouter } from 'react-router-dom';
import Router from '@/routes';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider, Toaster } from '@/components';
import { ThemeProvider } from '@/theme';
import { HelmetProvider } from 'react-helmet-async';

// Extend the Window interface to include 'electron'
declare global {
  interface Window {
    electron?: unknown;
  }
}

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 0,
      },
    },
  });

  // Check if running in Electron
  const isElectron = import.meta.env.VITE_IS_ELECTRON === 'true';
  const RouterComponent = isElectron ? HashRouter : BrowserRouter;

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <RouterComponent>
              <Router />
            </RouterComponent>
          </TooltipProvider>
        </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
