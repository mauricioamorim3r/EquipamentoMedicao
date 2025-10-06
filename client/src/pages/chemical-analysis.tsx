import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Filter, Download, Edit, Trash2, Eye, FlaskConical, Calendar, AlertCircle, CheckCircle, Clock, Ship, Beaker } from "lucide-react";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import CollectionPlanForm from "@/components/collection-plan-form";
import CalendarioDashboard from "@/components/calendario-dashboard";
import type { PlanoColeta, AnaliseQuimica } from "@shared/schema";

export default function ChemicalAnalysis() {
  const [activeTab, setActiveTab] = useState("collection-plans");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanoColeta | null>(null);
  const [editingAnalise, setEditingAnalise] = useState<AnaliseQuimica | null>(null);

  // Advanced filters
  const [selectedInstalacao, setSelectedInstalacao] = useState<string>("");
  const [selectedCampo, setSelectedCampo] = useState<string>("");
  const [selectedPoco, setSelectedPoco] = useState<string>("");
  const [selectedTipoAmostra, setSelectedTipoAmostra] = useState<string>("");
  const [selectedTipoAnalise, setSelectedTipoAnalise] = useState<string>("");
  const [selectedAplicabilidade, setSelectedAplicabilidade] = useState<string>("");
  const [selectedPeriodicidade, setSelectedPeriodicidade] = useState<string>("");

  const { toast } = useToast();

  // Fetch data
  const { data: planosColeta, isLoading: plansLoading } = useQuery({
    queryKey: ["/api/planos-coleta"],
    queryFn: () => api.getPlanosColeta(),
  });

  const { data: analisesQuimicas, isLoading: analisesLoading } = useQuery({
    queryKey: ["/api/analises-quimicas"],
    queryFn: () => api.getAnalisesQuimicas(),
  });

  const { data: pontosMedicao } = useQuery({
    queryKey: ["/api/pontos-medicao"],
    queryFn: () => api.getPontosMedicao(),
  });

  const { data: instalacoes } = useQuery({
    queryKey: ["/api/instalacoes"],
    queryFn: () => api.getInstalacoes(),
  });

  const { data: campos } = useQuery({
    queryKey: ["/api/campos"],
    queryFn: () => api.getCampos(),
  });

  const { data: pocos } = useQuery({
    queryKey: ["/api/wells"],
    queryFn: () => api.getWells(),
  });

  // Filter collection plans based on search and filters
  const filteredPlans = planosColeta?.filter((plan: PlanoColeta) => {
    const matchesSearch = !searchTerm ||
      plan.pontoMedicaoId.toString().includes(searchTerm) ||
      plan.tag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.pontoAmostragem?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !selectedStatus || plan.status === selectedStatus;
    const matchesInstalacao = !selectedInstalacao || plan.instalacaoId?.toString() === selectedInstalacao;
    const matchesCampo = !selectedCampo || plan.campoId?.toString() === selectedCampo;
    const matchesPoco = !selectedPoco || plan.pocoId?.toString() === selectedPoco;
    const matchesTipoAmostra = !selectedTipoAmostra || plan.tipoAmostra === selectedTipoAmostra;
    const matchesTipoAnalise = !selectedTipoAnalise || plan.tipoAnalise === selectedTipoAnalise;
    const matchesAplicabilidade = !selectedAplicabilidade || plan.aplicabilidade === selectedAplicabilidade;
    const matchesPeriodicidade = !selectedPeriodicidade || plan.periodicidade === selectedPeriodicidade;

    return matchesSearch && matchesStatus && matchesInstalacao && matchesCampo &&
           matchesPoco && matchesTipoAmostra && matchesTipoAnalise &&
           matchesAplicabilidade && matchesPeriodicidade;
  }) || [];

  // Calculate summary statistics
  const summaryStats = {
    total: filteredPlans.length,
    pending: filteredPlans.filter((p: any) => p.status === 'pendente').length,
    scheduled: filteredPlans.filter((p: any) => p.status === 'agendado').length,
    inProgress: filteredPlans.filter((p: any) => p.status === 'coletado' || p.status === 'laboratorio').length,
    completed: filteredPlans.filter((p: any) => p.status === 'concluido').length,
  };

  const getCollectionStatusBadge = (plan: PlanoColeta) => {
    // Use the actual status field instead of inferring from checkboxes
    switch (plan.status) {
      case 'concluido':
        return { text: 'Concluído', className: 'bg-green-100 text-green-800' };
      case 'laboratorio':
        return { text: 'Laboratório', className: 'bg-blue-100 text-blue-800' };
      case 'coletado':
        return { text: 'Coletado', className: 'bg-orange-100 text-orange-800' };
      case 'agendado':
        return { text: 'Agendado', className: 'bg-yellow-100 text-yellow-800' };
      case 'pendente':
      default:
        return { text: 'Pendente', className: 'bg-gray-100 text-gray-800' };
    }
  };

  const getPriorityBadge = (dataEmbarque?: string) => {
    if (!dataEmbarque) return { text: 'Sem data', className: 'bg-gray-100 text-gray-800' };
    
    const today = new Date();
    const embarqueDate = new Date(dataEmbarque);
    const daysUntilEmbarque = Math.floor((embarqueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilEmbarque < 0) {
      return { text: 'Atrasado', className: 'bg-red-100 text-red-800' };
    } else if (daysUntilEmbarque <= 3) {
      return { text: 'Urgente', className: 'bg-red-100 text-red-800' };
    } else if (daysUntilEmbarque <= 7) {
      return { text: 'Próximo', className: 'bg-orange-100 text-orange-800' };
    } else {
      return { text: 'Programado', className: 'bg-green-100 text-green-800' };
    }
  };

  const handleEdit = (plan: PlanoColeta) => {
    setEditingPlan(plan);
    setIsFormOpen(true);
  };

  const openNewPlanForm = () => {
    setEditingPlan(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingPlan(null);
  };

  const deletePlanMutation = useMutation({
    mutationFn: api.deletePlanoColeta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/planos-coleta"] });
      toast({
        title: "Sucesso",
        description: "Plano de coleta excluído com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir plano de coleta",
        variant: "destructive",
      });
    },
  });

  const handleDeletePlan = (plan: PlanoColeta) => {
    if (window.confirm(`Tem certeza que deseja excluir o plano de coleta do ponto ${plan.pontoMedicaoId}?`)) {
      deletePlanMutation.mutate(plan.id);
    }
  };

  const clearAdvancedFilters = () => {
    setSelectedInstalacao("");
    setSelectedCampo("");
    setSelectedPoco("");
    setSelectedTipoAmostra("");
    setSelectedTipoAnalise("");
    setSelectedAplicabilidade("");
    setSelectedPeriodicidade("");
  };

  const hasActiveAdvancedFilters = !!(
    selectedInstalacao ||
    selectedCampo ||
    selectedPoco ||
    selectedTipoAmostra ||
    selectedTipoAnalise ||
    selectedAplicabilidade ||
    selectedPeriodicidade
  );

  // Calculate summary statistics using status field
  const stats = {
    pending: filteredPlans.filter((p: any) => p.status === 'pendente').length,
    scheduled: filteredPlans.filter((p: any) => p.status === 'agendado').length,
    inProgress: filteredPlans.filter((p: any) => p.status === 'coletado' || p.status === 'laboratorio').length,
    completed: filteredPlans.filter((p: any) => p.status === 'concluido').length,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground" data-testid="page-title">
            Análises Químicas
          </h1>
          <p className="text-muted-foreground">
            Gestão de coletas para análises cromatográficas e PVT
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewPlanForm} data-testid="button-new-collection">
                <Plus className="w-4 h-4 mr-2" />
                Nova Coleta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPlan ? 'Editar Plano de Coleta' : 'Novo Plano de Coleta'}
                </DialogTitle>
              </DialogHeader>
              <CollectionPlanForm
                plan={editingPlan}
                onClose={closeForm}
                onSuccess={closeForm}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <Card data-testid="card-total-collections">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-3xl font-bold text-foreground">{summaryStats.total}</p>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <FlaskConical className="text-primary w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-pending-collections">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                <p className="text-3xl font-bold text-gray-600">{summaryStats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-gray-500/20 rounded-lg flex items-center justify-center">
                <Clock className="text-gray-500 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-scheduled-collections">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Agendadas</p>
                <p className="text-3xl font-bold text-yellow-600">{summaryStats.scheduled}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="text-yellow-500 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-progress-collections">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Andamento</p>
                <p className="text-3xl font-bold text-blue-600">{summaryStats.inProgress}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Ship className="text-blue-500 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-completed-collections">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Concluídas</p>
                <p className="text-3xl font-bold text-green-700">{summaryStats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-500 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="collection-plans" data-testid="tab-collection-plans">
            <FlaskConical className="w-4 h-4 mr-2" />
            Planos de Coleta
          </TabsTrigger>
          <TabsTrigger value="analyses" data-testid="tab-analyses">
            <FlaskConical className="w-4 h-4 mr-2" />
            Análises Químicas
          </TabsTrigger>
          <TabsTrigger value="calendar" data-testid="tab-calendar">
            <Calendar className="w-4 h-4 mr-2" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="cylinders" data-testid="tab-cylinders">
            <Beaker className="w-4 h-4 mr-2" />
            Cilindros
          </TabsTrigger>
          <TabsTrigger value="results" data-testid="tab-results">
            <Download className="w-4 h-4 mr-2" />
            Resultados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="collection-plans" className="mt-6">
          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por ponto de medição"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="search-input"
                  />
                </div>
                
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger data-testid="filter-status">
                    <SelectValue placeholder="Todos os Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="agendado">Agendado</SelectItem>
                    <SelectItem value="em-andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                  </SelectContent>
                </Select>

                <Dialog open={isAdvancedFiltersOpen} onOpenChange={setIsAdvancedFiltersOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="relative">
                      <Filter className="w-4 h-4 mr-2" />
                      Filtros Avançados
                      {hasActiveAdvancedFilters && (
                        <Badge className="ml-2 bg-primary text-white px-1.5 py-0.5 text-xs">
                          ✓
                        </Badge>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Filtros Avançados</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Instalação</label>
                        <Select value={selectedInstalacao} onValueChange={setSelectedInstalacao}>
                          <SelectTrigger>
                            <SelectValue placeholder="Todas as instalações" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Todas</SelectItem>
                            {instalacoes?.map((inst: any) => (
                              <SelectItem key={inst.id} value={inst.id.toString()}>
                                {inst.sigla} - {inst.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Campo</label>
                        <Select value={selectedCampo} onValueChange={setSelectedCampo}>
                          <SelectTrigger>
                            <SelectValue placeholder="Todos os campos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Todos</SelectItem>
                            {campos?.map((campo: any) => (
                              <SelectItem key={campo.id} value={campo.id.toString()}>
                                {campo.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Poço</label>
                        <Select value={selectedPoco} onValueChange={setSelectedPoco}>
                          <SelectTrigger>
                            <SelectValue placeholder="Todos os poços" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Todos</SelectItem>
                            {pocos?.map((poco: any) => (
                              <SelectItem key={poco.id} value={poco.id.toString()}>
                                {poco.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Tipo de Amostra</label>
                        <Select value={selectedTipoAmostra} onValueChange={setSelectedTipoAmostra}>
                          <SelectTrigger>
                            <SelectValue placeholder="Todos os tipos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Todos</SelectItem>
                            <SelectItem value="gas-natural">Gás Natural</SelectItem>
                            <SelectItem value="oleo-cru">Óleo Cru</SelectItem>
                            <SelectItem value="condensado">Condensado</SelectItem>
                            <SelectItem value="agua-producao">Água de Produção</SelectItem>
                            <SelectItem value="glp">GLP</SelectItem>
                            <SelectItem value="outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Tipo de Análise</label>
                        <Select value={selectedTipoAnalise} onValueChange={setSelectedTipoAnalise}>
                          <SelectTrigger>
                            <SelectValue placeholder="Todos os tipos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Todos</SelectItem>
                            <SelectItem value="pvt">PVT</SelectItem>
                            <SelectItem value="cromatografia">Cromatografia</SelectItem>
                            <SelectItem value="bsw">BSW</SelectItem>
                            <SelectItem value="teor-enxofre">Teor de Enxofre</SelectItem>
                            <SelectItem value="grau-api">Grau °API</SelectItem>
                            <SelectItem value="outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Aplicabilidade</label>
                        <Select value={selectedAplicabilidade} onValueChange={setSelectedAplicabilidade}>
                          <SelectTrigger>
                            <SelectValue placeholder="Todas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Todas</SelectItem>
                            <SelectItem value="fiscal">Fiscal</SelectItem>
                            <SelectItem value="apropriacao">Apropriação</SelectItem>
                            <SelectItem value="transferencia-custodia">Transferência de Custódia</SelectItem>
                            <SelectItem value="operacional">Operacional</SelectItem>
                            <SelectItem value="analise-tecnica">Análise Técnica</SelectItem>
                            <SelectItem value="outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Periodicidade</label>
                        <Select value={selectedPeriodicidade} onValueChange={setSelectedPeriodicidade}>
                          <SelectTrigger>
                            <SelectValue placeholder="Todas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Todas</SelectItem>
                            <SelectItem value="diaria">Diária</SelectItem>
                            <SelectItem value="semanal">Semanal</SelectItem>
                            <SelectItem value="quinzenal">Quinzenal</SelectItem>
                            <SelectItem value="mensal">Mensal</SelectItem>
                            <SelectItem value="bimestral">Bimestral</SelectItem>
                            <SelectItem value="trimestral">Trimestral</SelectItem>
                            <SelectItem value="semestral">Semestral</SelectItem>
                            <SelectItem value="anual">Anual</SelectItem>
                            <SelectItem value="sob-demanda">Sob Demanda</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={clearAdvancedFilters}
                      >
                        Limpar Filtros
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setIsAdvancedFiltersOpen(false)}
                      >
                        Aplicar Filtros
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Collection Plans List */}
          <Card>
            <CardHeader>
              <CardTitle>
                Planos de Coleta ({filteredPlans.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {plansLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-20 bg-muted rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : filteredPlans.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FlaskConical className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Nenhum plano de coleta encontrado</p>
                  <p className="text-sm">
                    {searchTerm || selectedStatus
                      ? 'Tente ajustar os filtros de busca'
                      : 'Adicione o primeiro plano de coleta'
                    }
                  </p>
                  {!searchTerm && !selectedStatus && (
                    <Button className="mt-4" onClick={openNewPlanForm}>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Plano
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPlans.map((plan: PlanoColeta) => {
                    const statusBadge = getCollectionStatusBadge(plan);
                    const pontoMedicao = pontosMedicao?.find((p: any) => p.id === plan.pontoMedicaoId);

                    return (
                      <div
                        key={plan.id}
                        className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                        data-testid={`collection-plan-${plan.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-2">
                              <h3 className="font-semibold text-lg">
                                {pontoMedicao ? `${pontoMedicao.tag} - ${pontoMedicao.nome}` : `Ponto ID: ${plan.pontoMedicaoId}`}
                              </h3>
                              <Badge className={statusBadge.className}>
                                {statusBadge.text}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                              <div>
                                <p className="mb-1">
                                  <strong>TAG:</strong> {plan.tag || 'N/A'}
                                </p>
                                <p className="mb-1">
                                  <strong>Instalação:</strong> {plan.instalacaoId ? instalacoes?.find(i => i.id === plan.instalacaoId)?.sigla || `ID ${plan.instalacaoId}` : 'N/A'}
                                </p>
                                <p className="mb-1">
                                  <strong>Campo:</strong> {plan.campoId ? campos?.find(c => c.id === plan.campoId)?.nome || `ID ${plan.campoId}` : 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="mb-1">
                                  <strong>Tipo de Amostra:</strong> {plan.tipoAmostra || 'N/A'}
                                </p>
                                <p className="mb-1">
                                  <strong>Tipo de Análise:</strong> {plan.tipoAnalise || 'N/A'}
                                </p>
                                <p className="mb-1">
                                  <strong>Aplicabilidade:</strong> {plan.aplicabilidade || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="mb-1">
                                  <strong>Ponto de Amostragem:</strong> {plan.pontoAmostragem || 'N/A'}
                                </p>
                                <p className="mb-1">
                                  <strong>Periodicidade:</strong> {plan.periodicidade || 'N/A'}
                                </p>
                                <p className="mb-1">
                                  <strong>Poço:</strong> {plan.pocoId ? pocos?.find(p => p.id === plan.pocoId)?.nome || `ID ${plan.pocoId}` : 'N/A'}
                                </p>
                              </div>
                            </div>
                            
                            {plan.observacoes && (
                              <div className="mt-2 p-2 bg-muted rounded text-xs">
                                <strong>Observações:</strong> {plan.observacoes}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              data-testid={`button-view-${plan.id}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(plan)}
                              data-testid={`button-edit-${plan.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePlan(plan)}
                              disabled={deletePlanMutation.isPending}
                              data-testid={`button-delete-${plan.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analyses" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                Análises Químicas ({analisesQuimicas?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analisesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 bg-muted rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : !analisesQuimicas?.length ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FlaskConical className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Nenhuma análise química encontrada</p>
                  <p className="text-sm mb-4">
                    As análises químicas serão criadas automaticamente quando os planos de coleta forem executados.
                  </p>
                  <Button variant="outline" onClick={() => setActiveTab("collection-plans")}>
                    <FlaskConical className="w-4 h-4 mr-2" />
                    Ver Planos de Coleta
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {analisesQuimicas.map((analise: AnaliseQuimica) => (
                    <div
                      key={analise.id}
                      className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                      data-testid={`analise-${analise.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <h3 className="font-semibold text-lg">
                              {analise.tipoFluido || 'Análise Química'}
                            </h3>
                            <Badge className={
                              analise.aprovadoIso17025 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }>
                              {analise.aprovadoIso17025 ? 'ISO 17025' : 'Pendente'}
                            </Badge>
                            <Badge className={
                              analise.statusAnalise === 'concluida' 
                                ? 'bg-green-100 text-green-800' 
                                : analise.statusAnalise === 'em_andamento'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }>
                              {analise.statusAnalise === 'concluida' ? 'Concluída' : 
                               analise.statusAnalise === 'em_andamento' ? 'Em Andamento' : 'Pendente'}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <div>
                              <p>Data Coleta: {analise.dataColeta ? new Date(analise.dataColeta).toLocaleDateString('pt-BR') : 'N/A'}</p>
                              <p>Laboratório: {analise.laboratorio || 'N/A'}</p>
                            </div>
                            <div>
                              <p>Protocolo: {analise.numeroProtocolo || 'N/A'}</p>
                              <p>Cilindro: {analise.numeroCilindro || 'N/A'}</p>
                            </div>
                            <div>
                              <p>Pressão: {analise.pressaoColeta ? `${analise.pressaoColeta} bar` : 'N/A'}</p>
                              <p>Temperatura: {analise.temperaturaColeta ? `${analise.temperaturaColeta}°C` : 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button variant="ghost" size="sm" data-testid={`button-view-analise-${analise.id}`}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" data-testid={`button-edit-analise-${analise.id}`}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" data-testid={`button-delete-analise-${analise.id}`}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Calendário de Atividades
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Visualize todas as atividades planejadas de coleta e análises químicas em um calendário.
                </p>
              </CardHeader>
              <CardContent>
                <CalendarioDashboard />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cylinders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Cilindros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Beaker className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Gestão de Cilindros</p>
                <p className="text-sm">Controle de estoque e rastreamento de cilindros para coleta</p>
                <Button className="mt-4" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Cilindro
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Resultados de Análises</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Download className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Resultados de Análises</p>
                <p className="text-sm">Visualização e download de resultados laboratoriais</p>
                <div className="mt-4 space-x-2">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Importar Resultados
                  </Button>
                  <Button variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Histórico
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
