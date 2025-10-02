import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import type { Polo, Instalacao } from "@shared/schema";

const wellTestSchema = z.object({
  pocoId: z.string().min(1, "Poço é obrigatório"),
  poloId: z.string().min(1, "Polo é obrigatório"),
  instalacaoId: z.string().min(1, "Instalação é obrigatória"),
  dataTeste: z.string().min(1, "Data do teste é obrigatória"),
  tipoTeste: z.string().min(1, "Tipo de teste é obrigatório"),
  dataPrevistoProximoTeste: z.string().optional(),
  periodicidadeTeste: z.string().optional(),
  numeroBoletimTeste: z.string().optional(),
  tagMedidorOleo: z.string().optional(),
  vazaoOleo: z.string().optional(),
  vazaoGas: z.string().optional(),
  vazaoAgua: z.string().optional(),
  bsw: z.string().optional(),
  rgo: z.string().optional(),
  resultadoTeste: z.string().optional(),
  resultadoUltimoTeste: z.string().optional(),
  dataAtualizacaoPotencial: z.string().optional(),
  ehUltimoTeste: z.string().default("false"),
  arquivoBtpPath: z.string().optional(),
  observacoes: z.string().optional(),
  responsavelTeste: z.string().optional(),
  statusTeste: z.string().default("realizado"),
});

type WellTestFormData = z.infer<typeof wellTestSchema>;

