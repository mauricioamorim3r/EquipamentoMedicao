import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  FileText, 
  Droplets,
  Flame,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TestePoco {
  id?: number;
  poloId: number;
  instalacaoId: number;
  pocoId: number;
  dataTeste?: string;
  resultadoUltimoTeste?: string;
  tipoTeste: string;
  dataPrevistoProximoTeste?: string;
  numeroBoletimTeste?: string;
  tagMedidorOleo?: string;
  vazaoOleo?: number;
  vazaoGas?: number;
  vazaoAgua?: number;
  bsw?: number;
  rgo?: number;
  resultadoTeste?: string;
  dataAtualizacaoPotencial?: string;
  observacoes?: string;
  arquivoBtpPath?: string;
  ehUltimoTeste: boolean;
  periodicidadeTeste?: number;
  createdAt?: string;
}

export default function TestesPocos() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPolo, setSelectedPolo] = useState("");
  const [selectedInstallation, setSelectedInstallation] = useState("");
  const [selectedTestType, setSelectedTestType] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<TestePoco | null>(null);

  // Fetch data
  const { data: testesPocos = [], isLoading: testsLoading, refetch } = useQuery({
    queryKey: ["/api/testes-pocos"],
    queryFn: () => api.getTestesPocos(),
  });

  const { data: polos = [] } = useQuery({
    queryKey: ["/api/polos"],
    queryFn: () => api.getPolos(),
  });

  const { data: instalacoes = [] } = useQuery({
    queryKey: ["/api/instalacoes"],
    queryFn: () => api.getInstalacoes(),
  });

  const { data: pocos = [] } = useQuery({
    queryKey: ["/api/pocos"],
    queryFn: () => api.getPocos(),
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteTestePoco(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/testes-pocos"] });
      toast({
        title: "Sucesso",
        description: "Teste de poço deletado com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao deletar teste de poço",
        variant: "destructive",
      });
    },
  });

  // Filter tests
  const filteredTests = testesPocos.filter((teste: TestePoco) => {
    const matchesSearch = !searchTerm || 
      teste.numeroBoletimTeste?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teste.tagMedidorOleo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teste.observacoes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPolo = !selectedPolo || teste.poloId.toString() === selectedPolo;
    const matchesInstallation = !selectedInstallation || teste.instalacaoId.toString() === selectedInstallation;
    const matchesTestType = !selectedTestType || teste.tipoTeste === selectedTestType;

    return matchesSearch && matchesPolo && matchesInstallation && matchesTestType;
  });

  // Get test result badge
  const getResultBadge = (resultado?: string) => {
    if (!resultado) return { text: 'Pendente', className: 'bg-gray-100 text-gray-800' };
    
    switch (resultado.toLowerCase()) {
      case 'aprovado':
      case 'satisfatório':
        return { text: resultado, className: 'bg-green-100 text-green-800' };
      case 'reprovado':
      case 'insatisfatório':
        return { text: resultado, className: 'bg-red-100 text-red-800' };
      case 'em análise':
        return { text: resultado, className: 'bg-yellow-100 text-yellow-800' };
      default:
        return { text: resultado, className: 'bg-blue-100 text-blue-800' };
    }
  };

  // Calculate days until next test
  const getDaysUntilNextTest = (dataPrevista?: string) => {
    if (!dataPrevista) return null;
    const today = new Date();
    const nextTest = new Date(dataPrevista);
    const diffTime = nextTest.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getNextTestBadge = (dataPrevista?: string) => {
    const days = getDaysUntilNextTest(dataPrevista);
    if (days === null) return null;
    
    if (days < 0) {
      return { text: `${Math.abs(days)} dias atrasado`, className: 'bg-red-100 text-red-800' };
    } else if (days === 0) {
      return { text: 'Hoje', className: 'bg-orange-100 text-orange-800' };
    } else if (days <= 7) {
      return { text: `${days} dias`, className: 'bg-yellow-100 text-yellow-800' };
    } else if (days <= 30) {
      return { text: `${days} dias`, className: 'bg-blue-100 text-blue-800' };
    } else {
      return { text: `${days} dias`, className: 'bg-green-100 text-green-800' };
    }
  };

  const handleEdit = (test: TestePoco) => {
    setEditingTest(test);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja deletar este teste?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingTest(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    refetch();
  };

  // Get polo name
  const getPoloName = (poloId: number) => {
    const polo = polos.find((p: any) => p.id === poloId);
    return polo ? `${polo.sigla} - ${polo.nome}` : 'N/A';
  };

  // Get installation name
  const getInstallationName = (instalacaoId: number) => {
    const instalacao = instalacoes.find((i: any) => i.id === instalacaoId);
    return instalacao ? `${instalacao.sigla} - ${instalacao.nome}` : 'N/A';
  };

  // Get well name
  const getWellName = (pocoId: number) => {
    const poco = pocos.find((p: any) => p.id === pocoId);
    return poco ? poco.nome : 'N/A';
  };

  // Summary statistics
  const summaryStats = {
    total: filteredTests.length,
    pendentes: filteredTests.filter((t: TestePoco) => !t.resultadoTeste || t.resultadoTeste === 'Em análise').length,
    aprovados: filteredTests.filter((t: TestePoco) => t.resultadoTeste?.toLowerCase() === 'aprovado' || t.resultadoTeste?.toLowerCase() === 'satisfatório').length,
    vencidos: filteredTests.filter((t: TestePoco) => {
      const days = getDaysUntilNextTest(t.dataPrevistoProximoTeste);
      return days !== null && days < 0;
    }).length,
    proximos: filteredTests.filter((t: TestePoco) => {
      const days = getDaysUntilNextTest(t.dataPrevistoProximoTeste);
      return days !== null && days >= 0 && days <= 7;
    }).length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Testes de Poços</h1>
          <p className="text-muted-foreground">
            Gerencie e acompanhe todos os testes BTP dos poços de produção
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Importar BTP
          </Button>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Teste
              </Button>
            </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingTest ? "Editar Teste de Poço" : "Novo Teste de Poço"}
                  </DialogTitle>
                </DialogHeader>
                <div className="p-4">
                  <p className="text-muted-foreground">
                    Formulário de teste de poço será implementado aqui.
                  </p>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={handleFormClose}>
                      Cancelar
                    </Button>
                    <Button onClick={handleFormSuccess}>
                      Salvar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{summaryStats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{summaryStats.pendentes}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aprovados</p>
                <p className="text-2xl font-bold text-green-700">{summaryStats.aprovados}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vencidos</p>
                <p className="text-2xl font-bold text-red-600">{summaryStats.vencidos}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Próximos</p>
                <p className="text-2xl font-bold text-blue-600">{summaryStats.proximos}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por boletim, medidor ou observação..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedPolo} onValueChange={setSelectedPolo}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todos os Polos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os Polos</SelectItem>
                {polos.map((polo: any) => (
                  <SelectItem key={polo.id} value={polo.id.toString()}>
                    {polo.sigla} - {polo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedInstallation} onValueChange={setSelectedInstallation}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todas as Instalações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as Instalações</SelectItem>
                {instalacoes.map((instalacao: any) => (
                  <SelectItem key={instalacao.id} value={instalacao.id.toString()}>
                    {instalacao.sigla} - {instalacao.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTestType} onValueChange={setSelectedTestType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tipo de Teste" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os Tipos</SelectItem>
                <SelectItem value="BTP">BTP</SelectItem>
                <SelectItem value="Produção">Produção</SelectItem>
                <SelectItem value="Potencial">Potencial</SelectItem>
                <SelectItem value="Restauração">Restauração</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Testes</CardTitle>
        </CardHeader>
        <CardContent>
          {testsLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="text-center py-8">
              <Flame className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-medium text-muted-foreground">
                Nenhum teste encontrado
              </p>
              <p className="text-muted-foreground mb-4">
                Tente ajustar os filtros ou adicione um novo teste.
              </p>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Teste
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Polo</TableHead>
                    <TableHead>Instalação</TableHead>
                    <TableHead>Poço</TableHead>
                    <TableHead>Último Teste</TableHead>
                    <TableHead>Resultado</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Próximo Teste</TableHead>
                    <TableHead>Boletim</TableHead>
                    <TableHead>Vazões</TableHead>
                    <TableHead>BSW</TableHead>
                    <TableHead>RGO</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTests.map((teste: TestePoco) => {
                    const resultBadge = getResultBadge(teste.resultadoTeste);
                    const nextTestBadge = getNextTestBadge(teste.dataPrevistoProximoTeste);
                    
                    return (
                      <TableRow key={teste.id}>
                        <TableCell className="font-medium">
                          {getPoloName(teste.poloId)}
                        </TableCell>
                        <TableCell>
                          {getInstallationName(teste.instalacaoId)}
                        </TableCell>
                        <TableCell>
                          {getWellName(teste.pocoId)}
                        </TableCell>
                        <TableCell>
                          {teste.dataTeste 
                            ? new Date(teste.dataTeste).toLocaleDateString('pt-BR')
                            : 'N/A'
                          }
                        </TableCell>
                        <TableCell>
                          <Badge className={resultBadge.className}>
                            {resultBadge.text}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{teste.tipoTeste}</Badge>
                        </TableCell>
                        <TableCell>
                          {nextTestBadge ? (
                            <Badge className={nextTestBadge.className}>
                              {nextTestBadge.text}
                            </Badge>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell>{teste.numeroBoletimTeste || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="text-xs space-y-1">
                            <div>Óleo: {teste.vazaoOleo || 0} m³</div>
                            <div>Gás: {teste.vazaoGas || 0} m³</div>
                            <div>Água: {teste.vazaoAgua || 0} m³</div>
                          </div>
                        </TableCell>
                        <TableCell>{teste.bsw ? `${teste.bsw}%` : 'N/A'}</TableCell>
                        <TableCell>{teste.rgo || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(teste)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => teste.id && handleDelete(teste.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            {teste.arquivoBtpPath && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(teste.arquivoBtpPath, '_blank')}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}