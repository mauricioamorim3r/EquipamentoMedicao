import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import type { PontoMedicao } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

const measurementPointSchema = z.object({
  tag: z.string().min(1, "TAG é obrigatório"),
  nome: z.string().min(1, "Nome é obrigatório"),
  poloId: z.string().min(1, "Polo é obrigatório"),
  instalacaoId: z.string().min(1, "Instalação é obrigatória"),
  classificacao: z.string().optional(),
  localizacao: z.string().optional(),
  tipoMedidorPrimario: z.string().optional(),

  // Equipamento Primário Principal
  numeroSeriePrimario: z.string().optional(),
  tagEquipamentoPrimario: z.string().optional(),
  calibracaoPrimarioValida: z.string().optional(),
  statusMetrologicoPrimario: z.string().optional(),

  // Trecho Reto
  numeroSerieTrechoReto: z.string().optional(),
  tagTrechoReto: z.string().optional(),
  calibracaoTrechoValida: z.string().optional(),
  statusMetrologicoTrecho: z.string().optional(),

  // Secundário - Pressão
  numeroSeriePressao: z.string().optional(),
  tagPressao: z.string().optional(),
  calibracaoPressaoValida: z.string().optional(),
  statusMetrologicoPressao: z.string().optional(),

  // Secundário - Pressão Diferencial
  numeroSeriePressaoDif: z.string().optional(),
  tagPressaoDif: z.string().optional(),
  calibracaoPressaoDifValida: z.string().optional(),
  statusMetrologicoPressaoDif: z.string().optional(),

  // Secundário - Temperatura
  numeroSerieTemperatura: z.string().optional(),
  tagTemperatura: z.string().optional(),
  calibracaoTemperaturaValida: z.string().optional(),
  statusMetrologicoTemperatura: z.string().optional(),

  // Sensor Temperatura
  numeroSerieSensorTemp: z.string().optional(),
  tagSensorTemp: z.string().optional(),
  calibracaoSensorValida: z.string().optional(),
  statusMetrologicoSensor: z.string().optional(),

  status: z.string().default("ativo"),
});

type MeasurementPointFormData = z.infer<typeof measurementPointSchema>;

