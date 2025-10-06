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
import { Upload, Search, AlertCircle, Gauge } from "lucide-react";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Schema for medidor primário form with conditional fields
const formSchema = z.object({
  // Equipment selection (required)
  equipamentoId: z.number().min(1, "Equipamento é obrigatório"),
  numeroSerie: z.string().min(1, "Número de série é obrigatório"),
  
  // Location fields
  campoId: z.number().optional().nullable(),
  instalacaoId: z.number().optional().nullable(),
  pontoInstalacaoId: z.number().optional().nullable(),
  
  // Common fields
  tipoMedidor: z.string().min(1, "Tipo de medidor é obrigatório"),
  diametroNominal: z.number().optional().nullable(),
  classePressao: z.string().optional().nullable(),
  material: z.string().optional().nullable(),
  pressaoBaseKpa: z.number().optional().nullable(),
  temperaturaBaseC: z.number().optional().nullable(),
  fluido: z.string().optional().nullable(),
  viscosidadeCpRef: z.number().optional().nullable(),
  densidadeRefKgm3: z.number().optional().nullable(),
  meterFactor: z.number().optional().nullable(),
  kFactorPulsosL: z.number().optional().nullable(),
  classeExatidao: z.string().optional().nullable(),
  repetibilidadePct: z.number().optional().nullable(),
  observacao: z.string().optional().nullable(),
  
  // Coriolis specific fields
  faixaVazaoMassaKgH: z.number().optional().nullable(),
  faixaDensidadeKgm3: z.number().optional().nullable(),
  zeroStabilityKgH: z.number().optional().nullable(),
  
  // Ultrassônico specific fields
  numeroCaminhos: z.number().optional().nullable(),
  anguloCaminhoGraus: z.number().optional().nullable(),
  comprimentoUpstreamD: z.number().optional().nullable(),
  comprimentoDownstreamD: z.number().optional().nullable(),
  
  // Turbina specific fields
  kFactorPpm3: z.number().optional().nullable(),
  viscosidadeMinCp: z.number().optional().nullable(),
  viscosidadeMaxCp: z.number().optional().nullable(),
  
  // Deslocamento Positivo specific fields
  deslocamentoM3Rev: z.number().optional().nullable(),
  kFactorPpm3DeslocPositivo: z.number().optional().nullable(),
  deltaPMaxBar: z.number().optional().nullable(),
  
  // Vortex specific fields
  constanteVortexK: z.number().optional().nullable(),
  larguraBluffMm: z.number().optional().nullable(),
  reynoldsMin: z.number().optional().nullable(),
  
  // Venturi / V-Cone specific fields
  tipoVenturi: z.string().optional().nullable(),
  betaRatio: z.number().optional().nullable(),
  
  // Documentation
  certificadoVigente: z.string().optional().nullable(),
  norma: z.string().optional().nullable(),
  dataInspecao: z.string().optional().nullable(),
  dataInstalacao: z.string().optional().nullable(),
  cartaNumero: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface MedidorPrimarioFormProps {
  medidor?: any | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const TIPOS_MEDIDOR = [
  { value: "CORIOLIS", label: "Medidor Coriolis" },
  { value: "ULTRASSÔNICO", label: "Medidor Ultrassônico" },
  { value: "TURBINA", label: "Medidor tipo Turbina" },
  { value: "DESLOCAMENTO_POSITIVO", label: "Medidor tipo Deslocamento Positivo" },
  { value: "VORTEX", label: "Medidor tipo Vortex" },
  { value: "VENTURI", label: "Medidor tipo Venturi" },
  { value: "V_CONE", label: "Medidor V-Cone" },
];

export default function MedidorPrimarioForm({
  medidor,
  onSuccess,
  onCancel
}: MedidorPrimarioFormProps) {
  const { toast } = useToast();
  const [selectedTipoMedidor, setSelectedTipoMedidor] = useState<string>("");
  const isEditing = !!medidor;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      equipamentoId: medidor?.equipamentoId || 0,
      numeroSerie: medidor?.numeroSerie || "",
      campoId: medidor?.campoId || null,
      instalacaoId: medidor?.instalacaoId || null,
      pontoInstalacaoId: medidor?.pontoInstalacaoId || null,
      
      tipoMedidor: medidor?.tipoMedidor || "",
      diametroNominal: medidor?.diametroNominal || null,
      classePressao: medidor?.classePressao || "",
      material: medidor?.material || "",
      pressaoBaseKpa: medidor?.pressaoBaseKpa || null,
      temperaturaBaseC: medidor?.temperaturaBaseC || null,
      fluido: medidor?.fluido || "",
      viscosidadeCpRef: medidor?.viscosidadeCpRef || null,
      densidadeRefKgm3: medidor?.densidadeRefKgm3 || null,
      meterFactor: medidor?.meterFactor || null,
      kFactorPulsosL: medidor?.kFactorPulsosL || null,
      classeExatidao: medidor?.classeExatidao || "",
      repetibilidadePct: medidor?.repetibilidadePct || null,
      observacao: medidor?.observacao || "",
      
      // Coriolis
      faixaVazaoMassaKgH: medidor?.faixaVazaoMassaKgH || null,
      faixaDensidadeKgm3: medidor?.faixaDensidadeKgm3 || null,
      zeroStabilityKgH: medidor?.zeroStabilityKgH || null,
      
      // Ultrassônico
      numeroCaminhos: medidor?.numeroCaminhos || null,
      anguloCaminhoGraus: medidor?.anguloCaminhoGraus || null,
      comprimentoUpstreamD: medidor?.comprimentoUpstreamD || null,
      comprimentoDownstreamD: medidor?.comprimentoDownstreamD || null,
      
      // Turbina
      kFactorPpm3: medidor?.kFactorPpm3 || null,
      viscosidadeMinCp: medidor?.viscosidadeMinCp || null,
      viscosidadeMaxCp: medidor?.viscosidadeMaxCp || null,
      
      // Deslocamento Positivo
      deslocamentoM3Rev: medidor?.deslocamentoM3Rev || null,
      kFactorPpm3DeslocPositivo: medidor?.kFactorPpm3DeslocPositivo || null,
      deltaPMaxBar: medidor?.deltaPMaxBar || null,
      
      // Vortex
      constanteVortexK: medidor?.constanteVortexK || null,
      larguraBluffMm: medidor?.larguraBluffMm || null,
      reynoldsMin: medidor?.reynoldsMin || null,
      
      // Venturi / V-Cone
      tipoVenturi: medidor?.tipoVenturi || "",
      betaRatio: medidor?.betaRatio || null,
      
      // Documentation
      certificadoVigente: medidor?.certificadoVigente || "",
      norma: medidor?.norma || "",
      dataInspecao: medidor?.dataInspecao || "",
      dataInstalacao: medidor?.dataInstalacao || "",
      cartaNumero: medidor?.cartaNumero || "",
    },
  });

  // Watch for tipo medidor changes
  const watchedTipoMedidor = form.watch("tipoMedidor");
  
  useEffect(() => {
    setSelectedTipoMedidor(watchedTipoMedidor);
  }, [watchedTipoMedidor]);

  // Fetch data
  const { data: equipamentos } = useQuery({
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

  // Create/Update mutations
  const createMutation = useMutation({
    mutationFn: (data: FormValues) => api.createMedidorPrimario(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medidores-primarios"] });
      toast({
        title: "Sucesso",
        description: "Medidor primário criado com sucesso!",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar medidor primário.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormValues }) => 
      api.updateMedidorPrimario(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medidores-primarios"] });
      toast({
        title: "Sucesso",
        description: "Medidor primário atualizado com sucesso!",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar medidor primário.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    if (isEditing) {
      updateMutation.mutate({ id: medidor.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Filter equipamentos for primary flow meters
  // Tipos elegíveis: Coriolis, Ultrassônico, Turbina, Deslocamento Positivo, Vortex, Venturi, V-Cone
  const medidorEquipamentos = equipamentos?.filter((eq: any) => {
    const tipo = eq.tipo?.toLowerCase() || "";
    return (
      tipo.includes("coriolis") ||
      tipo.includes("ultrassônico") ||
      tipo.includes("ultrassonico") ||
      tipo.includes("turbina") ||
      tipo.includes("deslocamento positivo") ||
      tipo.includes("deslocamento-positivo") ||
      tipo.includes("vortex") ||
      tipo.includes("venturi") ||
      tipo.includes("v-cone") ||
      tipo.includes("v cone") ||
      tipo.includes("vcone")
    );
  }) || [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Equipment Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Selecionar Número de Série (Medidor Primário)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="equipamentoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Série *</FormLabel>
                  <Select
                    value={field.value ? field.value.toString() : ""}
                    onValueChange={(value) => {
                      const equipamento = equipamentos?.find((eq: any) => eq.id.toString() === value);
                      if (equipamento) {
                        field.onChange(equipamento.id);
                        form.setValue("numeroSerie", equipamento.numeroSerie || "");
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o número de série do medidor..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {medidorEquipamentos.length > 0 ? (
                        medidorEquipamentos.map((equipamento: any) => (
                          <SelectItem key={equipamento.id} value={equipamento.id.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">N/S: {equipamento.numeroSerie}</span>
                              <span className="text-xs text-muted-foreground">
                                TAG: {equipamento.tag} | {equipamento.nome}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          Nenhum medidor cadastrado
                        </SelectItem>
                      )}
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
                  <FormLabel>Número de Série (auto-preenchido)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} disabled className="bg-muted" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tipoMedidor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Medidor *</FormLabel>
                    <Select value={field.value || ""} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIPOS_MEDIDOR.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            {tipo.label}
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
                    <Select value={field.value ? field.value.toString() : "none"} onValueChange={(value) => field.onChange(value === "none" ? null : parseInt(value))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o campo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {campos?.map((campo: any) => (
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="instalacaoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instalação</FormLabel>
                    <Select value={field.value ? field.value.toString() : "none"} onValueChange={(value) => field.onChange(value === "none" ? null : parseInt(value))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a instalação" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        {instalacoes?.map((instalacao: any) => (
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
                    <FormLabel>Ponto de Medição</FormLabel>
                    <Select value={field.value ? field.value.toString() : "none"} onValueChange={(value) => field.onChange(value === "none" ? null : parseInt(value))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o ponto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {pontosMedicao?.map((ponto: any) => (
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
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="diametroNominal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diâmetro Nominal (mm)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.000001"
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
                name="classePressao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classe Pressão</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
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
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="pressaoBaseKpa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pressão Base (kPa)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.000001"
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
                name="temperaturaBaseC"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperatura Base (°C)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.000001"
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
                name="fluido"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fluido</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="viscosidadeCpRef"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Viscosidade cP Ref</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.000001"
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
                name="densidadeRefKgm3"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Densidade Ref (kg/m³)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.000001"
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
                name="meterFactor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meter Factor</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.000001"
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
                name="kFactorPulsosL"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>K-factor (pulsos/L)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.000001"
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="classeExatidao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classe Exatidão</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="repetibilidadePct"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repetibilidade (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.000001"
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

        {/* Conditional Fields Based on Meter Type */}
        {selectedTipoMedidor === "CORIOLIS" && (
          <Card>
            <CardHeader>
              <CardTitle>Especificações - Coriolis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="faixaVazaoMassaKgH"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Faixa Vazão Massa (kg/h)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.000001"
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
                  name="faixaDensidadeKgm3"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Faixa Densidade (kg/m³)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.000001"
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
                  name="zeroStabilityKgH"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zero Stability (kg/h)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.000001"
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
        )}

        {selectedTipoMedidor === "ULTRASSÔNICO" && (
          <Card>
            <CardHeader>
              <CardTitle>Especificações - Ultrassônico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="numeroCaminhos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Caminhos</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          {...field} 
                          value={field.value || ""} 
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="anguloCaminhoGraus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ângulo Caminho (graus)</FormLabel>
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="comprimentoUpstreamD"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comprimento Upstream (D)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.000001"
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
                  name="comprimentoDownstreamD"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comprimento Downstream (D)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.000001"
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
        )}

        {selectedTipoMedidor === "TURBINA" && (
          <Card>
            <CardHeader>
              <CardTitle>Especificações - Turbina</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="kFactorPpm3"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>K-factor (ppm³)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.00000001"
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
                  name="viscosidadeMinCp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Viscosidade Min (cP)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.000001"
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
                  name="viscosidadeMaxCp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Viscosidade Max (cP)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.000001"
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
        )}

        {selectedTipoMedidor === "DESLOCAMENTO_POSITIVO" && (
          <Card>
            <CardHeader>
              <CardTitle>Especificações - Deslocamento Positivo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="deslocamentoM3Rev"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deslocamento (m³/rev)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.000000001"
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
                  name="kFactorPpm3DeslocPositivo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>K-factor (ppm³)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.00000001"
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
                  name="deltaPMaxBar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ΔP Max (bar)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.000001"
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
        )}

        {selectedTipoMedidor === "VORTEX" && (
          <Card>
            <CardHeader>
              <CardTitle>Especificações - Vortex</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="constanteVortexK"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Constante Vortex K</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.00000001"
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
                  name="larguraBluffMm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Largura Bluff (mm)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.000001"
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
                  name="reynoldsMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reynolds Min</FormLabel>
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
        )}

        {(selectedTipoMedidor === "VENTURI" || selectedTipoMedidor === "V_CONE") && (
          <Card>
            <CardHeader>
              <CardTitle>Especificações - Venturi / V-Cone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tipoVenturi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo Venturi</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="betaRatio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beta Ratio</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.000001"
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
        )}

        {/* Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>Documentação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="certificadoVigente"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certificado Vigente</FormLabel>
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
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="dataInspecao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Inspeção</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
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
                      <Input type="date" {...field} value={field.value || ""} />
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
                      rows={3}
                      {...field} 
                      value={field.value || ""} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending 
              ? "Salvando..." 
              : isEditing 
                ? "Atualizar" 
                : "Criar Medidor"
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}