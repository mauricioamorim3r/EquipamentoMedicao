import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Bell, Check, Trash2, AlertTriangle, Info, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SistemaNotificacao } from "@shared/schema";

interface NotificationPanelProps {
  unreadCount: number;
}

export default function NotificationPanel({ unreadCount }: NotificationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: notificacoes = [], isLoading } = useQuery({
    queryKey: ["/api/notificacoes"],
    queryFn: () => api.getNotificacoes(),
    enabled: isOpen,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => api.markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notificacoes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notificacoes/unread-count"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao marcar notificação como lida",
        variant: "destructive",
      });
    },
  });

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case "error": return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "success": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "info": default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPriorityBadgeVariant = (prioridade: string) => {
    switch (prioridade) {
      case "critica": return "destructive";
      case "alta": return "default";
      case "normal": return "secondary";
      case "baixa": return "outline";
      default: return "secondary";
    }
  };

  const getPriorityLabel = (prioridade: string) => {
    switch (prioridade) {
      case "critica": return "Crítica";
      case "alta": return "Alta";
      case "normal": return "Normal";
      case "baixa": return "Baixa";
      default: return prioridade;
    }
  };

  const getCategoryLabel = (categoria: string) => {
    switch (categoria) {
      case "calibracao": return "Calibração";
      case "equipamento": return "Equipamento";
      case "poco": return "Poço";
      case "valvula": return "Válvula";
      case "incerteza": return "Incerteza";
      case "sistema": return "Sistema";
      default: return categoria;
    }
  };

  const handleMarkAsRead = (notificacao: SistemaNotificacao) => {
    if (notificacao.status === "ativa") {
      markAsReadMutation.mutate(notificacao.id);
    }
  };

  const activeNotifications = notificacoes.filter((n: SistemaNotificacao) => n.status === "ativa");
  const readNotifications = notificacoes.filter((n: SistemaNotificacao) => n.status === "lida");

  const handleNotificationClick = () => {
    setLocation("/notificacoes");
  };

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="sm" 
        className="relative p-2"
        data-testid="notifications-button"
        onClick={handleNotificationClick}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center"
            data-testid="notification-count"
          >
            {unreadCount}
          </span>
        )}
      </Button>
      
      {/* Quick preview tooltip on hover - optional */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button 
            className="absolute inset-0 opacity-0"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            aria-label="Preview de notificações"
          />
        </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notificações</CardTitle>
              <Badge variant="secondary">
                {unreadCount} não lida{unreadCount !== 1 ? 's' : ''}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  Carregando notificações...
                </div>
              ) : notificacoes.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma notificação</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {/* Notificações Ativas */}
                  {activeNotifications.length > 0 && (
                    <>
                      <div className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50">
                        Não Lidas ({activeNotifications.length})
                      </div>
                      {activeNotifications.map((notificacao: SistemaNotificacao) => (
                        <div 
                          key={notificacao.id}
                          className="px-4 py-3 hover:bg-gray-50 border-l-4 border-l-blue-500 bg-blue-50"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {getNotificationIcon(notificacao.tipo)}
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {notificacao.titulo}
                                </h4>
                                <Badge 
                                  variant={getPriorityBadgeVariant(notificacao.prioridade)}
                                  className="text-xs"
                                >
                                  {getPriorityLabel(notificacao.prioridade)}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {notificacao.mensagem}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Badge variant="outline" className="text-xs">
                                  {getCategoryLabel(notificacao.categoria)}
                                </Badge>
                                <span>•</span>
                                <span>
                                  {notificacao.createdAt 
                                    ? new Date(notificacao.createdAt).toLocaleString('pt-BR')
                                    : 'Agora'
                                  }
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notificacao)}
                              disabled={markAsReadMutation.isPending}
                              className="ml-2 h-6 w-6 p-0"
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {/* Separador */}
                  {activeNotifications.length > 0 && readNotifications.length > 0 && (
                    <Separator />
                  )}

                  {/* Notificações Lidas */}
                  {readNotifications.length > 0 && (
                    <>
                      <div className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-50">
                        Lidas ({readNotifications.length})
                      </div>
                      {readNotifications.slice(0, 5).map((notificacao: SistemaNotificacao) => (
                        <div 
                          key={notificacao.id}
                          className="px-4 py-3 opacity-60"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {getNotificationIcon(notificacao.tipo)}
                                <h4 className="text-sm font-medium text-gray-700 truncate">
                                  {notificacao.titulo}
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  {getPriorityLabel(notificacao.prioridade)}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500 mb-2">
                                {notificacao.mensagem}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Badge variant="outline" className="text-xs opacity-60">
                                  {getCategoryLabel(notificacao.categoria)}
                                </Badge>
                                <span>•</span>
                                <span>
                                  {notificacao.dataLeitura 
                                    ? new Date(notificacao.dataLeitura).toLocaleString('pt-BR')
                                    : 'N/A'
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
    </div>
  );
}