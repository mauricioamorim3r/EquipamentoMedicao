import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  MapPin,
  Settings,
  Activity,
  Gauge,
  Thermometer,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  Wrench
} from "lucide-react";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useLanguage";
import MeasurementPointForm from "@/components/measurement-point-form";
import AdvancedFiltersDialog from "@/components/advanced-filters-dialog";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { PontoMedicao, Polo, Instalacao } from "@shared/schema";

export default function MeasurementPoints() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPolo, setSelectedPolo] = useState<string>("all");
  const [selectedInstalacao, setSelectedInstalacao] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<PontoMedicao | null>(null);
  const [activeTab, setActiveTab] = useState("list");

  // Advanced filters
  const [selectedClassificacao, setSelectedClassificacao] = useState<string>("");
  const [selectedTipoMedicao, setSelectedTipoMedicao] = useState<string>("");

  const { toast } = useToast();

  // Fetch data
  const { data: measurementPoints, isLoading: pointsLoading } = useQuery({
    queryKey: ["/api/pontos-medicao", selectedPolo, selectedInstalacao],
    queryFn: () => api.getPontosMedicao(),
  });

  const { data: polos } = useQuery({
    queryKey: ["/api/polos"],
    queryFn: api.getPolos,
  });

  const { data: instalacoes } = useQuery({
    queryKey: ["/api/instalacoes", selectedPolo],
    queryFn: () => api.getInstalacoes(selectedPolo && selectedPolo !== 'all' ? parseInt(selectedPolo) : undefined),
  });

  // Mutations
  const deletePointMutation = useMutation({
    mutationFn: (id: number) => api.deletePontoMedicao(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pontos-medicao"] });
      toast({ title: `Ponto de medição ${t('deletedSuccessfully')}!` });
    },
    onError: (error) => {
      toast({ 
        title: "Erro ao excluir ponto de medição", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Filter measurement points
  const filteredPoints = measurementPoints?.filter((point: PontoMedicao) => {
    const matchesSearch = !searchTerm ||
      point.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      point.tag?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPolo = !selectedPolo || selectedPolo === 'all' || point.poloId === parseInt(selectedPolo);
    const matchesInstalacao = !selectedInstalacao || selectedInstalacao === 'all' || point.instalacaoId === parseInt(selectedInstalacao);
    const matchesStatus = !selectedStatus || selectedStatus === 'all' || point.status === selectedStatus;
    const matchesClassificacao = !selectedClassificacao || point.classificacao === selectedClassificacao;
    const matchesTipoMedicao = !selectedTipoMedicao || point.tipoMedidorPrimario === selectedTipoMedicao;

    return matchesSearch && matchesPolo && matchesInstalacao && matchesStatus && matchesClassificacao && matchesTipoMedicao;
  }) || [];

  const clearAdvancedFilters = () => {
    setSelectedClassificacao("");
    setSelectedTipoMedicao("");
  };

  const hasActiveAdvancedFilters = !!(selectedClassificacao || selectedTipoMedicao);

  const handleEdit = (point: PontoMedicao) => {
    setEditingPoint(point);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este ponto de medição?")) {
      deletePointMutation.mutate(id);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingPoint(null);
    queryClient.invalidateQueries({ queryKey: ["/api/pontos-medicao"] });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'ativo': { className: 'bg-green-100 text-green-800', text: 'Ativo', icon: CheckCircle },
      'inativo': { className: 'bg-gray-100 text-gray-800', text: 'Inativo', icon: AlertCircle },
      'manutencao': { className: 'bg-yellow-100 text-yellow-800', text: 'Manutenção', icon: Wrench },
      'calibracao': { className: 'bg-blue-100 text-blue-800', text: 'Calibração', icon: Settings }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.ativo;
  };

  const getCalibrationStatus = (validUntil: string | null) => {
    if (!validUntil) return { text: 'Sem dados', className: 'bg-gray-100 text-gray-800', icon: AlertCircle };
    
    const daysUntilExpiry = differenceInDays(new Date(validUntil), new Date());
    
    if (daysUntilExpiry < 0) return { text: 'Vencido', className: 'bg-red-100 text-red-800', icon: AlertCircle };
    if (daysUntilExpiry <= 7) return { text: 'Crítico', className: 'bg-orange-100 text-orange-800', icon: AlertCircle };
    if (daysUntilExpiry <= 30) return { text: 'Alerta', className: 'bg-yellow-100 text-yellow-800', icon: Clock };
    return { text: 'OK', className: 'bg-green-100 text-green-800', icon: CheckCircle };
  };

  const getMedidorIcon = (tipo: string) => {
    switch (tipo?.toLowerCase()) {
      case 'pressão': case 'pressure': return <Gauge className="w-4 h-4" />;
      case 'temperatura': case 'temperature': return <Thermometer className="w-4 h-4" />;
      case 'vazão': case 'flow': return <Activity className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  // Statistics
  const stats = {
    total: filteredPoints.length,
    ativos: filteredPoints.filter((p: any) => p.status === 'ativo').length,
    criticos: filteredPoints.filter((p: any) => {
      const status = getCalibrationStatus(p.calibracaoPrimarioValida);
      return status.text === 'Crítico' || status.text === 'Vencido';
    }).length,
    tipos: Array.from(new Set(filteredPoints.map((p: any) => p.tipoMedidorPrimario).filter(Boolean))).length
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground" data-testid="page-title">Pontos de Medição</h1>
          <p className="text-muted-foreground">
            Gerencie os pontos de medição e seus equipamentos associados
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingPoint(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Ponto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPoint ? 'Editar Ponto de Medição' : 'Novo Ponto de Medição'}
                </DialogTitle>
              </DialogHeader>
              <MeasurementPointForm
                measurementPoint={editingPoint}
                onSuccess={handleFormSuccess}
                onCancel={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <MapPin className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ativos</p>
                <p className="text-3xl font-bold text-green-700">{stats.ativos}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Críticos</p>
                <p className="text-3xl font-bold text-red-600">{stats.criticos}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tipos</p>
                <p className="text-3xl font-bold text-purple-600">{stats.tipos}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar pontos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedPolo} onValueChange={setSelectedPolo}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os Polos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Polos</SelectItem>
                {polos?.map((polo: Polo) => (
                  <SelectItem key={polo.id} value={polo.id.toString()}>
                    {polo.sigla} - {polo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedInstalacao} onValueChange={setSelectedInstalacao}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as Instalações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Instalações</SelectItem>
                {instalacoes?.map((instalacao: Instalacao) => (
                  <SelectItem key={instalacao.id} value={instalacao.id.toString()}>
                    {instalacao.sigla} - {instalacao.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="manutencao">Manutenção</SelectItem>
                <SelectItem value="calibracao">Calibração</SelectItem>
              </SelectContent>
            </Select>

            <AdvancedFiltersDialog
              open={isAdvancedFiltersOpen}
              onOpenChange={setIsAdvancedFiltersOpen}
              hasActiveFilters={hasActiveAdvancedFilters}
              onClearFilters={clearAdvancedFilters}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Classificação</label>
                  <Select value={selectedClassificacao} onValueChange={setSelectedClassificacao}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as classificações" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas</SelectItem>
                      <SelectItem value="fiscal">Fiscal</SelectItem>
                      <SelectItem value="apropriacao">Apropriação</SelectItem>
                      <SelectItem value="operacional">Operacional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Tipo de Medição</label>
                  <Select value={selectedTipoMedicao} onValueChange={setSelectedTipoMedicao}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="vazao">Vazão</SelectItem>
                      <SelectItem value="pressao">Pressão</SelectItem>
                      <SelectItem value="temperatura">Temperatura</SelectItem>
                      <SelectItem value="densidade">Densidade</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AdvancedFiltersDialog>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="calibration">Status Calibração</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Pontos de Medição ({filteredPoints.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {pointsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>TAG</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Tipo Medidor</TableHead>
                        <TableHead>Instalação</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Cal. Primário</TableHead>
                        <TableHead>Localização</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPoints.map((point: PontoMedicao) => {
                        const statusBadge = getStatusBadge(point.status || 'ativo');
                        const calibrationStatus = getCalibrationStatus(point.calibracaoPrimarioValida);
                        const StatusIcon = statusBadge.icon;
                        const CalIcon = calibrationStatus.icon;
                        
                        return (
                          <TableRow key={point.id}>
                            <TableCell className="font-mono font-medium">
                              <div className="flex items-center">
                                {getMedidorIcon(point.tipoMedidorPrimario || '')}
                                <span className="ml-2">{point.tag}</span>
                              </div>
                            </TableCell>
                            <TableCell>{point.nome}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{point.tipoMedidorPrimario || 'N/A'}</Badge>
                            </TableCell>
                            <TableCell>
                              {instalacoes?.find((i: Instalacao) => i.id === point.instalacaoId)?.sigla || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge className={statusBadge.className}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusBadge.text}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={calibrationStatus.className}>
                                <CalIcon className="w-3 h-3 mr-1" />
                                {calibrationStatus.text}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {point.localizacao || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(point)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(point.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  
                  {filteredPoints.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum ponto de medição encontrado
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPoints.map((point: PontoMedicao) => {
              const statusBadge = getStatusBadge(point.status || 'ativo');
              const calibrationStatus = getCalibrationStatus(point.calibracaoPrimarioValida);
              const StatusIcon = statusBadge.icon;
              
              return (
                <Card key={point.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        {getMedidorIcon(point.tipoMedidorPrimario || '')}
                        <div className="ml-3">
                          <CardTitle className="text-lg">{point.tag}</CardTitle>
                          <p className="text-sm text-muted-foreground">{point.nome}</p>
                        </div>
                      </div>
                      <Badge className={statusBadge.className}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusBadge.text}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Tipo:</span>
                        <Badge variant="outline">{point.tipoMedidorPrimario || 'N/A'}</Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Instalação:</span>
                        <span className="text-sm font-medium">
                          {instalacoes?.find((i: Instalacao) => i.id === point.instalacaoId)?.sigla || 'N/A'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Calibração:</span>
                        <Badge className={calibrationStatus.className}>
                          {calibrationStatus.text}
                        </Badge>
                      </div>
                      
                      {point.localizacao && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Local:</span>
                          <span className="text-sm font-medium">{point.localizacao}</span>
                        </div>
                      )}
                      
                      <div className="flex space-x-2 pt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEdit(point)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(point.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="calibration">
          <Card>
            <CardHeader>
              <CardTitle>Status de Calibração</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPoints.map((point: PontoMedicao) => {
                  const calibrationStatus = getCalibrationStatus(point.calibracaoPrimarioValida);
                  const CalIcon = calibrationStatus.icon;
                  
                  return (
                    <div key={point.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getMedidorIcon(point.tipoMedidorPrimario || '')}
                        <div>
                          <p className="font-medium">{point.tag}</p>
                          <p className="text-sm text-muted-foreground">{point.nome}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {point.calibracaoPrimarioValida 
                              ? format(new Date(point.calibracaoPrimarioValida), 'dd/MM/yyyy', { locale: ptBR })
                              : 'Sem data'
                            }
                          </p>
                          <p className="text-xs text-muted-foreground">Vencimento</p>
                        </div>
                        
                        <Badge className={calibrationStatus.className}>
                          <CalIcon className="w-3 h-3 mr-1" />
                          {calibrationStatus.text}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}