import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Plus, Search, Download, Edit, Trash2, Eye, MapPin, Calendar, Settings, Upload, FileDown, FileUp, FileSpreadsheet } from "lucide-react";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useImportExport } from "@/hooks/use-import-export";
import EquipmentForm from "@/components/equipment-form";
import EquipmentModal from "@/components/equipment-modal";
import { useTranslation } from "@/hooks/useLanguage";
import { useLocation } from "wouter";
import type { Equipamento, Polo, Instalacao } from "@shared/schema";
import type { EquipmentWithCalibration } from "@/types";

export default function Equipment() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPolo, setSelectedPolo] = useState<string>("");
  const [selectedInstalacao, setSelectedInstalacao] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipamento | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentWithCalibration | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { toast } = useToast();
  const { downloadTemplate, exportData, importData, isDownloading, isUploading, isExporting } = useImportExport("equipamentos");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await importData(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Fetch data
  const { data: equipamentos, isLoading: equipmentLoading, error } = useQuery({
    queryKey: ["/api/equipamentos/with-calibration", selectedPolo, selectedInstalacao, selectedStatus],
    queryFn: () => api.getEquipamentosWithCalibration(),
    retry: 3,
    refetchOnWindowFocus: false,
  });

  // Debug: log dos dados
  console.log("Equipamentos carregados:", equipamentos);
  console.log("Loading:", equipmentLoading);
  console.log("Error:", error);

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
    
    const matchesPolo = !selectedPolo || selectedPolo === "all" || eq.poloId?.toString() === selectedPolo;
    const matchesInstalacao = !selectedInstalacao || selectedInstalacao === "all" || eq.instalacaoId?.toString() === selectedInstalacao;
    const matchesStatus = !selectedStatus || selectedStatus === "all" || eq.status === selectedStatus;

    return matchesSearch && matchesPolo && matchesInstalacao && matchesStatus;
  }) || [];

  // Debug filtros
  console.log("Filtros ativos:", { searchTerm, selectedPolo, selectedInstalacao, selectedStatus });
  console.log("Equipamentos filtrados:", filteredEquipments.length);
  console.log("Dados dos equipamentos:", equipamentos?.map(eq => ({ tag: eq.tag, poloId: eq.poloId, status: eq.status, statusOperacional: eq.statusOperacional })));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'em_operacao':
        return { text: t('operational'), className: 'bg-green-100 text-green-800' };
      case 'fora_operacao':
        return { text: t('nonOperational'), className: 'bg-red-100 text-red-800' };
      case 'em_calibracao':
        return { text: t('calibrating'), className: 'bg-blue-100 text-blue-800' };
      case 'em_manutencao':
        return { text: t('maintenance'), className: 'bg-yellow-100 text-yellow-800' };
      case 'fora_uso':
        return { text: 'Fora de Uso', className: 'bg-gray-100 text-gray-800' };
      case 'sobressalente':
        return { text: 'Sobressalente', className: 'bg-purple-100 text-purple-800' };
      // Backward compatibility
      case 'ativo':
        return { text: t('active'), className: 'bg-green-100 text-green-800' };
      case 'inativo':
        return { text: t('inactive'), className: 'bg-gray-100 text-gray-800' };
      case 'manutencao':
        return { text: t('maintenance'), className: 'bg-yellow-100 text-yellow-800' };
      default:
        return { text: status, className: 'bg-gray-100 text-gray-800' };
    }
  };

  const getCalibrationStatusBadge = (diasParaVencer?: number) => {
    if (!diasParaVencer && diasParaVencer !== 0) {
      return { text: t('noData'), className: 'bg-gray-100 text-gray-800' };
    }
    if (diasParaVencer <= 0) {
      return { text: t('expired'), className: 'bg-red-100 text-red-800' };
    }
    if (diasParaVencer <= 7) {
      return { text: t('critical'), className: 'bg-orange-100 text-orange-800' };
    }
    if (diasParaVencer <= 30) {
      return { text: t('alert'), className: 'bg-yellow-100 text-yellow-800' };
    }
    return { text: t('ok'), className: 'bg-green-100 text-green-800' };
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
        <div className="flex gap-2">
          {/* Import/Export Buttons */}
          <Button
            variant="outline"
            onClick={downloadTemplate}
            disabled={isDownloading}
            data-testid="button-download-template"
          >
            <FileDown className="w-4 h-4 mr-2" />
            {t('downloadTemplate')}
          </Button>

          <Button
            variant="outline"
            onClick={exportData}
            disabled={isExporting}
            data-testid="button-export-data"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            {t('exportData')}
          </Button>

          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            data-testid="button-import-data"
          >
            <FileUp className="w-4 h-4 mr-2" />
            {t('importData')}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Importar arquivo de equipamentos"
          />

          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewEquipmentForm} data-testid="button-new-equipment">
                <Plus className="w-4 h-4 mr-2" />
                {t('addEquipment')}
              </Button>
            </DialogTrigger>
            <DialogContent size="4xl">
              <DialogHeader>
                <DialogTitle>
                  {editingEquipment ? t('edit') + ' ' + t('equipments').slice(0, -1) : t('addEquipment')}
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
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">{t('filter')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('search') + ' por TAG, nome ou fabricante'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-input"
              />
            </div>
            
            <Select value={selectedPolo} onValueChange={setSelectedPolo}>
              <SelectTrigger data-testid="filter-polo">
                <SelectValue placeholder={t('allPoles')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allPoles')}</SelectItem>
                {polos?.map((polo: Polo) => (
                  <SelectItem key={polo.id} value={polo.id.toString()}>
                    {polo.sigla} - {polo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedInstalacao} onValueChange={setSelectedInstalacao}>
              <SelectTrigger data-testid="filter-instalacao">
                <SelectValue placeholder={t('allInstallations')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allInstallations')}</SelectItem>
                {instalacoes?.map((instalacao: Instalacao) => (
                  <SelectItem key={instalacao.id} value={instalacao.id.toString()}>
                    {instalacao.sigla} - {instalacao.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger data-testid="filter-status">
                <SelectValue placeholder={t('allStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allStatus')}</SelectItem>
                <SelectItem value="em_operacao">{t('operational')}</SelectItem>
                <SelectItem value="fora_operacao">{t('nonOperational')}</SelectItem>
                <SelectItem value="em_calibracao">{t('calibrating')}</SelectItem>
                <SelectItem value="em_manutencao">{t('maintenance')}</SelectItem>
                <SelectItem value="fora_uso">Fora de Uso</SelectItem>
                <SelectItem value="sobressalente">Sobressalente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Equipment List */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle>
            {t('equipments')} ({filteredEquipments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          {equipmentLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-muted rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : filteredEquipments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">{t('noEquipmentFound')}</p>
              <p className="text-sm">
                {searchTerm || selectedPolo || selectedInstalacao || selectedStatus
                  ? t('adjustSearchFilters')
                  : t('addFirstEquipment')
                }
              </p>
              {!searchTerm && !selectedPolo && !selectedInstalacao && !selectedStatus && (
                <Button className="mt-4" onClick={openNewEquipmentForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('addEquipment')}
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
                          {equipment.numeroSerie && (
                            <span className="text-sm font-mono text-primary bg-primary/10 px-2 py-1 rounded">
                              S/N: {equipment.numeroSerie}
                            </span>
                          )}
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
          closeDetails();
          navigate("/calibracoes");
        }}
      />
    </div>
  );
}
