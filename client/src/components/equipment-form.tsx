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
import { useInstallationAutoFill } from "@/hooks/use-auto-fill";
import { insertEquipamentoSchema, type InsertEquipamento, type Equipamento, type Polo, type Instalacao } from "@shared/schema";
import { z } from "zod";
import { useEffect } from "react";

const UNIDADES_MEDIDA = [
  "%",
  "°C",
  "°F",
  "bar",
  "barg",
  "h",
  "K",
  "kg",
  "kg/cm²",
  "kg/d",
  "kg/h",
  "kg/L",
  "kg/m³",
  "kgf/cm²",
  "km",
  "km²",
  "km³",
  "L",
  "lb",
  "m",
  "m²",
  "m³",
  "m³/d",
  "m³/h",
  "mg",
  "mg/L",
  "mi",
  "ml",
  "mm",
  "mol",
  "outro",
  "ppm",
  "psi",
  "psia",
  "psig",
  "pulsos/m³",
  "s",
  "scf",
  "Sm³/h",
  "t",
  "t/h",
  "ton"
];

const EQUIPMENT_TYPES = [
  "Amostrador Automático",
  "Amostrador Manual",
  "Analisador de BSW Online",
  "Analisador de Densidade",
  "Centrífuga",
  "Computador de Vazão",
  "Cromatógrafo",
  "Densímetro de Vidro",
  "Densímetro Digital",
  "Medidor de Nível",
  "Medidor de Vazão Deslocamento Positivo",
  "Medidor de Vazão Magnético",
  "Medidor de Vazão Coriolis",
  "Medidor de Vazão Turbina",
  "Medidor de Vazão Ultrassônico",
  "Medidor Multifásico",
  "Placa de Orifício",
  "Porta-placas",
  "Provador Compacto",
  "Provador de Líquidos (Ball Prover)",
  "Retificador de Fluxo",
  "Sensor Termoressistivo PT100 (2 Fios)",
  "Sensor Termoressistivo PT100 (3 Fios)",
  "Sensor Termoressistivo PT100 (4 Fios)",
  "Termômetro Bimetálico",
  "Termômetro Vidro",
  "Termopar",
  "Titulador Karl Fisher",
  "Transmissor de Pressão Absoluta",
  "Transmissor de Pressão Diferencial",
  "Transmissor de Pressão Estática",
  "Transmissor de Pressão Manométrico",
  "Transmissor de Pulsos DP",
  "Transmissor de Temperatura",
  "Transmissor Multivariável",
  "Trecho-reto",
  "Trena",
  "Válvula"
];

