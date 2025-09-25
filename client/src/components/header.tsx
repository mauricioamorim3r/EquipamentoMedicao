import { useState, useEffect } from "react";
import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationCount] = useState(12);

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
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-foreground" data-testid="page-title">
            Dashboard Metrológico
          </h1>
          <div className="text-sm text-muted-foreground">
            <span data-testid="current-date">{formatDate(currentTime)}</span> • 
            <span data-testid="current-time" className="ml-1">{formatTime(currentTime)}</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {/* Notification Bell */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="relative p-2"
            data-testid="notifications-button"
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span 
                className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center"
                data-testid="notification-count"
              >
                {notificationCount}
              </span>
            )}
          </Button>
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