interface MeasurementPointFormProps {
  measurementPoint?: PontoMedicao | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MeasurementPointForm({
  measurementPoint,
  onSuccess,
  onCancel
}: MeasurementPointFormProps) {
  const { toast } = useToast();

  const form = useForm<MeasurementPointFormData>({
    resolver: zodResolver(measurementPointSchema),
    defaultValues: {
      tag: measurementPoint?.tag || "",
      nome: measurementPoint?.nome || "",
      poloId: measurementPoint?.poloId?.toString() || "",
      instalacaoId: measurementPoint?.instalacaoId?.toString() || "",
      classificacao: measurementPoint?.classificacao || "",
      localizacao: measurementPoint?.localizacao || "",
      tipoMedidorPrimario: measurementPoint?.tipoMedidorPrimario || "",

      numeroSeriePrimario: measurementPoint?.numeroSeriePrimario || "",
      tagEquipamentoPrimario: measurementPoint?.tagEquipamentoPrimario || "",
      calibracaoPrimarioValida: measurementPoint?.calibracaoPrimarioValida?.toString() || "",
      statusMetrologicoPrimario: measurementPoint?.statusMetrologicoPrimario || "",

      numeroSerieTrechoReto: measurementPoint?.numeroSerieTrechoReto || "",
      tagTrechoReto: measurementPoint?.tagTrechoReto || "",
      calibracaoTrechoValida: measurementPoint?.calibracaoTrechoValida?.toString() || "",
      statusMetrologicoTrecho: measurementPoint?.statusMetrologicoTrecho || "",

      numeroSeriePressao: measurementPoint?.numeroSeriePressao || "",
      tagPressao: measurementPoint?.tagPressao || "",
      calibracaoPressaoValida: measurementPoint?.calibracaoPressaoValida?.toString() || "",
      statusMetrologicoPressao: measurementPoint?.statusMetrologicoPressao || "",

      numeroSeriePressaoDif: measurementPoint?.numeroSeriePressaoDif || "",
      tagPressaoDif: measurementPoint?.tagPressaoDif || "",
      calibracaoPressaoDifValida: measurementPoint?.calibracaoPressaoDifValida?.toString() || "",
      statusMetrologicoPressaoDif: measurementPoint?.statusMetrologicoPressaoDif || "",

      numeroSerieTemperatura: measurementPoint?.numeroSerieTemperatura || "",
      tagTemperatura: measurementPoint?.tagTemperatura || "",
      calibracaoTemperaturaValida: measurementPoint?.calibracaoTemperaturaValida?.toString() || "",
      statusMetrologicoTemperatura: measurementPoint?.statusMetrologicoTemperatura || "",

      numeroSerieSensorTemp: measurementPoint?.numeroSerieSensorTemp || "",
      tagSensorTemp: measurementPoint?.tagSensorTemp || "",
      calibracaoSensorValida: measurementPoint?.calibracaoSensorValida?.toString() || "",
      statusMetrologicoSensor: measurementPoint?.statusMetrologicoSensor || "",

      status: measurementPoint?.status || "ativo",
    },
  });

  // Fetch related data
  const { data: polos } = useQuery({
    queryKey: ["/api/polos"],
    queryFn: api.getPolos,
  });

  const { data: instalacoes } = useQuery({
    queryKey: ["/api/instalacoes"],
    queryFn: () => api.getInstalacoes(),
  });

  // Create/Update mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => api.createPontoMedicao(data),
    onSuccess: () => {
      toast({ title: "Ponto de Medição criado com sucesso!" });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar ponto de medição",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.updatePontoMedicao(id, data),
    onSuccess: () => {
      toast({ title: "Ponto de Medição atualizado com sucesso!" });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar ponto de medição",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const onSubmit = (data: MeasurementPointFormData) => {
    const formData = {
      ...data,
      poloId: parseInt(data.poloId),
      instalacaoId: parseInt(data.instalacaoId),
      calibracaoPrimarioValida: data.calibracaoPrimarioValida ? new Date(data.calibracaoPrimarioValida) : null,
      calibracaoTrechoValida: data.calibracaoTrechoValida ? new Date(data.calibracaoTrechoValida) : null,
      calibracaoPressaoValida: data.calibracaoPressaoValida ? new Date(data.calibracaoPressaoValida) : null,
      calibracaoPressaoDifValida: data.calibracaoPressaoDifValida ? new Date(data.calibracaoPressaoDifValida) : null,
      calibracaoTemperaturaValida: data.calibracaoTemperaturaValida ? new Date(data.calibracaoTemperaturaValida) : null,
      calibracaoSensorValida: data.calibracaoSensorValida ? new Date(data.calibracaoSensorValida) : null,
    };

    if (measurementPoint?.id) {
      updateMutation.mutate({ id: measurementPoint.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="basico" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basico">Dados Básicos</TabsTrigger>
            <TabsTrigger value="primario">Eq. Primário</TabsTrigger>
            <TabsTrigger value="secundario">Eq. Secundários</TabsTrigger>
            <TabsTrigger value="sensor">Sensores</TabsTrigger>
          </TabsList>

          <TabsContent value="basico">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tag"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>TAG *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: PM-001" />
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
                        <FormLabel>Nome *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nome do ponto de medição" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="poloId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Polo *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o polo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {polos?.map((polo) => (
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
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a instalação" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {instalacoes?.map((instalacao) => (
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
                    name="classificacao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Classificação</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fiscal">Fiscal</SelectItem>
                            <SelectItem value="apropriacao">Apropriação</SelectItem>
                            <SelectItem value="operacional">Operacional</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="localizacao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Localização</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Localização física" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tipoMedidorPrimario"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo Medidor Primário</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CORIOLIS">Coriolis</SelectItem>
                            <SelectItem value="ULTRASSONICO">Ultrassônico</SelectItem>
                            <SelectItem value="TURBINA">Turbina</SelectItem>
                            <SelectItem value="PLACA_ORIFICIO">Placa de Orifício</SelectItem>
                            <SelectItem value="DESLOCAMENTO_POSITIVO">Deslocamento Positivo</SelectItem>
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
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ativo">Ativo</SelectItem>
                            <SelectItem value="inativo">Inativo</SelectItem>
                            <SelectItem value="manutencao">Manutenção</SelectItem>
                            <SelectItem value="calibracao">Calibração</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="primario">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="text-lg font-semibold mb-4">Equipamento Primário e Trecho Reto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="numeroSeriePrimario"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Série Primário</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="N/S do medidor primário" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tagEquipamentoPrimario"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>TAG Equipamento Primário</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="TAG do equipamento" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="calibracaoPrimarioValida"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Calibração Primário Válida Até</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="statusMetrologicoPrimario"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status Metrológico Primário</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="conforme">Conforme</SelectItem>
                            <SelectItem value="nao_conforme">Não Conforme</SelectItem>
                            <SelectItem value="vencido">Vencido</SelectItem>
                            <SelectItem value="a_vencer">A Vencer</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="numeroSerieTrechoReto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Série Trecho Reto</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="N/S do trecho reto" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tagTrechoReto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>TAG Trecho Reto</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="TAG do trecho" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="calibracaoTrechoValida"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Calibração Trecho Válida Até</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="statusMetrologicoTrecho"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status Metrológico Trecho</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="conforme">Conforme</SelectItem>
                            <SelectItem value="nao_conforme">Não Conforme</SelectItem>
                            <SelectItem value="vencido">Vencido</SelectItem>
                            <SelectItem value="a_vencer">A Vencer</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="secundario">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Equipamento de Pressão</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="numeroSeriePressao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Série</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tagPressao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>TAG</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="calibracaoPressaoValida"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Calibração Válida Até</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="statusMetrologicoPressao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status Metrológico</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="conforme">Conforme</SelectItem>
                              <SelectItem value="nao_conforme">Não Conforme</SelectItem>
                              <SelectItem value="vencido">Vencido</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Equipamento de Pressão Diferencial</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="numeroSeriePressaoDif"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Série</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tagPressaoDif"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>TAG</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="calibracaoPressaoDifValida"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Calibração Válida Até</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="statusMetrologicoPressaoDif"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status Metrológico</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="conforme">Conforme</SelectItem>
                              <SelectItem value="nao_conforme">Não Conforme</SelectItem>
                              <SelectItem value="vencido">Vencido</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Equipamento de Temperatura</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="numeroSerieTemperatura"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Série</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tagTemperatura"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>TAG</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="calibracaoTemperaturaValida"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Calibração Válida Até</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="statusMetrologicoTemperatura"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status Metrológico</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="conforme">Conforme</SelectItem>
                              <SelectItem value="nao_conforme">Não Conforme</SelectItem>
                              <SelectItem value="vencido">Vencido</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sensor">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Sensor de Temperatura</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="numeroSerieSensorTemp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Série</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tagSensorTemp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>TAG</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="calibracaoSensorValida"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Calibração Válida Até</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="statusMetrologicoSensor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status Metrológico</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="conforme">Conforme</SelectItem>
                            <SelectItem value="nao_conforme">Não Conforme</SelectItem>
                            <SelectItem value="vencido">Vencido</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
