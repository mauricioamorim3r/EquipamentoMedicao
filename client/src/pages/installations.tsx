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
  Building2,
  Activity,
  BarChart3,
  Users,
  Droplets,
  Gauge,
  FileText
} from "lucide-react";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import InstallationForm from "@/components/installation-form";
import AdvancedFiltersDialog from "@/components/advanced-filters-dialog";
import { useTranslation } from "@/hooks/useLanguage";
import type { Instalacao, Polo, Campo } from "@shared/schema";

export default function Installations() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPolo, setSelectedPolo] = useState<string>("all");
  const [selectedCampo, setSelectedCampo] = useState<string>("all");
  const [selectedTipo, setSelectedTipo] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [editingInstallation, setEditingInstallation] = useState<Instalacao | null>(null);
  const [activeTab, setActiveTab] = useState("list");

  // Advanced filters
  const [selectedTipoInstalacao, setSelectedTipoInstalacao] = useState<string>("");

  const { toast } = useToast();

  // Fetch data
  const { data: installations, isLoading: installationsLoading } = useQuery({
    queryKey: ["/api/instalacoes", selectedPolo],
    queryFn: () => api.getInstalacoes(selectedPolo && selectedPolo !== 'all' ? parseInt(selectedPolo) : undefined),
  });

  const { data: polos } = useQuery({
    queryKey: ["/api/polos"],
    queryFn: api.getPolos,
  });

  const { data: campos } = useQuery({
    queryKey: ["/api/campos"],
    queryFn: () => api.getCampos(),
  });

  // Mutations
  const deleteInstallationMutation = useMutation({
    mutationFn: (id: number) => api.deleteInstalacao(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/instalacoes"] });
      toast({ title: `${t('installations').slice(0, -1)} ${t('deletedSuccessfully')}!` });
    },
    onError: (error) => {
      toast({ 
        title: "Erro ao excluir instalação", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Filter installations
  const filteredInstallations = installations?.filter((installation: Instalacao) => {
    const matchesSearch = !searchTerm ||
      installation.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      installation.sigla?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPolo = !selectedPolo || selectedPolo === 'all' || installation.poloId === parseInt(selectedPolo);
    const matchesCampo = !selectedCampo || selectedCampo === 'all' || installation.campoId === parseInt(selectedCampo);
    const matchesTipo = !selectedTipo || selectedTipo === 'all' || installation.tipo === selectedTipo;
    const matchesTipoInstalacao = !selectedTipoInstalacao || installation.tipo === selectedTipoInstalacao;

    return matchesSearch && matchesPolo && matchesCampo && matchesTipo && matchesTipoInstalacao;
  }) || [];

  const clearAdvancedFilters = () => {
    setSelectedTipoInstalacao("");
  };

  const hasActiveAdvancedFilters = !!selectedTipoInstalacao;

  const handleEdit = (installation: Instalacao) => {
    setEditingInstallation(installation);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm(`Tem certeza que deseja excluir esta ${t('installations').slice(0, -1).toLowerCase()}?`)) {
      deleteInstallationMutation.mutate(id);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingInstallation(null);
    queryClient.invalidateQueries({ queryKey: ["/api/instalacoes"] });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'ativo': { className: 'bg-green-100 text-green-800', text: 'Ativo' },
      'inativo': { className: 'bg-gray-100 text-gray-800', text: 'Inativo' },
      'manutencao': { className: 'bg-yellow-100 text-yellow-800', text: 'Manutenção' },
      'desativado': { className: 'bg-red-100 text-red-800', text: 'Desativado' }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.ativo;
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo?.toLowerCase()) {
      case 'fpso': return <Building2 className="w-4 h-4" />;
      case 'plataforma': return <Activity className="w-4 h-4" />;
      case 'refinaria': return <Gauge className="w-4 h-4" />;
      case 'terminal': return <MapPin className="w-4 h-4" />;
      default: return <Building2 className="w-4 h-4" />;
    }
  };

  // Statistics
  const stats = {
    total: filteredInstallations.length,
    ativas: filteredInstallations.filter((i: any) => i.status === 'ativo').length,
    tipos: Array.from(new Set(filteredInstallations.map((i: any) => i.tipo).filter(Boolean))).length,
    producao: filteredInstallations.reduce((sum: number, i: any) => sum + (i.capacidadePetroleo || 0), 0)
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground" data-testid="page-title">{t('installations')}</h1>
          <p className="text-muted-foreground">
            Gerencie as {t('installations').toLowerCase()}
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingInstallation(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Instalação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingInstallation ? 'Editar Instalação' : 'Nova Instalação'}
                </DialogTitle>
              </DialogHeader>
              <InstallationForm
                installation={editingInstallation}
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
              <Building2 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ativas</p>
                <p className="text-3xl font-bold text-green-700">{stats.ativas}</p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
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
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cap. Petróleo</p>
                <p className="text-3xl font-bold text-orange-700">{stats.producao.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">bbl/dia</p>
              </div>
              <Droplets className="w-8 h-8 text-orange-500" />
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
                placeholder="Buscar instalações..."
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

            <Select value={selectedCampo} onValueChange={setSelectedCampo}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os Campos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Campos</SelectItem>
                {campos?.map((campo: Campo) => (
                  <SelectItem key={campo.id} value={campo.id.toString()}>
                    {campo.sigla} - {campo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTipo} onValueChange={setSelectedTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os Tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="FPSO">FPSO</SelectItem>
                <SelectItem value="Plataforma">Plataforma</SelectItem>
                <SelectItem value="Refinaria">Refinaria</SelectItem>
                <SelectItem value="Terminal">Terminal</SelectItem>
                <SelectItem value="UEP">UEP</SelectItem>
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
                  <label className="text-sm font-medium mb-2 block">Tipo de Instalação</label>
                  <Select value={selectedTipoInstalacao} onValueChange={setSelectedTipoInstalacao}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="plataforma">Plataforma</SelectItem>
                      <SelectItem value="fpso">FPSO</SelectItem>
                      <SelectItem value="manifold">Manifold</SelectItem>
                      <SelectItem value="estacao">Estação</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
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
                      <SelectItem value="all">Todos</SelectItem>
                      {campos?.map((campo: Campo) => (
                        <SelectItem key={campo.id} value={campo.id.toString()}>
                          {campo.sigla} - {campo.nome}
                        </SelectItem>
                      ))}
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
          <TabsTrigger value="map">Mapa</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Instalações ({filteredInstallations.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {installationsLoading ? (
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
                        <TableHead>Sigla</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Polo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Cap. Petróleo</TableHead>
                        <TableHead>Cap. Gás</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInstallations.map((installation: Instalacao) => {
                        const statusBadge = getStatusBadge(installation.status || 'ativo');
                        return (
                          <TableRow key={installation.id}>
                            <TableCell className="font-mono font-medium">
                              <div className="flex items-center">
                                {getTipoIcon(installation.tipo || '')}
                                <span className="ml-2">{installation.sigla}</span>
                              </div>
                            </TableCell>
                            <TableCell>{installation.nome}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{installation.tipo || 'N/A'}</Badge>
                            </TableCell>
                            <TableCell>
                              {polos?.find((p: Polo) => p.id === installation.poloId)?.sigla || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge className={statusBadge.className}>
                                {statusBadge.text}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {installation.capacidadePetroleo ? `${installation.capacidadePetroleo.toLocaleString()} bbl/dia` : 'N/A'}
                            </TableCell>
                            <TableCell>
                              {installation.capacidadeGas ? `${installation.capacidadeGas.toLocaleString()} m³/dia` : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(installation)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(installation.id)}
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
                  
                  {filteredInstallations.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma instalação encontrada
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInstallations.map((installation: Instalacao) => {
              const statusBadge = getStatusBadge(installation.status || 'ativo');
              return (
                <Card key={installation.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        {getTipoIcon(installation.tipo || '')}
                        <div className="ml-3">
                          <CardTitle className="text-lg">{installation.sigla}</CardTitle>
                          <p className="text-sm text-muted-foreground">{installation.nome}</p>
                        </div>
                      </div>
                      <Badge className={statusBadge.className}>
                        {statusBadge.text}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Tipo:</span>
                        <Badge variant="outline">{installation.tipo || 'N/A'}</Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Polo:</span>
                        <span className="text-sm font-medium">
                          {polos?.find((p: Polo) => p.id === installation.poloId)?.sigla || 'N/A'}
                        </span>
                      </div>
                      
                      {installation.capacidadePetroleo && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Petróleo:</span>
                          <span className="text-sm font-medium">
                            {installation.capacidadePetroleo.toLocaleString()} bbl/dia
                          </span>
                        </div>
                      )}
                      
                      {installation.capacidadeGas && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Gás:</span>
                          <span className="text-sm font-medium">
                            {installation.capacidadeGas.toLocaleString()} m³/dia
                          </span>
                        </div>
                      )}
                      
                      <div className="flex space-x-2 pt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEdit(installation)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(installation.id)}
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

        <TabsContent value="map">
          <Card>
            <CardContent className="p-6">
              <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Visualização em mapa será implementada em breve
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}