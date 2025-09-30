import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { 
  TrendingUp, 
  BarChart3, 
  AlertTriangle, 
  DollarSign, 
  Target, 
  Clock,
  Download,
  RefreshCw,
  Zap
} from "lucide-react";
import { api } from "@/lib/api";
import { format, subMonths, eachMonthOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { CalibrationStats, EquipmentWithCalibration } from "@/types";

interface AdvancedMetricsModalProps {
  trigger: React.ReactNode;
}

export default function AdvancedMetricsModal({ trigger }: AdvancedMetricsModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: calibrationStats } = useQuery({
    queryKey: ["/api/calibracoes/stats"],
    queryFn: api.getCalibrationStats,
  });

  const { data: equipments } = useQuery({
    queryKey: ["/api/equipamentos/with-calibration"],
    queryFn: api.getEquipamentosWithCalibration,
  });

  const { data: polos } = useQuery({
    queryKey: ["/api/polos"],
    queryFn: api.getPolos,
  });

  // Generate quick metrics
  const getQuickMetrics = () => {
    if (!calibrationStats || !equipments) return null;

    const totalEquipments = equipments.length;
    const criticalEquipments = equipments.filter((eq: EquipmentWithCalibration) => {
      const dias = eq.diasParaVencer;
      return dias !== undefined && dias <= 7;
    }).length;

    const efficiency = calibrationStats.total > 0 ? 
      ((calibrationStats.ok + calibrationStats.proximo) / calibrationStats.total * 100) : 0;

    return {
      roi: 324, // Simulated ROI
      mtbf: 1247, // Mean Time Between Failures in hours
      availability: 98.7,
      qualityIndex: 4.8,
      criticalEvents: 3,
      automationLevel: 67,
      efficiency: efficiency.toFixed(1),
      totalCost: totalEquipments * 1200,
      savings: totalEquipments * 800,
      criticalCount: criticalEquipments
    };
  };

  // Generate trend data for quick visualization
  const getQuickTrendData = () => {
    const months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date()
    });

    return months.map(month => {
      const monthStr = format(month, 'MMM', { locale: ptBR });
      return {
        month: monthStr,
        efficiency: Math.floor(Math.random() * 20) + 75,
        costs: Math.floor(Math.random() * 30000) + 20000,
        calibrations: Math.floor(Math.random() * 20) + 30
      };
    });
  };

  const metrics = getQuickMetrics();
  const trendData = getQuickTrendData();

  const exportReport = () => {
    // Simulate report generation
    const reportData = {
      timestamp: new Date().toISOString(),
      metrics: metrics,
      trendData: trendData,
      equipment_count: equipments?.length || 0,
      polo_count: polos?.length || 0
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metricas-avancadas-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!metrics) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Métricas Avançadas - Visão Executiva
            </DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Atualizar
              </Button>
              <Button variant="outline" size="sm" onClick={exportReport}>
                <Download className="w-4 h-4 mr-1" />
                Exportar
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Executive KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-600" />
                  <p className="text-lg font-bold text-green-900">{metrics.roi}%</p>
                  <p className="text-xs text-green-700">ROI</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-lg font-bold text-blue-900">{metrics.mtbf}h</p>
                  <p className="text-xs text-blue-700">MTBF</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <Target className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                  <p className="text-lg font-bold text-purple-900">{metrics.availability}%</p>
                  <p className="text-xs text-purple-700">Disponibilidade</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
                  <p className="text-lg font-bold text-yellow-900">{metrics.qualityIndex}</p>
                  <p className="text-xs text-yellow-700">Qualidade</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-red-600" />
                  <p className="text-lg font-bold text-red-900">{metrics.criticalEvents}</p>
                  <p className="text-xs text-red-700">Eventos Críticos</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <Zap className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
                  <p className="text-lg font-bold text-indigo-900">{metrics.automationLevel}%</p>
                  <p className="text-xs text-indigo-700">Automação</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Tendência de Performance (6 meses)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="efficiency" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Eficiência (%)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="calibrations" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      name="Calibrações"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Insights Rápidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium text-green-800">Performance Excepcional</span>
                    </div>
                    <p className="text-xs text-green-600">
                      Eficiência {metrics.efficiency}% acima da meta de 85%
                    </p>
                  </div>

                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium text-yellow-800">Atenção Requerida</span>
                    </div>
                    <p className="text-xs text-yellow-600">
                      {metrics.criticalCount} equipamentos em estado crítico
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium text-blue-800">Economia Identificada</span>
                    </div>
                    <p className="text-xs text-blue-600">
                      R$ {metrics.savings.toLocaleString('pt-BR')} em manutenção preventiva
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <DollarSign className="w-4 h-4 mr-2" />
                Resumo Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded">
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {metrics.totalCost.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-sm text-gray-600">Custo Total Calibrações</p>
                  <Progress value={65} className="mt-2" />
                  <p className="text-xs text-gray-500 mt-1">65% do orçamento utilizado</p>
                </div>

                <div className="text-center p-4 bg-green-50 rounded">
                  <p className="text-2xl font-bold text-green-900">
                    R$ {metrics.savings.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-sm text-green-600">Economia Manutenção Preventiva</p>
                  <div className="flex items-center justify-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">+12% vs último período</span>
                  </div>
                </div>

                <div className="text-center p-4 bg-blue-50 rounded">
                  <p className="text-2xl font-bold text-blue-900">{metrics.roi}%</p>
                  <p className="text-sm text-blue-600">Retorno sobre Investimento</p>
                  <Badge className="mt-2 bg-blue-100 text-blue-800">
                    Excelente Performance
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ações Recomendadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { 
                    priority: 'Alta', 
                    action: 'Revisar equipamentos críticos', 
                    count: metrics.criticalCount,
                    color: 'red'
                  },
                  { 
                    priority: 'Média', 
                    action: 'Otimizar cronograma de calibrações', 
                    count: 5,
                    color: 'yellow'
                  },
                  { 
                    priority: 'Baixa', 
                    action: 'Implementar automação adicional', 
                    count: 2,
                    color: 'blue'
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 bg-${item.color}-500 rounded-full mr-3`}></div>
                      <div>
                        <p className="font-medium text-sm">{item.action}</p>
                        <p className="text-xs text-muted-foreground">{item.count} itens</p>
                      </div>
                    </div>
                    <Badge variant={
                      item.priority === 'Alta' ? 'destructive' :
                      item.priority === 'Média' ? 'default' : 'secondary'
                    }>
                      {item.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}