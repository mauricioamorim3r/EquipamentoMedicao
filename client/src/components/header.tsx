import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import NotificationPanel from "@/components/notification-panel";
import { LanguageSelector } from "@/components/language-selector";
import { useTranslation } from "@/hooks/useLanguage";

export default function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { t } = useTranslation();
  
  // Query para buscar o número de notificações não lidas
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["/api/notificacoes/unread-count"],
    queryFn: () => api.getUnreadNotificationsCount(),
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <header className="bg-card border-b border-border p-4" data-testid="header">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 md:space-x-4 flex-1 min-w-0">
          <h1 className="text-lg md:text-xl font-semibold text-foreground truncate" data-testid="page-title">
            <span className="hidden sm:inline">{t('metrologyDashboard')}</span>
            <span className="sm:hidden">{t('systemName')}</span>
          </h1>
          <div className="text-xs md:text-sm text-muted-foreground hidden xs:block">
            <span data-testid="current-date" className="hidden md:inline">{formatDate(currentTime)}</span>
            <span className="md:hidden">{formatTime(currentTime)}</span>
            <span className="hidden md:inline"> • </span>
            <span data-testid="current-time" className="hidden md:inline ml-1">{formatTime(currentTime)}</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {/* Notification Panel */}
          <NotificationPanel unreadCount={unreadCount} />
          {/* Language Selector */}
          <LanguageSelector />
          {/* Settings */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2"
            data-testid="settings-button"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
