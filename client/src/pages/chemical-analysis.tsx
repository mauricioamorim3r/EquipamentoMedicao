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
import type { PlanoColeta } from "@shared/schema";

export default function ChemicalAnalysis() {
  const [activeTab, setActiveTab] = useState("collection-plans");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanoColeta | null>(null);
  
  const { toast } = useToast();

  // Fetch data
  const { data: planosColeta, isLoading: plansLoading } = useQuery({
    queryKey: ["/api/planos-coleta"],
    queryFn: () => api.getPlanosColeta(),
  });

  const { data: pontosMedicao } = useQuery({
    queryKey: ["/api/pontos-medicao"],
    queryFn: () => api.getPontosMedicao(),
  });

  // Filter collection plans based on search and filters
  const filteredPlans = planosColeta?.filter((plan: PlanoColeta) => {
    const matchesSearch = !searchTerm || 
      plan.pontoMedicaoId.toString().includes(searchTerm);
    
    const matchesStatus = !selectedStatus || plan.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const getCollectionStatusBadge = (plan: PlanoColeta) => {
    if (plan.resultadoEmitido) {
      return { text: 'Concluído', className: 'bg-green-100 text-green-800' };
    } else if (plan.coletaRealizada) {
      return { text: 'Aguardando resultado', className: 'bg-blue-100 text-blue-800' };
    } else if (plan.embarqueRealizado) {
      return { text: 'Em coleta', className: 'bg-orange-100 text-orange-800' };
    } else if (plan.embarqueAgendado) {
      return { text: 'Agendado', className: 'bg-yellow-100 text-yellow-800' };
    } else {
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

  // Calculate summary statistics
  const summaryStats = {
    total: filteredPlans.length,
    pending: filteredPlans.filter(p => !p.embarqueAgendado).length,
    scheduled: filteredPlans.filter(p => p.embarqueAgendado && !p.embarqueRealizado).length,
    inProgress: filteredPlans.filter(p => p.embarqueRealizado && !p.resultadoEmitido).length,
    completed: filteredPlans.filter(p => p.resultadoEmitido).length,
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
          <Button variant="outline" data-testid="button-cylinder-management">
            <Beaker className="w-4 h-4 mr-2" />
            Gestão de Cilindros
          </Button>
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
                <p className="text-3xl font-bold text-green-600">{summaryStats.completed}</p>
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="collection-plans" data-testid="tab-collection-plans">
            <FlaskConical className="w-4 h-4 mr-2" />
            Planos de Coleta
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
                    <SelectItem value="">Todos os Status</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="agendado">Agendado</SelectItem>
                    <SelectItem value="em-andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Mais Filtros
                </Button>

                <Button variant="outline" data-testid="button-export">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
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
                    const priorityBadge = getPriorityBadge(plan.dataEmbarque || undefined);
                    
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
                                Ponto: {plan.pontoMedicaoId}
                              </h3>
                              <Badge className={statusBadge.className}>
                                {statusBadge.text}
                              </Badge>
                              <Badge className={priorityBadge.className}>
                                {priorityBadge.text}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                              <div>
                                <p>Data Embarque: {plan.dataEmbarque ? new Date(plan.dataEmbarque).toLocaleDateString('pt-BR') : 'N/A'}</p>
                                <p>Data Desembarque: {plan.dataDesembarque ? new Date(plan.dataDesembarque).toLocaleDateString('pt-BR') : 'N/A'}</p>
                              </div>
                              <div>
                                <p className="flex items-center">
                                  <CheckCircle className={`w-3 h-3 mr-1 ${plan.validadoOperacao ? 'text-green-500' : 'text-gray-300'}`} />
                                  Validado Operação
                                </p>
                                <p className="flex items-center">
                                  <CheckCircle className={`w-3 h-3 mr-1 ${plan.validadoLaboratorio ? 'text-green-500' : 'text-gray-300'}`} />
                                  Validado Laboratório
                                </p>
                              </div>
                              <div>
                                <p className="flex items-center">
                                  <CheckCircle className={`w-3 h-3 mr-1 ${plan.cilindrosDisponiveis ? 'text-green-500' : 'text-gray-300'}`} />
                                  Cilindros Disponíveis
                                </p>
                                <p className="flex items-center">
                                  <CheckCircle className={`w-3 h-3 mr-1 ${plan.embarqueAgendado ? 'text-green-500' : 'text-gray-300'}`} />
                                  Embarque Agendado
                                </p>
                              </div>
                              <div>
                                <p className="flex items-center">
                                  <CheckCircle className={`w-3 h-3 mr-1 ${plan.coletaRealizada ? 'text-green-500' : 'text-gray-300'}`} />
                                  Coleta Realizada
                                </p>
                                <p className="flex items-center">
                                  <CheckCircle className={`w-3 h-3 mr-1 ${plan.resultadoEmitido ? 'text-green-500' : 'text-gray-300'}`} />
                                  Resultado Emitido
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
