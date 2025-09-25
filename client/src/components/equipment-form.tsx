import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertEquipamentoSchema, type InsertEquipamento, type Equipamento, type Polo, type Instalacao } from "@shared/schema";
import { z } from "zod";

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
      ativoMxm: equipment?.ativoMxm || false,
      planoManutencao: equipment?.planoManutencao || "",
      criterioAceitacao: equipment?.criterioAceitacao || "",
      erroMaximoAdmissivel: equipment?.erroMaximoAdmissivel || undefined,
      status: equipment?.status || "ativo",
    },
  });

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

  const createMutation = useMutation({
    mutationFn: (data: InsertEquipamento) => api.createEquipamento(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipamentos"] });
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
                  <FormControl>
                    <Input {...field} data-testid="input-name" />
                  </FormControl>
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
                    <FormControl>
                      <Input {...field} value={field.value || ""} placeholder="Ex: m³/h, bar, °C" data-testid="input-unit" />
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
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
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
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                      data-testid="checkbox-mxm"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Ativo no MXM</FormLabel>
                  </div>
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
              <div className="grid grid-cols-2 gap-4">
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
                    <FormLabel>Plano de Manutenção MXM</FormLabel>
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
