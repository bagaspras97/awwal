'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { useState } from 'react';
import { AttendanceProvider } from './contexts/AttendanceContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      },
    },
  }));

  return (
    <SessionProvider>
      <AttendanceProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </AttendanceProvider>
    </SessionProvider>
  );
}