import { useEffect, useState } from 'react';
import { WifiOff, Wifi, CloudOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePWA } from '@/hooks/usePWA';

export function OfflineIndicator() {
  const { isOnline } = usePWA();
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [justWentOnline, setJustWentOnline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowOfflineBanner(true);
      setJustWentOnline(false);
    } else if (showOfflineBanner) {
      // Acabou de voltar online
      setJustWentOnline(true);
      setShowOfflineBanner(false);

      // Remove mensagem de "online" após 3 segundos
      const timer = setTimeout(() => {
        setJustWentOnline(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOnline, showOfflineBanner]);

  // Indica offline persistente
  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-destructive text-destructive-foreground px-4 py-2 flex items-center justify-center gap-2 z-50 animate-in slide-in-from-top">
        <WifiOff className="w-4 h-4" />
        <span className="text-sm font-medium">Você está offline</span>
        <CloudOff className="w-4 h-4" />
      </div>
    );
  }

  // Mensagem temporária quando volta online
  if (justWentOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-green-500 text-white px-4 py-2 flex items-center justify-center gap-2 z-50 animate-in slide-in-from-top">
        <Wifi className="w-4 h-4" />
        <span className="text-sm font-medium">Você está online novamente</span>
      </div>
    );
  }

  return null;
}

// Mini badge no header (alternativa mais sutil)
export function OnlineStatusBadge() {
  const { isOnline } = usePWA();

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all',
        isOnline
          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
          : 'bg-red-500/10 text-red-600 dark:text-red-400'
      )}
      title={isOnline ? 'Online' : 'Offline'}
    >
      <div
        className={cn(
          'w-2 h-2 rounded-full',
          isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'
        )}
      />
      <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
    </div>
  );
}
