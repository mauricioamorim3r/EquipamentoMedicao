import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, CheckCircle, Search, Bell } from "lucide-react";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Notifications() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: notificacoes = [], isLoading, error } = useQuery({
    queryKey: ["/api/notificacoes"],
    queryFn: async () => {
      try {
        const response = await api.getNotificacoes();
        console.log("Notificações carregadas:", response);
        return response;
      } catch (err) {
        console.error("Erro ao carregar notificações:", err);
        throw err;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => api.markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notificacoes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notificacoes/unread-count"] });
      toast({
        title: "Sucesso",
        description: "Notificação marcada como lida",
      });
    },
    onError: (error) => {
      console.error("Erro ao marcar como lida:", error);
      toast({
        title: "Erro",
        description: "Erro ao marcar notificação como lida",
        variant: "destructive",
      });
    },
  });

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case "error": return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case "warning": return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "success": return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "info": default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getPriorityLabel = (prioridade: string) => {
    switch (prioridade) {
      case "alta": return "Alta";
      case "media": return "Média";
      case "baixa": return "Baixa";
      default: return "Normal";
    }
  };

  const getCategoryLabel = (categoria: string) => {
    switch (categoria) {
      case "calibracao": return "Calibração";
      case "equipamento": return "Equipamento";
      case "sistema": return "Sistema";
      case "manutencao": return "Manutenção";
      default: return "Geral";
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-4">Carregando notificações...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold mb-2">Erro ao carregar notificações</h2>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : 'Erro de conexão com o servidor'}
            </p>
            <Button onClick={() => window.location.reload()}>
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const filteredNotifications = notificacoes.filter((notificacao: any) => {
    const matchesSearch = !searchTerm ||
      notificacao.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notificacao.mensagem?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const activeNotifications = filteredNotifications.filter((n: any) => n.status === "ativa");
  const readNotifications = filteredNotifications.filter((n: any) => n.status === "lida");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground" data-testid="page-title">Notificações</h1>
          <p className="text-muted-foreground">
            Gerencie e acompanhe todas as suas notificações do sistema
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar notificações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{filteredNotifications.length}</p>
              </div>
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ativas</p>
                <p className="text-2xl font-bold text-blue-600">{activeNotifications.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lidas</p>
                <p className="text-2xl font-bold text-green-700">{readNotifications.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {/* Active Notifications */}
        {activeNotifications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notificações Ativas ({activeNotifications.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeNotifications.map((notificacao: any) => (
                <div key={notificacao.id} className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getNotificationIcon(notificacao.tipo)}
                        <h4 className="font-medium">{notificacao.titulo}</h4>
                        <Badge variant="outline">
                          {getPriorityLabel(notificacao.prioridade)}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-2">{notificacao.mensagem}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary">
                          {getCategoryLabel(notificacao.categoria)}
                        </Badge>
                        <span>•</span>
                        <span>
                          {notificacao.createdAt 
                            ? new Date(notificacao.createdAt).toLocaleString('pt-BR')
                            : 'Data não disponível'
                          }
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markAsReadMutation.mutate(notificacao.id)}
                      disabled={markAsReadMutation.isPending}
                    >
                      Marcar como Lida
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Read Notifications */}
        {readNotifications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Notificações Lidas ({readNotifications.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {readNotifications.slice(0, 10).map((notificacao: any) => (
                <div key={notificacao.id} className="border rounded-lg p-4 opacity-60">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getNotificationIcon(notificacao.tipo)}
                        <h4 className="font-medium">{notificacao.titulo}</h4>
                        <Badge variant="outline">
                          {getPriorityLabel(notificacao.prioridade)}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-2">{notificacao.mensagem}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary">
                          {getCategoryLabel(notificacao.categoria)}
                        </Badge>
                        <span>•</span>
                        <span>
                          Lida em: {notificacao.dataLeitura 
                            ? new Date(notificacao.dataLeitura).toLocaleString('pt-BR')
                            : 'N/A'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {filteredNotifications.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nenhuma notificação encontrada</h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? "Tente ajustar os filtros de busca."
                  : "Você não tem notificações no momento."
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}