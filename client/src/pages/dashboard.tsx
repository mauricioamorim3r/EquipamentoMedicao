import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ExternalLink, Download, Calendar } from "lucide-react";
import { api } from "@/lib/api";
import KpiCards from "@/components/kpi-cards";
import OperationalCards from "@/components/operational-cards";
import EquipmentModal from "@/components/equipment-modal";
import AdvancedMetricsModal from "@/components/advanced-metrics-modal";
import CalendarioDashboard from "@/components/calendario-dashboard";
import LacresKpiCards from "@/components/lacres-kpi-cards";
import CertificateAlertsMonitor from "@/components/certificate-alerts-monitor";
import { useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "@/hooks/useLanguage";
import type { DashboardStats, CalibrationStats, EquipmentWithCalibration } from "@/types";

export default function Dashboard() {
  const { t } = useTranslation();
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentWithCalibration | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [, setLocation] = useLocation();

  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: api.getDashboardStats,
  });

  const { data: calibrationStats, isLoading: calibrationLoading } = useQuery({
    queryKey: ["/api/calibracoes/stats"],
    queryFn: api.getCalibrationStats,
  });

  const { data: criticalEquipments, isLoading: equipmentsLoading } = useQuery({
    queryKey: ["/api/equipamentos/with-calibration"],
    queryFn: api.getEquipamentosWithCalibration,
  });

  const openEquipmentModal = (equipment: EquipmentWithCalibration) => {
    setSelectedEquipment(equipment);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEquipment(null);
  };

  const getStatusBadge = (diasParaVencer?: number) => {
    if (!diasParaVencer && diasParaVencer !== 0) return { text: t('noData'), className: 'bg-gray-100 text-gray-800' };
    if (diasParaVencer <= 0) return { text: t('expired'), className: 'bg-red-100 text-red-800' };
    if (diasParaVencer <= 7) return { text: t('critical'), className: 'bg-orange-100 text-orange-800' };
    if (diasParaVencer <= 30) return { text: t('alert'), className: 'bg-yellow-100 text-yellow-800' };
    return { text: t('ok'), className: 'bg-green-100 text-green-800' };
  };

  const getCalibrationStatusData = (stats: CalibrationStats) => {
    const total = stats.total || 1; // Avoid division by zero
    return [
      {
        status: 'OK (> 90 dias)',
        count: stats.ok,
        percentage: ((stats.ok / total) * 100).toFixed(1),
        bgColor: 'bg-green-50',
        borderColor: 'border-green-500',
        textColor: 'text-green-800',
        countColor: 'text-green-700',
        percentageColor: 'text-green-700',
        dotColor: 'bg-green-500',
      },
      {
        status: 'Próximo (31-90 dias)',
        count: stats.proximo,
        percentage: ((stats.proximo / total) * 100).toFixed(1),
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-500',
        textColor: 'text-blue-800',
        countColor: 'text-blue-600',
        percentageColor: 'text-blue-700',
        dotColor: 'bg-blue-500',
      },
      {
        status: 'Alerta (8-30 dias)',
        count: stats.alert,
        percentage: ((stats.alert / total) * 100).toFixed(1),
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-500',
        textColor: 'text-orange-800',
        countColor: 'text-orange-700',
        percentageColor: 'text-orange-700',
        dotColor: 'bg-orange-500',
      },
      {
        status: 'Crítico + Vencido',
        count: stats.critical + stats.expired,
        percentage: (((stats.critical + stats.expired) / total) * 100).toFixed(1),
        bgColor: 'bg-red-50',
        borderColor: 'border-red-500',
        textColor: 'text-red-800',
        countColor: 'text-red-600',
        percentageColor: 'text-red-700',
        dotColor: 'bg-red-500',
      },
    ];
  };

  // Filter critical equipment (expired or critical status)
  const criticalList = criticalEquipments?.filter((eq: EquipmentWithCalibration) => 
    eq.diasParaVencer !== undefined && eq.diasParaVencer <= 7
  ).slice(0, 4) || [];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <KpiCards stats={dashboardStats || {} as DashboardStats} isLoading={statsLoading} />

      {/* Operational Cards - New colorful cards for operational metrics */}
      <OperationalCards isLoading={statsLoading} />

      {/* Calendário de Atividades */}
      <div className="mb-8">
        <CalendarioDashboard />
      </div>

      {/* KPIs de Controle de Lacres */}
      <LacresKpiCards />

      {/* Status de Calibrações e Distribuição por Polos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status de Calibrações */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('calibrationStatus')}</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                {t('seeAll')} <ArrowRight className="ml-1 w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {calibrationLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 bg-muted rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {getCalibrationStatusData(calibrationStats || {} as CalibrationStats).map((status, index) => (
                  <div 
                    key={index}
                    className={`flex items-center justify-between p-3 ${status.bgColor} rounded-lg border-l-4 ${status.borderColor}`}
                    data-testid={`calibration-status-${index}`}
                  >
                    <div className="flex items-center">
                      <div className={`w-3 h-3 ${status.dotColor} rounded-full mr-3`}></div>
                      <div>
                        <p className={`font-medium ${status.textColor}`}>{status.status}</p>
                        <p className={`text-sm ${status.countColor}`}>{status.count} equipamentos</p>
                      </div>
                    </div>
                    <span className={`${status.percentageColor} font-bold`}>{status.percentage}%</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Distribuição por Polos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('poleDistribution')}</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                Detalhes <ExternalLink className="ml-1 w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardStats?.polosDistribution?.slice(0, 4).map((polo: any, index: number) => {
                  const total = dashboardStats.totalEquipamentos || 1;
                  const percentage = ((polo.equipCount / total) * 100).toFixed(1);
                  const colors = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4'];
                  
                  return (
                    <div key={polo.id} className="flex items-center justify-between" data-testid={`polo-distribution-${index}`}>
                      <div className="flex items-center">
                        <div className={`w-4 h-4 ${colors[index % colors.length]} rounded mr-3`}></div>
                        <div>
                          <p className="font-medium text-foreground">{polo.sigla}</p>
                          <p className="text-sm text-muted-foreground">{polo.equipCount} equipamentos</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">{percentage}%</p>
                        <p className="text-xs text-green-700">95% conformidade</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Equipamentos Críticos e Ações Pendentes */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Equipamentos Críticos */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t('criticalEquipments')}</CardTitle>
                <div className="flex space-x-2">
                  <select 
                    className="text-sm border border-border rounded px-2 py-1 bg-background"
                    title="Filtrar período"
                    aria-label="Filtrar período"
                  >
                    <option>Todos os Polos</option>
                    <option>POL-RJ</option>
                    <option>POL-ES</option>
                    <option>POL-BA</option>
                  </select>
                  <Button variant="outline" size="sm">
                    Exportar <Download className="ml-1 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {equipmentsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 font-medium text-muted-foreground">TAG</th>
                        <th className="text-left py-2 font-medium text-muted-foreground">Equipamento</th>
                        <th className="text-left py-2 font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-2 font-medium text-muted-foreground">Dias</th>
                        <th className="text-left py-2 font-medium text-muted-foreground">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="text-foreground">
                      {criticalList.map((equip: any) => {
                        const statusBadge = getStatusBadge(equip.diasParaVencer);
                        return (
                          <tr 
                            key={equip.id} 
                            className="border-b border-border hover:bg-muted/30 cursor-pointer"
                            onClick={() => openEquipmentModal(equip)}
                            data-testid={`critical-equipment-${equip.id}`}
                          >
                            <td className="py-3 font-mono text-sm">{equip.tag}</td>
                            <td className="py-3">{equip.nome}</td>
                            <td className="py-3">
                              <Badge className={statusBadge.className}>
                                {statusBadge.text}
                              </Badge>
                            </td>
                            <td className={`py-3 font-medium ${equip.diasParaVencer && equip.diasParaVencer <= 0 ? 'text-red-600' : 'text-orange-700'}`}>
                              {equip.diasParaVencer !== undefined ? equip.diasParaVencer : 'N/A'}
                            </td>
                            <td className="py-3">
                              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 text-xs">
                                <Calendar className="w-3 h-3 mr-1" />
                                Agendar
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  
                  {criticalList.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum equipamento crítico encontrado
                    </div>
                  )}
                  
                  {criticalList.length > 0 && (
                    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                      <span>Mostrando {criticalList.length} equipamentos críticos</span>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">Anterior</Button>
                        <Button variant="outline" size="sm">Próximo</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Monitor de Alertas de Certificados */}
      <div className="mb-8">
        <CertificateAlertsMonitor />
      </div>

      {/* Equipment Modal */}
      <EquipmentModal
        equipment={selectedEquipment}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}
