import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon, Package, Check } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

// Componentes UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Schema para o formulário de cilindros
const formSchema = z.object({
  poloId: z.number().min(1, "Campo obrigatório"),
  instalacaoId: z.number().min(1, "Campo obrigatório"),
  pocosTeste: z.string().min(1, "Campo obrigatório"),
  quantidadeCilindros: z.number().min(1, "Informe pelo menos 1 cilindro"),
  dataRetirada: z.date().optional(),
  dataRecebimento: z.date().optional(),
  dataEnvioFornecedor: z.date().optional(),
  dataRecebimentoFornecedor: z.date().optional(),
  dataEntregaCliente: z.date().optional(),
  dataPrevisaoRetorno: z.date().optional(),
  observacao: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function GestaoForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantidadeCilindros: 1,
      pocosTeste: "",
      observacao: ""
    },
  });

  // Queries para dados
  const { data: polos = [] } = useQuery({
    queryKey: ["/api/polos"],
    queryFn: () => api.getPolos(),
  });

  const { data: instalacoes = [] } = useQuery({
    queryKey: ["/api/instalacoes"],
    queryFn: () => api.getInstalacoes(),
  });

  // Mutation para criar novo registro
  const createGestaoCilindrosMutation = useMutation({
    mutationFn: (data: any) => api.createGestaoCilindro(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gestao-cilindros"] });
      toast({
        title: "Sucesso",
        description: "Registro de gestão de cilindros criado com sucesso",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar registro de gestão de cilindros",
        variant: "destructive",
      });
    },
  });

  // Submit handler
  const onSubmit = (values: FormValues) => {
    createGestaoCilindrosMutation.mutate({
      ...values,
      dataRetirada: values.dataRetirada?.toISOString().split('T')[0],
      dataRecebimento: values.dataRecebimento?.toISOString().split('T')[0],
      dataEnvioFornecedor: values.dataEnvioFornecedor?.toISOString().split('T')[0],
      dataRecebimentoFornecedor: values.dataRecebimentoFornecedor?.toISOString().split('T')[0],
      dataEntregaCliente: values.dataEntregaCliente?.toISOString().split('T')[0],
      dataPrevisaoRetorno: values.dataPrevisaoRetorno?.toISOString().split('T')[0],
    });
  };

  // Filtragem de instalações por polo
  const getInstalacoesByPolo = (poloId: number) => {
    return instalacoes.filter((inst: any) => inst.poloId === poloId);
  };
  
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Package className="mr-2 h-4 w-4" />
          Novo Registro de Cilindros
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Registro de Gestão de Cilindros</DialogTitle>
          <DialogDescription>
            Registre informações sobre os cilindros utilizados em testes.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informações Principais */}
            <div>
              <h3 className="text-lg font-medium mb-4">Informações Principais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="poloId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Polo *</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(parseInt(value));
                          // Resetar instalação quando mudar de polo
                          form.setValue("instalacaoId", 0);
                        }}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o polo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {polos.map((polo: any) => (
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
                      <FormLabel>Unidade *</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                        disabled={!form.watch("poloId")}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a unidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {form.watch("poloId") && 
                            getInstalacoesByPolo(form.watch("poloId")).map((inst: any) => (
                              <SelectItem key={inst.id} value={inst.id.toString()}>
                                {inst.nome}
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="pocosTeste"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Poços para Teste *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: PCH-01, PCH-02" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="quantidadeCilindros"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade de Cilindros *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="1"
                          placeholder="Ex: 3"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          value={field.value || 1}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Datas */}
            <div>
              <h3 className="text-lg font-medium mb-4">Cronograma</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dataRetirada"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data da Retirada</FormLabel>
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
                            locale={pt}
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
                  name="dataRecebimento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data do Recebimento</FormLabel>
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
                            locale={pt}
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
                  name="dataEnvioFornecedor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data do Envio ao Fornecedor</FormLabel>
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
                            locale={pt}
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
                  name="dataRecebimentoFornecedor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data do Recebimento do Fornecedor</FormLabel>
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
                            locale={pt}
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
                  name="dataEntregaCliente"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data da Entrega ao Cliente</FormLabel>
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
                            locale={pt}
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
                  name="dataPrevisaoRetorno"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Previsão de Retorno</FormLabel>
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
                            locale={pt}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Observação */}
            <div>
              <h3 className="text-lg font-medium mb-4">Observação</h3>
              <FormField
                control={form.control}
                name="observacao"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <textarea
                        className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Informações adicionais sobre os cilindros"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={createGestaoCilindrosMutation.isPending}
              >
                {createGestaoCilindrosMutation.isPending ? "Salvando..." : "Criar Registro"}
                <Check className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Componente para listar registros de gestão de cilindros
export function CilindrosTable() {
  const { data: gestaoCilindros = [], isLoading } = useQuery({
    queryKey: ["/api/gestao-cilindros"],
    queryFn: () => api.getGestaoCilindros(),
  });

  // Columns definition
  // Helper to determine status based on dates
  function getStatus(registro: any) {
    if (!registro.dataRetirada) return "Em preparação";
    if (registro.dataRetirada && !registro.dataEnvioFornecedor) return "Retirado";
    if (registro.dataEnvioFornecedor && !registro.dataRecebimentoFornecedor) return "No fornecedor";
    if (registro.dataRecebimentoFornecedor && registro.dataEntregaCliente) return "Retornado";
    if (registro.dataPrevisaoRetorno && new Date() > new Date(registro.dataPrevisaoRetorno)) return "Pendente";
    return "Em andamento";
  }

  // Helper to get status color class
  function getStatusColor(status: string) {
    const statusColors: any = {
      "Em preparação": "bg-blue-100 text-blue-800",
      "Retirado": "bg-amber-100 text-amber-800",
      "No fornecedor": "bg-purple-100 text-purple-800",
      "Retornado": "bg-green-100 text-green-800",
      "Pendente": "bg-red-100 text-red-800",
      "Em andamento": "bg-gray-100 text-gray-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold">Registros de Gestão de Cilindros</h2>
        <GestaoForm />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Polo</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Poços Teste</TableHead>
              <TableHead>Qtd. Cilindros</TableHead>
              <TableHead>Data Retirada</TableHead>
              <TableHead>Previsão Retorno</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : gestaoCilindros.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6">
                  Nenhum registro encontrado
                </TableCell>
              </TableRow>
            ) : (
              gestaoCilindros.map((registro: any) => (
                <TableRow key={registro.id}>
                  <TableCell>{registro.id}</TableCell>
                  <TableCell>{registro.polo?.nome || registro.poloId}</TableCell>
                  <TableCell>{registro.instalacao?.nome || registro.instalacaoId}</TableCell>
                  <TableCell>{registro.pocosTeste}</TableCell>
                  <TableCell>{registro.quantidadeCilindros}</TableCell>
                  <TableCell>
                    {registro.dataRetirada ? format(new Date(registro.dataRetirada), "dd/MM/yyyy") : "-"}
                  </TableCell>
                  <TableCell>
                    {registro.dataPrevisaoRetorno ? format(new Date(registro.dataPrevisaoRetorno), "dd/MM/yyyy") : "-"}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(getStatus(registro))}`}>
                      {getStatus(registro)}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}