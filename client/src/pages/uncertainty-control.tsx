import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Calculator, FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ControleIncerteza, IncertezaLimite, Equipamento } from "@shared/schema";

export default function UncertaintyControl() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedEquipamento, setSelectedEquipamento] = useState<string>("");
  const { toast } = useToast();

  const { data: controleIncertezas = [], isLoading } = useQuery({
    queryKey: ["/api/controle-incertezas"],
    queryFn: () => api.getControleIncertezas(),
  });

  const { data: incertezaLimites = [] } = useQuery({
    queryKey: ["/api/incerteza-limites"],
    queryFn: () => api.getIncertezaLimites(),
  });

  const { data: equipamentos = [] } = useQuery({
    queryKey: ["/api/equipamentos"],
    queryFn: () => api.getEquipamentos(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createControleIncerteza(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/controle-incertezas"] });
      toast({
        title: "Sucesso",
        description: "Controle de incerteza criado com sucesso",
      });
      setIsCreateDialogOpen(false);
      setSelectedEquipamento("");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar controle de incerteza",
        variant: "destructive",
      });
    },
  });

  const filteredControles = controleIncertezas.filter((controle: ControleIncerteza) => {
    const matchesSearch = controle.numeroCertificado?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         controle.tagPontoInstalacao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         controle.classificacao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || controle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "aprovado": return "default";
      case "rejeitado": return "destructive";
      case "pendente": return "secondary";
      default: return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "aprovado": return "Aprovado";
      case "rejeitado": return "Rejeitado";
      case "pendente": return "Pendente";
      default: return status;
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "Tipo A": return "Tipo A";
      case "Tipo B": return "Tipo B";
      case "Combinada": return "Combinada";
      default: return tipo;
    }
  };

  const calculateUncertaintyBudget = (controle: ControleIncerteza) => {
    const incertezaExpandida = controle.incertezaExpandida || 0;
    const incertezaExpandidaRelativa = controle.incertezaExpandidaRelativa || 0;

    return {
      componentes: [],
      incertezaCombinada: incertezaExpandida / 2,
      incertezaExpandida,
      incertezaExpandidaRelativa,
    };
  };

  const getConformidadeAnp = (controle: ControleIncerteza) => {
    const conforme = controle.conformeLimite;
    const criterio = controle.criterioAceitacao;

    return { conforme, limite: criterio };
  };

  const handleCreateControle = () => {
    if (!selectedEquipamento) {
      toast({
        title: "Erro",
        description: "Selecione um equipamento",
        variant: "destructive",
      });
      return;
    }

    const equipamento = equipamentos.find((e: Equipamento) => e.id.toString() === selectedEquipamento);
    
    createMutation.mutate({
      pontoMedicaoId: parseInt(selectedEquipamento),
      numeroCertificado: `CERT-${equipamento?.tag}-${Date.now()}`,
      dataExecucao: new Date().toISOString().split('T')[0],
      status: "pendente",
    });
  };

  // Estatísticas
  const totalControles = controleIncertezas.length;
  const conformes = controleIncertezas.filter((c: ControleIncerteza) => c.status === "aprovado").length;
  const naoConformes = controleIncertezas.filter((c: ControleIncerteza) => c.status === "rejeitado").length;
  const pendentes = controleIncertezas.filter((c: ControleIncerteza) => c.status === "pendente").length;

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Controle de Incertezas</h1>
          <p className="text-gray-600">Gestão de incertezas de medição conforme GUM e ANP</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Análise
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Análise de Incerteza</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Equipamento</label>
                <Select value={selectedEquipamento} onValueChange={setSelectedEquipamento}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o equipamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipamentos.map((equip: Equipamento) => (
                      <SelectItem key={equip.id} value={equip.id.toString()}>
                        {equip.tag} - {equip.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleCreateControle}
                  disabled={createMutation.isPending || !selectedEquipamento}
                >
                  {createMutation.isPending ? "Criando..." : "Criar Análise"}
                </Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Análises</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalControles}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conformes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{conformes}</div>
            <p className="text-xs text-gray-600">
              {totalControles > 0 ? Math.round((conformes / totalControles) * 100) : 0}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Não Conformes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{naoConformes}</div>
            <p className="text-xs text-gray-600">
              {totalControles > 0 ? Math.round((naoConformes / totalControles) * 100) : 0}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendentes}</div>
            <p className="text-xs text-gray-600">
              {totalControles > 0 ? Math.round((pendentes / totalControles) * 100) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Buscar por identificador ou tipo de medição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="rejeitado">Rejeitado</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Controles */}
      <Card>
        <CardHeader>
          <CardTitle>Análises de Incerteza</CardTitle>
          <CardDescription>
            {filteredControles.length} análise(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Identificador</TableHead>
                <TableHead>Equipamento</TableHead>
                <TableHead>Tipo de Incerteza</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Incerteza Expandida</TableHead>
                <TableHead>Conformidade ANP</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredControles.map((controle: ControleIncerteza) => {
                const budget = calculateUncertaintyBudget(controle);
                const conformidadeAnp = getConformidadeAnp(controle);

                return (
                  <TableRow key={controle.id}>
                    <TableCell className="font-medium">
                      {controle.numeroCertificado || `CTRL-${controle.id}`}
                    </TableCell>
                    <TableCell>
                      {controle.tagPontoInstalacao || 'N/A'}
                    </TableCell>
                    <TableCell className="capitalize">
                      {controle.classificacao || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {controle.resultado || 'Pendente'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-blue-500" />
                        {budget.incertezaExpandida.toFixed(3)}%
                      </div>
                    </TableCell>
                    <TableCell>
                      {conformidadeAnp.limite ? (
                        <div className="flex items-center gap-2">
                          {conformidadeAnp.conforme ? (
                            <Badge variant="default">Conforme</Badge>
                          ) : (
                            <Badge variant="destructive">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Não Conforme
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            (Limite: {conformidadeAnp.limite}%)
                          </span>
                        </div>
                      ) : (
                        <Badge variant="secondary">Sem Limite</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(controle.status || '')}>
                        {getStatusLabel(controle.status || '')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {controle.dataExecucao ?
                        new Date(controle.dataExecucao).toLocaleDateString('pt-BR') :
                        'N/A'
                      }
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredControles.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma análise de incerteza encontrada</p>
              <p>Crie uma nova análise para começar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}