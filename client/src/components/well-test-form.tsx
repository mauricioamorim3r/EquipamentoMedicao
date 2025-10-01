import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Upload, FileText, Save, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TestePoco {
  id?: number;
  poloId: number;
  instalacaoId: number;
  pocoId: number;
  dataTeste?: string;
  resultadoUltimoTeste?: string;
  tipoTeste: string;
  dataPrevistoProximoTeste?: string;
  numeroBoletimTeste?: string;
  tagMedidorOleo?: string;
  vazaoOleo?: number;
  vazaoGas?: number;
  vazaoAgua?: number;
  bsw?: number;
  rgo?: number;
  resultadoTeste?: string;
  dataAtualizacaoPotencial?: string;
  observacoes?: string;
  arquivoBtpPath?: string;
  ehUltimoTeste: boolean;
  periodicidadeTeste?: number;
}

interface WellTestFormProps {
  test?: TestePoco | null;
  onClose: () => void;
  onSuccess: () => void;
}

const TIPOS_TESTE = [
  "BTP",
  "Produção",
  "Potencial",
  "Restauração",
  "Análise Nodal",
  "Injeção",
  "Especial"
];

const RESULTADOS_TESTE = [
  "Aprovado",
  "Reprovado",
  "Satisfatório",
  "Insatisfatório",
  "Em análise",
  "Pendente",
  "Cancelado"
];

const PERIODICIDADES = [
  { value: 30, label: "30 dias" },
  { value: 60, label: "60 dias" },
  { value: 90, label: "90 dias" },
  { value: 120, label: "120 dias" },
  { value: 180, label: "6 meses" },
  { value: 365, label: "1 ano" },
];

