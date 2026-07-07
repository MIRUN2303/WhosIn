import { supabase, checkConnection } from './supabase';
import toast from 'react-hot-toast';

type ConnectionListener = (connected: boolean) => void;

class ConnectionManager {
  private _connected = false;
  private _checking = false;
  private listeners: ConnectionListener[] = [];
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private toastShown = false;

  get connected() { return this._connected; }

  subscribe(listener: ConnectionListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l(this._connected));
  }

  async check(): Promise<boolean> {
    if (this._checking) return this._connected;
    this._checking = true;
    try {
      const ok = await checkConnection();
      const wasConnected = this._connected;
      this._connected = ok;

      if (ok && !wasConnected && !this.toastShown) {
        toast.success('Connected to WhosIn', {
          style: {
            background: 'rgba(34,212,91,0.12)',
            color: '#22d45b',
            border: '1px solid rgba(34,212,91,0.25)',
            borderRadius: '14px',
            backdropFilter: 'blur(16px)',
          },
          icon: '⚡',
          duration: 3000,
        });
        this.toastShown = false;
      }

      if (!ok && wasConnected) {
        toast.error('Connection lost — using offline mode', {
          style: {
            background: 'rgba(248,113,113,0.12)',
            color: '#f87171',
            border: '1px solid rgba(248,113,113,0.25)',
            borderRadius: '14px',
            backdropFilter: 'blur(16px)',
          },
          duration: 5000,
        });
        this.toastShown = true;
      }

      this.notify();
      return ok;
    } catch {
      this._connected = false;
      this.notify();
      return false;
    } finally {
      this._checking = false;
    }
  }

  startPolling(intervalMs = 30000) {
    this.check();
    this.retryTimer = setInterval(() => this.check(), intervalMs);
  }

  stopPolling() {
    if (this.retryTimer) {
      clearInterval(this.retryTimer);
      this.retryTimer = null;
    }
  }
}

export const connectionManager = new ConnectionManager();

// Hook for components
import { useState, useEffect } from 'react';

export function useConnection() {
  const [connected, setConnected] = useState(connectionManager.connected);

  useEffect(() => {
    const unsub = connectionManager.subscribe(setConnected);
    connectionManager.check();
    return unsub;
  }, []);

  return connected;
}
