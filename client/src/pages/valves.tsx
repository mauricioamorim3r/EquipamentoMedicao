import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Filter, Download, Edit, Trash2, Settings, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ValveForm from "@/components/valve-form";
import AdvancedFiltersDialog from "@/components/advanced-filters-dialog";
import type { Valvula, Polo } from "@shared/schema";

export default function Valves() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPolo, setSelectedPolo] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [editingValve, setEditingValve] = useState<Valvula | null>(null);

  // Advanced filters
  const [selectedTipo, setSelectedTipo] = useState<string>("");
  const [selectedClassePressao, setSelectedClassePressao] = useState<string>("");
  const [selectedDiametroNominal, setSelectedDiametroNominal] = useState<string>("");

  const { toast } = useToast();

  // Fetch data
  const { data: valvulas = [], isLoading: valvulasLoading } = useQuery({
    queryKey: ["/api/valvulas"],
    queryFn: () => api.getValvulas(),
  });

  const { data: polos = [] } = useQuery({
    queryKey: ["/api/polos"],
    queryFn: api.getPolos,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteValvula(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/valvulas"] });
      toast({
        title: "Sucesso",
        description: "Válvula removida com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao remover válvula",
        variant: "destructive",
      });
    },
  });

  // Filter valves
  const filteredValves = valvulas.filter((valve: Valvula) => {
    const matchesSearch =
      valve.tagValvula?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      valve.tipoValvula?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      valve.finalidadeSistema?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !selectedStatus || selectedStatus === "all" || valve.statusOperacional === selectedStatus;
    const matchesTipo = !selectedTipo || valve.tipoValvula === selectedTipo;
    const matchesClasse = !selectedClassePressao || valve.classePressaoDiametro === selectedClassePressao;
    const matchesDiametro = !selectedDiametroNominal || valve.diametroNominal === selectedDiametroNominal;

    return matchesSearch && matchesStatus && matchesTipo && matchesClasse && matchesDiametro;
  });

  const clearAdvancedFilters = () => {
    setSelectedTipo("");
    setSelectedClassePressao("");
    setSelectedDiametroNominal("");
  };

  const hasActiveAdvancedFilters = !!(selectedTipo || selectedClassePressao || selectedDiametroNominal);

  // Status functions
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operacional':
        return { text: 'Operacional', className: 'bg-green-100 text-green-800' };
      case 'manutencao':
        return { text: 'Manutenção', className: 'bg-yellow-100 text-yellow-800' };
      case 'inoperante':
        return { text: 'Inoperante', className: 'bg-red-100 text-red-800' };
      default:
        return { text: status, className: 'bg-gray-100 text-gray-800' };
    }
  };

  const getTestStatusBadge = (dataUltimoTeste?: string, dataPrevistaProximoTeste?: string) => {
    if (!dataPrevistaProximoTeste) {
      return { text: 'Não programado', className: 'bg-gray-100 text-gray-800', icon: Clock };
    }

    const proximoTeste = new Date(dataPrevistaProximoTeste);
    const hoje = new Date();
    const diasRestantes = Math.ceil((proximoTeste.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

    if (diasRestantes < 0) {
      return { text: 'Vencido', className: 'bg-red-100 text-red-800', icon: AlertTriangle };
    } else if (diasRestantes <= 7) {
      return { text: 'Crítico', className: 'bg-orange-100 text-orange-800', icon: AlertTriangle };
    } else if (diasRestantes <= 30) {
      return { text: 'Próximo', className: 'bg-yellow-100 text-yellow-800', icon: Clock };
    } else {
      return { text: 'Em dia', className: 'bg-green-100 text-green-800', icon: CheckCircle };
    }
  };

  // Form handlers
  const openNewValveForm = () => {
    setEditingValve(null);
    setIsFormOpen(true);
  };

  const openEditValveForm = (valve: Valvula) => {
    setEditingValve(valve);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingValve(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja remover esta válvula?")) {
      deleteMutation.mutate(id);
    }
  };

  // Stats calculations
  const stats = {
    total: filteredValves.length,
    operacional: filteredValves.filter((v: Valvula) => v.statusOperacional === 'operacional').length,
    manutencao: filteredValves.filter((v: Valvula) => v.statusOperacional === 'manutencao').length,
    testesVencidos: filteredValves.filter((v: Valvula) => {
      if (!v.dataPrevistaProximoTeste) return false;
      return new Date(v.dataPrevistaProximoTeste) < new Date();
    }).length,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground" data-testid="page-title">
            Gestão de Válvulas
          </h1>
          <p className="text-muted-foreground">
            Controle de válvulas e testes de estanqueidade
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewValveForm} data-testid="button-new-valve">
              <Plus className="w-4 h-4 mr-2" />
              Nova Válvula
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingValve ? 'Editar Válvula' : 'Nova Válvula'}
              </DialogTitle>
            </DialogHeader>
            <ValveForm
              valve={editingValve}
              onClose={closeForm}
              onSuccess={closeForm}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card data-testid="card-total-valves">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Válvulas</p>
                <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Settings className="text-primary w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-operational-valves">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Operacionais</p>
                <p className="text-3xl font-bold text-green-700">{stats.operacional}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-500 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-maintenance-valves">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Manutenção</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.manutencao}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Clock className="text-yellow-500 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-expired-tests">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Testes Vencidos</p>
                <p className="text-3xl font-bold text-red-600">{stats.testesVencidos}</p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-red-500 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por TAG, tipo ou função"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                data-testid="search-input"
              />
            </div>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger data-testid="status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="operacional">Operacional</SelectItem>
                <SelectItem value="manutencao">Manutenção</SelectItem>
                <SelectItem value="inoperante">Inoperante</SelectItem>
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
                  <label className="text-sm font-medium mb-2 block">Tipo de Válvula</label>
                  <Select value={selectedTipo} onValueChange={setSelectedTipo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="gaveta">Gaveta</SelectItem>
                      <SelectItem value="esfera">Esfera</SelectItem>
                      <SelectItem value="globo">Globo</SelectItem>
                      <SelectItem value="borboleta">Borboleta</SelectItem>
                      <SelectItem value="retencao">Retenção</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Classe de Pressão</label>
                  <Select value={selectedClassePressao} onValueChange={setSelectedClassePressao}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas</SelectItem>
                      <SelectItem value="150">150</SelectItem>
                      <SelectItem value="300">300</SelectItem>
                      <SelectItem value="600">600</SelectItem>
                      <SelectItem value="900">900</SelectItem>
                      <SelectItem value="1500">1500</SelectItem>
                      <SelectItem value="2500">2500</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Diâmetro Nominal</label>
                  <Select value={selectedDiametroNominal} onValueChange={setSelectedDiametroNominal}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os diâmetros" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="50mm">50mm</SelectItem>
                      <SelectItem value="75mm">75mm</SelectItem>
                      <SelectItem value="100mm">100mm</SelectItem>
                      <SelectItem value="150mm">150mm</SelectItem>
                      <SelectItem value="200mm">200mm</SelectItem>
                      <SelectItem value="250mm">250mm</SelectItem>
                      <SelectItem value="300mm">300mm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AdvancedFiltersDialog>
          </div>
        </CardContent>
      </Card>

      {/* Valves List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Válvulas ({filteredValves.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {valvulasLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-muted rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : filteredValves.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Nenhuma válvula encontrada</p>
              <p className="text-sm">
                {searchTerm || selectedStatus
                  ? 'Tente ajustar os filtros de busca'
                  : 'Adicione a primeira válvula'
                }
              </p>
              {!searchTerm && !selectedStatus && (
                <Button className="mt-4" onClick={openNewValveForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Válvula
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredValves.map((valve: Valvula) => {
                const statusBadge = getStatusBadge(valve.statusOperacional || 'operacional');
                const testBadge = getTestStatusBadge(
                  valve.dataUltimoTeste || undefined,
                  valve.dataPrevistaProximoTeste || undefined
                );
                const TestIcon = testBadge.icon;

                return (
                  <div
                    key={valve.id}
                    className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                    data-testid={`valve-card-${valve.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="font-semibold text-lg">
                            TAG: {valve.tagValvula}
                          </h3>
                          <Badge className={statusBadge.className}>
                            {statusBadge.text}
                          </Badge>
                          <Badge className={testBadge.className}>
                            <TestIcon className="w-3 h-3 mr-1" />
                            {testBadge.text}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div>
                            <p className="font-medium text-foreground">Tipo: {valve.tipoValvula || 'N/A'}</p>
                            <p>N° Série: {valve.numeroSerie || 'N/A'}</p>
                            <p>Fabricante: {valve.fabricante || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">DN: {valve.diametroNominal || 'N/A'}</p>
                            <p>Classe/DN: {valve.classePressaoDiametro || 'N/A'}</p>
                            <p>Finalidade: {valve.finalidadeSistema || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Classificação: {valve.classificacao || 'N/A'}</p>
                            <p>Modelo: {valve.modelo || 'N/A'}</p>
                            <p>Local: {valve.localInstalacao || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              Último Teste: {valve.dataUltimoTeste ?
                                new Date(valve.dataUltimoTeste).toLocaleDateString('pt-BR') : 'N/A'}
                            </p>
                            <p>
                              Próximo Teste: {valve.dataPrevistaProximoTeste ?
                                new Date(valve.dataPrevistaProximoTeste).toLocaleDateString('pt-BR') : 'N/A'}
                            </p>
                            <p>Resultado: {valve.resultadoUltimoTeste || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openEditValveForm(valve)}
                          data-testid={`edit-valve-${valve.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(valve.id)}
                          className="text-red-500 hover:text-red-700"
                          data-testid={`delete-valve-${valve.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
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
    </div>
  );
}