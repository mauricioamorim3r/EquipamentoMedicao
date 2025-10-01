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
import { Separator } from "@/components/ui/separator";

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
                      <div className="grid gap-6">
                        {/* Informações Gerais do Equipamento */}
                        <Card className="border-blue-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base text-blue-700">
                              Informações Gerais
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Aplicabilidade:</span>
                                <p>{execution.aplicabilidade || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="font-medium">Fluido:</span>
                                <p>{execution.fluido || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="font-medium">Ponto de Medição:</span>
                                <p>{execution.pontoMedicao || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="font-medium">Local Calibração:</span>
                                <p>{execution.localCalibracao || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="font-medium">Dias para Alertar:</span>
                                <p>{execution.diasParaAlertar || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="font-medium">Frequência ANP (meses):</span>
                                <p>{execution.frequenciaCalibracaoMeses || 'N/A'}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

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
                          <CardContent className="space-y-4">
                            {/* Dados Básicos */}
                            <div>
                              <h4 className="font-medium text-sm mb-2">Dados Básicos</h4>
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Laboratório:</span>
                                  <p>{execution.laboratorioUltimo || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Certificado:</span>
                                  <p>{execution.numeroUltimoCertificado || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Rev.:</span>
                                  <p>{execution.revisaoUltimoCertificado || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Data Calibração:</span>
                                  <p>{execution.dataUltimoCertificado ? 
                                    new Date(execution.dataUltimoCertificado).toLocaleDateString('pt-BR') : 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Data Emissão:</span>
                                  <p>{execution.dataEmissaoUltimo ? 
                                    new Date(execution.dataEmissaoUltimo).toLocaleDateString('pt-BR') : 'N/A'}</p>
                                </div>
                              </div>
                            </div>

                            {/* Dados Técnicos */}
                            <div>
                              <h4 className="font-medium text-sm mb-2">Dados Técnicos</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Incerteza Calibração:</span>
                                  <p>{execution.incertezaCalibracaoUltimo ? `${execution.incertezaCalibracaoUltimo}%` : 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Erro Máx. Admissível - Cal.:</span>
                                  <p>{execution.erroMaximoAdmissivelCalibracaoUltimo ? `${execution.erroMaximoAdmissivelCalibracaoUltimo}%` : 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Incerteza Limite ANP:</span>
                                  <p>{execution.incertezaLimiteAnpUltimo ? `${execution.incertezaLimiteAnpUltimo}%` : 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Erro Máx. Admissível - ANP:</span>
                                  <p>{execution.erroMaximoAdmissivelAnpUltimo ? `${execution.erroMaximoAdmissivelAnpUltimo}%` : 'N/A'}</p>
                                </div>
                              </div>
                            </div>

                            {/* Fatores de Correção */}
                            <div>
                              <h4 className="font-medium text-sm mb-2">Fatores de Correção</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Meter Factor:</span>
                                  <p>{execution.meterFactorUltimo || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Variação MF %:</span>
                                  <p>{execution.variacaoMfPercentUltimo ? `${execution.variacaoMfPercentUltimo}%` : 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium">K Factor:</span>
                                  <p>{execution.kFactorUltimo || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Ajuste:</span>
                                  <Badge variant={execution.ajusteUltimo ? "secondary" : "outline"}>
                                    {execution.ajusteUltimo ? "Sim" : "Não"}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Observações e Ações */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <span className="font-medium text-sm">Observações:</span>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {execution.observacaoUltimo || 'Nenhuma observação'}
                                </p>
                              </div>
                              <Button variant="outline" size="sm" className="ml-4">
                                <Upload className="h-4 w-4 mr-2" />
                                Importar Arquivo
                              </Button>
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
                          <CardContent className="space-y-4">
                            {/* Dados Básicos */}
                            <div>
                              <h4 className="font-medium text-sm mb-2">Dados Básicos</h4>
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Laboratório:</span>
                                  <p>{execution.laboratorioPenultimo || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Certificado:</span>
                                  <p>{execution.numeroPenultimoCertificado || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Rev.:</span>
                                  <p>{execution.revisaoPenultimoCertificado || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Data Calibração:</span>
                                  <p>{execution.dataPenultimoCertificado ? 
                                    new Date(execution.dataPenultimoCertificado).toLocaleDateString('pt-BR') : 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Data Emissão:</span>
                                  <p>{execution.dataEmissaoPenultimo ? 
                                    new Date(execution.dataEmissaoPenultimo).toLocaleDateString('pt-BR') : 'N/A'}</p>
                                </div>
                              </div>
                            </div>

                            {/* Dados Técnicos */}
                            <div>
                              <h4 className="font-medium text-sm mb-2">Dados Técnicos</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Incerteza Calibração:</span>
                                  <p>{execution.incertezaCalibracaoPenultimo ? `${execution.incertezaCalibracaoPenultimo}%` : 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Erro Máx. Admissível - Cal.:</span>
                                  <p>{execution.erroMaximoAdmissivelCalibracaoPenultimo ? `${execution.erroMaximoAdmissivelCalibracaoPenultimo}%` : 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Incerteza Limite ANP:</span>
                                  <p>{execution.incertezaLimiteAnpPenultimo ? `${execution.incertezaLimiteAnpPenultimo}%` : 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Erro Máx. Admissível - ANP:</span>
                                  <p>{execution.erroMaximoAdmissivelAnpPenultimo ? `${execution.erroMaximoAdmissivelAnpPenultimo}%` : 'N/A'}</p>
                                </div>
                              </div>
                            </div>

                            {/* Fatores de Correção */}
                            <div>
                              <h4 className="font-medium text-sm mb-2">Fatores de Correção</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Meter Factor:</span>
                                  <p>{execution.meterFactorPenultimo || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Variação MF %:</span>
                                  <p>{execution.variacaoMfPercentPenultimo ? `${execution.variacaoMfPercentPenultimo}%` : 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium">K Factor:</span>
                                  <p>{execution.kFactorPenultimo || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Ajuste:</span>
                                  <Badge variant={execution.ajustePenultimo ? "secondary" : "outline"}>
                                    {execution.ajustePenultimo ? "Sim" : "Não"}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Observações e Ações */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <span className="font-medium text-sm">Observações:</span>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {execution.observacaoPenultimo || 'Nenhuma observação'}
                                </p>
                              </div>
                              <Button variant="outline" size="sm" className="ml-4">
                                <Upload className="h-4 w-4 mr-2" />
                                Importar Arquivo
                              </Button>
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
                          <CardContent className="space-y-4">
                            {/* Dados Básicos */}
                            <div>
                              <h4 className="font-medium text-sm mb-2">Dados Básicos</h4>
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Laboratório:</span>
                                  <p>{execution.laboratorioAntepenultimo || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Certificado:</span>
                                  <p>{execution.numeroAntepenultimoCertificado || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Rev.:</span>
                                  <p>{execution.revisaoAntepenultimoCertificado || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Data Calibração:</span>
                                  <p>{execution.dataAntepenultimoCertificado ? 
                                    new Date(execution.dataAntepenultimoCertificado).toLocaleDateString('pt-BR') : 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Data Emissão:</span>
                                  <p>{execution.dataEmissaoAntepenultimo ? 
                                    new Date(execution.dataEmissaoAntepenultimo).toLocaleDateString('pt-BR') : 'N/A'}</p>
                                </div>
                              </div>
                            </div>

                            {/* Dados Técnicos */}
                            <div>
                              <h4 className="font-medium text-sm mb-2">Dados Técnicos</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Incerteza Calibração:</span>
                                  <p>{execution.incertezaCalibracaoAntepenultimo ? `${execution.incertezaCalibracaoAntepenultimo}%` : 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Erro Máx. Admissível - Cal.:</span>
                                  <p>{execution.erroMaximoAdmissivelCalibracaoAntepenultimo ? `${execution.erroMaximoAdmissivelCalibracaoAntepenultimo}%` : 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Incerteza Limite ANP:</span>
                                  <p>{execution.incertezaLimiteAnpAntepenultimo ? `${execution.incertezaLimiteAnpAntepenultimo}%` : 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Erro Máx. Admissível - ANP:</span>
                                  <p>{execution.erroMaximoAdmissivelAnpAntepenultimo ? `${execution.erroMaximoAdmissivelAnpAntepenultimo}%` : 'N/A'}</p>
                                </div>
                              </div>
                            </div>

                            {/* Fatores de Correção */}
                            <div>
                              <h4 className="font-medium text-sm mb-2">Fatores de Correção</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Meter Factor:</span>
                                  <p>{execution.meterFactorAntepenultimo || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Variação MF %:</span>
                                  <p>{execution.variacaoMfPercentAntepenultimo ? `${execution.variacaoMfPercentAntepenultimo}%` : 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium">K Factor:</span>
                                  <p>{execution.kFactorAntepenultimo || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Ajuste:</span>
                                  <Badge variant={execution.ajusteAntepenultimo ? "secondary" : "outline"}>
                                    {execution.ajusteAntepenultimo ? "Sim" : "Não"}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Observações e Ações */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <span className="font-medium text-sm">Observações:</span>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {execution.observacaoAntepenultimo || 'Nenhuma observação'}
                                </p>
                              </div>
                              <Button variant="outline" size="sm" className="ml-4">
                                <Upload className="h-4 w-4 mr-2" />
                                Importar Arquivo
                              </Button>
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
      aplicabilidade: execution?.aplicabilidade || "",
      fluido: execution?.fluido || "",
      pontoMedicao: execution?.pontoMedicao || "",
      localCalibracao: execution?.localCalibracao || "",
      diasParaAlertar: execution?.diasParaAlertar || 30,
      frequenciaCalibracaoMeses: execution?.frequenciaCalibracaoMeses || 12,
      
      // Último certificado
      numeroUltimoCertificado: execution?.numeroUltimoCertificado || "",
      revisaoUltimoCertificado: execution?.revisaoUltimoCertificado || "",
      dataUltimoCertificado: execution?.dataUltimoCertificado || "",
      dataEmissaoUltimo: execution?.dataEmissaoUltimo || "",
      statusUltimoCertificado: execution?.statusUltimoCertificado || "",
      laboratorioUltimo: execution?.laboratorioUltimo || "",
      incertezaCalibracaoUltimo: execution?.incertezaCalibracaoUltimo || 0,
      erroMaximoAdmissivelCalibracaoUltimo: execution?.erroMaximoAdmissivelCalibracaoUltimo || 0,
      incertezaLimiteAnpUltimo: execution?.incertezaLimiteAnpUltimo || 0,
      erroMaximoAdmissivelAnpUltimo: execution?.erroMaximoAdmissivelAnpUltimo || 0,
      observacaoUltimo: execution?.observacaoUltimo || "",
      meterFactorUltimo: execution?.meterFactorUltimo || 0,
      variacaoMfPercentUltimo: execution?.variacaoMfPercentUltimo || 0,
      kFactorUltimo: execution?.kFactorUltimo || 0,
      ajusteUltimo: execution?.ajusteUltimo || false,
      
      // Penúltimo certificado
      numeroPenultimoCertificado: execution?.numeroPenultimoCertificado || "",
      revisaoPenultimoCertificado: execution?.revisaoPenultimoCertificado || "",
      dataPenultimoCertificado: execution?.dataPenultimoCertificado || "",
      dataEmissaoPenultimo: execution?.dataEmissaoPenultimo || "",
      statusPenultimoCertificado: execution?.statusPenultimoCertificado || "",
      laboratorioPenultimo: execution?.laboratorioPenultimo || "",
      incertezaCalibracaoPenultimo: execution?.incertezaCalibracaoPenultimo || 0,
      erroMaximoAdmissivelCalibracaoPenultimo: execution?.erroMaximoAdmissivelCalibracaoPenultimo || 0,
      incertezaLimiteAnpPenultimo: execution?.incertezaLimiteAnpPenultimo || 0,
      erroMaximoAdmissivelAnpPenultimo: execution?.erroMaximoAdmissivelAnpPenultimo || 0,
      observacaoPenultimo: execution?.observacaoPenultimo || "",
      meterFactorPenultimo: execution?.meterFactorPenultimo || 0,
      variacaoMfPercentPenultimo: execution?.variacaoMfPercentPenultimo || 0,
      kFactorPenultimo: execution?.kFactorPenultimo || 0,
      ajustePenultimo: execution?.ajustePenultimo || false,
      
      // Antepenúltimo certificado
      numeroAntepenultimoCertificado: execution?.numeroAntepenultimoCertificado || "",
      revisaoAntepenultimoCertificado: execution?.revisaoAntepenultimoCertificado || "",
      dataAntepenultimoCertificado: execution?.dataAntepenultimoCertificado || "",
      dataEmissaoAntepenultimo: execution?.dataEmissaoAntepenultimo || "",
      statusAntepenultimoCertificado: execution?.statusAntepenultimoCertificado || "",
      laboratorioAntepenultimo: execution?.laboratorioAntepenultimo || "",
      incertezaCalibracaoAntepenultimo: execution?.incertezaCalibracaoAntepenultimo || 0,
      erroMaximoAdmissivelCalibracaoAntepenultimo: execution?.erroMaximoAdmissivelCalibracaoAntepenultimo || 0,
      incertezaLimiteAnpAntepenultimo: execution?.incertezaLimiteAnpAntepenultimo || 0,
      erroMaximoAdmissivelAnpAntepenultimo: execution?.erroMaximoAdmissivelAnpAntepenultimo || 0,
      observacaoAntepenultimo: execution?.observacaoAntepenultimo || "",
      meterFactorAntepenultimo: execution?.meterFactorAntepenultimo || 0,
      variacaoMfPercentAntepenultimo: execution?.variacaoMfPercentAntepenultimo || 0,
      kFactorAntepenultimo: execution?.kFactorAntepenultimo || 0,
      ajusteAntepenultimo: execution?.ajusteAntepenultimo || false,
      
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

        {/* Informações Gerais */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg text-blue-700">Informações Gerais do Equipamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="aplicabilidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aplicabilidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Fiscal Óleo" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fluido"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fluido</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Óleo, Gás Natural" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pontoMedicao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ponto de Medição</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 20-FT-2300" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="localCalibracao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local Calibração</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Laboratório, Campo" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="diasParaAlertar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dias para Alertar</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="30" {...field} value={field.value || ""} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frequenciaCalibracaoMeses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequência Calibração ANP (meses)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="12" {...field} value={field.value || ""} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Último Certificado - Dados Técnicos */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-lg text-green-700">Último Certificado - Dados Técnicos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informações Básicas do Certificado */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            </div>

            {/* Laboratório e Data de Emissão */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="laboratorioUltimo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Laboratório</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o laboratório" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="IPT">IPT - Instituto de Pesquisas Tecnológicas</SelectItem>
                        <SelectItem value="INMETRO">INMETRO</SelectItem>
                        <SelectItem value="TUV">TÜV SÜD</SelectItem>
                        <SelectItem value="BUREAU_VERITAS">Bureau Veritas</SelectItem>
                        <SelectItem value="SGS">SGS</SelectItem>
                        <SelectItem value="OUTRO">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dataEmissaoUltimo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Emissão</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Dados de Calibração */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Dados de Calibração</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="incertezaCalibracaoUltimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Incerteza de Calibração (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.15" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="erroMaximoAdmissivelUltimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Erro Máximo Admissível (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.50" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="meterFactorUltimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meter Factor</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.00001" placeholder="1.00000" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="kFactorUltimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>K Factor</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.00001" placeholder="1000.00000" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Fatores e Ajustes */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Fatores e Ajustes</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="fatorCorrecaoTemperaturaUltimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fator Correção Temperatura</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.00001" placeholder="1.00000" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fatorCorrecaoPressaoUltimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fator Correção Pressão</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.00001" placeholder="1.00000" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ajusteLinearidadeUltimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ajuste Linearidade (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="repetibilidadeUltimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repetibilidade (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.05" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Condições de Calibração */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Condições de Calibração</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <FormField
                  control={form.control}
                  name="temperaturaCalibracao1Ultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temperatura Calibração 1 (°C)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="20.0" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="temperaturaCalibracao2Ultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temperatura Calibração 2 (°C)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="60.0" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="temperaturaCalibracao3Ultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temperatura Calibração 3 (°C)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="80.0" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="pressaoCalibracao1Ultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pressão Calibração 1 (bar)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="10.0" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pressaoCalibracao2Ultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pressão Calibração 2 (bar)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="50.0" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pressaoCalibracao3Ultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pressão Calibração 3 (bar)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="100.0" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Faixas de Medição */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Faixas de Medição</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="faixaMedicaoMinimaUltimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Faixa Medição Mínima (m³/h)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="10.0" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="faixaMedicaoMaximaUltimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Faixa Medição Máxima (m³/h)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="1000.0" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="densidadeFluidoUltimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Densidade do Fluido (kg/m³)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="850.0" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Observações */}
            <FormField
              control={form.control}
              name="observacoesUltimo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observações técnicas sobre a calibração..." 
                      className="min-h-[80px]"
                      {...field} 
                      value={field.value || ""} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Penúltimo Certificado - Dados Técnicos */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg text-blue-700">Penúltimo Certificado - Dados Técnicos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informações Básicas do Certificado */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            </div>

            {/* Laboratório e Data de Emissão */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="laboratorioPenultimo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Laboratório</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o laboratório" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="IPT">IPT - Instituto de Pesquisas Tecnológicas</SelectItem>
                        <SelectItem value="INMETRO">INMETRO</SelectItem>
                        <SelectItem value="TUV">TÜV SÜD</SelectItem>
                        <SelectItem value="BUREAU_VERITAS">Bureau Veritas</SelectItem>
                        <SelectItem value="SGS">SGS</SelectItem>
                        <SelectItem value="OUTRO">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dataEmissaoPenultimo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Emissão</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Dados de Calibração */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Dados de Calibração</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="incertezaCalibracaoPenultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Incerteza de Calibração (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.15" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="erroMaximoAdmissivelPenultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Erro Máximo Admissível (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.50" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="meterFactorPenultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meter Factor</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.00001" placeholder="1.00000" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="kFactorPenultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>K Factor</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.00001" placeholder="1000.00000" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Fatores e Ajustes */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Fatores e Ajustes</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="fatorCorrecaoTemperaturaPenultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fator Correção Temperatura</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.00001" placeholder="1.00000" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fatorCorrecaoPressaoPenultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fator Correção Pressão</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.00001" placeholder="1.00000" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ajusteLinearidadePenultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ajuste Linearidade (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="repetibilidadePenultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repetibilidade (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.05" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Condições de Calibração */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Condições de Calibração</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <FormField
                  control={form.control}
                  name="temperaturaCalibracao1Penultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temperatura Calibração 1 (°C)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="20.0" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="temperaturaCalibracao2Penultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temperatura Calibração 2 (°C)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="60.0" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="temperaturaCalibracao3Penultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temperatura Calibração 3 (°C)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="80.0" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="pressaoCalibracao1Penultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pressão Calibração 1 (bar)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="10.0" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pressaoCalibracao2Penultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pressão Calibração 2 (bar)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="50.0" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pressaoCalibracao3Penultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pressão Calibração 3 (bar)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="100.0" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Faixas de Medição */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Faixas de Medição</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="faixaMedicaoMinimaPenultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Faixa Medição Mínima (m³/h)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="10.0" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="faixaMedicaoMaximaPenultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Faixa Medição Máxima (m³/h)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="1000.0" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="densidadeFluidoPenultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Densidade do Fluido (kg/m³)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="850.0" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Observações */}
            <FormField
              control={form.control}
              name="observacoesPenultimo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observações técnicas sobre a calibração..." 
                      className="min-h-[80px]"
                      {...field} 
                      value={field.value || ""} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Antepenúltimo Certificado - Dados Técnicos */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-gray-700">Antepenúltimo Certificado - Dados Técnicos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informações Básicas do Certificado */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            </div>

            {/* Laboratório e Data de Emissão */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="laboratorioAntepenultimo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Laboratório</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o laboratório" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="IPT">IPT - Instituto de Pesquisas Tecnológicas</SelectItem>
                        <SelectItem value="INMETRO">INMETRO</SelectItem>
                        <SelectItem value="TUV">TÜV SÜD</SelectItem>
                        <SelectItem value="BUREAU_VERITAS">Bureau Veritas</SelectItem>
                        <SelectItem value="SGS">SGS</SelectItem>
                        <SelectItem value="OUTRO">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dataEmissaoAntepenultimo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Emissão</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Dados de Calibração */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Dados de Calibração</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="incertezaCalibracaoAntepenultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Incerteza de Calibração (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.15" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="erroMaximoAdmissivelAntepenultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Erro Máximo Admissível (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.50" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="meterFactorAntepenultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meter Factor</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.00001" placeholder="1.00000" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="kFactorAntepenultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>K Factor</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.00001" placeholder="1000.00000" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Fatores e Ajustes */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Fatores e Ajustes</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="fatorCorrecaoTemperaturaAntepenultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fator Correção Temperatura</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.00001" placeholder="1.00000" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fatorCorrecaoPressaoAntepenultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fator Correção Pressão</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.00001" placeholder="1.00000" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ajusteLinearidadeAntepenultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ajuste Linearidade (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="repetibilidadeAntepenultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repetibilidade (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.05" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Condições de Calibração */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Condições de Calibração</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <FormField
                  control={form.control}
                  name="temperaturaCalibracao1Antepenultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temperatura Calibração 1 (°C)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="20.0" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="temperaturaCalibracao2Antepenultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temperatura Calibração 2 (°C)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="60.0" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="temperaturaCalibracao3Antepenultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temperatura Calibração 3 (°C)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="80.0" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="pressaoCalibracao1Antepenultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pressão Calibração 1 (bar)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="10.0" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pressaoCalibracao2Antepenultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pressão Calibração 2 (bar)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="50.0" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pressaoCalibracao3Antepenultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pressão Calibração 3 (bar)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="100.0" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Faixas de Medição */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Faixas de Medição</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="faixaMedicaoMinimaAntepenultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Faixa Medição Mínima (m³/h)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="10.0" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="faixaMedicaoMaximaAntepenultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Faixa Medição Máxima (m³/h)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="1000.0" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="densidadeFluidoAntepenultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Densidade do Fluido (kg/m³)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="850.0" {...field} value={field.value || ""} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Observações */}
            <FormField
              control={form.control}
              name="observacoesAntepenultimo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observações técnicas sobre a calibração..." 
                      className="min-h-[80px]"
                      {...field} 
                      value={field.value || ""} 
                    />
                  </FormControl>
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