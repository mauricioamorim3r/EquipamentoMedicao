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
import { Upload, Search, AlertCircle, Ruler } from "lucide-react";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useEquipmentAutoFill } from "@/hooks/use-auto-fill";
import type { TrechoReto, Equipamento, Campo, Instalacao, PontoMedicao } from "@shared/schema";

// Schema for straight section form with all required fields
const formSchema = z.object({
  // Equipment selection (required)
  equipamentoId: z.number().min(1, "Equipamento é obrigatório"),
  numeroSerie: z.string().min(1, "Número de série é obrigatório"),
  
  // Location fields
  campoId: z.number().optional().nullable(),
  instalacaoId: z.number().optional().nullable(),
  pontoInstalacaoId: z.number().optional().nullable(),
  
  // Technical specifications
  classe: z.string().optional().nullable(),
  diametroNominal: z.number().optional().nullable(),
  diametroReferencia20c: z.number().optional().nullable(),
  tipoAco: z.string().optional().nullable(),
  
  // Component identification
  tagTrechoMontanteCondicionador: z.string().optional().nullable(),
  numeroSerieTrechoMontanteCondicionador: z.string().optional().nullable(),
  tagTrechoMontantePlaca: z.string().optional().nullable(),
  numeroSerieTrechoMontantePlaca: z.string().optional().nullable(),
  tagCondicionadorFluxo: z.string().optional().nullable(),
  numeroSerieCondicionadorFluxo: z.string().optional().nullable(),
  numeroSeriePortaPlaca: z.string().optional().nullable(),
  tagTrechoJusante: z.string().optional().nullable(),
  numeroSerieTrechoJusante: z.string().optional().nullable(),
  
  // Documentation and compliance
  certificadoVigente: z.string().optional().nullable(),
  norma: z.string().optional().nullable(),
  dataInspecao: z.string().optional().nullable(),
  dataInstalacao: z.string().optional().nullable(),
  cartaNumero: z.string().optional().nullable(),
  observacao: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface EnhancedStraightSectionFormProps {
  trechoReto?: TrechoReto | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EnhancedStraightSectionForm({
  trechoReto,
  onClose,
  onSuccess
}: EnhancedStraightSectionFormProps) {
  const { toast } = useToast();
  const [selectedEquipment, setSelectedEquipment] = useState<Equipamento | null>(null);
  const isEditing = !!trechoReto;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      equipamentoId: trechoReto?.equipamentoId || 0,
      numeroSerie: trechoReto?.numeroSerie || "",
      campoId: trechoReto?.campoId || null,
      instalacaoId: trechoReto?.instalacaoId || null,
      pontoInstalacaoId: trechoReto?.pontoInstalacaoId || null,
      classe: trechoReto?.classe || "",
      diametroNominal: trechoReto?.diametroNominal || null,
      diametroReferencia20c: trechoReto?.diametroReferencia20c || null,
      tipoAco: trechoReto?.tipoAco || "",
      tagTrechoMontanteCondicionador: trechoReto?.tagTrechoMontanteCondicionador || "",
      numeroSerieTrechoMontanteCondicionador: trechoReto?.numeroSerieTrechoMontanteCondicionador || "",
      tagTrechoMontantePlaca: trechoReto?.tagTrechoMontantePlaca || "",
      numeroSerieTrechoMontantePlaca: trechoReto?.numeroSerieTrechoMontantePlaca || "",
      tagCondicionadorFluxo: trechoReto?.tagCondicionadorFluxo || "",
      numeroSerieCondicionadorFluxo: trechoReto?.numeroSerieCondicionadorFluxo || "",
      numeroSeriePortaPlaca: trechoReto?.numeroSeriePortaPlaca || "",
      tagTrechoJusante: trechoReto?.tagTrechoJusante || "",
      numeroSerieTrechoJusante: trechoReto?.numeroSerieTrechoJusante || "",
      certificadoVigente: trechoReto?.certificadoVigente || "",
      norma: trechoReto?.norma || "",
      dataInspecao: trechoReto?.dataInspecao || "",
      dataInstalacao: trechoReto?.dataInstalacao || "",
      cartaNumero: trechoReto?.cartaNumero || "",
      observacao: trechoReto?.observacao || "",
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

  // Filter ONLY equipment registered as straight sections in /equipamentos
  const straightSectionEquipments = equipamentos?.filter((eq: Equipamento) =>
    eq.tipo?.toLowerCase().includes("trecho") ||
    eq.tipo?.toLowerCase().includes("reto")
  ) || [];

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
      
      // Auto-suggest steel type based on environment
      if (instalacao && !form.getValues("tipoAco")) {
        let suggestedSteel = "Aço Carbono A53 Gr B"; // Default
        
        if (instalacao.ambiente?.toLowerCase().includes("offshore")) {
          suggestedSteel = "Aço Inoxidável 316L";
        } else if (instalacao.ambiente?.toLowerCase().includes("alta pressão")) {
          suggestedSteel = "Aço Liga ASTM A335 P11";
        } else if (instalacao.ambiente?.toLowerCase().includes("corrosivo")) {
          suggestedSteel = "Super Duplex SAF 2507";
        }
        
        form.setValue("tipoAco", suggestedSteel);
      }
    }
  }, [equipmentData, form, isEditing, toast]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: FormValues) => api.createTrechoReto(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trechos-retos"] });
      toast({ title: "Trecho reto criado com sucesso!" });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar trecho reto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormValues }) => 
      api.updateTrechoReto(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trechos-retos"] });
      toast({ title: "Trecho reto atualizado com sucesso!" });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar trecho reto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    if (isEditing && trechoReto?.id) {
      updateMutation.mutate({ id: trechoReto.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEquipmentSelect = (equipamentoId: number) => {
    const equipment = equipamentos?.find((eq: Equipamento) => eq.id === equipamentoId);
    setSelectedEquipment(equipment || null);
    form.setValue("equipamentoId", equipamentoId);
    // Auto-fill numeroSerie from equipment - it's the same serial number
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
              <Ruler className="w-5 h-5" />
              Selecionar Trecho Reto (Cadastrado em Equipamentos)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Número de Série *</label>
              <Select
                value={selectedEquipment?.id.toString() || ""}
                onValueChange={(value) => handleEquipmentSelect(Number(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o trecho reto cadastrado em /equipamentos..." />
                </SelectTrigger>
                <SelectContent>
                  {straightSectionEquipments.length > 0 ? (
                    straightSectionEquipments.map((equipment: Equipamento) => (
                      <SelectItem key={equipment.id} value={equipment.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">N/S: {equipment.numeroSerie}</span>
                          <span className="text-xs text-muted-foreground">
                            TAG: {equipment.tag} | {equipment.nome}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      Nenhum trecho reto cadastrado em /equipamentos
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Cadastre trechos retos em /equipamentos primeiro. Esta tela serve apenas para detalhar dados técnicos específicos.
              </p>
            </div>

            {selectedEquipment && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-green-900">Equipamento Selecionado:</p>
                      <p className="text-green-800 font-semibold">N/S: {selectedEquipment.numeroSerie}</p>
                      <p className="text-sm text-green-700">TAG: {selectedEquipment.tag} - {selectedEquipment.nome}</p>
                    </div>
                    <Badge className="bg-green-600 text-white">{selectedEquipment.tipo}</Badge>
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
                    name="classe"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Classe</FormLabel>
                        <Select
                          value={field.value || ""}
                          onValueChange={(value) => field.onChange(value || null)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a classe" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Classe 150">Classe 150</SelectItem>
                            <SelectItem value="Classe 300">Classe 300</SelectItem>
                            <SelectItem value="Classe 600">Classe 600</SelectItem>
                            <SelectItem value="Classe 900">Classe 900</SelectItem>
                            <SelectItem value="Classe 1500">Classe 1500</SelectItem>
                            <SelectItem value="Classe 2500">Classe 2500</SelectItem>
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
                        <FormLabel>Unidade</FormLabel>
                        <Select
                          value={field.value?.toString() || ""}
                          onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a unidade" />
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

            {/* Technical Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Especificações Técnicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    name="diametroReferencia20c"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diâmetro Referência @ 20°C (Dr) - mm</FormLabel>
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
                    name="tipoAco"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Aço</FormLabel>
                        <Select
                          value={field.value || ""}
                          onValueChange={(value) => field.onChange(value || null)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo de aço" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Aço Carbono A53 Gr B">Aço Carbono A53 Gr B</SelectItem>
                            <SelectItem value="Aço Inoxidável 316L">Aço Inoxidável 316L</SelectItem>
                            <SelectItem value="Aço Liga ASTM A335 P11">Aço Liga ASTM A335 P11</SelectItem>
                            <SelectItem value="Super Duplex SAF 2507">Super Duplex SAF 2507</SelectItem>
                            <SelectItem value="Inconel 625">Inconel 625</SelectItem>
                            <SelectItem value="Hastelloy C-276">Hastelloy C-276</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Component Identification - Upstream */}
            <Card>
              <CardHeader>
                <CardTitle>Componentes à Montante</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tagTrechoMontanteCondicionador"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>TAG Trecho Reto à Montante do Condicionador</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="numeroSerieTrechoMontanteCondicionador"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>N° Série Trecho Reto Montante do Condicionador</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tagTrechoMontantePlaca"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>TAG Trecho Reto à Montante da Placa</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="numeroSerieTrechoMontantePlaca"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>N° Série Trecho Reto à Montante da Placa</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Flow Conditioner and Plate Holder */}
            <Card>
              <CardHeader>
                <CardTitle>Condicionador de Fluxo e Porta Placa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tagCondicionadorFluxo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>TAG Condicionador Fluxo</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="numeroSerieCondicionadorFluxo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>N° Série do Condicionador de Fluxo</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="numeroSeriePortaPlaca"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>N° Série do Porta Placa</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Component Identification - Downstream */}
            <Card>
              <CardHeader>
                <CardTitle>Componentes à Jusante</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tagTrechoJusante"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>TAG Trecho Reto à Jusante</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="numeroSerieTrechoJusante"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>N° Série do Trecho Reto à Jusante</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
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
                            <SelectItem value="ASME B36.10M">ASME B36.10M</SelectItem>
                            <SelectItem value="API 5L">API 5L</SelectItem>
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
                    Inserir Certificado de Inspeção Trecho
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
                {isLoading ? "Salvando..." : isEditing ? "Atualizar" : "Criar"} Trecho Reto
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}