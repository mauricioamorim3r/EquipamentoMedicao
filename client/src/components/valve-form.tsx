import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useEquipmentAutoFill, useAutoFill } from "@/hooks/use-auto-fill";
import { useEffect } from "react";
import { z } from "zod";
import type { Valvula } from "@shared/schema";

const formSchema = z.object({
  equipamentoId: z.number().min(1, "Equipamento é obrigatório").optional(),
  numeroSerie: z.string().min(1, "Número de série é obrigatório"),
  tagValvula: z.string().min(1, "TAG da válvula é obrigatório"),
  tipoValvula: z.string().optional(),
  fabricante: z.string().optional(),
  modelo: z.string().optional(),
  poloId: z.number().optional(),
  instalacaoId: z.number().optional(),
  localInstalacao: z.string().optional(),
  classificacao: z.string().optional(),
  finalidadeSistema: z.string().optional(),
  classePressaoDiametro: z.string().optional(),
  diametroNominal: z.coerce.number().optional(),
  dataUltimoTeste: z.string().optional(),
  resultadoUltimoTeste: z.string().optional(),
  periodicidadeTeste: z.coerce.number().optional(),
  dataPrevistaProximoTeste: z.string().optional(),
  relatorioEstanqueidadePath: z.string().optional(),
  statusOperacional: z.string().default("operacional"),
  observacao: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ValveFormProps {
  valve?: Valvula | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ValveForm({ valve, onClose, onSuccess }: ValveFormProps) {
  const { toast } = useToast();
  const isEditing = !!valve;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      equipamentoId: valve?.equipamentoId || undefined,
      numeroSerie: valve?.numeroSerie || "",
      tagValvula: valve?.tagValvula || "",
      tipoValvula: valve?.tipoValvula || "",
      fabricante: valve?.fabricante || "",
      modelo: valve?.modelo || "",
      poloId: valve?.poloId || undefined,
      instalacaoId: valve?.instalacaoId || undefined,
      localInstalacao: valve?.localInstalacao || "",
      classificacao: valve?.classificacao || "",
      finalidadeSistema: valve?.finalidadeSistema || "",
      classePressaoDiametro: valve?.classePressaoDiametro || "",
      diametroNominal: valve?.diametroNominal || undefined,
      dataUltimoTeste: valve?.dataUltimoTeste || "",
      resultadoUltimoTeste: valve?.resultadoUltimoTeste || "",
      periodicidadeTeste: valve?.periodicidadeTeste || undefined,
      dataPrevistaProximoTeste: valve?.dataPrevistaProximoTeste || "",
      relatorioEstanqueidadePath: valve?.relatorioEstanqueidadePath || "",
      statusOperacional: valve?.statusOperacional || "operacional",
      observacao: valve?.observacao || "",
    },
  });

  // Hook de autopreenchimento
  const { data } = useAutoFill();
  const selectedEquipamentoId = form.watch("equipamentoId");
  const { data: autoFillData } = useEquipmentAutoFill(selectedEquipamentoId);

  // Fetch equipamentos
  const { data: equipamentos } = useQuery({
    queryKey: ["/api/equipamentos"],
    queryFn: () => api.getEquipamentos(),
  });

  // Filter equipamentos for valves
  const valveEquipamentos = equipamentos?.filter((eq: any) =>
    eq.tipo?.toLowerCase().includes("válvula") ||
    eq.tipo?.toLowerCase().includes("valvula")
  ) || [];

  // Autopreencher dados quando equipamento é selecionado
  useEffect(() => {
    if (autoFillData?.equipamento && !isEditing) {
      form.setValue("numeroSerie", autoFillData.equipamento.numeroSerie);
      form.setValue("tagValvula", autoFillData.equipamento.tag);
      if (autoFillData.polo) {
        form.setValue("poloId", autoFillData.polo.id);
      }
      if (autoFillData.instalacao) {
        form.setValue("instalacaoId", autoFillData.instalacao.id);
        form.setValue("localInstalacao", autoFillData.instalacao.nome);
      }
    }
  }, [autoFillData, isEditing]);

  const createMutation = useMutation({
    mutationFn: (data: FormValues) => api.createValvula(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/valvulas"] });
      toast({
        title: "Sucesso",
        description: "Válvula criada com sucesso",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar válvula",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormValues) => api.updateValvula(valve!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/valvulas"] });
      toast({
        title: "Sucesso",
        description: "Válvula atualizada com sucesso",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar válvula",
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Identificação */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Identificação</h3>

            {!isEditing && (
              <FormField
                control={form.control}
                name="equipamentoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selecionar Equipamento (Válvula)</FormLabel>
                    <Select
                      value={field.value?.toString() || ""}
                      onValueChange={(value) => {
                        const equipamento = equipamentos?.find((eq: any) => eq.id.toString() === value);
                        if (equipamento) {
                          field.onChange(Number(value));
                          form.setValue("numeroSerie", equipamento.numeroSerie || "");
                          form.setValue("tagValvula", equipamento.tag || "");
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o número de série da válvula..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {valveEquipamentos.length > 0 ? (
                          valveEquipamentos.map((equipamento: any) => (
                            <SelectItem key={equipamento.id} value={equipamento.id.toString()}>
                              <div className="flex flex-col">
                                <span className="font-medium">N/S: {equipamento.numeroSerie}</span>
                                <span className="text-xs text-muted-foreground">
                                  TAG: {equipamento.tag} | {equipamento.nome}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            Nenhuma válvula cadastrada
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="numeroSerie"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Série *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: VLV-001"
                      data-testid="input-numero-serie"
                      {...field}
                      value={field.value || ""}
                      disabled={!isEditing && !!form.watch("equipamentoId")}
                      className={!isEditing && !!form.watch("equipamentoId") ? "bg-muted" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tagValvula"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TAG da Válvula *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: XV-001"
                      data-testid="input-tag-valvula"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipoValvula"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Válvula</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-tipo-valvula">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="gaveta">Gaveta</SelectItem>
                      <SelectItem value="globo">Globo</SelectItem>
                      <SelectItem value="esfera">Esfera</SelectItem>
                      <SelectItem value="borboleta">Borboleta</SelectItem>
                      <SelectItem value="agulha">Agulha</SelectItem>
                      <SelectItem value="diafragma">Diafragma</SelectItem>
                      <SelectItem value="retencao">Retenção</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fabricante"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fabricante</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nome do fabricante"
                      data-testid="input-fabricante"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="modelo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Modelo da válvula"
                      data-testid="input-modelo"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Localização e Características */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Localização e Características</h3>

            <FormField
              control={form.control}
              name="localInstalacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Local de Instalação</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Unidade A - Área 1"
                      data-testid="input-local-instalacao"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="classificacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Classificação</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Classificação da válvula"
                      data-testid="input-classificacao"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="finalidadeSistema"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Finalidade do Sistema</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Bloqueio, Controle, Segurança"
                      data-testid="input-finalidade-sistema"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="classePressaoDiametro"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Classe de Pressão / Diâmetro</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: 150# / DN50"
                      data-testid="input-classe-pressao-diametro"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="diametroNominal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diâmetro Nominal (mm)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Ex: 50"
                      data-testid="input-diametro-nominal"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Testes de Estanqueidade */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Testes de Estanqueidade</h3>

            <FormField
              control={form.control}
              name="dataUltimoTeste"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data do Último Teste</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      data-testid="input-data-ultimo-teste"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resultadoUltimoTeste"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resultado do Último Teste</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Aprovado, Reprovado"
                      data-testid="input-resultado-ultimo-teste"
                      {...field}
                      value={field.value || ""}
                    />
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
                  <FormLabel>Periodicidade do Teste (dias)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Ex: 365"
                      data-testid="input-periodicidade-teste"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dataPrevistaProximoTeste"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Prevista Próximo Teste</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      data-testid="input-data-prevista-proximo-teste"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Status</h3>

            <FormField
              control={form.control}
              name="statusOperacional"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Operacional</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-status-operacional">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="operacional">Operacional</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                      <SelectItem value="inoperante">Inoperante</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Observações */}
        <FormField
          control={form.control}
          name="observacao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observações adicionais sobre a válvula..."
                  data-testid="textarea-observacao"
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
          <Button 
            type="submit" 
            data-testid="button-submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending ? "Salvando..." : 
             isEditing ? "Atualizar Válvula" : "Criar Válvula"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            data-testid="button-cancel"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}