export default function WellTestForm({ test, onClose, onSuccess }: WellTestFormProps) {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("geral");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<TestePoco>({
    defaultValues: test || {
      ehUltimoTeste: true,
      tipoTeste: "BTP",
      periodicidadeTeste: 90,
    }
  });

  // Fetch data for dropdowns
  const { data: polos = [] } = useQuery({
    queryKey: ["/api/polos"],
    queryFn: () => api.getPolos(),
  });

  const { data: instalacoes = [] } = useQuery({
    queryKey: ["/api/instalacoes"],
    queryFn: () => api.getInstalacoes(),
  });

  const { data: pocos = [] } = useQuery({
    queryKey: ["/api/pocos"],
    queryFn: () => api.getPocos(),
  });

  // Watch form values
  const watchedPoloId = watch("poloId");
  const watchedInstalacaoId = watch("instalacaoId");

  // Filter instalações by polo
  const filteredInstalacoes = instalacoes.filter((instalacao: any) => 
    !watchedPoloId || instalacao.poloId === parseInt(watchedPoloId.toString())
  );

  // Filter poços by instalação
  const filteredPocos = pocos.filter((poco: any) => 
    !watchedInstalacaoId || poco.instalacaoId === parseInt(watchedInstalacaoId.toString())
  );

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: TestePoco) => api.createTestePoco(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/testes-pocos"] });
      toast({
        title: "Sucesso",
        description: "Teste de poço criado com sucesso",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar teste de poço",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TestePoco }) => 
      api.updateTestePoco(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/testes-pocos"] });
      toast({
        title: "Sucesso",
        description: "Teste de poço atualizado com sucesso",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar teste de poço",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TestePoco) => {
    if (test?.id) {
      updateMutation.mutate({ id: test.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // In a real app, you would upload the file here
      setValue("arquivoBtpPath", file.name);
    }
  };

  const DatePicker = ({ 
    value, 
    onChange, 
    placeholder = "Selecione uma data",
    disabled = false 
  }: {
    value?: string;
    onChange: (date: string) => void;
    placeholder?: string;
    disabled?: boolean;
  }) => {
    const [date, setDate] = useState<Date | undefined>(
      value ? new Date(value) : undefined
    );

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => {
              setDate(newDate);
              if (newDate) {
                onChange(newDate.toISOString().split('T')[0]);
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="medicoes">Medições</TabsTrigger>
          <TabsTrigger value="resultados">Resultados</TabsTrigger>
          <TabsTrigger value="arquivos">Arquivos</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas do Teste</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="poloId">Polo *</Label>
                  <Select
                    value={watch("poloId")?.toString() || ""}
                    onValueChange={(value) => {
                      setValue("poloId", parseInt(value));
                      setValue("instalacaoId", 0);
                      setValue("pocoId", 0);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o polo" />
                    </SelectTrigger>
                    <SelectContent>
                      {polos.map((polo: any) => (
                        <SelectItem key={polo.id} value={polo.id.toString()}>
                          {polo.sigla} - {polo.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.poloId && (
                    <p className="text-sm text-destructive">Campo obrigatório</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instalacaoId">Instalação *</Label>
                  <Select
                    value={watch("instalacaoId")?.toString() || ""}
                    onValueChange={(value) => {
                      setValue("instalacaoId", parseInt(value));
                      setValue("pocoId", 0);
                    }}
                    disabled={!watchedPoloId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a instalação" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredInstalacoes.map((instalacao: any) => (
                        <SelectItem key={instalacao.id} value={instalacao.id.toString()}>
                          {instalacao.sigla} - {instalacao.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.instalacaoId && (
                    <p className="text-sm text-destructive">Campo obrigatório</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pocoId">Poço *</Label>
                  <Select
                    value={watch("pocoId")?.toString() || ""}
                    onValueChange={(value) => setValue("pocoId", parseInt(value))}
                    disabled={!watchedInstalacaoId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o poço" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredPocos.map((poco: any) => (
                        <SelectItem key={poco.id} value={poco.id.toString()}>
                          {poco.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.pocoId && (
                    <p className="text-sm text-destructive">Campo obrigatório</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipoTeste">Tipo de Teste *</Label>
                  <Select
                    value={watch("tipoTeste") || ""}
                    onValueChange={(value) => setValue("tipoTeste", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_TESTE.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {tipo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.tipoTeste && (
                    <p className="text-sm text-destructive">Campo obrigatório</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numeroBoletim">Número do Boletim</Label>
                  <Input
                    id="numeroBoletim"
                    {...register("numeroBoletimTeste")}
                    placeholder="Ex: BTP-001-2024"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data do Teste</Label>
                  <DatePicker
                    value={watch("dataTeste")}
                    onChange={(date) => setValue("dataTeste", date)}
                    placeholder="Selecione a data"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Data Prevista Próximo Teste</Label>
                  <DatePicker
                    value={watch("dataPrevistoProximoTeste")}
                    onChange={(date) => setValue("dataPrevistoProximoTeste", date)}
                    placeholder="Selecione a data"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="periodicidadeTeste">Periodicidade do Teste</Label>
                  <Select
                    value={watch("periodicidadeTeste")?.toString() || ""}
                    onValueChange={(value) => setValue("periodicidadeTeste", parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a periodicidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {PERIODICIDADES.map((periodo) => (
                        <SelectItem key={periodo.value} value={periodo.value.toString()}>
                          {periodo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="ehUltimoTeste"
                    checked={watch("ehUltimoTeste")}
                    onCheckedChange={(checked) => setValue("ehUltimoTeste", checked)}
                  />
                  <Label htmlFor="ehUltimoTeste">É o último teste?</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medicoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medições e Vazões</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tagMedidorOleo">TAG Medidor Óleo</Label>
                <Input
                  id="tagMedidorOleo"
                  {...register("tagMedidorOleo")}
                  placeholder="Ex: FIT-001"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vazaoOleo">Vazão Óleo (m³)</Label>
                  <Input
                    id="vazaoOleo"
                    type="number"
                    step="0.01"
                    {...register("vazaoOleo", { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vazaoGas">Vazão Gás (m³)</Label>
                  <Input
                    id="vazaoGas"
                    type="number"
                    step="0.01"
                    {...register("vazaoGas", { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vazaoAgua">Vazão Água (m³)</Label>
                  <Input
                    id="vazaoAgua"
                    type="number"
                    step="0.01"
                    {...register("vazaoAgua", { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bsw">BSW (%)</Label>
                  <Input
                    id="bsw"
                    type="number"
                    step="0.01"
                    max="100"
                    {...register("bsw", { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rgo">RGO</Label>
                  <Input
                    id="rgo"
                    type="number"
                    step="0.01"
                    {...register("rgo", { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resultados" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resultados e Análises</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="resultadoUltimoTeste">Resultado do Último Teste</Label>
                  <Input
                    id="resultadoUltimoTeste"
                    {...register("resultadoUltimoTeste")}
                    placeholder="Descreva o resultado anterior"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resultadoTeste">Resultado do Teste</Label>
                  <Select
                    value={watch("resultadoTeste") || ""}
                    onValueChange={(value) => setValue("resultadoTeste", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o resultado" />
                    </SelectTrigger>
                    <SelectContent>
                      {RESULTADOS_TESTE.map((resultado) => (
                        <SelectItem key={resultado} value={resultado}>
                          {resultado}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Data Atualização Potencial</Label>
                <DatePicker
                  value={watch("dataAtualizacaoPotencial")}
                  onChange={(date) => setValue("dataAtualizacaoPotencial", date)}
                  placeholder="Selecione a data"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  {...register("observacoes")}
                  rows={4}
                  placeholder="Descreva observações relevantes sobre o teste..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="arquivos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Arquivos e Documentos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="arquivo">Arquivo BTP</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    id="arquivo"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('arquivo')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Selecionar Arquivo
                  </Button>
                  {selectedFile && (
                    <span className="text-sm text-muted-foreground">
                      {selectedFile.name}
                    </span>
                  )}
                  {watch("arquivoBtpPath") && !selectedFile && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">{watch("arquivoBtpPath")}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Formatos aceitos: PDF, DOC, DOCX, XLS, XLSX (máx. 10MB)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="w-4 h-4 mr-2" />
          {isSubmitting ? "Salvando..." : test ? "Atualizar" : "Salvar"}
        </Button>
      </div>
    </form>
  );
}