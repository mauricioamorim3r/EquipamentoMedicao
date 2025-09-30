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
import type { Instalacao, Polo, Campo } from "@shared/schema";

const installationSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  sigla: z.string().min(1, "Sigla é obrigatória"),
  poloId: z.string().min(1, "Polo é obrigatório"),
  campoId: z.string().optional(),
  tipo: z.string().optional(),
  situacao: z.string().optional(),
  ambiente: z.string().optional(),
  laminaAgua: z.string().optional(),
  estado: z.string().optional(),
  cidade: z.string().optional(),
  operadora: z.string().optional(),
  capacidadePetroleo: z.string().optional(),
  capacidadeGas: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  status: z.string().default("ativo"),
});

type InstallationFormData = z.infer<typeof installationSchema>;

interface InstallationFormProps {
  installation?: Instalacao | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function InstallationForm({ installation, onSuccess, onCancel }: InstallationFormProps) {
  const { toast } = useToast();
  
  const form = useForm<InstallationFormData>({
    resolver: zodResolver(installationSchema),
    defaultValues: {
      nome: installation?.nome || "",
      sigla: installation?.sigla || "",
      poloId: installation?.poloId?.toString() || "",
      campoId: installation?.campoId?.toString() || "",
      tipo: installation?.tipo || "",
      situacao: installation?.situacao || "",
      ambiente: installation?.ambiente || "",
      laminaAgua: installation?.laminaAgua?.toString() || "",
      estado: installation?.estado || "",
      cidade: installation?.cidade || "",
      operadora: installation?.operadora || "",
      capacidadePetroleo: installation?.capacidadePetroleo?.toString() || "",
      capacidadeGas: installation?.capacidadeGas?.toString() || "",
      latitude: installation?.latitude?.toString() || "",
      longitude: installation?.longitude?.toString() || "",
      status: installation?.status || "ativo",
    },
  });

  // Fetch related data
  const { data: polos } = useQuery({
    queryKey: ["/api/polos"],
    queryFn: api.getPolos,
  });

  const { data: campos } = useQuery({
    queryKey: ["/api/campos"],
    queryFn: () => api.getCampos(),
  });

  // Create/Update mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => api.createInstalacao(data),
    onSuccess: () => {
      toast({ title: "Instalação criada com sucesso!" });
      onSuccess();
    },
    onError: (error) => {
      toast({ 
        title: "Erro ao criar instalação", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.updateInstalacao(id, data),
    onSuccess: () => {
      toast({ title: "Instalação atualizada com sucesso!" });
      onSuccess();
    },
    onError: (error) => {
      toast({ 
        title: "Erro ao atualizar instalação", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (data: InstallationFormData) => {
    const formattedData = {
      ...data,
      poloId: parseInt(data.poloId),
      campoId: data.campoId && data.campoId !== "none" ? parseInt(data.campoId) : null,
      laminaAgua: data.laminaAgua ? parseFloat(data.laminaAgua) : null,
      capacidadePetroleo: data.capacidadePetroleo ? parseFloat(data.capacidadePetroleo) : null,
      capacidadeGas: data.capacidadeGas ? parseFloat(data.capacidadeGas) : null,
      latitude: data.latitude ? parseFloat(data.latitude) : null,
      longitude: data.longitude ? parseFloat(data.longitude) : null,
    };

    if (installation?.id) {
      updateMutation.mutate({ id: installation.id, data: formattedData });
    } else {
      createMutation.mutate(formattedData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações Básicas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Informações Básicas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Instalação *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: FPSO Cidade de Ilhabela" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sigla"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sigla *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: FPSO-CI" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="operadora"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operadora</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Petrobras" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="poloId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Polo *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
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
              name="campoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar campo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Nenhum campo selecionado</SelectItem>
                      {campos?.map((campo: Campo) => (
                        <SelectItem key={campo.id} value={campo.id.toString()}>
                          {campo.sigla} - {campo.nome}
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                      <SelectItem value="desativado">Desativado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Classificação e Situação */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Classificação e Situação</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="FPSO">FPSO</SelectItem>
                      <SelectItem value="Plataforma">Plataforma</SelectItem>
                      <SelectItem value="Refinaria">Refinaria</SelectItem>
                      <SelectItem value="Terminal">Terminal</SelectItem>
                      <SelectItem value="UEP">UEP</SelectItem>
                      <SelectItem value="UPGN">UPGN</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="situacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Situação</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar situação" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Operando">Operando</SelectItem>
                      <SelectItem value="Parada">Parada</SelectItem>
                      <SelectItem value="Teste">Teste</SelectItem>
                      <SelectItem value="Construção">Construção</SelectItem>
                      <SelectItem value="Projeto">Projeto</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ambiente"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ambiente</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar ambiente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Marítimo">Marítimo</SelectItem>
                      <SelectItem value="Terrestre">Terrestre</SelectItem>
                      <SelectItem value="Lacustre">Lacustre</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <FormField
              control={form.control}
              name="laminaAgua"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lâmina d'Água (m)</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" step="0.1" placeholder="Ex: 1200.5" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Localização */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Localização</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Rio de Janeiro" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Macaé" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="latitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitude</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" step="0.000001" placeholder="Ex: -22.2726" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="longitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" step="0.000001" placeholder="Ex: -39.9309" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Capacidades de Produção */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Capacidades de Produção</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="capacidadePetroleo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacidade de Petróleo (bbl/dia)</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" step="0.1" placeholder="Ex: 150000" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="capacidadeGas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacidade de Gás (m³/dia)</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" step="0.1" placeholder="Ex: 6000000" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : installation?.id ? "Atualizar" : "Criar"} Instalação
          </Button>
        </div>
      </form>
    </Form>
  );
}