import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  Calendar,
  Bell,
  X,
  ExternalLink,
  Filter,
  Download,
  Settings,
  FileText
} from "lucide-react";
import { api } from "@/lib/api";
import { useLocation } from "wouter";
import { format, differenceInDays, parseISO, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

interface CertificateAlert {
  id: number;
  type: 'placa_orificio' | 'equipamento' | 'calibracao';
  item: string;
  numeroSerie?: string;
  vencimento: string;
  diasRestantes: number;
  status: 'vencido' | 'critico' | 'atencao' | 'normal';
  responsavel?: string;
  observacoes?: string;
}

export default function CertificateAlertsMonitor() {
  const [, setLocation] = useLocation();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showDismissed, setShowDismissed] = useState(false);

  // Buscar dados das placas de orifício
  const { data: placas, isLoading: placasLoading } = useQuery({
    queryKey: ["/api/placas-orificio"],
    queryFn: () => api.getPlacasOrificio(),
  });

  // Buscar dados dos equipamentos
  const { data: equipamentos, isLoading: equipamentosLoading } = useQuery({
    queryKey: ["/api/equipamentos"],
    queryFn: () => api.getEquipamentos(),
  });

  // Processar alertas de certificados
  const processarAlertas = (): CertificateAlert[] => {
    const alertas: CertificateAlert[] = [];
    const hoje = new Date();

    // Processar placas de orifício
    if (placas) {
      placas.forEach((placa: any) => {
        // Simular data de vencimento baseada na data de instalação + 1 ano
        if (placa.dataInstalacao) {
          const vencimento = addDays(new Date(placa.dataInstalacao), 365);
          const diasRestantes = differenceInDays(vencimento, hoje);
          
          let status: CertificateAlert['status'] = 'normal';
          if (diasRestantes < 0) status = 'vencido';
          else if (diasRestantes <= 7) status = 'critico';
          else if (diasRestantes <= 30) status = 'atencao';

          if (status !== 'normal') {
            alertas.push({
              id: placa.id,
              type: 'placa_orificio',
              item: `Placa ${placa.numeroSerie}`,
              numeroSerie: placa.numeroSerie,
              vencimento: format(vencimento, 'dd/MM/yyyy'),
              diasRestantes,
              status,
              observacoes: placa.observacao || 'Certificado de calibração'
            });
          }
        }
      });
    }

    // Processar equipamentos com datas de aquisição antigas (simular vencimento)
    if (equipamentos) {
      equipamentos.forEach((equip: any) => {
        if (equip.dataAquisicao) {
          const vencimento = addDays(new Date(equip.dataAquisicao), 730); // 2 anos
          const diasRestantes = differenceInDays(vencimento, hoje);
          
          let status: CertificateAlert['status'] = 'normal';
          if (diasRestantes < 0) status = 'vencido';
          else if (diasRestantes <= 30) status = 'critico';
          else if (diasRestantes <= 90) status = 'atencao';

          if (status !== 'normal') {
            alertas.push({
              id: equip.id,
              type: 'equipamento',
              item: `Equipamento ${equip.tag}`,
              numeroSerie: equip.numeroSerie,
              vencimento: format(vencimento, 'dd/MM/yyyy'),
              diasRestantes,
              status,
              observacoes: 'Manutenção preventiva programada'
            });
          }
        }
      });
    }

    return alertas.sort((a, b) => a.diasRestantes - b.diasRestantes);
  };

  const alertas = processarAlertas();
  
  // Filtrar alertas
  const alertasFiltrados = alertas.filter(alerta => {
    if (filterStatus === 'all') return true;
    return alerta.status === filterStatus;
  });

  // Estatísticas dos alertas
  const stats = {
    total: alertas.length,
    vencidos: alertas.filter(a => a.status === 'vencido').length,
    criticos: alertas.filter(a => a.status === 'critico').length,
    atencao: alertas.filter(a => a.status === 'atencao').length,
  };

  const getStatusIcon = (status: CertificateAlert['status']) => {
    switch (status) {
      case 'vencido': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'critico': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'atencao': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getStatusBadge = (status: CertificateAlert['status']) => {
    switch (status) {
      case 'vencido': return <Badge variant="destructive">Vencido</Badge>;
      case 'critico': return <Badge className="bg-orange-500 text-white">Crítico</Badge>;
      case 'atencao': return <Badge className="bg-yellow-500 text-white">Atenção</Badge>;
      default: return <Badge variant="secondary">Normal</Badge>;
    }
  };

  const getProgressColor = (diasRestantes: number) => {
    if (diasRestantes < 0) return "bg-red-500";
    if (diasRestantes <= 7) return "bg-orange-500";
    if (diasRestantes <= 30) return "bg-yellow-500";
    return "bg-green-500";
  };

  if (placasLoading || equipamentosLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Monitor de Certificados</h1>
          <p className="text-gray-600">Alertas de vencimento e renovação</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <Bell className="w-4 h-4 mr-2" />
            Configurar Alertas
          </Button>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total de Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <Badge variant="outline" className="mt-1">
              {stats.total > 0 ? 'Requer atenção' : 'Tudo ok'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Vencidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.vencidos}</div>
            <div className="flex items-center text-sm text-red-600 mt-1">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Ação imediata
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Críticos (≤ 7 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.criticos}</div>
            <div className="flex items-center text-sm text-orange-600 mt-1">
              <AlertCircle className="w-4 h-4 mr-1" />
              Urgente
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Atenção (≤ 30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.atencao}</div>
            <div className="flex items-center text-sm text-yellow-600 mt-1">
              <Clock className="w-4 h-4 mr-1" />
              Programar
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <Button
          variant={filterStatus === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterStatus('all')}
        >
          Todos ({stats.total})
        </Button>
        <Button
          variant={filterStatus === 'vencido' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterStatus('vencido')}
        >
          Vencidos ({stats.vencidos})
        </Button>
        <Button
          variant={filterStatus === 'critico' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterStatus('critico')}
        >
          Críticos ({stats.criticos})
        </Button>
        <Button
          variant={filterStatus === 'atencao' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterStatus('atencao')}
        >
          Atenção ({stats.atencao})
        </Button>
      </div>

      {/* Lista de alertas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Alertas Ativos ({alertasFiltrados.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alertasFiltrados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
              <p>Nenhum alerta para o filtro selecionado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alertasFiltrados.map((alerta) => (
                <Alert key={`${alerta.type}-${alerta.id}`} className="relative">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(alerta.status)}
                      <div className="flex-1">
                        <AlertTitle className="flex items-center gap-2">
                          {alerta.item}
                          {getStatusBadge(alerta.status)}
                        </AlertTitle>
                        <AlertDescription className="mt-2 space-y-2">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Vencimento: </span>
                              {alerta.vencimento}
                            </div>
                            <div>
                              <span className="font-medium">Dias restantes: </span>
                              <span className={`font-bold ${
                                alerta.diasRestantes < 0 ? 'text-red-600' :
                                alerta.diasRestantes <= 7 ? 'text-orange-600' :
                                alerta.diasRestantes <= 30 ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {alerta.diasRestantes < 0 
                                  ? `${Math.abs(alerta.diasRestantes)} dias em atraso`
                                  : `${alerta.diasRestantes} dias`
                                }
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">Série: </span>
                              {alerta.numeroSerie}
                            </div>
                          </div>
                          {alerta.observacoes && (
                            <div className="text-sm text-gray-600 mt-2">
                              <span className="font-medium">Observações: </span>
                              {alerta.observacoes}
                            </div>
                          )}
                          
                          {/* Barra de progresso visual */}
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Tempo até vencimento</span>
                              <span>{alerta.diasRestantes < 0 ? 'VENCIDO' : `${alerta.diasRestantes} dias`}</span>
                            </div>
                            <Progress 
                              value={Math.max(0, Math.min(100, (alerta.diasRestantes / 365) * 100))} 
                              className="h-2"
                            />
                          </div>
                        </AlertDescription>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (alerta.type === 'placa_orificio') {
                            setLocation('/orifice-plates');
                          } else if (alerta.type === 'equipamento') {
                            setLocation('/equipment');
                          }
                        }}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Ver Item
                      </Button>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}