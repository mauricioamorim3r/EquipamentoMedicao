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
import { Plus, Search, Filter, Download, Edit, Trash2, Eye, MapPin, Calendar, AlertCircle, Flame, Upload, FileText, TestTube } from "lucide-react";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import WellForm from "@/components/well-form";
import BtpTestForm from "@/components/btp-test-form";
import WellCard from "@/components/well-card";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { CadastroPoço, Polo, Instalacao, TestePoco } from "@shared/schema";

export default function Wells() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPolo, setSelectedPolo] = useState<string>("");
  const [selectedInstalacao, setSelectedInstalacao] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWell, setEditingWell] = useState<CadastroPoço | null>(null);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [selectedWell, setSelectedWell] = useState<CadastroPoço | null>(null);
  
  const { toast } = useToast();

  // Fetch data
  const { data: wells, isLoading: wellsLoading } = useQuery({
    queryKey: ["/api/pocos", selectedPolo, selectedInstalacao],
    queryFn: () => api.getPocos({ 
      poloId: selectedPolo ? parseInt(selectedPolo) : undefined,
      instalacaoId: selectedInstalacao ? parseInt(selectedInstalacao) : undefined 
    }),
  });

  // Use the original wells data - individual WellCard components will handle test loading
  const wellsWithTests = wells || [];

  const { data: polos } = useQuery({
    queryKey: ["/api/polos"],
    queryFn: api.getPolos,
  });

  const { data: instalacoes } = useQuery({
    queryKey: ["/api/instalacoes", selectedPolo],
    queryFn: () => selectedPolo ? api.getInstalacoes(parseInt(selectedPolo)) : api.getInstalacoes(),
    enabled: !!selectedPolo,
  });

  // Filter wells based on search
  const filteredWells = wellsWithTests.filter((well: any) => {
    const matchesSearch = !searchTerm || 
      well.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      well.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      well.codigoAnp?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getWellStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo':
        return { text: 'Ativo', className: 'bg-green-100 text-green-800' };
      case 'inativo':
        return { text: 'Inativo', className: 'bg-gray-100 text-gray-800' };
      case 'suspenso':
        return { text: 'Suspenso', className: 'bg-yellow-100 text-yellow-800' };
      case 'abandonado':
        return { text: 'Abandonado', className: 'bg-red-100 text-red-800' };
      default:
        return { text: status, className: 'bg-gray-100 text-gray-800' };
    }
  };

  const getTestStatusBadge = (lastTestDate?: string, frequencyDays: number = 90) => {
    if (!lastTestDate) {
      return { text: 'Sem teste', className: 'bg-gray-100 text-gray-800', daysOverdue: 0 };
    }
    
    const today = new Date();
    const testDate = new Date(lastTestDate);
    const daysSinceTest = Math.floor((today.getTime() - testDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysOverdue = daysSinceTest - frequencyDays;
    
    if (daysOverdue <= 0) {
      return { text: 'Em dia', className: 'bg-green-100 text-green-800', daysOverdue };
    } else if (daysOverdue <= 7) {
      return { text: 'Próximo ao prazo', className: 'bg-yellow-100 text-yellow-800', daysOverdue };
    } else {
      return { text: 'Vencido', className: 'bg-red-100 text-red-800', daysOverdue };
    }
  };

  const handleEdit = (well: CadastroPoço) => {
    setEditingWell(well);
    setIsFormOpen(true);
  };

  const openNewWellForm = () => {
    setEditingWell(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingWell(null);
  };

  const openBtpTestForm = (well: CadastroPoço) => {
    setSelectedWell(well);
    setTestDialogOpen(true);
  };

  const closeBtpTestForm = () => {
    setTestDialogOpen(false);
    setSelectedWell(null);
  };

  // Calculate BTP test status based on actual test data
  const getBtpStatus = (well: CadastroPoço, tests?: TestePoco[]) => {
    if (!tests || tests.length === 0) {
      return {
        status: 'sem_teste',
        daysSinceTest: -1,
        daysOverdue: -1,
        lastTestDate: null,
        badge: { text: 'Sem teste', className: 'bg-gray-100 text-gray-800' }
      };
    }

    // Get most recent test
    const latestTest = tests.sort((a, b) => 
      new Date(b.dataTeste).getTime() - new Date(a.dataTeste).getTime()
    )[0];

    const today = new Date();
    const testDate = new Date(latestTest.dataTeste);
    const daysSinceTest = differenceInDays(today, testDate);
    const frequencyDays = well.frequenciaTesteDias || 90;
    const daysOverdue = daysSinceTest - frequencyDays;

    if (daysOverdue <= 0) {
      return {
        status: 'em_dia',
        daysSinceTest,
        daysOverdue,
        lastTestDate: latestTest.dataTeste,
        badge: { text: 'Em dia', className: 'bg-green-100 text-green-800' }
      };
    } else if (daysOverdue <= 7) {
      return {
        status: 'proximo',
        daysSinceTest,
        daysOverdue,
        lastTestDate: latestTest.dataTeste,
        badge: { text: 'Próximo ao prazo', className: 'bg-yellow-100 text-yellow-800' }
      };
    } else {
      return {
        status: 'vencido',
        daysSinceTest,
        daysOverdue,
        lastTestDate: latestTest.dataTeste,
        badge: { text: 'Vencido', className: 'bg-red-100 text-red-800' }
      };
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground" data-testid="page-title">
            Gestão de Poços
          </h1>
          <p className="text-muted-foreground">
            Controle de poços produtores e testes BTP (90 dias)
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" data-testid="button-import-btp">
            <Upload className="w-4 h-4 mr-2" />
            Importar BTP
          </Button>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewWellForm} data-testid="button-new-well">
                <Plus className="w-4 h-4 mr-2" />
                Novo Poço
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingWell ? 'Editar Poço' : 'Novo Poço'}
                </DialogTitle>
              </DialogHeader>
              <WellForm
                well={editingWell}
                onClose={closeForm}
                onSuccess={closeForm}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* BTP Test Dialog */}
      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registro de Teste BTP</DialogTitle>
          </DialogHeader>
          {selectedWell && (
            <BtpTestForm
              well={selectedWell}
              onClose={closeBtpTestForm}
              onSuccess={closeBtpTestForm}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card data-testid="card-total-wells">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Poços</p>
                <p className="text-3xl font-bold text-foreground">{filteredWells.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Flame className="text-primary w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-active-wells">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Poços Ativos</p>
                <p className="text-3xl font-bold text-green-600">
                  {filteredWells.filter((w: any) => w.status === 'ativo').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Flame className="text-green-500 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-overdue-tests">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Testes Vencidos</p>
                <p className="text-3xl font-bold text-red-600">0</p>
                <p className="text-xs text-muted-foreground">Carregando dados...</p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <AlertCircle className="text-red-500 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-due-tests">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Próximos ao Prazo</p>
                <p className="text-3xl font-bold text-orange-600">0</p>
                <p className="text-xs text-muted-foreground">Carregando dados...</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="text-orange-500 w-6 h-6" />
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
                placeholder="Buscar por código, nome ou ANP"
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

            <Button variant="outline" data-testid="button-export">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Wells List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Poços Cadastrados ({filteredWells.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {wellsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-muted rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : filteredWells.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Flame className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Nenhum poço encontrado</p>
              <p className="text-sm">
                {searchTerm || selectedPolo || selectedInstalacao
                  ? 'Tente ajustar os filtros de busca'
                  : 'Adicione o primeiro poço para começar'
                }
              </p>
              {!searchTerm && !selectedPolo && !selectedInstalacao && (
                <Button className="mt-4" onClick={openNewWellForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Poço
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredWells.map((well: CadastroPoço) => (
                <WellCard
                  key={well.id}
                  well={well}
                  onEdit={handleEdit}
                  onBtpTest={openBtpTestForm}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
