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
import { insertPlanoColetaSchema, type InsertPlanoColeta, type PlanoColeta, type PontoMedicao } from "@shared/schema";
import { z } from "zod";

const formSchema = insertPlanoColetaSchema.extend({
  dataEmbarque: z.string().optional(),
  dataDesembarque: z.string().optional(),
  dataRealEmbarque: z.string().optional(),
}).refine((data) => data.pontoMedicaoId && data.pontoMedicaoId > 0, {
  message: "Ponto de medição é obrigatório",
  path: ["pontoMedicaoId"],
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pontoMedicaoId: plan?.pontoMedicaoId || undefined,
      dataEmbarque: plan?.dataEmbarque?.toString() || "",
      dataDesembarque: plan?.dataDesembarque?.toString() || "",
      validadoOperacao: plan?.validadoOperacao || false,
      validadoLaboratorio: plan?.validadoLaboratorio || false,
      cilindrosDisponiveis: plan?.cilindrosDisponiveis || false,
      embarqueAgendado: plan?.embarqueAgendado || false,
      embarqueRealizado: plan?.embarqueRealizado || false,
      coletaRealizada: plan?.coletaRealizada || false,
      resultadoEmitido: plan?.resultadoEmitido || false,
      dataRealEmbarque: plan?.dataRealEmbarque?.toString() || "",
      observacoes: plan?.observacoes || "",
      status: plan?.status || "pendente",
    },
  });

  const { data: pontosMedicao } = useQuery({
    queryKey: ["/api/pontos-medicao"],
    queryFn: () => api.getPontosMedicao(),
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertPlanoColeta) => api.createPlanoColeta(data),
    onSuccess: () => {
      // Force refetch to ensure UI updates
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
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertPlanoColeta> }) => 
      api.updatePlanoColeta(id, data),
    onSuccess: () => {
      // Force refetch to ensure UI updates
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
    const submitData = {
      ...data,
      dataEmbarque: data.dataEmbarque ? data.dataEmbarque : null,
      dataDesembarque: data.dataDesembarque ? data.dataDesembarque : null,
      dataRealEmbarque: data.dataRealEmbarque ? data.dataRealEmbarque : null,
    };
    
    if (isEditing && plan) {
      updateMutation.mutate({ id: plan.id, data: submitData });
    } else {
      createMutation.mutate(submitData as InsertPlanoColeta);
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
              name="pontoMedicaoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ponto de Medição *</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger data-testid="select-measurement-point" aria-label="Selecionar ponto de medição">
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
              name="dataEmbarque"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Embarque</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      data-testid="input-embark-date"
                      aria-label="Data de embarque"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dataDesembarque"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Desembarque</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      data-testid="input-disembark-date"
                      aria-label="Data de desembarque"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dataRealEmbarque"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Real de Embarque</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      data-testid="input-real-embark-date"
                    />
                  </FormControl>
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
                      <SelectTrigger data-testid="select-status" aria-label="Status do plano de coleta">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="agendado">Agendado</SelectItem>
                      <SelectItem value="em-andamento">Em Andamento</SelectItem>
                      <SelectItem value="concluido">Concluído</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Checklist de Validações */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Checklist de Validações</h3>
            
            <FormField
              control={form.control}
              name="validadoOperacao"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                      data-testid="checkbox-validated-operation"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Validado pela Operação</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="validadoLaboratorio"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                      data-testid="checkbox-validated-laboratory"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Validado pelo Laboratório</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cilindrosDisponiveis"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                      data-testid="checkbox-cylinders-available"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Cilindros Disponíveis</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="embarqueAgendado"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                      data-testid="checkbox-embark-scheduled"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Embarque Agendado</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="embarqueRealizado"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                      data-testid="checkbox-embark-completed"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Embarque Realizado</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="coletaRealizada"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                      data-testid="checkbox-collection-completed"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Coleta Realizada</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resultadoEmitido"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                      data-testid="checkbox-result-issued"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Resultado Emitido</FormLabel>
                  </div>
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
                    placeholder="Observações sobre o plano de coleta"
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
