import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Filter, Download, Edit, Trash2, Eye, MapPin, Calendar, Settings } from "lucide-react";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import EquipmentForm from "@/components/equipment-form";
import EquipmentModal from "@/components/equipment-modal";
import type { Equipamento, Polo, Instalacao } from "@shared/schema";
import type { EquipmentWithCalibration } from "@/types";

export default function Equipment() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPolo, setSelectedPolo] = useState<string>("");
  const [selectedInstalacao, setSelectedInstalacao] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipamento | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentWithCalibration | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const { toast } = useToast();

  // Fetch data
  const { data: equipamentos, isLoading: equipmentLoading } = useQuery({
    queryKey: ["/api/equipamentos/with-calibration", selectedPolo, selectedInstalacao, selectedStatus],
    queryFn: () => api.getEquipamentosWithCalibration(),
  });

  const { data: polos } = useQuery({
    queryKey: ["/api/polos"],
    queryFn: api.getPolos,
  });

  const { data: instalacoes } = useQuery({
    queryKey: ["/api/instalacoes", selectedPolo],
    queryFn: () => selectedPolo ? api.getInstalacoes(parseInt(selectedPolo)) : api.getInstalacoes(),
    enabled: !!selectedPolo,
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteEquipamento(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipamentos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/equipamentos/with-calibration"] });
      toast({
        title: "Sucesso",
        description: "Equipamento excluído com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir equipamento",
        variant: "destructive",
      });
    },
  });

  // Filter equipment based on search and filters
  const filteredEquipments = equipamentos?.filter((eq: EquipmentWithCalibration) => {
    const matchesSearch = !searchTerm || 
      eq.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.fabricante?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPolo = !selectedPolo || selectedPolo === "all" || eq.poloId.toString() === selectedPolo;
    const matchesInstalacao = !selectedInstalacao || selectedInstalacao === "all" || eq.instalacaoId.toString() === selectedInstalacao;
    const matchesStatus = !selectedStatus || selectedStatus === "all" || eq.status === selectedStatus;

    return matchesSearch && matchesPolo && matchesInstalacao && matchesStatus;
  }) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo':
        return { text: 'Ativo', className: 'bg-green-100 text-green-800' };
      case 'inativo':
        return { text: 'Inativo', className: 'bg-gray-100 text-gray-800' };
      case 'manutencao':
        return { text: 'Manutenção', className: 'bg-yellow-100 text-yellow-800' };
      default:
        return { text: status, className: 'bg-gray-100 text-gray-800' };
    }
  };

  const getCalibrationStatusBadge = (diasParaVencer?: number) => {
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
    return { text: 'OK', className: 'bg-green-100 text-green-800' };
  };

  const handleEdit = (equipment: Equipamento) => {
    setEditingEquipment(equipment);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este equipamento?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleViewDetails = (equipment: EquipmentWithCalibration) => {
    setSelectedEquipment(equipment);
    setIsDetailsOpen(true);
  };

  const openNewEquipmentForm = () => {
    setEditingEquipment(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingEquipment(null);
  };

  const closeDetails = () => {
    setIsDetailsOpen(false);
    setSelectedEquipment(null);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground" data-testid="page-title">
            Gestão de Equipamentos
          </h1>
          <p className="text-muted-foreground">
            Controle completo de equipamentos de medição
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewEquipmentForm} data-testid="button-new-equipment">
              <Plus className="w-4 h-4 mr-2" />
              Novo Equipamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEquipment ? 'Editar Equipamento' : 'Novo Equipamento'}
              </DialogTitle>
            </DialogHeader>
            <EquipmentForm
              equipment={editingEquipment}
              onClose={closeForm}
              onSuccess={closeForm}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por TAG, nome ou fabricante"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-input"
              />
            </div>
            
            <Select value={selectedPolo} onValueChange={setSelectedPolo}>
              <SelectTrigger data-testid="filter-polo">
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
              <SelectTrigger data-testid="filter-instalacao">
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
              <SelectTrigger data-testid="filter-status">
                <SelectValue placeholder="Todos os Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="manutencao">Manutenção</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" data-testid="button-export">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Equipment List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Equipamentos ({filteredEquipments.length})
            </CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtros Avançados
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {equipmentLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-muted rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : filteredEquipments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Nenhum equipamento encontrado</p>
              <p className="text-sm">
                {searchTerm || selectedPolo || selectedInstalacao || selectedStatus
                  ? 'Tente ajustar os filtros de busca'
                  : 'Adicione o primeiro equipamento para começar'
                }
              </p>
              {!searchTerm && !selectedPolo && !selectedInstalacao && !selectedStatus && (
                <Button className="mt-4" onClick={openNewEquipmentForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Equipamento
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEquipments.map((equipment: EquipmentWithCalibration) => {
                const statusBadge = getStatusBadge(equipment.status);
                const calibrationBadge = getCalibrationStatusBadge(equipment.diasParaVencer);
                
                return (
                  <div
                    key={equipment.id}
                    className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                    data-testid={`equipment-card-${equipment.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="font-semibold text-lg font-mono">{equipment.tag}</h3>
                          <Badge className={statusBadge.className}>
                            {statusBadge.text}
                          </Badge>
                          <Badge className={calibrationBadge.className}>
                            {calibrationBadge.text}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div>
                            <p className="font-medium text-foreground">{equipment.nome}</p>
                            <p>
                              {equipment.fabricante && equipment.modelo 
                                ? `${equipment.fabricante} - ${equipment.modelo}`
                                : equipment.fabricante || equipment.modelo || 'N/A'
                              }
                            </p>
                          </div>
                          <div>
                            <p className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              Polo: {equipment.poloId} | Instalação: {equipment.instalacaoId}
                            </p>
                            {equipment.dataProximaCalibracão && (
                              <p className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                Próxima cal.: {new Date(equipment.dataProximaCalibracão).toLocaleDateString('pt-BR')}
                              </p>
                            )}
                          </div>
                          <div>
                            {equipment.certificado && (
                              <p className="text-xs font-mono">
                                Cert.: {equipment.certificado}
                              </p>
                            )}
                            {equipment.diasParaVencer !== undefined && (
                              <p className={equipment.diasParaVencer <= 7 ? 'text-red-600 font-medium' : ''}>
                                {equipment.diasParaVencer <= 0 
                                  ? `Vencido há ${Math.abs(equipment.diasParaVencer)} dias`
                                  : `${equipment.diasParaVencer} dias restantes`
                                }
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(equipment)}
                          data-testid={`button-view-${equipment.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(equipment as Equipamento)}
                          data-testid={`button-edit-${equipment.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(equipment.id)}
                          data-testid={`button-delete-${equipment.id}`}
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

      {/* Equipment Details Modal */}
      <EquipmentModal
        equipment={selectedEquipment}
        isOpen={isDetailsOpen}
        onClose={closeDetails}
        onEdit={(eq) => {
          closeDetails();
          handleEdit(eq as Equipamento);
        }}
        onScheduleCalibration={(eq) => {
          // TODO: Implement calibration scheduling
          toast({
            title: "Em desenvolvimento",
            description: "Funcionalidade de agendamento em desenvolvimento",
          });
        }}
      />
    </div>
  );
}
