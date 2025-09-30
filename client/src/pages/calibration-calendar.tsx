import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar, Plus, Search, Edit, Trash2, Clock, CheckCircle, AlertTriangle, FileText } from "lucide-react";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCalendarioCalibracaoSchema, type InsertCalendarioCalibracao, type CalendarioCalibracao, type Polo, type Instalacao, type Equipamento } from "@shared/schema";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";

const formSchema = insertCalendarioCalibracaoSchema;
type FormValues = z.infer<typeof formSchema>;

interface CalendarFormProps {
  calendarioCalibracao?: CalendarioCalibracao | null;
  polos: Polo[];
  instalacoes: Instalacao[];
  equipamentos: Equipamento[];
  onClose: () => void;
  onSuccess: () => void;
}

function CalendarForm({ calendarioCalibracao, polos, instalacoes, equipamentos, onClose, onSuccess }: CalendarFormProps) {
  const { toast } = useToast();
  const isEditing = !!calendarioCalibracao;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      equipamentoId: calendarioCalibracao?.equipamentoId || 0,
      poloId: calendarioCalibracao?.poloId || 0,
      instalacaoId: calendarioCalibracao?.instalacaoId || 0,
      tagPontoMedicao: calendarioCalibracao?.tagPontoMedicao || "",
      nomePontoMedicao: calendarioCalibracao?.nomePontoMedicao || "",
      classificacao: calendarioCalibracao?.classificacao || "",
      tagEquipamento: calendarioCalibracao?.tagEquipamento || "",
      nomeEquipamento: calendarioCalibracao?.nomeEquipamento || "",
      numeroSerie: calendarioCalibracao?.numeroSerie || "",
      tipoCalibracao: calendarioCalibracao?.tipoCalibracao || "",
      motivo: calendarioCalibracao?.motivo || "",
      laboratorio: calendarioCalibracao?.laboratorio || "",
      previsaoCalibracao: calendarioCalibracao?.previsaoCalibracao || "",
      vencimentoCalibracao: calendarioCalibracao?.vencimentoCalibracao || "",
      status: calendarioCalibracao?.status || "pendente",
      observacao: calendarioCalibracao?.observacao || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: FormValues) => api.createCalendarioCalibracao(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendario-calibracoes"] });
      toast({
        title: "Sucesso",
        description: "Agendamento criado com sucesso",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar agendamento",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormValues) => api.updateCalendarioCalibracao(calendarioCalibracao!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendario-calibracoes"] });
      toast({
        title: "Sucesso",
        description: "Agendamento atualizado com sucesso",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar agendamento",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="equipamentoId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Equipamento *</FormLabel>
                <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o equipamento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {equipamentos?.map((equip) => (
                      <SelectItem key={equip.id} value={equip.id.toString()}>
                        {equip.tag} - {equip.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="poloId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Polo *</FormLabel>
                <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o polo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {polos?.map((polo) => (
                      <SelectItem key={polo.id} value={polo.id.toString()}>
                        {polo.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="instalacaoId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instalação *</FormLabel>
                <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a instalação" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {instalacoes?.map((inst) => (
                      <SelectItem key={inst.id} value={inst.id.toString()}>
                        {inst.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tipoCalibracao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Calibração</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="interna">Interna</SelectItem>
                    <SelectItem value="externa">Externa</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="previsaoCalibracao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Previsão de Calibração</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vencimentoCalibracao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vencimento de Calibração</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="laboratorio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Laboratório</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do laboratório" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="agendado">Agendado</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="observacao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observações sobre a calibração..."
                  rows={3}
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending ? "Salvando..." : isEditing ? "Atualizar" : "Criar"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function CalibrationCalendar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPolo, setSelectedPolo] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedMes, setSelectedMes] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CalendarioCalibracao | null>(null);
  const { toast } = useToast();

  const { data: calendarios = [], isLoading } = useQuery({
    queryKey: ["/api/calendario-calibracoes"],
    queryFn: () => api.getCalendarioCalibracoes(),
  });

  const { data: polos = [] } = useQuery({
    queryKey: ["/api/polos"],
    queryFn: api.getPolos,
  });

  const { data: instalacoes = [] } = useQuery({
    queryKey: ["/api/instalacoes"],
    queryFn: () => api.getInstalacoes(),
  });

  const { data: equipamentos = [] } = useQuery({
    queryKey: ["/api/equipamentos"],
    queryFn: () => api.getEquipamentos(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteCalendarioCalibracao(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendario-calibracoes"] });
      toast({
        title: "Sucesso",
        description: "Agendamento removido com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao remover agendamento",
        variant: "destructive",
      });
    },
  });

  const filteredCalendarios = calendarios.filter((cal: CalendarioCalibracao) => {
    const matchesSearch =
      cal.tagEquipamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cal.nomeEquipamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cal.numeroSerie?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPolo = !selectedPolo || selectedPolo === "all" || cal.poloId === parseInt(selectedPolo);
    const matchesStatus = !selectedStatus || selectedStatus === "all" || cal.status === selectedStatus;

    let matchesMes = true;
    if (selectedMes && cal.previsaoCalibracao) {
      const mes = new Date(cal.previsaoCalibracao).getMonth() + 1;
      matchesMes = mes === parseInt(selectedMes);
    }

    return matchesSearch && matchesPolo && matchesStatus && matchesMes;
  });

  const openNewForm = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const openEditForm = (item: CalendarioCalibracao) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja remover este agendamento?")) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'concluido':
        return { text: 'Concluído', className: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'em_andamento':
        return { text: 'Em Andamento', className: 'bg-blue-100 text-blue-800', icon: Clock };
      case 'agendado':
        return { text: 'Agendado', className: 'bg-yellow-100 text-yellow-800', icon: Calendar };
      case 'cancelado':
        return { text: 'Cancelado', className: 'bg-red-100 text-red-800', icon: AlertTriangle };
      default:
        return { text: 'Pendente', className: 'bg-gray-100 text-gray-800', icon: Clock };
    }
  };

  const stats = {
    total: filteredCalendarios.length,
    pendentes: filteredCalendarios.filter((c: CalendarioCalibracao) => c.status === 'pendente').length,
    agendados: filteredCalendarios.filter((c: CalendarioCalibracao) => c.status === 'agendado').length,
    concluidos: filteredCalendarios.filter((c: CalendarioCalibracao) => c.status === 'concluido').length,
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Calendário de Calibrações
          </h1>
          <p className="text-muted-foreground">
            Gerenciar programação de calibrações
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewForm}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Editar Agendamento' : 'Novo Agendamento'}
              </DialogTitle>
            </DialogHeader>
            <CalendarForm
              calendarioCalibracao={editingItem}
              polos={polos}
              instalacoes={instalacoes}
              equipamentos={equipamentos}
              onClose={closeForm}
              onSuccess={closeForm}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Calendar className="text-primary w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                <p className="text-3xl font-bold text-gray-600">{stats.pendentes}</p>
              </div>
              <div className="w-12 h-12 bg-gray-500/20 rounded-lg flex items-center justify-center">
                <Clock className="text-gray-500 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Agendados</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.agendados}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="text-yellow-500 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Concluídos</p>
                <p className="text-3xl font-bold text-green-600">{stats.concluidos}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-500 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por TAG, nome ou série"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={selectedPolo} onValueChange={setSelectedPolo}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os Polos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Polos</SelectItem>
                {polos.map((polo: Polo) => (
                  <SelectItem key={polo.id} value={polo.id.toString()}>
                    {polo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="agendado">Agendado</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedMes} onValueChange={setSelectedMes}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os Meses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Meses</SelectItem>
                <SelectItem value="1">Janeiro</SelectItem>
                <SelectItem value="2">Fevereiro</SelectItem>
                <SelectItem value="3">Março</SelectItem>
                <SelectItem value="4">Abril</SelectItem>
                <SelectItem value="5">Maio</SelectItem>
                <SelectItem value="6">Junho</SelectItem>
                <SelectItem value="7">Julho</SelectItem>
                <SelectItem value="8">Agosto</SelectItem>
                <SelectItem value="9">Setembro</SelectItem>
                <SelectItem value="10">Outubro</SelectItem>
                <SelectItem value="11">Novembro</SelectItem>
                <SelectItem value="12">Dezembro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Agendamentos ({filteredCalendarios.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : filteredCalendarios.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Nenhum agendamento encontrado</p>
              <Button className="mt-4" onClick={openNewForm}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Agendamento
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCalendarios.map((cal: CalendarioCalibracao) => {
                const statusBadge = getStatusBadge(cal.status || 'pendente');
                const StatusIcon = statusBadge.icon;

                return (
                  <div
                    key={cal.id}
                    className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="font-semibold text-lg">
                            {cal.tagEquipamento || 'N/A'}
                          </h3>
                          <Badge className={statusBadge.className}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusBadge.text}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div>
                            <p className="font-medium text-foreground">Equipamento: {cal.nomeEquipamento || 'N/A'}</p>
                            <p>N° Série: {cal.numeroSerie || 'N/A'}</p>
                          </div>
                          <div>
                            <p>Tipo: {cal.tipoCalibracao || 'N/A'}</p>
                            <p>Laboratório: {cal.laboratorio || 'N/A'}</p>
                          </div>
                          <div>
                            <p>Previsão: {cal.previsaoCalibracao ? new Date(cal.previsaoCalibracao).toLocaleDateString('pt-BR') : 'N/A'}</p>
                            <p>Vencimento: {cal.vencimentoCalibracao ? new Date(cal.vencimentoCalibracao).toLocaleDateString('pt-BR') : 'N/A'}</p>
                          </div>
                          <div>
                            <p>Classificação: {cal.classificacao || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditForm(cal)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(cal.id)}
                          className="text-red-500 hover:text-red-700"
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