'use client';

import { useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';

export function SocketProvider({ children }: { children: React.ReactNode }) {
  useSocket();
  return <>{children}</>;
}
