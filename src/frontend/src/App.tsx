import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import Layout from './components/Layout';
import CustomersPage from './pages/CustomersPage';
import CustomerLedgerPage from './pages/CustomerLedgerPage';

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: CustomersPage,
});

const customerLedgerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/customer/$customerId',
  component: CustomerLedgerPage,
});

const routeTree = rootRoute.addChildren([indexRoute, customerLedgerRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
