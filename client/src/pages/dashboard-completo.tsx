import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  MapPin,
  Building,
  Gauge,
  Thermometer,
  Droplets,
  Zap,
  Download,
  Filter,
  RefreshCw,
  DollarSign,
  Target,
  Settings,
  Eye,
  FileText,
  TrendingUp as TrendIcon
} from "lucide-react";
import { api } from "@/lib/api";
import { useLocation } from "wouter";
import { format, subDays, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, subYears } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import type { DashboardStats, CalibrationStats, EquipmentWithCalibration } from "@/types";

export default function DashboardCompleto() {
  const [, setLocation] = useLocation();
  const [selectedPolo, setSelectedPolo] = useState<string>("");
  const [selectedDateRange, setSelectedDateRange] = useState<string>("12m");
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);

  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: api.getDashboardStats,
  });

  const { data: calibrationStats, isLoading: calibrationLoading } = useQuery({
    queryKey: ["/api/calibracoes/stats"],
    queryFn: api.getCalibrationStats,
  });

  const { data: equipments, isLoading: equipmentsLoading } = useQuery({
    queryKey: ["/api/equipamentos/with-calibration"],
    queryFn: api.getEquipamentosWithCalibration,
  });

  const { data: polos } = useQuery({
    queryKey: ["/api/polos"],
    queryFn: api.getPolos,
  });

  const { data: instalacoes } = useQuery({
    queryKey: ["/api/instalacoes"],
    queryFn: () => api.getInstalacoes(),
  });

  const { data: pontosMedicao } = useQuery({
    queryKey: ["/api/pontos-medicao"],
    queryFn: () => api.getPontosMedicao(),
  });

  // Calculate advanced metrics
  const getAdvancedMetrics = () => {
    if (!dashboardStats || !calibrationStats || !equipments) return null;

    const totalEquipments = equipments.length;
    const calibratedEquipments = equipments.filter((eq: EquipmentWithCalibration) => eq.dataProximaCalibracão).length;
    const calibrationCoverage = totalEquipments > 0 ? ((calibratedEquipments / totalEquipments) * 100) : 0;

    const vencidosECriticos = calibrationStats.expired + calibrationStats.critical;
    const riskLevel = vencidosECriticos > 10 ? 'Alto' : vencidosECriticos > 5 ? 'Médio' : 'Baixo';

    const efficiency = calibrationStats.total > 0 ? 
      ((calibrationStats.ok + calibrationStats.proximo) / calibrationStats.total * 100) : 0;

    return {
      calibrationCoverage: calibrationCoverage.toFixed(1),
      riskLevel,
      efficiency: efficiency.toFixed(1),
      totalAssets: (polos?.length || 0) + (instalacoes?.length || 0) + (pontosMedicao?.length || 0),
      compliance: efficiency > 80 ? 'Excelente' : efficiency > 60 ? 'Bom' : efficiency > 40 ? 'Regular' : 'Crítico'
    };
  };

  const metrics = getAdvancedMetrics();

  const getCalibrationTrend = () => {
    // Simulated trend data - in real app, this would come from API
    return {
      thisMonth: calibrationStats?.ok || 0,
      lastMonth: Math.max(0, (calibrationStats?.ok || 0) - Math.floor(Math.random() * 5) + 2),
      change: Math.floor(Math.random() * 20) - 10 // -10% to +10%
    };
  };

  const trend = getCalibrationTrend();

  const getEquipmentsByLocation = () => {
    if (!equipments || !polos || !instalacoes) return [];

    const locationMap = new Map();

    equipments.forEach((eq: EquipmentWithCalibration) => {
      const location = (eq as any).localizacao || 'Não informado';
      if (!locationMap.has(location)) {
        locationMap.set(location, {
          name: location,
          total: 0,
          ok: 0,
          alert: 0,
          critical: 0
        });
      }

      const loc = locationMap.get(location);
      loc.total += 1;

      const diasParaVencer = eq.diasParaVencer;
      if (!diasParaVencer && diasParaVencer !== 0) return;
      
      if (diasParaVencer <= 0 || diasParaVencer <= 7) loc.critical += 1;
      else if (diasParaVencer <= 30) loc.alert += 1;
      else loc.ok += 1;
    });

    return Array.from(locationMap.values()).sort((a, b) => b.total - a.total);
  };

  const locationStats = getEquipmentsByLocation();

  const getCalibrationSchedule = () => {
    if (!equipments) return [];

    const schedule = [];
    const today = new Date();

    for (let i = 0; i < 12; i++) {
      const month = subMonths(today, -i);
      const monthEquipments = equipments.filter((eq: EquipmentWithCalibration) => {
        if (!eq.dataProximaCalibracão) return false;
        const calibrationDate = new Date(eq.dataProximaCalibracão);
        return calibrationDate.getMonth() === month.getMonth() && 
               calibrationDate.getFullYear() === month.getFullYear();
      });

      schedule.push({
        month: format(month, 'MMM/yy', { locale: ptBR }),
        count: monthEquipments.length,
        equipments: monthEquipments.slice(0, 5) // Show first 5
      });
    }

    return schedule;
  };

  const calibrationSchedule = getCalibrationSchedule();

  // Generate trend data for charts
  const getTrendData = () => {
    const months = eachMonthOfInterval({
      start: subMonths(new Date(), 11),
      end: new Date()
    });

    return months.map(month => {
      const monthStr = format(month, 'MMM/yy', { locale: ptBR });
      // Simulated data - in real app, this would come from API
      const baseValue = calibrationStats?.ok || 50;
      const variation = Math.floor(Math.random() * 20) - 10;
      
      return {
        month: monthStr,
        calibracoes: Math.max(0, baseValue + variation),
        equipamentos: Math.floor(Math.random() * 50) + 100,
        custos: Math.floor(Math.random() * 50000) + 25000,
        eficiencia: Math.floor(Math.random() * 20) + 75,
        conformidade: Math.floor(Math.random() * 15) + 80
      };
    });
  };

  const getPoloPerformanceData = () => {
    if (!polos || !equipments) return [];

    return polos.map((polo: any) => {
      const poloEquipments = equipments.filter((eq: EquipmentWithCalibration) => eq.poloId === polo.id);
      const totalEquipments = poloEquipments.length;
      const activeEquipments = poloEquipments.filter((eq: EquipmentWithCalibration) => eq.status === 'ativo').length;
      const criticalEquipments = poloEquipments.filter((eq: EquipmentWithCalibration) => {
        const dias = eq.diasParaVencer;
        return dias !== undefined && dias <= 7;
      }).length;

      return {
        nome: polo.sigla,
        nomeCompleto: polo.nome,
        total: totalEquipments,
        ativos: activeEquipments,
        criticos: criticalEquipments,
        eficiencia: totalEquipments > 0 ? Math.round((activeEquipments / totalEquipments) * 100) : 0,
        custoEstimado: Math.floor(Math.random() * 100000) + 50000,
        producao: Math.floor(Math.random() * 1000) + 500,
        conformidade: Math.floor(Math.random() * 20) + 75
      };
    });
  };

  const getFinancialMetrics = () => {
    const baseValue = equipments?.length || 100;
    return {
      custoCalibracoes: baseValue * 1200, // R$ 1200 por equipamento
      economiaPreventiva: baseValue * 800, // Economia com manutenção preventiva
      custoPorPolo: Math.floor(baseValue * 1200 / (polos?.length || 1)),
      orcamentoAnual: baseValue * 1200 * 1.2, // 20% buffer
      gastosRealizados: baseValue * 1200 * 0.65, // 65% executado
      projecaoMensal: baseValue * 100
    };
  };

  const getEquipmentDrillDown = () => {
    if (!equipments) return [];

    return equipments.map((eq: EquipmentWithCalibration) => ({
      ...eq,
      custoCalibracaoEstimado: Math.floor(Math.random() * 2000) + 800,
      diasOperacao: Math.floor(Math.random() * 300) + 30,
      eficienciaOperacional: Math.floor(Math.random() * 20) + 75,
      manutencoesPrevistas: Math.floor(Math.random() * 3) + 1,
      polo: polos?.find((p: any) => p.id === eq.poloId)?.sigla || 'N/A',
      instalacao: instalacoes?.find((i: any) => i.id === eq.instalacaoId)?.sigla || 'N/A'
    }));
  };

  const trendData = getTrendData();
  const poloPerformanceData = getPoloPerformanceData();
  const financialMetrics = getFinancialMetrics();
  const equipmentDrillDown = getEquipmentDrillDown();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (statsLoading || calibrationLoading || equipmentsLoading) {
    return (
      <div className="p-6">
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Dashboard Completo</h1>
            <p className="text-muted-foreground">
              Visão abrangente do sistema de gestão metrológica
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Dialog open={isMetricsModalOpen} onOpenChange={setIsMetricsModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <TrendIcon className="w-4 h-4 mr-2" />
                Métricas Avançadas
              </Button>
            </DialogTrigger>
          </Dialog>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Advanced KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Cobertura de Calibração</p>
                <p className="text-3xl font-bold text-blue-900">{metrics?.calibrationCoverage}%</p>
                <p className="text-xs text-blue-600 mt-1">
                  {equipments?.filter((eq: EquipmentWithCalibration) => eq.dataProximaCalibracão).length} de {equipments?.length} equipamentos
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <Progress value={parseFloat(metrics?.calibrationCoverage || '0')} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Eficiência do Sistema</p>
                <p className="text-3xl font-bold text-green-900">{metrics?.efficiency}%</p>
                <p className="text-xs text-green-600 mt-1">
                  Status: {metrics?.compliance}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-3 text-xs">
              {trend.change >= 0 ? (
                <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-600 mr-1" />
              )}
              <span className={trend.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(trend.change)}% vs mês anterior
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Nível de Risco</p>
                <p className="text-3xl font-bold text-orange-900">{metrics?.riskLevel}</p>
                <p className="text-xs text-orange-600 mt-1">
                  {calibrationStats?.expired + calibrationStats?.critical} itens críticos
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Total de Ativos</p>
                <p className="text-3xl font-bold text-purple-900">{metrics?.totalAssets}</p>
                <p className="text-xs text-purple-600 mt-1">
                  Polos, Instalações e Pontos
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="polos">Por Polo</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="drilldown">Drill-Down</TabsTrigger>
          <TabsTrigger value="schedule">Cronograma</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  Distribuição de Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'OK', count: calibrationStats?.ok || 0, color: 'bg-green-500', percentage: ((calibrationStats?.ok || 0) / (calibrationStats?.total || 1) * 100).toFixed(1) },
                    { label: 'Próximo', count: calibrationStats?.proximo || 0, color: 'bg-blue-500', percentage: ((calibrationStats?.proximo || 0) / (calibrationStats?.total || 1) * 100).toFixed(1) },
                    { label: 'Alerta', count: calibrationStats?.alert || 0, color: 'bg-yellow-500', percentage: ((calibrationStats?.alert || 0) / (calibrationStats?.total || 1) * 100).toFixed(1) },
                    { label: 'Crítico', count: calibrationStats?.critical || 0, color: 'bg-orange-500', percentage: ((calibrationStats?.critical || 0) / (calibrationStats?.total || 1) * 100).toFixed(1) },
                    { label: 'Vencido', count: calibrationStats?.expired || 0, color: 'bg-red-500', percentage: ((calibrationStats?.expired || 0) / (calibrationStats?.total || 1) * 100).toFixed(1) }
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${item.color} mr-3`} />
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">{item.count} ({item.percentage}%)</span>
                        <Progress value={parseFloat(item.percentage)} className="w-16 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: 'calibracao', description: 'Calibração realizada - FIT-001', time: '2 horas atrás', icon: CheckCircle, color: 'text-green-600' },
                    { type: 'alerta', description: 'Alerta de vencimento - TIT-003', time: '4 horas atrás', icon: AlertTriangle, color: 'text-yellow-600' },
                    { type: 'novo', description: 'Novo equipamento cadastrado', time: '1 dia atrás', icon: Activity, color: 'text-blue-600' },
                    { type: 'manutencao', description: 'Manutenção programada - PIT-002', time: '2 dias atrás', icon: Clock, color: 'text-orange-600' },
                  ].map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <div key={index} className="flex items-start space-x-3">
                        <div className={`w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center`}>
                          <IconComponent className={`w-4 h-4 ${item.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{item.description}</p>
                          <p className="text-xs text-gray-500">{item.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calibrations Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Tendência de Calibrações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="calibracoes" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Calibrações Realizadas"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="eficiencia" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      name="Eficiência (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Equipment Status Over Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Evolução dos Equipamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="equipamentos" 
                      stackId="1"
                      stroke="#8884d8" 
                      fill="#8884d8"
                      name="Total Equipamentos"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Conformity Trend */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Índice de Conformidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Conformidade']} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="conformidade" 
                      stroke="#00C49F" 
                      fill="#00C49F"
                      fillOpacity={0.6}
                      name="Conformidade (%)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="polos">
          <div className="space-y-6">
            {/* Polo Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {poloPerformanceData.slice(0, 4).map((polo: any, index: number) => (
                <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg">{polo.nome}</h3>
                        <p className="text-sm text-muted-foreground">{polo.nomeCompleto}</p>
                      </div>
                      <Badge variant={polo.criticos > 5 ? "destructive" : polo.criticos > 2 ? "default" : "secondary"}>
                        {polo.criticos} críticos
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Equipamentos:</span>
                        <span className="font-medium">{polo.total}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Ativos:</span>
                        <span className="font-medium text-green-600">{polo.ativos}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Eficiência:</span>
                        <span className="font-medium">{polo.eficiencia}%</span>
                      </div>
                      <Progress value={polo.eficiencia} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Detailed Polo Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Performance por Polo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={poloPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nome" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#8884d8" name="Total Equipamentos" />
                    <Bar dataKey="ativos" fill="#82ca9d" name="Equipamentos Ativos" />
                    <Bar dataKey="criticos" fill="#ff7300" name="Equipamentos Críticos" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Financial KPIs */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700">Custo Total Calibrações</p>
                      <p className="text-2xl font-bold text-green-900">
                        R$ {financialMetrics.custoCalibracoes.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700">Economia Preventiva</p>
                      <p className="text-2xl font-bold text-blue-900">
                        R$ {financialMetrics.economiaPreventiva.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-700">Custo Médio por Polo</p>
                      <p className="text-2xl font-bold text-orange-900">
                        R$ {financialMetrics.custoPorPolo.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <Building className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Budget Execution */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Execução Orçamentária
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Orçamento Anual</span>
                      <span className="text-sm text-muted-foreground">
                        R$ {financialMetrics.orcamentoAnual.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <Progress 
                      value={(financialMetrics.gastosRealizados / financialMetrics.orcamentoAnual) * 100} 
                      className="h-3"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Executado: R$ {financialMetrics.gastosRealizados.toLocaleString('pt-BR')}</span>
                      <span>{((financialMetrics.gastosRealizados / financialMetrics.orcamentoAnual) * 100).toFixed(1)}%</span>
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Custos']} />
                      <Bar dataKey="custos" fill="#8884d8" name="Custos Mensais" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="drilldown">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Análise Detalhada por Equipamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">TAG</th>
                      <th className="text-left p-2">Nome</th>
                      <th className="text-left p-2">Polo</th>
                      <th className="text-left p-2">Instalação</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Dias p/ Vencer</th>
                      <th className="text-left p-2">Custo Calibração</th>
                      <th className="text-left p-2">Eficiência</th>
                      <th className="text-left p-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {equipmentDrillDown.slice(0, 10).map((equipment: any, index: number) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-mono">{equipment.tag}</td>
                        <td className="p-2">{equipment.nome}</td>
                        <td className="p-2">{equipment.polo}</td>
                        <td className="p-2">{equipment.instalacao}</td>
                        <td className="p-2">
                          <Badge variant={equipment.status === 'ativo' ? 'default' : 'secondary'}>
                            {equipment.status}
                          </Badge>
                        </td>
                        <td className="p-2">
                          {equipment.diasParaVencer !== undefined ? (
                            <Badge variant={
                              equipment.diasParaVencer <= 0 ? 'destructive' :
                              equipment.diasParaVencer <= 7 ? 'destructive' :
                              equipment.diasParaVencer <= 30 ? 'default' : 'secondary'
                            }>
                              {equipment.diasParaVencer} dias
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </td>
                        <td className="p-2">R$ {equipment.custoCalibracaoEstimado.toLocaleString('pt-BR')}</td>
                        <td className="p-2">{equipment.eficienciaOperacional}%</td>
                        <td className="p-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Equipamentos por Localização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {locationStats.slice(0, 10).map((location, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">{location.name}</h3>
                      <Badge variant="outline">{location.total} equipamentos</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
                        <span>OK: {location.ok}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2" />
                        <span>Alerta: {location.alert}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
                        <span>Crítico: {location.critical}</span>
                      </div>
                    </div>
                    <Progress 
                      value={location.total > 0 ? (location.ok / location.total * 100) : 0} 
                      className="mt-3" 
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Cronograma de Calibrações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {calibrationSchedule.map((month, index) => (
                  <Card key={index} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{month.month}</CardTitle>
                        <Badge variant={month.count > 5 ? "destructive" : month.count > 2 ? "default" : "secondary"}>
                          {month.count}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {month.equipments.length > 0 ? (
                        <div className="space-y-2">
                          {month.equipments.map((eq: any, eqIndex: number) => (
                            <div key={eqIndex} className="text-xs p-2 bg-gray-50 rounded">
                              <p className="font-medium">{eq.tag || eq.nome}</p>
                              {eq.dataProximaCalibracão && (
                                <p className="text-gray-600">
                                  {format(new Date(eq.dataProximaCalibracão), 'dd/MM', { locale: ptBR })}
                                </p>
                              )}
                            </div>
                          ))}
                          {month.count > 5 && (
                            <p className="text-xs text-gray-500 text-center mt-2">
                              +{month.count - 5} outros
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">Nenhuma calibração agendada</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Métricas de Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Taxa de Conformidade</span>
                      <span className="text-sm text-muted-foreground">{metrics?.efficiency}%</span>
                    </div>
                    <Progress value={parseFloat(metrics?.efficiency || '0')} />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Cobertura de Calibração</span>
                      <span className="text-sm text-muted-foreground">{metrics?.calibrationCoverage}%</span>
                    </div>
                    <Progress value={parseFloat(metrics?.calibrationCoverage || '0')} />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Equipamentos Ativos</span>
                      <span className="text-sm text-muted-foreground">
                        {equipments?.filter((eq: EquipmentWithCalibration) => eq.status === 'ativo').length}/{equipments?.length}
                      </span>
                    </div>
                    <Progress value={equipments?.length ? (equipments.filter((eq: EquipmentWithCalibration) => eq.status === 'ativo').length / equipments.length * 100) : 0} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gauge className="w-5 h-5 mr-2" />
                  Distribuição por Tipo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: 'Pressão', count: equipments?.filter((eq: any) => eq.tipo?.toLowerCase().includes('pressão') || eq.tipo?.toLowerCase().includes('pressure')).length || 0, icon: Gauge, color: 'bg-blue-500' },
                    { type: 'Temperatura', count: equipments?.filter((eq: any) => eq.tipo?.toLowerCase().includes('temperatura') || eq.tipo?.toLowerCase().includes('temperature')).length || 0, icon: Thermometer, color: 'bg-red-500' },
                    { type: 'Vazão', count: equipments?.filter((eq: any) => eq.tipo?.toLowerCase().includes('vazão') || eq.tipo?.toLowerCase().includes('flow')).length || 0, icon: Droplets, color: 'bg-green-500' },
                    { type: 'Elétricos', count: equipments?.filter((eq: any) => eq.tipo?.toLowerCase().includes('elétrico') || eq.tipo?.toLowerCase().includes('electrical')).length || 0, icon: Zap, color: 'bg-yellow-500' },
                  ].map((item, index) => {
                    const IconComponent = item.icon;
                    const percentage = equipments?.length ? (item.count / equipments.length * 100).toFixed(1) : '0';
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-lg ${item.color}/20 flex items-center justify-center mr-3`}>
                            <IconComponent className={`w-4 h-4 text-white`} style={{ filter: 'brightness(0.8)' }} />
                          </div>
                          <span className="text-sm font-medium">{item.type}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">{item.count} ({percentage}%)</span>
                          <Progress value={parseFloat(percentage)} className="w-16 h-2" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Advanced Metrics Modal */}
      <Dialog open={isMetricsModalOpen} onOpenChange={setIsMetricsModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Métricas Avançadas e Análises Detalhadas
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="advanced-kpis" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="advanced-kpis">KPIs Avançados</TabsTrigger>
              <TabsTrigger value="interactive-charts">Gráficos Interativos</TabsTrigger>
              <TabsTrigger value="predictions">Predições</TabsTrigger>
              <TabsTrigger value="reports">Relatórios</TabsTrigger>
            </TabsList>

            <TabsContent value="advanced-kpis">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* ROI Metrics */}
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-700">ROI Calibrações</p>
                        <p className="text-2xl font-bold text-purple-900">324%</p>
                        <p className="text-xs text-purple-600">vs período anterior</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                {/* Mean Time Between Failures */}
                <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-indigo-700">MTBF Médio</p>
                        <p className="text-2xl font-bold text-indigo-900">1.247h</p>
                        <p className="text-xs text-indigo-600">+12% este mês</p>
                      </div>
                      <Clock className="w-8 h-8 text-indigo-600" />
                    </div>
                  </CardContent>
                </Card>

                {/* Availability Index */}
                <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-teal-700">Disponibilidade</p>
                        <p className="text-2xl font-bold text-teal-900">98.7%</p>
                        <p className="text-xs text-teal-600">Meta: 95%</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-teal-600" />
                    </div>
                  </CardContent>
                </Card>

                {/* Quality Index */}
                <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-amber-700">Índice Qualidade</p>
                        <p className="text-2xl font-bold text-amber-900">4.8/5.0</p>
                        <p className="text-xs text-amber-600">Baseado em auditorias</p>
                      </div>
                      <Target className="w-8 h-8 text-amber-600" />
                    </div>
                  </CardContent>
                </Card>

                {/* Critical Events */}
                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-700">Eventos Críticos</p>
                        <p className="text-2xl font-bold text-red-900">3</p>
                        <p className="text-xs text-red-600">Últimos 30 dias</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>

                {/* Automation Level */}
                <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-cyan-700">Nível Automação</p>
                        <p className="text-2xl font-bold text-cyan-900">67%</p>
                        <p className="text-xs text-cyan-600">Processos automatizados</p>
                      </div>
                      <Settings className="w-8 h-8 text-cyan-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="interactive-charts">
              <div className="space-y-6">
                {/* Advanced Correlation Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Correlação: Calibração vs Eficiência Operacional</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="calibracoes" 
                          stroke="#8884d8" 
                          strokeWidth={2}
                          name="Calibrações"
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="eficiencia" 
                          stroke="#82ca9d" 
                          strokeWidth={2}
                          name="Eficiência (%)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Equipment Distribution Pie Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Distribuição por Tipo de Equipamento</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                          <Tooltip />
                          <Legend />
                          <RechartsPieChart
                            data={[
                              { name: 'Pressão', value: 35, fill: COLORS[0] },
                              { name: 'Temperatura', value: 25, fill: COLORS[1] },
                              { name: 'Vazão', value: 20, fill: COLORS[2] },
                              { name: 'Elétricos', value: 15, fill: COLORS[3] },
                              { name: 'Outros', value: 5, fill: COLORS[4] }
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                          >
                            {[
                              { name: 'Pressão', value: 35, fill: COLORS[0] },
                              { name: 'Temperatura', value: 25, fill: COLORS[1] },
                              { name: 'Vazão', value: 20, fill: COLORS[2] },
                              { name: 'Elétricos', value: 15, fill: COLORS[3] },
                              { name: 'Outros', value: 5, fill: COLORS[4] }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </RechartsPieChart>
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Análise de Criticidade</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={poloPerformanceData.slice(0, 5)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="nome" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="conformidade" fill="#82ca9d" name="Conformidade (%)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="predictions">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Predição de Falhas e Manutenções
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-red-50 rounded">
                        <h3 className="font-bold text-red-800">Alto Risco</h3>
                        <p className="text-2xl font-bold text-red-900">12</p>
                        <p className="text-sm text-red-600">Equipamentos</p>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded">
                        <h3 className="font-bold text-yellow-800">Médio Risco</h3>
                        <p className="text-2xl font-bold text-yellow-900">28</p>
                        <p className="text-sm text-yellow-600">Equipamentos</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded">
                        <h3 className="font-bold text-green-800">Baixo Risco</h3>
                        <p className="text-2xl font-bold text-green-900">145</p>
                        <p className="text-sm text-green-600">Equipamentos</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">Próximas Ações Recomendadas:</h4>
                      {[
                        { equipment: 'FIT-001', action: 'Calibração preventiva', days: 5, priority: 'Alta' },
                        { equipment: 'TIT-003', action: 'Substituição sensor', days: 12, priority: 'Média' },
                        { equipment: 'PIT-002', action: 'Manutenção preventiva', days: 18, priority: 'Alta' },
                        { equipment: 'LIT-004', action: 'Verificação conexões', days: 25, priority: 'Baixa' }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">{item.equipment}</p>
                            <p className="text-sm text-muted-foreground">{item.action}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={
                              item.priority === 'Alta' ? 'destructive' :
                              item.priority === 'Média' ? 'default' : 'secondary'
                            }>
                              {item.priority}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">{item.days} dias</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reports">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Geração de Relatórios Personalizados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold">Relatórios Disponíveis:</h4>
                        {[
                          { name: 'Relatório Executivo', description: 'Visão geral para gestão', format: 'PDF' },
                          { name: 'Análise Técnica', description: 'Dados detalhados de equipamentos', format: 'Excel' },
                          { name: 'Compliance Report', description: 'Status regulatório', format: 'PDF' },
                          { name: 'Custos e ROI', description: 'Análise financeira', format: 'Excel' },
                          { name: 'Predições e Trends', description: 'Análises preditivas', format: 'PDF' }
                        ].map((report, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <p className="font-medium">{report.name}</p>
                              <p className="text-sm text-muted-foreground">{report.description}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{report.format}</Badge>
                              <Button size="sm">
                                <Download className="w-4 h-4 mr-1" />
                                Gerar
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold">Configurar Relatório Personalizado:</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium">Período:</label>
                            <select className="w-full mt-1 p-2 border rounded" title="Selecionar período">
                              <option>Últimos 30 dias</option>
                              <option>Últimos 3 meses</option>
                              <option>Últimos 6 meses</option>
                              <option>Último ano</option>
                              <option>Personalizado</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Incluir:</label>
                            <div className="mt-2 space-y-2">
                              {['KPIs Básicos', 'Análise de Tendências', 'Métricas Financeiras', 'Predições', 'Gráficos Interativos'].map((item, index) => (
                                <label key={index} className="flex items-center">
                                  <input type="checkbox" className="mr-2" defaultChecked />
                                  <span className="text-sm">{item}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                          <Button className="w-full mt-4">
                            <FileText className="w-4 h-4 mr-2" />
                            Gerar Relatório Personalizado
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}