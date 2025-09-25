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
import { insertPlacaOrificioSchema, type InsertPlacaOrificio, type PlacaOrificio, type Equipamento } from "@shared/schema";
import { z } from "zod";

const formSchema = insertPlacaOrificioSchema.extend({
  diametroExterno20c: z.coerce.number().optional(),
  diametroOrificio20c: z.coerce.number().optional(),
  espessura: z.coerce.number().optional(),
  emaEspecifico: z.coerce.number().optional(),
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
      diametroExterno20c: plate?.diametroExterno20c || undefined,
      diametroOrificio20c: plate?.diametroOrificio20c || undefined,
      espessura: plate?.espessura || undefined,
      material: plate?.material || "",
      classePressao: plate?.classePressao || "",
      dataInspecao: plate?.dataInspecao || "",
      dataInstalacao: plate?.dataInstalacao || "",
      dataMaximaUso: plate?.dataMaximaUso || "",
      cartaNumero: plate?.cartaNumero || "",
      criterioAceitacao: plate?.criterioAceitacao || "",
      emaEspecifico: plate?.emaEspecifico || undefined,
      certificadoDimensional: plate?.certificadoDimensional || "",
    },
  });

  const { data: equipamentos } = useQuery({
    queryKey: ["/api/equipamentos"],
    queryFn: () => api.getEquipamentos(),
  });

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
            name="diametroExterno20c"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <FormField
            control={form.control}
            name="classePressao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Classe de Pressão</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: 150# / 300# / 600#"
                    data-testid="input-classe-pressao"
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

          <FormField
            control={form.control}
            name="dataMaximaUso"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data Máxima de Uso</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    data-testid="input-data-maxima-uso"
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
          name="emaEspecifico"
          render={({ field }) => (
            <FormItem>
              <FormLabel>EMA Específico (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 0.50"
                  data-testid="input-ema-especifico"
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
          name="criterioAceitacao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Critério de Aceitação</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva os critérios de aceitação..."
                  data-testid="input-criterio-aceitacao"
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
          name="certificadoDimensional"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Certificado Dimensional</FormLabel>
              <FormControl>
                <Input
                  placeholder="Número ou referência do certificado"
                  data-testid="input-certificado-dimensional"
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