const formSchema = insertEquipamentoSchema.extend({
  faixaMinEquipamento: z.coerce.number().optional(),
  faixaMaxEquipamento: z.coerce.number().optional(),
  faixaMinPam: z.coerce.number().optional(),
  faixaMaxPam: z.coerce.number().optional(),
  faixaMinCalibrada: z.coerce.number().optional(),
  faixaMaxCalibrada: z.coerce.number().optional(),
  frequenciaCalibracao: z.coerce.number().optional(),
  erroMaximoAdmissivel: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EquipmentFormProps {
  equipment?: Equipamento | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EquipmentForm({ equipment, onClose, onSuccess }: EquipmentFormProps) {
  const { toast } = useToast();
  const isEditing = !!equipment;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numeroSerie: equipment?.numeroSerie || "",
      tag: equipment?.tag || "",
      nome: equipment?.nome || "",
      modelo: equipment?.modelo || "",
      fabricante: equipment?.fabricante || "",
      unidadeMedida: equipment?.unidadeMedida || "",
      faixaMinEquipamento: equipment?.faixaMinEquipamento || undefined,
      faixaMaxEquipamento: equipment?.faixaMaxEquipamento || undefined,
      faixaMinPam: equipment?.faixaMinPam || undefined,
      faixaMaxPam: equipment?.faixaMaxPam || undefined,
      faixaMinCalibrada: equipment?.faixaMinCalibrada || undefined,
      faixaMaxCalibrada: equipment?.faixaMaxCalibrada || undefined,
      instalacaoId: equipment?.instalacaoId || 0,
      poloId: equipment?.poloId || 0,
      classificacao: equipment?.classificacao || "",
      frequenciaCalibracao: equipment?.frequenciaCalibracao || undefined,
      ativoMxm: equipment?.ativoMxm || "",
      planoManutencao: equipment?.planoManutencao || "",
      criterioAceitacao: equipment?.criterioAceitacao || "",
      erroMaximoAdmissivel: equipment?.erroMaximoAdmissivel || undefined,
      status: equipment?.status || "ativo",
    },
  });

  // Auto-fill hook para dados da instalação
  const selectedInstalacaoId = form.watch("instalacaoId");
  const { data: installationData } = useInstallationAutoFill(selectedInstalacaoId);

  const { data: polos } = useQuery({
    queryKey: ["/api/polos"],
    queryFn: api.getPolos,
  });

  const selectedPoloId = form.watch("poloId");
  const { data: instalacoes } = useQuery({
    queryKey: ["/api/instalacoes", selectedPoloId],
    queryFn: () => selectedPoloId ? api.getInstalacoes(selectedPoloId) : Promise.resolve([]),
    enabled: !!selectedPoloId,
  });

  // Auto-fill efeito para aplicar dados da instalação
  useEffect(() => {
    if (installationData && selectedInstalacaoId && !isEditing) {
      const { instalacao, polo } = installationData;
      
      // Auto-preencher polo se não estiver selecionado
      if (polo && !form.getValues("poloId")) {
        form.setValue("poloId", polo.id);
      }

      // Gerar TAG baseada na instalação se não existir
      if (instalacao && !form.getValues("tag")) {
        const equipmentName = form.getValues("nome");
        if (equipmentName) {
          const equipmentCode = equipmentName.split(" ")[0].substring(0, 3).toUpperCase();
          const randomNum = Math.floor(Math.random() * 999) + 1;
          const newTag = `${instalacao.sigla}-${equipmentCode}-${randomNum.toString().padStart(3, '0')}`;
          form.setValue("tag", newTag);
        }
      }

      toast({
        title: "Auto preenchimento",
        description: `Dados preenchidos automaticamente baseados na instalação ${instalacao?.nome}`,
      });
    }
  }, [installationData, selectedInstalacaoId, isEditing, form, toast]);

  const createMutation = useMutation({
    mutationFn: (data: InsertEquipamento) => api.createEquipamento(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipamentos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/equipamentos/with-calibration"] });
      toast({
        title: "Sucesso",
        description: "Equipamento criado com sucesso",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar equipamento",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertEquipamento> }) => 
      api.updateEquipamento(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipamentos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/equipamentos/with-calibration"] });
      toast({
        title: "Sucesso",
        description: "Equipamento atualizado com sucesso",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar equipamento",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    if (isEditing && equipment) {
      updateMutation.mutate({ id: equipment.id, data });
    } else {
      createMutation.mutate(data as InsertEquipamento);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Informações Básicas</h3>
            
            <FormField
              control={form.control}
              name="numeroSerie"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Série *</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-serial-number" />
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
                  <FormLabel>TAG *</FormLabel>
                  <FormControl>
                    <Input {...field} className="font-mono" data-testid="input-tag" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Equipamento *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-equipment-name">
                        <SelectValue placeholder="Selecione o tipo de equipamento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {EQUIPMENT_TYPES.map((equipmentType) => (
                        <SelectItem key={equipmentType} value={equipmentType}>
                          {equipmentType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fabricante"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fabricante</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} data-testid="input-manufacturer" />
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
                      <Input {...field} value={field.value || ""} data-testid="input-model" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="unidadeMedida"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade de Medida</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger data-testid="select-unit">
                          <SelectValue placeholder="Selecione a unidade de medida" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {UNIDADES_MEDIDA.map((unidade) => (
                          <SelectItem key={unidade} value={unidade}>
                            {unidade}
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
                name="classificacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classificação</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                      <FormControl>
                        <SelectTrigger data-testid="select-classification">
                          <SelectValue placeholder="Selecionar classificação" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fiscal">Fiscal</SelectItem>
                        <SelectItem value="apropriacao">Apropriação</SelectItem>
                        <SelectItem value="operacional">Operacional</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Localização e Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Localização e Status</h3>
            
            <FormField
              control={form.control}
              name="poloId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Polo *</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger data-testid="select-polo">
                        <SelectValue placeholder="Selecionar polo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {polos?.map((polo: Polo) => (
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
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger data-testid="select-installation">
                        <SelectValue placeholder="Selecionar instalação" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {instalacoes?.map((instalacao: Instalacao) => (
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-status">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="em_operacao">Em Operação</SelectItem>
                      <SelectItem value="fora_operacao">Fora de Operação</SelectItem>
                      <SelectItem value="em_calibracao">Em Calibração</SelectItem>
                      <SelectItem value="em_manutencao">Em Manutenção</SelectItem>
                      <SelectItem value="fora_uso">Fora de Uso</SelectItem>
                      <SelectItem value="sobressalente">Sobressalente</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="frequenciaCalibracao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequência Calibração ANP (dias)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      value={field.value?.toString() || ""}
                      data-testid="input-calibration-frequency"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ativoMxm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número Ativo MAXIMO</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={typeof field.value === 'boolean' ? '' : (field.value || "")}
                      placeholder="Ex: 123456"
                      data-testid="input-maximo-number"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Faixas de Medição */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Faixas de Medição</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Faixa do Equipamento</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="faixaMinEquipamento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mínimo</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="any"
                          {...field} 
                          value={field.value?.toString() || ""}
                          data-testid="input-range-min-equipment"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="faixaMaxEquipamento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Máximo</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="any"
                          {...field} 
                          value={field.value?.toString() || ""}
                          data-testid="input-range-max-equipment"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Faixa PAM</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="faixaMinPam"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mínimo</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="any"
                          {...field} 
                          value={field.value?.toString() || ""}
                          data-testid="input-range-min-pam"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="faixaMaxPam"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Máximo</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="any"
                          {...field} 
                          value={field.value?.toString() || ""}
                          data-testid="input-range-max-pam"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Faixa Calibrada</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="faixaMinCalibrada"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mínimo</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="any"
                          {...field} 
                          value={field.value?.toString() || ""}
                          data-testid="input-range-min-calibrated"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="faixaMaxCalibrada"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Máximo</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="any"
                          {...field} 
                          value={field.value?.toString() || ""}
                          data-testid="input-range-max-calibrated"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Critérios Técnicos */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Critérios Técnicos</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="criterioAceitacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Critério de Aceitação</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      value={field.value || ""}
                      placeholder="Descreva os critérios de aceitação"
                      data-testid="textarea-acceptance-criteria"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="erroMaximoAdmissivel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Erro Máximo Admissível (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="any"
                        {...field} 
                        value={field.value?.toString() || ""}
                        data-testid="input-max-error"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="planoManutencao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plano de manutenção no MAXIMO</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} data-testid="input-maintenance-plan" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
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
            {createMutation.isPending || updateMutation.isPending ? "Salvando..." : isEditing ? "Atualizar" : "Criar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
