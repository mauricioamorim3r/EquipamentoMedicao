import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertTestePocoSchema, type InsertTestePoco, type CadastroPoço } from "@shared/schema";
import { z } from "zod";

const formSchema = insertTestePocoSchema.extend({
  vazaoOleo: z.coerce.number().min(0).optional(),
  vazaoGas: z.coerce.number().min(0).optional(), 
  vazaoAgua: z.coerce.number().min(0).optional(),
  bsw: z.coerce.number().min(0).max(100).optional(),
  rgo: z.coerce.number().min(0).optional(),
}).omit({
  pocoId: true, // Will be provided by parent component
});

type FormValues = z.infer<typeof formSchema>;

interface BtpTestFormProps {
  well: CadastroPoço;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BtpTestForm({ well, onClose, onSuccess }: BtpTestFormProps) {
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dataTeste: new Date().toISOString().split('T')[0],
      tipoTeste: "BTP",
      statusTeste: "pendente",
      vazaoOleo: 0,
      vazaoGas: 0,
      vazaoAgua: 0,
      bsw: 0,
      rgo: 0,
      numeroBoletim: "",
      responsavelTeste: "",
      observacoes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: FormValues) => api.createWellTest(well.id, data),
    onSuccess: () => {
      // Invalidate both the wells list and the specific well's tests
      queryClient.invalidateQueries({ queryKey: ["/api/pocos"] });
      queryClient.invalidateQueries({ queryKey: [`/api/pocos/${well.id}/testes`] });
      // Also invalidate any other related queries
      queryClient.invalidateQueries({ queryKey: ["/api/pocos", "withTests"] });
      toast({
        title: "Sucesso",
        description: "Teste BTP registrado com sucesso",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao registrar teste",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    createMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informações do Teste */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Informações do Teste</h3>
            
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium">Poço: {well.codigo}</p>
              <p className="text-sm text-muted-foreground">{well.nome}</p>
            </div>

            <FormField
              control={form.control}
              name="dataTeste"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data do Teste *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} data-testid="input-test-date" />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-test-type">
                        <SelectValue placeholder="Selecionar tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BTP">BTP - Boletim de Teste de Produção</SelectItem>
                      <SelectItem value="TPF">TPF - Teste de Pressão de Formação</SelectItem>
                      <SelectItem value="TPI">TPI - Teste de Produtividade de Injeção</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="numeroBoletim"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número do Boletim</FormLabel>
                  <FormControl>
                    <Input {...field} className="font-mono" data-testid="input-bulletin-number" />
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
                    <Input {...field} data-testid="input-responsible" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Resultados do Teste */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Resultados do Teste</h3>
            
            <FormField
              control={form.control}
              name="vazaoOleo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vazão de Óleo (bbl/d)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      {...field} 
                      value={field.value?.toString() || ""}
                      data-testid="input-oil-flow"
                    />
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
                  <FormLabel>Vazão de Gás (Mm³/d)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      {...field} 
                      value={field.value?.toString() || ""}
                      data-testid="input-gas-flow"
                    />
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
                  <FormLabel>Vazão de Água (bbl/d)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      {...field} 
                      value={field.value?.toString() || ""}
                      data-testid="input-water-flow"
                    />
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
                    <Input 
                      type="number" 
                      step="0.01"
                      max="100"
                      {...field} 
                      value={field.value?.toString() || ""}
                      data-testid="input-bsw"
                    />
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
                    <Input 
                      type="number" 
                      step="0.01"
                      {...field} 
                      value={field.value?.toString() || ""}
                      data-testid="input-rgo"
                    />
                  </FormControl>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-test-status">
                        <SelectValue placeholder="Selecionar status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="concluido">Concluído</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
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
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Observações sobre o teste..."
                  {...field}
                  rows={3}
                  data-testid="textarea-observations"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={createMutation.isPending}
            data-testid="button-save"
          >
            {createMutation.isPending ? "Salvando..." : "Registrar Teste"}
          </Button>
        </div>
      </form>
    </Form>
  );
}