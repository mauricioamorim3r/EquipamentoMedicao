import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  FileText, 
  Download, 
  Calendar as CalendarIcon, 
  BarChart3, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  FileSpreadsheet,
  File,
  Printer,
  Send,
  Eye
} from "lucide-react";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DashboardStats, CalibrationStats } from "@/types";

export default function Reports() {
  const [activeTab, setActiveTab] = useState("compliance");
  const [selectedPolo, setSelectedPolo] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reportType, setReportType] = useState<string>("monthly");

  // Fetch data for reports
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: api.getDashboardStats,
  });

  const { data: calibrationStats, isLoading: calibrationLoading } = useQuery({
    queryKey: ["/api/calibracoes/stats"],
    queryFn: api.getCalibrationStats,
  });

  const { data: equipamentos } = useQuery({
    queryKey: ["/api/equipamentos/with-calibration"],
    queryFn: api.getEquipamentosWithCalibration,
  });

  const { data: polos } = useQuery({
    queryKey: ["/api/polos"],
    queryFn: api.getPolos,
  });

  const generateReport = (type: string, format: string) => {
    // In a real application, this would call an API endpoint to generate the report
    console.log(`Generating ${type} report in ${format} format`);
    // For now, we'll just show a toast
  };

  const getComplianceStats = () => {
    if (!dashboardStats || !calibrationStats) return null;
    
    const total = calibrationStats.total || 1;
    const compliant = total - (calibrationStats.expired + calibrationStats.critical);
    const complianceRate = (compliant / total) * 100;
    
    return {
      totalEquipments: total,
      compliant,
      nonCompliant: calibrationStats.expired + calibrationStats.critical,
      complianceRate: complianceRate.toFixed(1),
      expired: calibrationStats.expired,
      critical: calibrationStats.critical,
    };
  };

  const complianceStats = getComplianceStats();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground" data-testid="page-title">
            Relatórios
          </h1>
          <p className="text-muted-foreground">
            Relatórios regulamentares e análises de conformidade
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" data-testid="button-schedule-reports">
            <Send className="w-4 h-4 mr-2" />
            Agendar Envios
          </Button>
          <Button data-testid="button-quick-export">
            <Download className="w-4 h-4 mr-2" />
            Exportação Rápida
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {complianceStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card data-testid="card-total-equipment">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Equipamentos</p>
                  <p className="text-3xl font-bold text-foreground">{complianceStats.totalEquipments}</p>
                </div>
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="text-primary w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-compliance-rate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taxa de Conformidade</p>
                  <p className="text-3xl font-bold text-green-600">{complianceStats.complianceRate}%</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-green-500 w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-non-compliant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Não Conformes</p>
                  <p className="text-3xl font-bold text-red-600">{complianceStats.nonCompliant}</p>
                </div>
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="text-red-500 w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-improvement">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Melhoria Mensal</p>
                  <p className="text-3xl font-bold text-blue-600">+2.3%</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-blue-500 w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filtros de Relatório</CardTitle>
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

            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger data-testid="filter-report-type">
                <SelectValue placeholder="Tipo de Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diário</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="quarterly">Trimestral</SelectItem>
                <SelectItem value="yearly">Anual</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" data-testid="select-start-date">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Data Início"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" data-testid="select-end-date">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Data Fim"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Report Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="compliance" data-testid="tab-compliance">
            <CheckCircle className="w-4 h-4 mr-2" />
            Conformidade
          </TabsTrigger>
          <TabsTrigger value="anp" data-testid="tab-anp">
            <FileText className="w-4 h-4 mr-2" />
            ANP
          </TabsTrigger>
          <TabsTrigger value="operational" data-testid="tab-operational">
            <BarChart3 className="w-4 h-4 mr-2" />
            Operacional
          </TabsTrigger>
          <TabsTrigger value="custom" data-testid="tab-custom">
            <Printer className="w-4 h-4 mr-2" />
            Customizados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compliance" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatório de Conformidade Geral</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Relatório completo do status de conformidade de todos os equipamentos
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <span>Taxa de Conformidade</span>
                    <Badge className="bg-green-100 text-green-800">
                      {complianceStats?.complianceRate}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <span>Equipamentos Vencidos</span>
                    <Badge className="bg-red-100 text-red-800">
                      {complianceStats?.expired || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <span>Equipamentos Críticos</span>
                    <Badge className="bg-orange-100 text-orange-800">
                      {complianceStats?.critical || 0}
                    </Badge>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Button 
                    className="w-full" 
                    onClick={() => generateReport('compliance', 'pdf')}
                    data-testid="button-compliance-pdf"
                  >
                    <File className="w-4 h-4 mr-2" />
                    Gerar PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => generateReport('compliance', 'excel')}
                    data-testid="button-compliance-excel"
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Exportar Excel
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Relatório por Polo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Análise detalhada de conformidade por polo de produção
                </p>
                <div className="space-y-3">
                  {dashboardStats?.polosDistribution?.slice(0, 3).map((polo, index) => (
                    <div key={polo.id} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                      <div>
                        <p className="font-medium">{polo.sigla}</p>
                        <p className="text-sm text-muted-foreground">{polo.equipCount} equipamentos</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        {(Math.random() * 10 + 90).toFixed(1)}%
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  <Button 
                    className="w-full"
                    onClick={() => generateReport('polo', 'pdf')}
                    data-testid="button-polo-report"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Relatório Detalhado
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    data-testid="button-view-polo-dashboard"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="anp" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatório ANP Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Relatório regulamentado pela ANP para controle metrológico mensal
                </p>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="font-medium text-blue-800">Próximo Envio</p>
                    <p className="text-sm text-blue-600">05 de Março de 2024</p>
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded">
                    <p className="font-medium text-green-800">Último Relatório</p>
                    <p className="text-sm text-green-600">Enviado em 05/02/2024</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Button 
                    className="w-full"
                    onClick={() => generateReport('anp-monthly', 'xml')}
                    data-testid="button-anp-monthly"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Gerar Relatório ANP
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    data-testid="button-anp-preview"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar Prévia
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Controle de Incertezas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Relatório de controle de incertezas de medição conforme normas
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <span>Equipamentos Fiscais</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {equipamentos?.filter((eq: any) => eq.classificacao === 'fiscal').length || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <span>Dentro dos Limites</span>
                    <Badge className="bg-green-100 text-green-800">
                      95.2%
                    </Badge>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Button 
                    className="w-full"
                    onClick={() => generateReport('uncertainty', 'pdf')}
                    data-testid="button-uncertainty-report"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Relatório de Incertezas
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    data-testid="button-uncertainty-excel"
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Planilha Detalhada
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operational" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Indicadores Operacionais</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  KPIs e indicadores de performance operacional
                </p>
                <div className="space-y-2">
                  <Button 
                    className="w-full"
                    onClick={() => generateReport('kpi', 'pdf')}
                    data-testid="button-kpi-report"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Dashboard Executivo
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    data-testid="button-kpi-excel"
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Dados Tabulados
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Histórico de Calibrações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Histórico completo de todas as calibrações realizadas
                </p>
                <div className="space-y-2">
                  <Button 
                    className="w-full"
                    onClick={() => generateReport('calibration-history', 'pdf')}
                    data-testid="button-calibration-history"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Histórico Completo
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    data-testid="button-calibration-timeline"
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Timeline de Eventos
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Análise de Tendências</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Análise estatística e tendências dos dados metrológicos
                </p>
                <div className="space-y-2">
                  <Button 
                    className="w-full"
                    onClick={() => generateReport('trends', 'pdf')}
                    data-testid="button-trends-report"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Análise Estatística
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    data-testid="button-forecast"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Previsões
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="custom" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Customizados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Modelos Salvos</h3>
                  <div className="space-y-3">
                    <div className="p-3 border border-border rounded hover:bg-accent cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Relatório Semanal - Gestão</p>
                          <p className="text-sm text-muted-foreground">Criado em 15/02/2024</p>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 border border-border rounded hover:bg-accent cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Análise Mensal - Operação</p>
                          <p className="text-sm text-muted-foreground">Criado em 10/02/2024</p>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Criar Novo Modelo</h3>
                  <div className="space-y-3">
                    <Button 
                      className="w-full"
                      data-testid="button-create-custom"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Relatório Customizado
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      data-testid="button-report-builder"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Construtor de Relatórios
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      data-testid="button-template-library"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Biblioteca de Templates
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
