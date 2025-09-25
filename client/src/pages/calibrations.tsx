import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CalendarDays, Clock, AlertCircle, CheckCircle, XCircle, Plus, Filter, Download, Upload } from "lucide-react";
import { api } from "@/lib/api";
import CalibrationCalendar from "@/components/calibration-calendar";
import type { CalibrationStats } from "@/types";

export default function Calibrations() {
  const [activeTab, setActiveTab] = useState("calendar");
  const [selectedPolo, setSelectedPolo] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const { data: calibrationStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/calibracoes/stats"],
    queryFn: api.getCalibrationStats,
  });

  const { data: calibracoes, isLoading: calibrationLoading } = useQuery({
    queryKey: ["/api/calibracoes"],
    queryFn: () => api.getCalibracoes(),
  });

  const { data: equipamentos } = useQuery({
    queryKey: ["/api/equipamentos/with-calibration"],
    queryFn: api.getEquipamentosWithCalibration,
  });

  const { data: polos } = useQuery({
    queryKey: ["/api/polos"],
    queryFn: api.getPolos,
  });

  const getStatusData = (stats: CalibrationStats) => [
    {
      title: "OK (> 90 dias)",
      count: stats.ok,
      percentage: stats.total > 0 ? ((stats.ok / stats.total) * 100).toFixed(1) : "0",
      color: "text-green-600",
      bgColor: "bg-green-100",
      icon: CheckCircle,
    },
    {
      title: "Próximo (31-90 dias)", 
      count: stats.alert,
      percentage: stats.total > 0 ? ((stats.alert / stats.total) * 100).toFixed(1) : "0",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      icon: CalendarDays,
    },
    {
      title: "Alerta (8-30 dias)",
      count: stats.alert,
      percentage: stats.total > 0 ? ((stats.alert / stats.total) * 100).toFixed(1) : "0",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100", 
      icon: Clock,
    },
    {
      title: "Crítico (1-7 dias)",
      count: stats.critical,
      percentage: stats.total > 0 ? ((stats.critical / stats.total) * 100).toFixed(1) : "0",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      icon: AlertCircle,
    },
    {
      title: "Vencido",
      count: stats.expired,
      percentage: stats.total > 0 ? ((stats.expired / stats.total) * 100).toFixed(1) : "0",
      color: "text-red-600",
      bgColor: "bg-red-100",
      icon: XCircle,
    },
  ];

  const filteredEquipments = equipamentos?.filter((eq: any) => {
    const matchesPolo = !selectedPolo || eq.poloId.toString() === selectedPolo;
    const matchesStatus = !selectedStatus || (
      selectedStatus === 'vencido' ? (eq.diasParaVencer !== undefined && eq.diasParaVencer <= 0) :
      selectedStatus === 'critico' ? (eq.diasParaVencer !== undefined && eq.diasParaVencer > 0 && eq.diasParaVencer <= 7) :
      selectedStatus === 'alerta' ? (eq.diasParaVencer !== undefined && eq.diasParaVencer > 7 && eq.diasParaVencer <= 30) :
      selectedStatus === 'proximo' ? (eq.diasParaVencer !== undefined && eq.diasParaVencer > 30 && eq.diasParaVencer <= 90) :
      selectedStatus === 'ok' ? (eq.diasParaVencer !== undefined && eq.diasParaVencer > 90) : true
    );
    return matchesPolo && matchesStatus;
  }) || [];

  const getEquipmentStatusBadge = (diasParaVencer?: number) => {
    if (!diasParaVencer && diasParaVencer !== 0) {
      return { text: 'Sem dados', className: 'bg-gray-100 text-gray-800' };
    }
    if (diasParaVencer <= 0) {
      return { text: 'Vencido', className: 'bg-red-100 text-red-800' };
    }
    if (diasParaVencer <= 7) {
      return { text: 'Crítico', className: 'bg-orange-100 text-orange-800' };
    }
    if (diasParaVencer <= 30) {
      return { text: 'Alerta', className: 'bg-yellow-100 text-yellow-800' };
    }
    if (diasParaVencer <= 90) {
      return { text: 'Próximo', className: 'bg-blue-100 text-blue-800' };
    }
    return { text: 'OK', className: 'bg-green-100 text-green-800' };
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground" data-testid="page-title">
            Controle de Calibrações
          </h1>
          <p className="text-muted-foreground">
            Monitoramento e gestão de prazos de calibração
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" data-testid="button-upload-certificate">
            <Upload className="w-4 h-4 mr-2" />
            Upload Certificado
          </Button>
          <Button data-testid="button-schedule-calibration">
            <Plus className="w-4 h-4 mr-2" />
            Agendar Calibração
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {getStatusData(calibrationStats || {} as CalibrationStats).map((status, index) => (
            <Card key={index} data-testid={`status-card-${index}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className={`w-10 h-10 ${status.bgColor} rounded-lg flex items-center justify-center mb-2`}>
                      <status.icon className={`w-5 h-5 ${status.color}`} />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{status.count}</p>
                    <p className="text-xs text-muted-foreground">{status.title}</p>
                    <p className="text-xs font-medium text-foreground">{status.percentage}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar" data-testid="tab-calendar">
            <Calendar className="w-4 h-4 mr-2" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="list" data-testid="tab-list">
            <CalendarDays className="w-4 h-4 mr-2" />
            Lista
          </TabsTrigger>
          <TabsTrigger value="reports" data-testid="tab-reports">
            <Download className="w-4 h-4 mr-2" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Calendário de Calibrações</CardTitle>
            </CardHeader>
            <CardContent>
              <CalibrationCalendar equipamentos={equipamentos || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={selectedPolo} onValueChange={setSelectedPolo}>
                  <SelectTrigger data-testid="filter-polo">
                    <SelectValue placeholder="Todos os Polos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os Polos</SelectItem>
                    {polos?.map((polo: any) => (
                      <SelectItem key={polo.id} value={polo.id.toString()}>
                        {polo.sigla} - {polo.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger data-testid="filter-status">
                    <SelectValue placeholder="Todos os Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os Status</SelectItem>
                    <SelectItem value="vencido">Vencido</SelectItem>
                    <SelectItem value="critico">Crítico (1-7 dias)</SelectItem>
                    <SelectItem value="alerta">Alerta (8-30 dias)</SelectItem>
                    <SelectItem value="proximo">Próximo (31-90 dias)</SelectItem>
                    <SelectItem value="ok">OK ({'>'} 90 dias)</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Mais Filtros
                </Button>

                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Equipment List */}
          <Card>
            <CardHeader>
              <CardTitle>
                Equipamentos com Calibração ({filteredEquipments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {calibrationLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
                  ))}
                </div>
              ) : filteredEquipments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Nenhum equipamento encontrado</p>
                  <p className="text-sm">Ajuste os filtros ou verifique se existem equipamentos cadastrados</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 font-medium text-muted-foreground">TAG</th>
                        <th className="text-left py-3 font-medium text-muted-foreground">Equipamento</th>
                        <th className="text-left py-3 font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 font-medium text-muted-foreground">Próxima Calibração</th>
                        <th className="text-left py-3 font-medium text-muted-foreground">Dias Restantes</th>
                        <th className="text-left py-3 font-medium text-muted-foreground">Certificado</th>
                        <th className="text-left py-3 font-medium text-muted-foreground">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEquipments.map((equipment: any) => {
                        const statusBadge = getEquipmentStatusBadge(equipment.diasParaVencer);
                        
                        return (
                          <tr 
                            key={equipment.id} 
                            className="border-b border-border hover:bg-muted/30"
                            data-testid={`equipment-row-${equipment.id}`}
                          >
                            <td className="py-3 font-mono text-sm font-medium">{equipment.tag}</td>
                            <td className="py-3">
                              <div>
                                <p className="font-medium">{equipment.nome}</p>
                                <p className="text-xs text-muted-foreground">
                                  {equipment.fabricante} {equipment.modelo && `- ${equipment.modelo}`}
                                </p>
                              </div>
                            </td>
                            <td className="py-3">
                              <Badge className={statusBadge.className}>
                                {statusBadge.text}
                              </Badge>
                            </td>
                            <td className="py-3">
                              {equipment.dataProximaCalibracão ? 
                                new Date(equipment.dataProximaCalibracão).toLocaleDateString('pt-BR') :
                                'N/A'
                              }
                            </td>
                            <td className={`py-3 font-medium ${
                              equipment.diasParaVencer !== undefined && equipment.diasParaVencer <= 7 
                                ? 'text-red-600' 
                                : equipment.diasParaVencer !== undefined && equipment.diasParaVencer <= 30
                                ? 'text-orange-600'
                                : ''
                            }`}>
                              {equipment.diasParaVencer !== undefined 
                                ? `${equipment.diasParaVencer} dias`
                                : 'N/A'
                              }
                            </td>
                            <td className="py-3">
                              <div className="text-xs font-mono">
                                {equipment.certificado || 'N/A'}
                              </div>
                            </td>
                            <td className="py-3">
                              <div className="flex space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  data-testid={`button-schedule-${equipment.id}`}
                                >
                                  <Calendar className="w-3 h-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  data-testid={`button-upload-${equipment.id}`}
                                >
                                  <Upload className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatório de Conformidade</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Relatório detalhado do status de calibração de todos os equipamentos
                </p>
                <div className="space-y-2">
                  <Button className="w-full" data-testid="button-compliance-report">
                    <Download className="w-4 h-4 mr-2" />
                    Gerar Relatório de Conformidade
                  </Button>
                  <Button variant="outline" className="w-full" data-testid="button-excel-export">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Excel
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Relatório ANP</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Relatório regulamentado pela ANP para controle metrológico
                </p>
                <div className="space-y-2">
                  <Button className="w-full" data-testid="button-anp-report">
                    <Download className="w-4 h-4 mr-2" />
                    Gerar Relatório ANP
                  </Button>
                  <Button variant="outline" className="w-full" data-testid="button-pdf-export">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
