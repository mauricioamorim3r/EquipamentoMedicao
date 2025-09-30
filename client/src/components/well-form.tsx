import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAutoFill } from "@/hooks/use-auto-fill";
import { insertCadastroPocoSchema, type InsertCadastroPoço, type CadastroPoço, type Polo, type Instalacao, type Campo } from "@shared/schema";
import { z } from "zod";
import { useEffect } from "react";

const formSchema = insertCadastroPocoSchema.extend({
  frequenciaTesteDias: z.coerce.number().min(1, "Frequência deve ser maior que 0"),
});

type FormValues = z.infer<typeof formSchema>;

interface WellFormProps {
  well?: CadastroPoço | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function WellForm({ well, onClose, onSuccess }: WellFormProps) {
  const { toast } = useToast();
  const isEditing = !!well;
  
  // Use auto-fill hook for data management
  const { data: autoFillData, getFilteredCampos, getFilteredInstalacoes, getCampoByInstalacao } = useAutoFill();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codigo: well?.codigo || "",
      poloId: well?.poloId || 0,
      instalacaoId: well?.instalacaoId || 0,
      nome: well?.nome || "",
      tipo: well?.tipo || "",
      codigoAnp: well?.codigoAnp || "",
      frequenciaTesteDias: well?.frequenciaTesteDias || 90,
      status: well?.status || "ativo",
    },
  });

  // Watch form values for auto-fill functionality
  const selectedPoloId = form.watch("poloId");
  const selectedInstalacaoId = form.watch("instalacaoId");
  
  // Auto-fill when polo changes
  useEffect(() => {
    if (selectedPoloId && !isEditing) {
      const selectedPolo = autoFillData.polos.find((p: Polo) => p.id === selectedPoloId);
      if (selectedPolo) {
        // Auto-fill polo-related fields if needed
        const fieldsFromPolo = getFilteredInstalacoes(selectedPoloId);
        if (fieldsFromPolo.length === 1) {
          // If only one installation, auto-select it
          form.setValue("instalacaoId", fieldsFromPolo[0].id);
        }
      }
    }
  }, [selectedPoloId, autoFillData.polos, getFilteredInstalacoes, form, isEditing]);

  // Auto-fill when installation changes
  useEffect(() => {
    if (selectedInstalacaoId && !isEditing) {
      const selectedInstalacao = autoFillData.instalacoes.find((i: Instalacao) => i.id === selectedInstalacaoId);
      if (selectedInstalacao) {
        // Auto-fill installation-related data
        const campo = getCampoByInstalacao(selectedInstalacaoId);
        
        // Auto-generate well name if empty
        const currentNome = form.getValues("nome");
        if (!currentNome) {
          const codigo = form.getValues("codigo");
          if (codigo && selectedInstalacao.sigla) {
            form.setValue("nome", `Poço ${selectedInstalacao.sigla}-${codigo}`);
          }
        }
      }
    }
  }, [selectedInstalacaoId, autoFillData.instalacoes, getCampoByInstalacao, form, isEditing]);

  // Get filtered data based on selections
  const availableCampos = selectedPoloId ? getFilteredCampos(selectedPoloId) : [];
  const availableInstalacoes = selectedPoloId ? getFilteredInstalacoes(selectedPoloId) : [];

  const createMutation = useMutation({
    mutationFn: (data: InsertCadastroPoço) => api.createPoco(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pocos"] });
      toast({
        title: "Sucesso",
        description: "Poço criado com sucesso",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar poço",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    createMutation.mutate(data as InsertCadastroPoço);
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
              name="codigo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código do Poço *</FormLabel>
                  <FormControl>
                    <Input {...field} className="font-mono" data-testid="input-well-code" />
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
                  <FormLabel>Nome do Poço *</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-well-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="codigoAnp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código ANP *</FormLabel>
                  <FormControl>
                    <Input {...field} className="font-mono" data-testid="input-anp-code" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo do Poço</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                    <FormControl>
                      <SelectTrigger data-testid="select-well-type">
                        <SelectValue placeholder="Selecionar tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="produtor">Produtor</SelectItem>
                      <SelectItem value="injetor">Injetor</SelectItem>
                      <SelectItem value="exploratório">Exploratório</SelectItem>
                      <SelectItem value="desenvolvimento">Desenvolvimento</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                      {autoFillData.polos?.map((polo: Polo) => (
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
                      {availableInstalacoes?.map((instalacao: Instalacao) => (
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
                      <SelectItem value="suspenso">Suspenso</SelectItem>
                      <SelectItem value="abandonado">Abandonado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="frequenciaTesteDias"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequência de Teste BTP (dias)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      value={field.value?.toString() || ""}
                      data-testid="input-test-frequency"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            disabled={createMutation.isPending}
            data-testid="button-save"
          >
            {createMutation.isPending ? "Salvando..." : isEditing ? "Atualizar" : "Criar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