interface WellTestCompleteFormProps {
  wellTest?: any | null;
  preselectedPocoId?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function WellTestCompleteForm({
  wellTest,
  preselectedPocoId,
  onSuccess,
  onCancel
}: WellTestCompleteFormProps) {
  const { toast } = useToast();

  const form = useForm<WellTestFormData>({
    resolver: zodResolver(wellTestSchema),
    defaultValues: {
      pocoId: wellTest?.pocoId?.toString() || preselectedPocoId?.toString() || "",
      poloId: wellTest?.poloId?.toString() || "",
      instalacaoId: wellTest?.instalacaoId?.toString() || "",
      dataTeste: wellTest?.dataTeste ? new Date(wellTest.dataTeste).toISOString().split('T')[0] : "",
      tipoTeste: wellTest?.tipoTeste || "BTP",
      dataPrevistoProximoTeste: wellTest?.dataPrevistoProximoTeste
        ? new Date(wellTest.dataPrevistoProximoTeste).toISOString().split('T')[0]
        : "",
      periodicidadeTeste: wellTest?.periodicidadeTeste?.toString() || "90",
      numeroBoletimTeste: wellTest?.numeroBoletimTeste || "",
      tagMedidorOleo: wellTest?.tagMedidorOleo || "",
      vazaoOleo: wellTest?.vazaoOleo?.toString() || "",
      vazaoGas: wellTest?.vazaoGas?.toString() || "",
      vazaoAgua: wellTest?.vazaoAgua?.toString() || "",
      bsw: wellTest?.bsw?.toString() || "",
      rgo: wellTest?.rgo?.toString() || "",
      resultadoTeste: wellTest?.resultadoTeste || "",
      resultadoUltimoTeste: wellTest?.resultadoUltimoTeste || "",
      dataAtualizacaoPotencial: wellTest?.dataAtualizacaoPotencial
        ? new Date(wellTest.dataAtualizacaoPotencial).toISOString().split('T')[0]
        : "",
      ehUltimoTeste: wellTest?.ehUltimoTeste ? "true" : "false",
      arquivoBtpPath: wellTest?.arquivoBtpPath || "",
      observacoes: wellTest?.observacoes || "",
      responsavelTeste: wellTest?.responsavelTeste || "",
      statusTeste: wellTest?.statusTeste || "realizado",
    },
  });

  // Fetch related data
  const { data: polos } = useQuery({
    queryKey: ["/api/polos"],
    queryFn: api.getPolos,
  });

  const { data: instalacoes } = useQuery({
    queryKey: ["/api/instalacoes"],
    queryFn: () => api.getInstalacoes(),
  });

  const { data: pocos } = useQuery({
    queryKey: ["/api/pocos"],
    queryFn: () => api.getPocos(),
  });

  // Create/Update mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => api.createTestePoco(data),
    onSuccess: () => {
      toast({ title: "Teste de poço criado com sucesso!" });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar teste",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.updateTestePoco(id, data),
    onSuccess: () => {
      toast({ title: "Teste de poço atualizado com sucesso!" });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar teste",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const onSubmit = (data: WellTestFormData) => {
    const formData = {
      ...data,
      pocoId: parseInt(data.pocoId),
      poloId: parseInt(data.poloId),
      instalacaoId: parseInt(data.instalacaoId),
      dataTeste: new Date(data.dataTeste),
      dataPrevistoProximoTeste: data.dataPrevistoProximoTeste ? new Date(data.dataPrevistoProximoTeste) : null,
      dataAtualizacaoPotencial: data.dataAtualizacaoPotencial ? new Date(data.dataAtualizacaoPotencial) : null,
      periodicidadeTeste: data.periodicidadeTeste ? parseInt(data.periodicidadeTeste) : null,
      vazaoOleo: data.vazaoOleo ? parseFloat(data.vazaoOleo) : null,
      vazaoGas: data.vazaoGas ? parseFloat(data.vazaoGas) : null,
      vazaoAgua: data.vazaoAgua ? parseFloat(data.vazaoAgua) : null,
      bsw: data.bsw ? parseFloat(data.bsw) : null,
      rgo: data.rgo ? parseFloat(data.rgo) : null,
      ehUltimoTeste: data.ehUltimoTeste === "true",
    };

    if (wellTest?.id) {
      updateMutation.mutate({ id: wellTest.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Dados Básicos */}
          <FormField
            control={form.control}
            name="pocoId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Poço *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={!!preselectedPocoId}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o poço" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {pocos?.map((poco) => (
                      <SelectItem key={poco.id} value={poco.id.toString()}>
                        {poco.codigo} - {poco.nome}
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o polo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {polos?.map((polo) => (
                      <SelectItem key={polo.id} value={polo.id.toString()}>
                        {polo.sigla} - {polo.nome}
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a instalação" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {instalacoes?.map((instalacao) => (
                      <SelectItem key={instalacao.id} value={instalacao.id.toString()}>
                        {instalacao.sigla} - {instalacao.nome}
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
            name="dataTeste"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data do Teste *</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tipoTeste"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Teste *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="BTP">BTP</SelectItem>
                    <SelectItem value="Produção">Produção</SelectItem>
                    <SelectItem value="Potencial">Potencial</SelectItem>
                    <SelectItem value="Restauração">Restauração</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="statusTeste"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status do Teste</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="realizado">Realizado</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                    <SelectItem value="reprogramado">Reprogramado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dataPrevistoProximoTeste"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data Prevista Próximo Teste</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="periodicidadeTeste"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Periodicidade (dias)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder="Ex: 90" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="numeroBoletimTeste"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número do Boletim</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: BTP-2024-001" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="responsavelTeste"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsável pelo Teste</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nome do responsável" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tagMedidorOleo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>TAG Medidor de Óleo</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: FT-001" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vazaoOleo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vazão de Óleo (m³/d)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" step="0.01" placeholder="0.00" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vazaoGas"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vazão de Gás (m³/d)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" step="0.01" placeholder="0.00" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vazaoAgua"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vazão de Água (m³/d)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" step="0.01" placeholder="0.00" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bsw"
            render={({ field }) => (
              <FormItem>
                <FormLabel>BSW (%)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" step="0.01" placeholder="0.00" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rgo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RGO (m³/m³)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" step="0.01" placeholder="0.00" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="resultadoTeste"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resultado do Teste</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="reprovado">Reprovado</SelectItem>
                    <SelectItem value="com_restricao">Com Restrição</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dataAtualizacaoPotencial"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data Atualização Potencial</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ehUltimoTeste"
            render={({ field }) => (
              <FormItem>
                <FormLabel>É o Último Teste?</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">Sim</SelectItem>
                    <SelectItem value="false">Não</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="arquivoBtpPath"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Caminho do Arquivo BTP</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="/uploads/btp/arquivo.pdf" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Observações sobre o teste..."
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
