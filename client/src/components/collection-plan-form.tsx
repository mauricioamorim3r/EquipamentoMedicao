import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertPlanoColetaSchema, type InsertPlanoColeta, type PlanoColeta, type PontoMedicao } from "@shared/schema";
import { z } from "zod";
import { useEffect, useState } from "react";

const formSchema = z.object({
  pontoMedicaoId: z.number().min(1, "Ponto de medição é obrigatório"),
  tag: z.string().optional(),
  pocoId: z.number().optional().nullable(),
  instalacaoId: z.number().optional().nullable(),
  campoId: z.number().optional().nullable(),
  tipoAmostra: z.string().min(1, "Tipo da amostra é obrigatório"),
  tipoAnalise: z.string().min(1, "Tipo de análise é obrigatório"),
  aplicabilidade: z.string().min(1, "Aplicabilidade é obrigatória"),
  pontoAmostragem: z.string().min(1, "Ponto de amostragem é obrigatório"),
  periodicidade: z.string().min(1, "Periodicidade é obrigatória"),
  observacoes: z.string().optional(),
  status: z.string().default("pendente"),
});

type FormValues = z.infer<typeof formSchema>;

interface CollectionPlanFormProps {
  plan?: PlanoColeta | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CollectionPlanForm({ plan, onClose, onSuccess }: CollectionPlanFormProps) {
  const { toast } = useToast();
  const isEditing = !!plan;
  const [selectedPontoMedicao, setSelectedPontoMedicao] = useState<PontoMedicao | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pontoMedicaoId: plan?.pontoMedicaoId || undefined,
      tag: plan?.tag || "",
      pocoId: plan?.pocoId || null,
      instalacaoId: plan?.instalacaoId || null,
      campoId: plan?.campoId || null,
      tipoAmostra: plan?.tipoAmostra || "",
      tipoAnalise: plan?.tipoAnalise || "",
      aplicabilidade: plan?.aplicabilidade || "",
      pontoAmostragem: plan?.pontoAmostragem || "",
      periodicidade: plan?.periodicidade || "",
      observacoes: plan?.observacoes || "",
      status: plan?.status || "pendente",
    },
  });

  const { data: pontosMedicao } = useQuery({
    queryKey: ["/api/pontos-medicao"],
    queryFn: () => api.getPontosMedicao(),
  });

  const { data: pocos } = useQuery({
    queryKey: ["/api/wells"],
    queryFn: () => api.getWells(),
  });

  const { data: instalacoes } = useQuery({
    queryKey: ["/api/instalacoes"],
    queryFn: () => api.getInstalacoes(),
  });

  const { data: campos } = useQuery({
    queryKey: ["/api/campos"],
    queryFn: () => api.getCampos(),
  });

  // Auto-preencher TAG quando seleciona ponto de medição
  useEffect(() => {
    if (selectedPontoMedicao) {
      form.setValue("tag", selectedPontoMedicao.tag || "");
      form.setValue("instalacaoId", selectedPontoMedicao.instalacaoId || null);
    }
  }, [selectedPontoMedicao, form]);

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createPlanoColeta(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/planos-coleta"] });
      queryClient.refetchQueries({ queryKey: ["/api/planos-coleta"] });
      toast({
        title: "Sucesso",
        description: "Plano de coleta criado com sucesso",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar plano de coleta",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.updatePlanoColeta(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/planos-coleta"] });
      queryClient.refetchQueries({ queryKey: ["/api/planos-coleta"] });
      toast({
        title: "Sucesso",
        description: "Plano de coleta atualizado com sucesso!",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar plano de coleta",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    if (isEditing && plan) {
      updateMutation.mutate({ id: plan.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coluna 1: Identificação */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Identificação</h3>

            <FormField
              control={form.control}
              name="pontoMedicaoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ponto de Medição *</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      const id = parseInt(value);
                      field.onChange(id);
                      const ponto = pontosMedicao?.find((p: PontoMedicao) => p.id === id);
                      setSelectedPontoMedicao(ponto || null);
                    }}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="select-measurement-point">
                        <SelectValue placeholder="Selecionar ponto de medição" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {pontosMedicao?.map((ponto: PontoMedicao) => (
                        <SelectItem key={ponto.id} value={ponto.id.toString()}>
                          {ponto.tag} - {ponto.nome}
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
              name="tag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TAG do Ponto de Medição</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      readOnly
                      disabled
                      placeholder="Selecionado automaticamente"
                      className="bg-muted"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pocoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poço (se aplicável)</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === "null" ? null : parseInt(value))}
                    value={field.value?.toString() || "null"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar poço (opcional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="null">Nenhum</SelectItem>
                      {pocos?.map((poco: any) => (
                        <SelectItem key={poco.id} value={poco.id.toString()}>
                          {poco.nome}
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
                  <FormLabel>Instalação</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === "null" ? null : parseInt(value))}
                    value={field.value?.toString() || "null"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar instalação" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="null">Nenhuma</SelectItem>
                      {instalacoes?.map((inst: any) => (
                        <SelectItem key={inst.id} value={inst.id.toString()}>
                          {inst.sigla} - {inst.nome}
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
              name="campoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campo</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === "null" ? null : parseInt(value))}
                    value={field.value?.toString() || "null"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar campo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="null">Nenhum</SelectItem>
                      {campos?.map((campo: any) => (
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
          </div>

          {/* Coluna 2: Características da Coleta */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Características da Coleta</h3>

            <FormField
              control={form.control}
              name="tipoAmostra"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo da Amostra (Fluido) *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar tipo de amostra" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="gas-natural">Gás Natural</SelectItem>
                      <SelectItem value="oleo-cru">Óleo Cru</SelectItem>
                      <SelectItem value="condensado">Condensado</SelectItem>
                      <SelectItem value="agua-producao">Água de Produção</SelectItem>
                      <SelectItem value="glp">GLP</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipoAnalise"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Análise *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar tipo de análise" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pvt">PVT</SelectItem>
                      <SelectItem value="cromatografia">Cromatografia</SelectItem>
                      <SelectItem value="bsw">BSW</SelectItem>
                      <SelectItem value="teor-enxofre">Teor de Enxofre</SelectItem>
                      <SelectItem value="grau-api">Grau °API</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="aplicabilidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aplicabilidade *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar aplicabilidade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="fiscal">Fiscal</SelectItem>
                      <SelectItem value="apropriacao">Apropriação</SelectItem>
                      <SelectItem value="transferencia-custodia">Transferência de Custódia</SelectItem>
                      <SelectItem value="operacional">Operacional</SelectItem>
                      <SelectItem value="analise-tecnica">Análise Técnica</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pontoAmostragem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ponto de Amostragem *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex: Linha de produção, Separador 1, etc."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="periodicidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Periodicidade *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar periodicidade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="diaria">Diária</SelectItem>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="quinzenal">Quinzenal</SelectItem>
                      <SelectItem value="mensal">Mensal</SelectItem>
                      <SelectItem value="bimestral">Bimestral</SelectItem>
                      <SelectItem value="trimestral">Trimestral</SelectItem>
                      <SelectItem value="semestral">Semestral</SelectItem>
                      <SelectItem value="anual">Anual</SelectItem>
                      <SelectItem value="sob-demanda">Sob Demanda</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Observações */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Observações</h3>

          <FormField
            control={form.control}
            name="observacoes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value || ""}
                    placeholder="Informações adicionais sobre o plano de coleta"
                    rows={4}
                    data-testid="textarea-observations"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            data-testid="button-cancel"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            data-testid="button-save"
          >
            {(createMutation.isPending || updateMutation.isPending)
              ? (isEditing ? "Atualizando..." : "Salvando...")
              : (isEditing ? "Atualizar" : "Criar")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
