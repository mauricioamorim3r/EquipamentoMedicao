import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon, Calculator, AlertTriangle, FileText, LineChart, Check } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

// Componentes UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";

import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Schema para o formulário de incertezas
const formSchema = z.object({
  sistemaId: z.string().min(1, "Campo obrigatório"),
  nome: z.string().min(1, "Campo obrigatório"),
  tag: z.string().min(1, "Campo obrigatório"),
  campoId: z.number().min(1, "Campo obrigatório"),
  unidadeId: z.number().min(1, "Campo obrigatório"),
  pontoInstalacaoId: z.number().min(1, "Campo obrigatório"),
  medidorPrimarioId: z.string().optional(),
  transmissorPressaoId: z.string().optional(),
  transmissorTemperaturaId: z.string().optional(),
  computadorVazaoId: z.string().optional(),
  incertezaMedidor: z.number().min(0).optional(),
  incertezaPressao: z.number().min(0).optional(),
  incertezaTemperatura: z.number().min(0).optional(),
  incertezaDensidade: z.number().min(0).optional(),
  vazaoMinima: z.number().min(0).optional(),
  vazaoMaxima: z.number().min(0).optional(),
  pressaoOperacao: z.number().min(0).optional(),
  temperaturaOperacao: z.number().min(0).optional(),
  dataCertificacao: z.date().optional(),
  validadeCertificacao: z.date().optional(),
  responsavelTecnico: z.string().optional(),
  certificado: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NovaAnaliseIncerteza() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sistemaId: "",
      nome: "",
      tag: "",
      incertezaMedidor: 0,
      incertezaPressao: 0,
      incertezaTemperatura: 0,
      incertezaDensidade: 0,
    },
  });

  // Queries para dados
  const { data: campos = [] } = useQuery({
    queryKey: ["/api/campos"],
    queryFn: () => api.getCampos(),
  });

  const { data: unidades = [] } = useQuery({
    queryKey: ["/api/instalacoes"],
    queryFn: () => api.getInstalacoes(),
  });

  const { data: pontosMedicao = [] } = useQuery({
    queryKey: ["/api/pontos-medicao"],
    queryFn: () => api.getPontosMedicao(),
  });

  const { data: equipamentos = [] } = useQuery({
    queryKey: ["/api/equipamentos"],
    queryFn: () => api.getEquipamentos(),
  });

  // Mutation para criar nova análise
  const createAnaliseIncertezaMutation = useMutation({
    mutationFn: (data: any) => api.createControleIncerteza(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/controle-incertezas"] });
      toast({
        title: "Sucesso",
        description: "Análise de incerteza criada com sucesso",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar análise de incerteza",
        variant: "destructive",
      });
    },
  });

  // Filtragem de equipamentos por tipo
  const getMedidoresPrimarios = () => {
    return equipamentos.filter((eq: any) => eq.tipo === "medidor_primario");
  };

  const getTransmissoresPressao = () => {
    return equipamentos.filter((eq: any) => eq.tipo === "transmissor_pressao");
  };

  const getTransmissoresTemperatura = () => {
    return equipamentos.filter((eq: any) => eq.tipo === "transmissor_temperatura");
  };

  const getComputadoresVazao = () => {
    return equipamentos.filter((eq: any) => eq.tipo === "computador_vazao");
  };

  // Calcular incertezas automaticamente
  const calcularIncertezaCombinada = () => {
    const incMedidor = form.getValues("incertezaMedidor") || 0;
    const incPressao = form.getValues("incertezaPressao") || 0;
    const incTemperatura = form.getValues("incertezaTemperatura") || 0;
    const incDensidade = form.getValues("incertezaDensidade") || 0;
    
    // Raiz quadrada da soma dos quadrados
    return Math.sqrt(
      Math.pow(incMedidor, 2) + 
      Math.pow(incPressao, 2) + 
      Math.pow(incTemperatura, 2) + 
      Math.pow(incDensidade, 2)
    ).toFixed(3);
  };
  
  const calcularIncertezaExpandida = () => {
    // k=2 para nível de confiança de 95%
    const incCombinada = parseFloat(calcularIncertezaCombinada());
    return (incCombinada * 2).toFixed(3);
  };

  // Submit handler
  const onSubmit = (values: FormValues) => {
    const incertezaCombinada = parseFloat(calcularIncertezaCombinada());
    const incertezaExpandida = parseFloat(calcularIncertezaExpandida());
    
    createAnaliseIncertezaMutation.mutate({
      ...values,
      incertezaCombinada,
      incertezaExpandida,
      dataCertificacao: values.dataCertificacao?.toISOString().split('T')[0],
      validadeCertificacao: values.validadeCertificacao?.toISOString().split('T')[0],
    });
  };
  
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Calculator className="mr-2 h-4 w-4" />
          Nova Análise de Incerteza
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Nova Análise de Incerteza</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Identificação do Sistema */}
            <div>
              <h3 className="text-lg font-medium mb-4">Identificação do Sistema</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Sistema *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Sistema Medição A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tag"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>TAG do Sistema *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: SMA-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="campoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campo *</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um campo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {campos.map((campo: any) => (
                            <SelectItem key={campo.id} value={campo.id.toString()}>
                              {campo.nome}
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
                  name="unidadeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidade *</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma unidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {unidades.map((unidade: any) => (
                            <SelectItem key={unidade.id} value={unidade.id.toString()}>
                              {unidade.nome}
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
                  name="pontoInstalacaoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ponto de Instalação *</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um ponto" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {pontosMedicao.map((ponto: any) => (
                            <SelectItem key={ponto.id} value={ponto.id.toString()}>
                              {ponto.tag || `Ponto ${ponto.id}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Componentes do Sistema */}
            <div>
              <h3 className="text-lg font-medium mb-4">Componentes do Sistema</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="medidorPrimarioId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medidor Primário ID</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um medidor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getMedidoresPrimarios().map((medidor: any) => (
                            <SelectItem key={medidor.id} value={medidor.id.toString()}>
                              {medidor.tag || `MFP-${medidor.id}`}
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
                  name="transmissorPressaoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transmissor Pressão ID</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um transmissor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getTransmissoresPressao().map((transmissor: any) => (
                            <SelectItem key={transmissor.id} value={transmissor.id.toString()}>
                              {transmissor.tag || `TP-${transmissor.id}`}
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
                  name="transmissorTemperaturaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transmissor Temperatura ID</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um transmissor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getTransmissoresTemperatura().map((transmissor: any) => (
                            <SelectItem key={transmissor.id} value={transmissor.id.toString()}>
                              {transmissor.tag || `TT-${transmissor.id}`}
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
                  name="computadorVazaoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Computador Vazão ID</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um computador" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getComputadoresVazao().map((computador: any) => (
                            <SelectItem key={computador.id} value={computador.id.toString()}>
                              {computador.tag || `CV-${computador.id}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Incertezas Individuais */}
            <div>
              <h3 className="text-lg font-medium mb-4">Incertezas Individuais (%)</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="incertezaMedidor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Incerteza do Medidor (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.01"
                          placeholder="0.25"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="incertezaPressao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Incerteza da Pressão (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.01"
                          placeholder="0.15"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="incertezaTemperatura"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Incerteza da Temperatura (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.01"
                          placeholder="0.10"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="incertezaDensidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Incerteza da Densidade (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.01"
                          placeholder="0.05"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Incertezas Calculadas */}
            <div>
              <h3 className="text-lg font-medium mb-4">Incertezas Calculadas (%)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-md p-3 bg-muted/20">
                  <p className="text-sm font-medium mb-2">Incerteza Combinada (%)</p>
                  <div className="text-lg font-semibold">{calcularIncertezaCombinada()}%</div>
                  <p className="text-xs text-muted-foreground">Calculado automaticamente</p>
                </div>
                
                <div className="border rounded-md p-3 bg-muted/20">
                  <p className="text-sm font-medium mb-2">Incerteza Expandida (k=2) (%)</p>
                  <div className="text-lg font-semibold">{calcularIncertezaExpandida()}%</div>
                  <p className="text-xs text-muted-foreground">Calculado automaticamente</p>
                </div>
              </div>
            </div>
            
            {/* Condições Operacionais */}
            <div>
              <h3 className="text-lg font-medium mb-4">Condições Operacionais</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="vazaoMinima"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vazão Mínima (m³/h)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.1"
                          placeholder="10.0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="vazaoMaxima"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vazão Máxima (m³/h)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.1"
                          placeholder="1000.0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="pressaoOperacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pressão de Operação (bar)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.1"
                          placeholder="25.0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="temperaturaOperacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temperatura de Operação (°C)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.1"
                          placeholder="60.0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Certificação */}
            <div>
              <h3 className="text-lg font-medium mb-4">Certificação</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dataCertificacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data do Cálculo</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="w-full pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy")
                              ) : (
                                <span>dd/mm/aaaa</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="validadeCertificacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Validade do Cálculo</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="w-full pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy")
                              ) : (
                                <span>dd/mm/aaaa</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="responsavelTecnico"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsável Técnico</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Eng. João Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="certificado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certificado de Incerteza</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: CERT-2023-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={createAnaliseIncertezaMutation.isPending}
              >
                {createAnaliseIncertezaMutation.isPending ? "Salvando..." : "Criar Análise"}
                <Check className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}