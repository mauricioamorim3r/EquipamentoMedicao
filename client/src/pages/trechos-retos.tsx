import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Ruler, CheckCircle, AlertCircle, Calendar, Filter, Download, Eye } from "lucide-react";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import EnhancedStraightSectionForm from "@/components/enhanced-straight-section-form";
import type { TrechoReto, Equipamento } from "@shared/schema";

export default function TrechosRetos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTrechoReto, setEditingTrechoReto] = useState<TrechoReto | null>(null);
  
  const { toast } = useToast();

  // Fetch data
  const { data: trechosRetos, isLoading: trechosLoading } = useQuery({
    queryKey: ["/api/trechos-retos"],
    queryFn: () => api.getTrechosRetos(),
  });

  const { data: equipamentos } = useQuery({
    queryKey: ["/api/equipamentos"],
    queryFn: () => api.getEquipamentos(),
  });

  // Filter straight sections based on search
  const filteredTrechos = trechosRetos?.filter((trecho: TrechoReto) => {
    const matchesSearch = !searchTerm || 
      trecho.cartaNumero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trecho.numeroSerie.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trecho.tipoAco?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEquipment = !selectedEquipment || trecho.equipamentoId.toString() === selectedEquipment;
    
    return matchesSearch && matchesEquipment;
  }) || [];

  const getInspectionStatusBadge = (dataInspecao?: string) => {
    if (!dataInspecao) {
      return { text: 'Sem dados', className: 'bg-gray-100 text-gray-800' };
    }

    const today = new Date();
    const inspectionDate = new Date(dataInspecao);
    const diffMonths = (today.getFullYear() - inspectionDate.getFullYear()) * 12 + 
                      (today.getMonth() - inspectionDate.getMonth());

    if (diffMonths >= 12) {
      return { text: 'Vencida', className: 'bg-red-100 text-red-800' };
    } else if (diffMonths >= 10) {
      return { text: 'Próxima troca', className: 'bg-orange-100 text-orange-800' };
    } else {
      return { text: 'OK', className: 'bg-green-100 text-green-800' };
    }
  };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteTrechoReto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trechos-retos"] });
      toast({ title: "Trecho reto excluído com sucesso!" });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir trecho reto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const openNewTrechoForm = () => {
    setEditingTrechoReto(null);
    setIsFormOpen(true);
  };

  const handleEdit = (trecho: TrechoReto) => {
    setEditingTrechoReto(trecho);
    setIsFormOpen(true);
  };

  const handleDelete = (trecho: TrechoReto) => {
    if (confirm(`Tem certeza que deseja excluir o trecho reto ${trecho.numeroSerie}?`)) {
      deleteMutation.mutate(trecho.id);
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTrechoReto(null);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Trechos Retos</h1>
          <p className="text-muted-foreground">
            Gerencie os trechos retos dos equipamentos de medição
          </p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewTrechoForm} data-testid="button-new-straight-section">
              <Plus className="w-4 h-4 mr-2" />
              Novo Trecho Reto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTrechoReto ? 'Editar Trecho Reto' : 'Novo Trecho Reto'}
              </DialogTitle>
            </DialogHeader>
            <EnhancedStraightSectionForm
              trechoReto={editingTrechoReto}
              onClose={closeForm}
              onSuccess={closeForm}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card data-testid="card-total-straight-sections">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Trechos</p>
                <p className="text-3xl font-bold text-foreground">{filteredTrechos.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Ruler className="text-primary w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-ok-straight-sections">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Condições</p>
                <p className="text-3xl font-bold text-green-700">
                  {filteredTrechos.filter((t: any) => {
                    const badge = getInspectionStatusBadge(t.dataInspecao || undefined);
                    return badge.text === 'OK';
                  }).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-500 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-expiring-straight-sections">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Próximas à Troca</p>
                <p className="text-3xl font-bold text-orange-700">
                  {filteredTrechos.filter((t: any) => {
                    const badge = getInspectionStatusBadge(t.dataInspecao || undefined);
                    return badge.text === 'Próxima troca';
                  }).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="text-orange-500 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-expired-straight-sections">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vencidas</p>
                <p className="text-3xl font-bold text-red-600">
                  {filteredTrechos.filter((t: any) => {
                    const badge = getInspectionStatusBadge(t.dataInspecao || undefined);
                    return badge.text === 'Vencida';
                  }).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <AlertCircle className="text-red-500 w-6 h-6" />
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por carta, série ou tipo de aço"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-input"
              />
            </div>
            
            <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
              <SelectTrigger data-testid="filter-equipment">
                <SelectValue placeholder="Todos os Equipamentos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Equipamentos</SelectItem>
                {equipamentos?.map((equip: any) => (
                  <SelectItem key={equip.id} value={equip.id.toString()}>
                    {equip.tag} - {equip.nome}
                  </SelectItem>
                ))}
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

      {/* Straight Sections List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Trechos Retos ({filteredTrechos.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {trechosLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-muted rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : filteredTrechos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Ruler className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Nenhum trecho reto encontrado</p>
              <p className="text-sm">
                {searchTerm || selectedEquipment
                  ? 'Tente ajustar os filtros de busca'
                  : 'Adicione o primeiro trecho reto'
                }
              </p>
              {!searchTerm && !selectedEquipment && (
                <Button className="mt-4" onClick={openNewTrechoForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Trecho Reto
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTrechos.map((trecho: TrechoReto) => {
                const statusBadge = getInspectionStatusBadge(
                  trecho.dataInspecao || undefined
                );
                
                return (
                  <div
                    key={trecho.id}
                    className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                    data-testid={`straight-section-card-${trecho.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="font-semibold text-lg">
                            N° Série: {trecho.numeroSerie}
                          </h3>
                          <Badge className={statusBadge.className}>
                            {statusBadge.text}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div>
                            <p className="font-medium text-foreground">Classe: {trecho.classe || 'N/A'}</p>
                            <p>Tipo de Aço: {trecho.tipoAco || 'N/A'}</p>
                            <p>Norma: {trecho.norma || 'N/A'}</p>
                          </div>
                          <div>
                            <p>DN: {trecho.diametroNominal ? `${trecho.diametroNominal} mm` : 'N/A'}</p>
                            <p>Dr @ 20°C: {trecho.diametroReferencia20c ? `${trecho.diametroReferencia20c} mm` : 'N/A'}</p>
                            <p>Carta N°: {trecho.cartaNumero || 'N/A'}</p>
                          </div>
                          <div>
                            <p>Data Inspeção: {trecho.dataInspecao ? new Date(trecho.dataInspecao).toLocaleDateString('pt-BR') : 'N/A'}</p>
                            <p>Data Instalação: {trecho.dataInstalacao ? new Date(trecho.dataInstalacao).toLocaleDateString('pt-BR') : 'N/A'}</p>
                            <p>Certificado: {trecho.certificadoVigente || 'N/A'}</p>
                          </div>
                          <div>
                            <p>TAG Montante: {trecho.tagTrechoMontantePlaca || 'N/A'}</p>
                            <p>TAG Jusante: {trecho.tagTrechoJusante || 'N/A'}</p>
                            <p>Condicionador: {trecho.tagCondicionadorFluxo || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          data-testid={`button-view-${trecho.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(trecho)}
                          data-testid={`button-edit-${trecho.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(trecho)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-${trecho.id}`}
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
    </div>
  );
}
