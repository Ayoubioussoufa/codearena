'use client';
/**
 * One QueryClient for the app, plus Devtools in development.
 *
 * Open the Devtools panel while you navigate: watching queries go
 * fresh → stale → fetching is the fastest way to build the mental model.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { HttpError } from '../http';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // useState, not a module-level const: in Next.js a module-level client would
  // be shared across requests on the server and leak one user's data to another.
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Server state goes stale on its own schedule. A minute is long
            // enough that navigating away and back is a cache hit, short
            // enough that data does not feel frozen.
            staleTime: 60_000,
            retry: (failureCount, error) => {
              // Retrying a 401/403/404 is pointless — the answer will not
              // change. Only retry what might be transient.
              if (error instanceof HttpError && error.status < 500) return false;
              return failureCount < 2;
            },
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
