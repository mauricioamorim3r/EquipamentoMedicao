import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Edit, 
  Plus,
  Clock,
  Award
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertExecucaoCalibracaoSchema, type InsertExecucaoCalibracao, type ExecucaoCalibracao } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";

const formSchema = insertExecucaoCalibracaoSchema;
type FormValues = z.infer<typeof formSchema>;

export default function ExecutionCalibrations() {
  const [selectedEquipment, setSelectedEquipment] = useState<string>("all");
  const [isExecutionDialogOpen, setIsExecutionDialogOpen] = useState(false);
  const [selectedExecution, setSelectedExecution] = useState<ExecucaoCalibracao | null>(null);
  const { toast } = useToast();

  const { data: execucoesCalibracoes, isLoading: executionsLoading } = useQuery({
    queryKey: ["/api/execucao-calibracoes"],
    queryFn: () => api.getExecucaoCalibracoes(),
  });

  const { data: equipamentos } = useQuery({
    queryKey: ["/api/equipamentos"],
    queryFn: () => api.getEquipamentos(),
  });

  const filteredExecutions = execucoesCalibracoes?.filter((exec: any) => 
    selectedEquipment === "all" || exec.equipamentoId.toString() === selectedEquipment
  ) || [];

  const handleNewExecution = () => {
    setSelectedExecution(null);
    setIsExecutionDialogOpen(true);
  };

  const handleEditExecution = (execution: ExecucaoCalibracao) => {
    setSelectedExecution(execution);
    setIsExecutionDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valido':
        return <Badge className="bg-green-100 text-green-800">Válido</Badge>;
      case 'vencido':
        return <Badge className="bg-red-100 text-red-800">Vencido</Badge>;
      case 'proximo_vencimento':
        return <Badge className="bg-yellow-100 text-yellow-800">Próximo ao Vencimento</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Sem Status</Badge>;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Execução de Calibrações
          </h1>
          <p className="text-muted-foreground">
            Gerencie a execução e histórico dos 3 últimos certificados por equipamento
          </p>
        </div>
        <Button onClick={handleNewExecution}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Execução
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por equipamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Equipamentos</SelectItem>
                  {equipamentos?.map((eq: any) => (
                    <SelectItem key={eq.id} value={eq.id.toString()}>
                      {eq.tag} - {eq.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid gap-6">
        {executionsLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-muted-foreground">Carregando execuções...</p>
          </div>
        ) : filteredExecutions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Nenhuma execução encontrada</h3>
              <p className="text-muted-foreground mb-4">
                Comece criando uma nova execução de calibração
              </p>
              <Button onClick={handleNewExecution}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Execução
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredExecutions.map((execution: any) => (
              <Card key={execution.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {execution.tagEquipamento} - {execution.nomeEquipamento}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Série: {execution.numeroSerieEquipamento}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleEditExecution(execution)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="certificates" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="certificates">Certificados</TabsTrigger>
                      <TabsTrigger value="details">Detalhes</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="certificates" className="mt-4">
                      <div className="grid gap-4">
                        {/* Último Certificado */}
                        <Card className="border-green-200">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base text-green-700">
                                <CheckCircle className="h-4 w-4 inline mr-2" />
                                Último Certificado
                              </CardTitle>
                              {getStatusBadge(execution.statusUltimoCertificado || 'sem_status')}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Número:</span>
                                <p>{execution.numeroUltimoCertificado || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="font-medium">Revisão:</span>
                                <p>{execution.revisaoUltimoCertificado || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="font-medium">Data:</span>
                                <p>{execution.dataUltimoCertificado ? 
                                  new Date(execution.dataUltimoCertificado).toLocaleDateString('pt-BR') : 'N/A'}</p>
                              </div>
                              <div>
                                <Button variant="outline" size="sm">
                                  <Upload className="h-4 w-4 mr-2" />
                                  Importar
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Penúltimo Certificado */}
                        <Card className="border-blue-200">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base text-blue-700">
                                <Clock className="h-4 w-4 inline mr-2" />
                                Penúltimo Certificado
                              </CardTitle>
                              {getStatusBadge(execution.statusPenultimoCertificado || 'sem_status')}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Número:</span>
                                <p>{execution.numeroPenultimoCertificado || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="font-medium">Revisão:</span>
                                <p>{execution.revisaoPenultimoCertificado || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="font-medium">Data:</span>
                                <p>{execution.dataPenultimoCertificado ? 
                                  new Date(execution.dataPenultimoCertificado).toLocaleDateString('pt-BR') : 'N/A'}</p>
                              </div>
                              <div>
                                <Button variant="outline" size="sm">
                                  <Upload className="h-4 w-4 mr-2" />
                                  Importar
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Antepenúltimo Certificado */}
                        <Card className="border-gray-200">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base text-gray-700">
                                <FileText className="h-4 w-4 inline mr-2" />
                                Antepenúltimo Certificado
                              </CardTitle>
                              {getStatusBadge(execution.statusAntepenultimoCertificado || 'sem_status')}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Número:</span>
                                <p>{execution.numeroAntepenultimoCertificado || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="font-medium">Revisão:</span>
                                <p>{execution.revisaoAntepenultimoCertificado || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="font-medium">Data:</span>
                                <p>{execution.dataAntepenultimoCertificado ? 
                                  new Date(execution.dataAntepenultimoCertificado).toLocaleDateString('pt-BR') : 'N/A'}</p>
                              </div>
                              <div>
                                <Button variant="outline" size="sm">
                                  <Upload className="h-4 w-4 mr-2" />
                                  Importar
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="details" className="mt-4">
                      <div className="grid gap-4">
                        <div>
                          <span className="font-medium">Periodicidade ANP:</span>
                          <p className="text-muted-foreground">
                            {execution.periodicidadeCalibracao ? 
                              `${execution.periodicidadeCalibracao} dias` : 'Não definida'}
                          </p>
                        </div>
                        {execution.observacoes && (
                          <div>
                            <span className="font-medium">Observações:</span>
                            <p className="text-muted-foreground mt-1">{execution.observacoes}</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Execution Dialog */}
      <Dialog open={isExecutionDialogOpen} onOpenChange={setIsExecutionDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedExecution ? 'Editar Execução' : 'Nova Execução de Calibração'}
            </DialogTitle>
          </DialogHeader>
          
          <ExecutionForm 
            execution={selectedExecution}
            equipamentos={equipamentos || []}
            onClose={() => setIsExecutionDialogOpen(false)}
            onSuccess={() => {
              setIsExecutionDialogOpen(false);
              queryClient.invalidateQueries({ queryKey: ["/api/execucao-calibracoes"] });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente do formulário de execução
interface ExecutionFormProps {
  execution?: ExecucaoCalibracao | null;
  equipamentos: any[];
  onClose: () => void;
  onSuccess: () => void;
}

function ExecutionForm({ execution, equipamentos, onClose, onSuccess }: ExecutionFormProps) {
  const { toast } = useToast();
  const isEditing = !!execution;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      equipamentoId: execution?.equipamentoId || 0,
      numeroSerieEquipamento: execution?.numeroSerieEquipamento || "",
      tagEquipamento: execution?.tagEquipamento || "",
      nomeEquipamento: execution?.nomeEquipamento || "",
      numeroUltimoCertificado: execution?.numeroUltimoCertificado || "",
      revisaoUltimoCertificado: execution?.revisaoUltimoCertificado || "",
      dataUltimoCertificado: execution?.dataUltimoCertificado || "",
      statusUltimoCertificado: execution?.statusUltimoCertificado || "",
      numeroPenultimoCertificado: execution?.numeroPenultimoCertificado || "",
      revisaoPenultimoCertificado: execution?.revisaoPenultimoCertificado || "",
      dataPenultimoCertificado: execution?.dataPenultimoCertificado || "",
      statusPenultimoCertificado: execution?.statusPenultimoCertificado || "",
      numeroAntepenultimoCertificado: execution?.numeroAntepenultimoCertificado || "",
      revisaoAntepenultimoCertificado: execution?.revisaoAntepenultimoCertificado || "",
      dataAntepenultimoCertificado: execution?.dataAntepenultimoCertificado || "",
      statusAntepenultimoCertificado: execution?.statusAntepenultimoCertificado || "",
      periodicidadeCalibracao: execution?.periodicidadeCalibracao || 365,
      observacoes: execution?.observacoes || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: FormValues) => api.createExecucaoCalibracao(data),
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Execução criada com sucesso",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar execução",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormValues) => api.updateExecucaoCalibracao(execution!.id, data),
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Execução atualizada com sucesso",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar execução",
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

  // Auto-fill equipment data when equipment is selected
  const selectedEquipmentId = form.watch("equipamentoId");
  const equipment = equipamentos.find(eq => eq.id === selectedEquipmentId);
  
  if (equipment && selectedEquipmentId !== execution?.equipamentoId) {
    form.setValue("tagEquipamento", equipment.tag);
    form.setValue("nomeEquipamento", equipment.nome);
    form.setValue("numeroSerieEquipamento", equipment.numeroSerie);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Equipment Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="equipamentoId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Equipamento</FormLabel>
                <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o equipamento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {equipamentos.map((eq) => (
                      <SelectItem key={eq.id} value={eq.id.toString()}>
                        {eq.tag} - {eq.nome}
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
            name="periodicidadeCalibracao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Periodicidade ANP (dias)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="365" {...field} value={field.value || ""} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Último Certificado */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-lg text-green-700">Último Certificado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="numeroUltimoCertificado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número do Certificado</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: CERT-2024-001" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="revisaoUltimoCertificado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Revisão</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Rev. 01" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dataUltimoCertificado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data do Certificado</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="statusUltimoCertificado"
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
                      <SelectItem value="valido">Válido</SelectItem>
                      <SelectItem value="vencido">Vencido</SelectItem>
                      <SelectItem value="proximo_vencimento">Próximo ao Vencimento</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Penúltimo Certificado */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg text-blue-700">Penúltimo Certificado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="numeroPenultimoCertificado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número do Certificado</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: CERT-2023-001" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="revisaoPenultimoCertificado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Revisão</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Rev. 01" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dataPenultimoCertificado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data do Certificado</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="statusPenultimoCertificado"
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
                      <SelectItem value="valido">Válido</SelectItem>
                      <SelectItem value="vencido">Vencido</SelectItem>
                      <SelectItem value="proximo_vencimento">Próximo ao Vencimento</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Antepenúltimo Certificado */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-gray-700">Antepenúltimo Certificado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="numeroAntepenultimoCertificado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número do Certificado</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: CERT-2022-001" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="revisaoAntepenultimoCertificado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Revisão</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Rev. 01" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dataAntepenultimoCertificado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data do Certificado</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="statusAntepenultimoCertificado"
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
                      <SelectItem value="valido">Válido</SelectItem>
                      <SelectItem value="vencido">Vencido</SelectItem>
                      <SelectItem value="proximo_vencimento">Próximo ao Vencimento</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Observações */}
        <FormField
          control={form.control}
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Observações sobre a execução da calibração..."
                  className="min-h-[100px]"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending ? "Salvando..." : 
             isEditing ? "Atualizar" : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}