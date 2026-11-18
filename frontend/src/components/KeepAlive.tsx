'use client';

import { useEffect } from 'react';

const PING_INTERVAL_MS = 4 * 60 * 1000; // Every 4 minutes
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

/**
 * KeepAlive: Silently pings the backend /health endpoint every 4 minutes
 * to prevent Render free-tier cold starts (50s+ spin-up delay).
 */
export const KeepAlive: React.FC = () => {
  useEffect(() => {
    const ping = async () => {
      try {
        await fetch(`${API_BASE}/health`, { method: 'GET', cache: 'no-store' });
      } catch {
        // Silent fail — backend may be briefly unreachable
      }
    };

    // Ping immediately on mount
    ping();

    // Then ping every 4 minutes
    const interval = setInterval(ping, PING_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return null; // No UI rendered
};
