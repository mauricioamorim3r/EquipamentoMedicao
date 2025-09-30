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
import { useEquipmentAutoFill } from "@/hooks/use-auto-fill";
import { insertPlacaOrificioSchema, type InsertPlacaOrificio, type PlacaOrificio, type Equipamento } from "@shared/schema";
import { z } from "zod";
import { useEffect } from "react";

const formSchema = insertPlacaOrificioSchema.extend({
  diametroExterno: z.coerce.number().optional(),
  diametroOrificio20c: z.coerce.number().optional(),
  espessura: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface OrificePlateFormProps {
  plate?: PlacaOrificio | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function OrificePlateForm({ plate, onClose, onSuccess }: OrificePlateFormProps) {
  const { toast } = useToast();
  const isEditing = !!plate;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      equipamentoId: plate?.equipamentoId || 0,
      numeroSerie: plate?.numeroSerie || "",
      diametroExterno: plate?.diametroExterno || undefined,
      diametroOrificio20c: plate?.diametroOrificio20c || undefined,
      espessura: plate?.espessura || undefined,
      material: plate?.material || "",
      dataInspecao: plate?.dataInspecao || "",
      dataInstalacao: plate?.dataInstalacao || "",
      cartaNumero: plate?.cartaNumero || "",
      observacao: plate?.observacao || "",
    },
  });

  const { data: equipamentos } = useQuery({
    queryKey: ["/api/equipamentos"],
    queryFn: () => api.getEquipamentos(),
  });

  // Watch equipment selection for auto-fill
  const selectedEquipamentoId = form.watch("equipamentoId");
  const { data: equipmentData } = useEquipmentAutoFill(selectedEquipamentoId);

  // Auto-fill when equipment changes
  useEffect(() => {
    if (equipmentData && !isEditing) {
      const { equipamento, instalacao, polo } = equipmentData;
      
      // Auto-generate serial number if empty
      const currentNumeroSerie = form.getValues("numeroSerie");
      if (!currentNumeroSerie && equipamento) {
        const serialSuggestion = `PO-${equipamento.tag}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        form.setValue("numeroSerie", serialSuggestion);
      }
      
      // Auto-fill material if equipment has model info
      const currentMaterial = form.getValues("material");
      if (!currentMaterial && equipamento?.modelo) {
        // Common orifice plate materials based on equipment model
        const materialMapping: Record<string, string> = {
          "Inox": "Aço Inoxidável 316L",
          "Carbon": "Aço Carbono",
          "Hastelloy": "Hastelloy C-276",
          "Monel": "Monel 400"
        };
        
        const suggestedMaterial = Object.keys(materialMapping).find(key => 
          equipamento.modelo?.includes(key)
        );
        
        if (suggestedMaterial) {
          form.setValue("material", materialMapping[suggestedMaterial]);
        } else {
          form.setValue("material", "Aço Inoxidável 316L"); // Default
        }
      }

      toast({
        title: "Auto preenchimento",
        description: `Dados baseados no equipamento ${equipamento.tag} preenchidos automaticamente.`,
      });
    }
  }, [equipmentData, form, isEditing, toast]);

  const createMutation = useMutation({
    mutationFn: api.createPlacaOrificio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/placas-orificio"] });
      toast({
        title: "Sucesso",
        description: "Placa de orifício criada com sucesso!",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar placa de orifício",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: InsertPlacaOrificio }) =>
      api.updatePlacaOrificio(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/placas-orificio"] });
      toast({
        title: "Sucesso",
        description: "Placa de orifício atualizada com sucesso!",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar placa de orifício",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    if (isEditing && plate) {
      updateMutation.mutate({ id: plate.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="equipamentoId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Equipamento *</FormLabel>
                <Select 
                  value={field.value?.toString() || ""} 
                  onValueChange={(value) => field.onChange(parseInt(value))}
                >
                  <FormControl>
                    <SelectTrigger data-testid="select-equipamento">
                      <SelectValue placeholder="Selecione o equipamento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {equipamentos?.map((equipamento: Equipamento) => (
                      <SelectItem key={equipamento.id} value={equipamento.id.toString()}>
                        {equipamento.tag} - {equipamento.nome}
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
            name="numeroSerie"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Série *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: PO-001"
                    data-testid="input-numero-serie"
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
            name="cartaNumero"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número da Carta</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: C-001"
                    data-testid="input-carta-numero"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="diametroExterno"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Diâmetro Externo @ 20°C (mm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.001"
                    placeholder="0.000"
                    data-testid="input-diametro-externo"
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
            name="diametroOrificio20c"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Diâmetro do Orifício @ 20°C (mm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.001"
                    placeholder="0.000"
                    data-testid="input-diametro-orificio"
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
            name="espessura"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Espessura (mm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.001"
                    placeholder="0.000"
                    data-testid="input-espessura"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="material"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Material</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Aço inoxidável 316L"
                  data-testid="input-material"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dataInspecao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Inspeção</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    data-testid="input-data-inspecao"
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
            name="dataInstalacao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Instalação</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    data-testid="input-data-instalacao"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
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
                  placeholder="Observações sobre a placa de orifício..."
                  data-testid="input-observacao"
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
            {isEditing ? "Atualizar" : "Criar"} Placa de Orifício
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            data-testid="button-cancel"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}