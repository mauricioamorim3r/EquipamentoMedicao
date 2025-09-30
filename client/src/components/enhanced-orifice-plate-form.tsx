import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Upload, Search, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useEquipmentAutoFill } from "@/hooks/use-auto-fill";
import type { PlacaOrificio, Equipamento, Campo, Instalacao, PontoMedicao } from "@shared/schema";

// Schema for orifice plate form with all required fields
const formSchema = z.object({
  // Equipment selection (required)
  equipamentoId: z.number().min(1, "Equipamento é obrigatório"),
  numeroSerie: z.string().min(1, "Número de série é obrigatório"),
  
  // Location fields
  campoId: z.number().optional().nullable(),
  instalacaoId: z.number().optional().nullable(),
  pontoInstalacaoId: z.number().optional().nullable(),
  
  // Physical specifications
  material: z.string().optional().nullable(),
  diametroExterno: z.number().optional().nullable(),
  diametroOrificio20c: z.number().optional().nullable(),
  espessura: z.number().optional().nullable(),
  
  // Flow specifications
  vazaoMinima: z.number().optional().nullable(),
  vazaoMaxima: z.number().optional().nullable(),
  
  // Diameter specifications
  diametroNominal: z.number().optional().nullable(),
  diametroInternoMedio: z.number().optional().nullable(),
  diametroInternoMedio20c: z.number().optional().nullable(),
  
  // Documentation and compliance
  certificadoVigente: z.string().optional().nullable(),
  norma: z.string().optional().nullable(),
  dataInspecao: z.string().optional().nullable(),
  dataInstalacao: z.string().optional().nullable(),
  cartaNumero: z.string().optional().nullable(),
  observacao: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface EnhancedOrificePlateFormProps {
  plate?: PlacaOrificio | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EnhancedOrificePlateForm({ 
  plate, 
  onClose, 
  onSuccess 
}: EnhancedOrificePlateFormProps) {
  const { toast } = useToast();
  const [selectedEquipment, setSelectedEquipment] = useState<Equipamento | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const isEditing = !!plate;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      equipamentoId: plate?.equipamentoId || 0,
      numeroSerie: plate?.numeroSerie || "",
      campoId: plate?.campoId || null,
      instalacaoId: plate?.instalacaoId || null,
      pontoInstalacaoId: plate?.pontoInstalacaoId || null,
      material: plate?.material || "",
      diametroExterno: plate?.diametroExterno || null,
      diametroOrificio20c: plate?.diametroOrificio20c || null,
      espessura: plate?.espessura || null,
      vazaoMinima: plate?.vazaoMinima || null,
      vazaoMaxima: plate?.vazaoMaxima || null,
      diametroNominal: plate?.diametroNominal || null,
      diametroInternoMedio: plate?.diametroInternoMedio || null,
      diametroInternoMedio20c: plate?.diametroInternoMedio20c || null,
      certificadoVigente: plate?.certificadoVigente || "",
      norma: plate?.norma || "",
      dataInspecao: plate?.dataInspecao || "",
      dataInstalacao: plate?.dataInstalacao || "",
      cartaNumero: plate?.cartaNumero || "",
      observacao: plate?.observacao || "",
    },
  });

  // Fetch data
  const { data: equipamentos, isLoading: equipamentosLoading } = useQuery({
    queryKey: ["/api/equipamentos"],
    queryFn: () => api.getEquipamentos(),
  });

  const { data: campos } = useQuery({
    queryKey: ["/api/campos"],
    queryFn: () => api.getCampos(),
  });

  const { data: instalacoes } = useQuery({
    queryKey: ["/api/instalacoes"],
    queryFn: () => api.getInstalacoes(),
  });

  const { data: pontosMedicao } = useQuery({
    queryKey: ["/api/pontos-medicao"],
    queryFn: () => api.getPontosMedicao(),
  });

  // Auto-fill hook based on selected equipment
  const selectedEquipamentoId = form.watch("equipamentoId");
  const { data: equipmentData } = useEquipmentAutoFill(selectedEquipamentoId);

  // Filter equipamentos for orifice plates (tipo containing "placa" or "orifício")
  const orificePlateEquipments = equipamentos?.filter((eq: Equipamento) => 
    eq.tipo?.toLowerCase().includes("placa") || 
    eq.tipo?.toLowerCase().includes("orifício") ||
    eq.tipo?.toLowerCase().includes("orificio")
  ) || [];

  // Filter equipamentos based on search term
  const filteredEquipments = orificePlateEquipments.filter((eq: Equipamento) =>
    !searchTerm ||
    eq.numeroSerie.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eq.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eq.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Auto-fill when equipment changes
  useEffect(() => {
    if (equipmentData && !isEditing) {
      const { equipamento, instalacao, polo } = equipmentData;
      
      if (instalacao) {
        form.setValue("instalacaoId", instalacao.id);
        form.setValue("campoId", instalacao.campoId);
        
        toast({
          title: "Auto-preenchimento",
          description: `Instalação e campo preenchidos baseados no equipamento ${equipamento.tag}`,
        });
      }
      
      // Auto-suggest material based on environment
      if (instalacao && !form.getValues("material")) {
        let suggestedMaterial = "Aço Inoxidável 316L"; // Default
        
        if (instalacao.ambiente?.toLowerCase().includes("offshore")) {
          suggestedMaterial = "Super Duplex";
        } else if (instalacao.ambiente?.toLowerCase().includes("alta temperatura")) {
          suggestedMaterial = "Hastelloy C-276";
        } else if (instalacao.ambiente?.toLowerCase().includes("corrosivo")) {
          suggestedMaterial = "Monel 400";
        }
        
        form.setValue("material", suggestedMaterial);
      }
    }
  }, [equipmentData, form, isEditing, toast]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: FormValues) => api.createPlacaOrificio(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/placas-orificio"] });
      toast({ title: "Placa de orifício criada com sucesso!" });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar placa de orifício",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormValues }) => 
      api.updatePlacaOrificio(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/placas-orificio"] });
      toast({ title: "Placa de orifício atualizada com sucesso!" });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar placa de orifício",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    if (isEditing && plate?.id) {
      updateMutation.mutate({ id: plate.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEquipmentSelect = (equipamentoId: number) => {
    const equipment = equipamentos?.find((eq: Equipamento) => eq.id === equipamentoId);
    setSelectedEquipment(equipment || null);
    form.setValue("equipamentoId", equipamentoId);
    form.setValue("numeroSerie", equipment?.numeroSerie || "");
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Equipment Selection Section */}
      {!isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Selecionar Equipamento (Placa de Orifício)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por número de série, TAG ou nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            
            {searchTerm && (
              <div className="max-h-48 overflow-y-auto border rounded-lg">
                {filteredEquipments.length > 0 ? (
                  <div className="p-2 space-y-2">
                    {filteredEquipments.map((equipment: Equipamento) => (
                      <div
                        key={equipment.id}
                        className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                          selectedEquipment?.id === equipment.id ? 'bg-blue-50 border-blue-300' : ''
                        }`}
                        onClick={() => handleEquipmentSelect(equipment.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{equipment.tag}</p>
                            <p className="text-sm text-gray-600">{equipment.nome}</p>
                            <p className="text-sm text-gray-500">N/S: {equipment.numeroSerie}</p>
                          </div>
                          <Badge variant="outline">{equipment.tipo}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                    Nenhuma placa de orifício encontrada
                  </div>
                )}
              </div>
            )}
            
            {selectedEquipment && (
              <Card className="bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-blue-900">Equipamento Selecionado:</p>
                      <p className="text-blue-800">{selectedEquipment.tag} - {selectedEquipment.nome}</p>
                      <p className="text-sm text-blue-600">N/S: {selectedEquipment.numeroSerie}</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">{selectedEquipment.tipo}</Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}

      {/* Form Section */}
      {(isEditing || selectedEquipment) && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="numeroSerie"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Série *</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="material"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Material</FormLabel>
                        <Select
                          value={field.value || ""}
                          onValueChange={(value) => field.onChange(value || null)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o material" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Aço Inoxidável 316L">Aço Inoxidável 316L</SelectItem>
                            <SelectItem value="Aço Carbono">Aço Carbono</SelectItem>
                            <SelectItem value="Super Duplex">Super Duplex</SelectItem>
                            <SelectItem value="Hastelloy C-276">Hastelloy C-276</SelectItem>
                            <SelectItem value="Monel 400">Monel 400</SelectItem>
                            <SelectItem value="Inconel 625">Inconel 625</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card>
              <CardHeader>
                <CardTitle>Localização</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="campoId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campo</FormLabel>
                        <Select
                          value={field.value?.toString() || ""}
                          onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o campo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
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
                    name="instalacaoId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instalação</FormLabel>
                        <Select
                          value={field.value?.toString() || ""}
                          onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a instalação" />
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
                    name="pontoInstalacaoId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ponto de Instalação</FormLabel>
                        <Select
                          value={field.value?.toString() || ""}
                          onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o ponto" />
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
                </div>
              </CardContent>
            </Card>

            {/* Physical Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Especificações Físicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="diametroExterno"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diâmetro Externo (De) - mm</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
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
                        <FormLabel>Diâmetro do Orifício @ 20°C (dr) - mm</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
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
                        <FormLabel>Espessura (E) - mm</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
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
                    name="diametroNominal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diâmetro Nominal (DN) - mm</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="diametroInternoMedio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diâmetro Interno Médio (Dm) - mm</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="diametroInternoMedio20c"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diâmetro Interno Médio @ 20°C (Dr) - mm</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Flow Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Especificações de Vazão</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="vazaoMinima"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vazão Mínima (m³/dia)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vazaoMaxima"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vazão Máxima (m³/dia)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Documentation and Compliance */}
            <Card>
              <CardHeader>
                <CardTitle>Documentação e Conformidade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="certificadoVigente"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Certificado de Calibração Vigente</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="norma"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Norma</FormLabel>
                        <Select
                          value={field.value || ""}
                          onValueChange={(value) => field.onChange(value || null)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a norma" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="AGA 3">AGA 3</SelectItem>
                            <SelectItem value="ISO 5167">ISO 5167</SelectItem>
                            <SelectItem value="API 14.3">API 14.3</SelectItem>
                            <SelectItem value="ASME MFC-3M">ASME MFC-3M</SelectItem>
                          </SelectContent>
                        </Select>
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
                        <FormLabel>Data Inspeção</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
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
                        <FormLabel>Data Instalação</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
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
                        <FormLabel>Carta N°</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
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
                      <FormLabel>Observação</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Observações adicionais..."
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Certificate Upload Section */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">
                    Inserir Certificado de Inspeção
                  </p>
                  <Button type="button" variant="outline" size="sm">
                    Selecionar Arquivo
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Formatos aceitos: PDF, JPG, PNG (máx. 5MB)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : isEditing ? "Atualizar" : "Criar"} Placa
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}