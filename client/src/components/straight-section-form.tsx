import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useEquipmentAutoFill } from "@/hooks/use-auto-fill";
import { useToast } from "@/hooks/use-toast";

// Schema for straight section form based on trechosRetos table
const formSchema = z.object({
  numeroSerie: z.string().min(1, "Número de série é obrigatório"),
  equipamentoId: z.number().min(1, "Equipamento é obrigatório"),
  campoId: z.number().optional().nullable(),
  instalacaoId: z.number().optional().nullable(),
  pontoInstalacaoId: z.number().optional().nullable(),
  classe: z.string().optional().nullable(),
  diametroNominal: z.number().optional().nullable(),
  diametroReferencia20c: z.number().optional().nullable(),
  tipoAco: z.string().optional().nullable(),
  tagTrechoMontanteCondicionador: z.string().optional().nullable(),
  numeroSerieTrechoMontanteCondicionador: z.string().optional().nullable(),
  tagTrechoMontantePlaca: z.string().optional().nullable(),
  numeroSerieTrechoMontantePlaca: z.string().optional().nullable(),
  tagCondicionadorFluxo: z.string().optional().nullable(),
  numeroSerieCondicionadorFluxo: z.string().optional().nullable(),
  numeroSeriePortaPlaca: z.string().optional().nullable(),
  tagTrechoJusante: z.string().optional().nullable(),
  numeroSerieTrechoJusante: z.string().optional().nullable(),
  certificadoVigente: z.string().optional().nullable(),
  norma: z.string().optional().nullable(),
  dataInspecao: z.string().optional().nullable(),
  dataInstalacao: z.string().optional().nullable(),
  cartaNumero: z.string().optional().nullable(),
  observacao: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface StraightSectionFormProps {
  straightSection?: any;
  onSubmit: (data: FormValues) => void;
  equipamentos: any[];
  campos: any[];
  instalacoes: any[];
}

export function StraightSectionForm({
  straightSection,
  onSubmit,
  equipamentos,
  campos,
  instalacoes,
}: StraightSectionFormProps) {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numeroSerie: straightSection?.numeroSerie || "",
      equipamentoId: straightSection?.equipamentoId || 0,
      campoId: straightSection?.campoId || null,
      instalacaoId: straightSection?.instalacaoId || null,
      pontoInstalacaoId: straightSection?.pontoInstalacaoId || null,
      classe: straightSection?.classe || "",
      diametroNominal: straightSection?.diametroNominal || null,
      diametroReferencia20c: straightSection?.diametroReferencia20c || null,
      tipoAco: straightSection?.tipoAco || "",
      tagTrechoMontanteCondicionador: straightSection?.tagTrechoMontanteCondicionador || "",
      numeroSerieTrechoMontanteCondicionador: straightSection?.numeroSerieTrechoMontanteCondicionador || "",
      tagTrechoMontantePlaca: straightSection?.tagTrechoMontantePlaca || "",
      numeroSerieTrechoMontantePlaca: straightSection?.numeroSerieTrechoMontantePlaca || "",
      tagCondicionadorFluxo: straightSection?.tagCondicionadorFluxo || "",
      numeroSerieCondicionadorFluxo: straightSection?.numeroSerieCondicionadorFluxo || "",
      numeroSeriePortaPlaca: straightSection?.numeroSeriePortaPlaca || "",
      tagTrechoJusante: straightSection?.tagTrechoJusante || "",
      numeroSerieTrechoJusante: straightSection?.numeroSerieTrechoJusante || "",
      certificadoVigente: straightSection?.certificadoVigente || "",
      norma: straightSection?.norma || "",
      dataInspecao: straightSection?.dataInspecao || "",
      dataInstalacao: straightSection?.dataInstalacao || "",
      cartaNumero: straightSection?.cartaNumero || "",
      observacao: straightSection?.observacao || "",
    },
  });

  // Use equipment auto-fill hook
  const { data } = useEquipmentAutoFill(form.watch("equipamentoId"));
  
  // Handle equipment change for auto-fill
  const handleEquipmentChange = (equipamentoId: number) => {
    if (data?.instalacao) {
      form.setValue("instalacaoId", data.instalacao.id);
      form.setValue("campoId", data.instalacao.campoId);
      
      toast({
        title: "Auto-preenchimento",
        description: `Dados preenchidos automaticamente para instalação: ${data.instalacao.sigla}`,
      });
    }
  };

  // Filter campos and instalacoes based on selected equipment
  const filteredCampos = data?.instalacao?.campoId ? 
    campos.filter(campo => campo.id === data.instalacao?.campoId) : 
    campos;
  
  const filteredInstalacoes = data?.instalacao ? 
    instalacoes.filter(instalacao => instalacao.id === data.instalacao?.id) : 
    instalacoes;

  // Auto-fill logic for diameter suggestions based on equipment flow
  useEffect(() => {
    const equipamentoId = form.watch("equipamentoId");
    if (equipamentoId) {
      const selectedEquipamento = equipamentos.find(eq => eq.id === equipamentoId);
      if (selectedEquipamento) {
        const currentDiameter = form.getValues("diametroNominal");
        if (!currentDiameter) {
          // Suggest diameter based on flow range
          const maxFlow = selectedEquipamento.faixaMaxEquipamento || 0;
          let suggestedDiameter: number;
          
          if (maxFlow <= 100) {
            suggestedDiameter = 50; // DN50 for low flow
          } else if (maxFlow <= 500) {
            suggestedDiameter = 100; // DN100 for medium flow
          } else if (maxFlow <= 1000) {
            suggestedDiameter = 150; // DN150 for high flow
          } else {
            suggestedDiameter = 200; // DN200 for very high flow
          }
          
          form.setValue("diametroNominal", suggestedDiameter);
          toast({
            title: "Auto-preenchimento",
            description: `Diâmetro nominal sugerido: DN${suggestedDiameter}mm baseado na vazão do equipamento`,
          });
        }

        // Auto-fill steel type based on installation environment
        const currentTipoAco = form.getValues("tipoAco");
        const instalacaoId = form.getValues("instalacaoId");
        if (!currentTipoAco && instalacaoId) {
          const instalacao = instalacoes.find(inst => inst.id === instalacaoId);
          if (instalacao) {
            let suggestedSteel: string;
            
            if (instalacao.ambiente?.toLowerCase().includes("offshore")) {
              suggestedSteel = "Super Duplex";
            } else if (instalacao.ambiente?.toLowerCase().includes("onshore")) {
              suggestedSteel = "API 5L";
            } else {
              suggestedSteel = "Aço Carbono";
            }
            
            form.setValue("tipoAco", suggestedSteel);
            toast({
              title: "Auto-preenchimento",
              description: `Tipo de aço sugerido: ${suggestedSteel} baseado no ambiente da instalação`,
            });
          }
        }
      }
    }
  }, [form.watch("equipamentoId"), form.watch("instalacaoId"), equipamentos, instalacoes, form, toast]);

  // Auto-generate serial number based on equipment
  useEffect(() => {
    const equipamentoId = form.watch("equipamentoId");
    if (equipamentoId && !straightSection) {
      const selectedEquipamento = equipamentos.find(eq => eq.id === equipamentoId);
      if (selectedEquipamento) {
        const currentSerial = form.getValues("numeroSerie");
        if (!currentSerial) {
          const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
          const generatedSerial = `TR-${selectedEquipamento.tag}-${randomSuffix}`;
          
          form.setValue("numeroSerie", generatedSerial);
          toast({
            title: "Auto-preenchimento",
            description: `Número de série gerado: ${generatedSerial}`,
          });
        }
      }
    }
  }, [form.watch("equipamentoId"), equipamentos, straightSection, form, toast]);

  return (
    <Card className="p-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="numeroSerie"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Série *</FormLabel>
                <FormControl>
                  <Input placeholder="TR-XXX-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="equipamentoId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Equipamento *</FormLabel>
                <Select
                  value={field.value?.toString() || ""}
                  onValueChange={(value) => {
                    const numValue = parseInt(value);
                    field.onChange(numValue);
                  }}

                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um equipamento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {equipamentos.map((equipamento) => (
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
        </div>

        {/* Location Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <SelectValue placeholder="Selecione um campo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredCampos.map((campo) => (
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
                      <SelectValue placeholder="Selecione uma instalação" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredInstalacoes.map((instalacao) => (
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
        </div>

        {/* Technical Specifications */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="classe"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Classe</FormLabel>
                <FormControl>
                  <Input placeholder="Classe do trecho" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="diametroNominal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Diâmetro Nominal (mm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="50"
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
                <FormLabel>Diâmetro Referência 20°C (mm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="50.8"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <SelectItem value="Aço Carbono">Aço Carbono</SelectItem>
                    <SelectItem value="Aço Inoxidável 316L">Aço Inoxidável 316L</SelectItem>
                    <SelectItem value="Super Duplex">Super Duplex</SelectItem>
                    <SelectItem value="API 5L">API 5L</SelectItem>
                    <SelectItem value="ASTM A106">ASTM A106</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="certificadoVigente"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Certificado Vigente</FormLabel>
                <FormControl>
                  <Input placeholder="Número do certificado" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dataInstalacao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Instalação</FormLabel>
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
            name="dataInspecao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Inspeção</FormLabel>
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
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cartaNumero"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número da Carta</FormLabel>
                <FormControl>
                  <Input placeholder="Número da carta" {...field} value={field.value || ""} />
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

        <FormField
          control={form.control}
          name="observacao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
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

        <div className="flex justify-end space-x-4">
          <Button type="submit">
            {straightSection ? "Atualizar" : "Criar"} Trecho Reto
          </Button>
        </div>
      </form>
    </Card>
  );
}