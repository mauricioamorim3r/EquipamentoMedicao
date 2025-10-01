import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Gauge, CheckCircle, AlertCircle, Calendar, Filter, Download, Eye } from "lucide-react";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import MedidorPrimarioForm from "@/components/medidor-primario-form";

export default function MedidoresPrimarios() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTipoMedidor, setSelectedTipoMedidor] = useState<string>("");
  const [selectedEquipment, setSelectedEquipment] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMedidor, setEditingMedidor] = useState<any>(null);
  
  const { toast } = useToast();

  // Fetch data
  const { data: medidores, isLoading: medidoresLoading } = useQuery({
    queryKey: ["/api/medidores-primarios"],
    queryFn: () => api.getMedidoresPrimarios(),
  });

  const { data: equipamentos } = useQuery({
    queryKey: ["/api/equipamentos"],
    queryFn: () => api.getEquipamentos(),
  });

  const { data: campos } = useQuery({
    queryKey: ["/api/campos"],
    queryFn: () => api.getCampos(),
  });

  const { data: instalacoes } = useQuery({
    queryKey: ["/api/instalacoes"],
    queryFn: () => api.getInstalacoes(),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteMedidorPrimario(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medidores-primarios"] });
      toast({
        title: "Sucesso",
        description: "Medidor primário excluído com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao excluir medidor primário.",
        variant: "destructive",
      });
    },
  });

  // Filter medidores based on search
  const filteredMedidores = medidores?.filter((medidor: any) => {
    const matchesSearch = !searchTerm || 
      medidor.numeroSerie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medidor.tipoMedidor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medidor.material?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTipo = !selectedTipoMedidor || selectedTipoMedidor === "all" || medidor.tipoMedidor === selectedTipoMedidor;
    const matchesEquipment = !selectedEquipment || selectedEquipment === "all" || medidor.equipamentoId?.toString() === selectedEquipment;
    
    return matchesSearch && matchesTipo && matchesEquipment;
  }) || [];

  const getStatusBadge = (dataInspecao?: string) => {
    if (!dataInspecao) {
      return { text: 'Sem dados', className: 'bg-gray-100 text-gray-800' };
    }

    const inspecaoDate = new Date(dataInspecao);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - inspecaoDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff <= 365) {
      return { text: 'Válido', className: 'bg-green-100 text-green-800' };
    } else if (daysDiff <= 395) {
      return { text: 'Próximo vencimento', className: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { text: 'Vencido', className: 'bg-red-100 text-red-800' };
    }
  };

  const getTipoMedidorIcon = (tipo: string) => {
    switch (tipo) {
      case 'CORIOLIS':
        return <Gauge className="h-4 w-4" />;
      case 'ULTRASSÔNICO':
        return <Gauge className="h-4 w-4" />;
      case 'TURBINA':
        return <Gauge className="h-4 w-4" />;
      case 'DESLOCAMENTO_POSITIVO':
        return <Gauge className="h-4 w-4" />;
      case 'VORTEX':
        return <Gauge className="h-4 w-4" />;
      case 'VENTURI':
        return <Gauge className="h-4 w-4" />;
      case 'V_CONE':
        return <Gauge className="h-4 w-4" />;
      default:
        return <Gauge className="h-4 w-4" />;
    }
  };

  const handleEdit = (medidor: any) => {
    setEditingMedidor(medidor);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingMedidor(null);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este medidor primário?")) {
      deleteMutation.mutate(id);
    }
  };

  // Calculate summary stats
  const stats = {
    total: filteredMedidores.length,
    tipos: Array.from(new Set(filteredMedidores.map((m: any) => m.tipoMedidor))).length,
    validos: filteredMedidores.filter((m: any) => {
      if (!m.dataInspecao) return false;
      const daysDiff = Math.floor((new Date().getTime() - new Date(m.dataInspecao).getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 365;
    }).length,
    proximoVencimento: filteredMedidores.filter((m: any) => {
      if (!m.dataInspecao) return false;
      const daysDiff = Math.floor((new Date().getTime() - new Date(m.dataInspecao).getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff > 365 && daysDiff <= 395;
    }).length
  };

  if (medidoresLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medidores Primários</h1>
          <p className="text-muted-foreground">
            Gestão completa de medidores primários de vazão
          </p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingMedidor(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Medidor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMedidor ? "Editar Medidor Primário" : "Novo Medidor Primário"}
              </DialogTitle>
            </DialogHeader>
            <MedidorPrimarioForm
              medidor={editingMedidor}
              onSuccess={handleCloseForm}
              onCancel={handleCloseForm}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              medidores cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tipos</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tipos}</div>
            <p className="text-xs text-muted-foreground">
              tipos diferentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Válidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{stats.validos}</div>
            <p className="text-xs text-muted-foreground">
              inspeção em dia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próx. Vencimento</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.proximoVencimento}</div>
            <p className="text-xs text-muted-foreground">
              precisam atenção
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número de série, tipo, material..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedTipoMedidor} onValueChange={setSelectedTipoMedidor}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tipo de medidor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="CORIOLIS">Coriolis</SelectItem>
                <SelectItem value="ULTRASSÔNICO">Ultrassônico</SelectItem>
                <SelectItem value="TURBINA">Turbina</SelectItem>
                <SelectItem value="DESLOCAMENTO_POSITIVO">Deslocamento Positivo</SelectItem>
                <SelectItem value="VORTEX">Vortex</SelectItem>
                <SelectItem value="VENTURI">Venturi</SelectItem>
                <SelectItem value="V_CONE">V-Cone</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Equipamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos equipamentos</SelectItem>
                {equipamentos?.map((equipamento: any) => (
                  <SelectItem key={equipamento.id} value={equipamento.id.toString()}>
                    {equipamento.tag} - {equipamento.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Medidores List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Lista de Medidores Primários ({filteredMedidores.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMedidores.length === 0 ? (
            <div className="text-center py-8">
              <Gauge className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {medidores?.length === 0 
                  ? "Nenhum medidor primário cadastrado ainda."
                  : "Nenhum medidor encontrado com os filtros aplicados."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMedidores.map((medidor: any) => {
                const statusBadge = getStatusBadge(medidor.dataInspecao);
                
                return (
                  <div key={medidor.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getTipoMedidorIcon(medidor.tipoMedidor)}
                          <h3 className="font-semibold">{medidor.numeroSerie}</h3>
                          <Badge variant="secondary">{medidor.tipoMedidor}</Badge>
                          <Badge className={statusBadge.className}>
                            {statusBadge.text}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Diâmetro:</span> {medidor.diametroNominal || 'N/A'} mm
                          </div>
                          <div>
                            <span className="font-medium">Classe:</span> {medidor.classePressao || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Material:</span> {medidor.material || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Fluido:</span> {medidor.fluido || 'N/A'}
                          </div>
                          {medidor.dataInspecao && (
                            <div>
                              <span className="font-medium">Inspeção:</span> {new Date(medidor.dataInspecao).toLocaleDateString('pt-BR')}
                            </div>
                          )}
                          {medidor.norma && (
                            <div>
                              <span className="font-medium">Norma:</span> {medidor.norma}
                            </div>
                          )}
                          {medidor.certificadoVigente && (
                            <div>
                              <span className="font-medium">Certificado:</span> {medidor.certificadoVigente}
                            </div>
                          )}
                          {medidor.classeExatidao && (
                            <div>
                              <span className="font-medium">Exatidão:</span> {medidor.classeExatidao}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(medidor)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(medidor.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMedidor ? "Editar Medidor Primário" : "Novo Medidor Primário"}
            </DialogTitle>
          </DialogHeader>
          <MedidorPrimarioForm
            medidor={editingMedidor}
            onSuccess={handleCloseForm}
            onCancel={handleCloseForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}