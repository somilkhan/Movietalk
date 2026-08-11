import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function NetworkStatus() {
  const { isOnline, wasOffline } = useNetworkStatus();

  return (
    <>
      {/* Offline banner */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium transition-transform duration-300",
          isOnline ? "-translate-y-full" : "translate-y-0",
          "bg-red-600 text-white"
        )}
        role="alert"
        aria-live="polite"
      >
        <WifiOff className="w-4 h-4" />
        You are offline. Some features may not work.
      </div>

      {/* Back online toast */}
      <div
        className={cn(
          "fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-500",
          wasOffline ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4",
          "bg-green-600 text-white shadow-lg"
        )}
        role="status"
        aria-live="polite"
      >
        <Wifi className="w-4 h-4" />
        Back online
      </div>
    </>
  );
}
