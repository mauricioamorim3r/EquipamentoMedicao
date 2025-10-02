import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Shield, Edit, Trash2, Eye, FileDown, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useLanguage";
import type { Campo, Instalacao, Polo } from "@shared/schema";

// Função para criar schemas com mensagens traduzidas
const createLacreEletronicoSchema = (t: (key: string) => string) => z.object({
  poloId: z.number().optional(),
  campoId: z.number().optional(),
  instalacaoId: z.number().optional(),
  localLacre: z.string().min(1, `Local do lacre ${t('fieldRequired').toLowerCase()}`),
  tag: z.string().min(1, `TAG ${t('fieldRequired').toLowerCase()}`),
  tipoAcesso: z.string().min(1, `Tipo de acesso ${t('fieldRequired').toLowerCase()}`),
  login: z.string().min(1, `Login ${t('fieldRequired').toLowerCase()}`),
  senha: z.string().min(1, `Senha ${t('fieldRequired').toLowerCase()}`),
  observacao: z.string().optional(),
  preenchidoPor: z.string().min(1, t('fieldRequired')),
  dataPreenchimento: z.string().min(1, `Data ${t('fieldRequired').toLowerCase()}`),
});

const createLacreFisicoSchema = (t: (key: string) => string) => z.object({
  poloId: z.number().optional(),
  campoId: z.number().optional(),
  instalacaoId: z.number().optional(),
  localLacre: z.string().min(1, `Local do lacre ${t('fieldRequired').toLowerCase()}`),
  descricaoLacre: z.string().min(1, `${t('description')} ${t('fieldRequired').toLowerCase()}`),
  tipoLacre: z.string().min(1, `Tipo de lacre ${t('fieldRequired').toLowerCase()}`),
  observacao: z.string().optional(),
  preenchidoPor: z.string().min(1, t('fieldRequired')),
  dataPreenchimento: z.string().min(1, `Data ${t('fieldRequired').toLowerCase()}`),
});

const createControleLacreSchema = (t: (key: string) => string) => z.object({
  poloId: z.number().optional(),
  campoId: z.number().min(1, `Campo ${t('fieldRequired').toLowerCase()}`),
  instalacaoId: z.number().min(1, `Instalação ${t('fieldRequired').toLowerCase()}`),
  concessionario: z.string().min(1, `Concessionário ${t('fieldRequired').toLowerCase()}`),
  dataAtualizacao: z.string().min(1, `Data ${t('fieldRequired').toLowerCase()}`),
  nome: z.string().min(1, `Nome ${t('fieldRequired').toLowerCase()}`),
  item: z.number().min(1, `Item ${t('fieldRequired').toLowerCase()}`),
  descricaoEquipamento: z.string().min(1, `${t('description')} ${t('fieldRequired').toLowerCase()}`),
  numeroSerie: z.string().min(1, `Número de série ${t('fieldRequired').toLowerCase()}`),
  lacreNumeracao: z.string().min(1, `Numeração do lacre ${t('fieldRequired').toLowerCase()}`),
  dataLacrado: z.string().min(1, `Data ${t('fieldRequired').toLowerCase()}`),
  violado: z.enum(["sim", "nao"]),
  dataViolado: z.string().optional(),
  motivo: z.string().optional(),
  dataNovoLacre: z.string().optional(),
  novoLacreNumeracao: z.string().optional(),
  lacradoPor: z.string().min(1, t('fieldRequired')),
});

// Opções para dropdowns
const locaisLacre = [
  "Instrumento de medição",
  "Válvula tanque",
  "Válvula bloqueio",
  "Definido pelo CM"
].filter(Boolean); // Remove valores falsy

const tiposLacre = [
  "Arame",
  "Placa metálica",
  "Adesivo",
  "Senha eletrônica"
].filter(Boolean); // Remove valores falsy

// Função para validar se um valor é válido para SelectItem
const isValidSelectValue = (value: any) => {
  return value !== null && value !== undefined && String(value).trim() !== '';
};

export default function ProtecaoLacre() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("fisico");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPolo, setSelectedPolo] = useState<number | null>(null);
  const [selectedCampo, setSelectedCampo] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Schemas com mensagens traduzidas
  const lacreEletronicoSchema = createLacreEletronicoSchema(t);
  const lacreFisicoSchema = createLacreFisicoSchema(t);
  const controleLacreSchema = createControleLacreSchema(t);

  // Queries para dropdowns
  const { data: polos = [] } = useQuery<Polo[]>({
    queryKey: ["polos"],
    queryFn: async () => {
      const response = await fetch("/api/polos");
      if (!response.ok) throw new Error("Erro ao buscar polos");
      return response.json();
    },
    staleTime: 1000, // 1 segundo
  });

  const { data: campos = [] } = useQuery<Campo[]>({
    queryKey: ["campos", selectedPolo],
    queryFn: async () => {
      const url = selectedPolo ? `/api/campos?poloId=${selectedPolo}` : "/api/campos";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Erro ao buscar campos");
      return response.json();
    },
    staleTime: 1000, // 1 segundo
  });

  const { data: instalacoes = [] } = useQuery<Instalacao[]>({
    queryKey: ["instalacoes", selectedPolo, selectedCampo],
    queryFn: async () => {
      let url = "/api/instalacoes";
      const params = new URLSearchParams();
      if (selectedPolo) params.append("poloId", selectedPolo.toString());
      if (selectedCampo) params.append("campoId", selectedCampo.toString());
      if (params.toString()) url += "?" + params.toString();
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Erro ao buscar instalações");
      return response.json();
    },
    staleTime: 1000, // 1 segundo
  });

  // Query para verificar lacres violados
  const { data: lacresViolados } = useQuery({
    queryKey: ["lacres-violados"],
    queryFn: async () => {
      const response = await fetch("/api/controle-lacres");
      if (!response.ok) throw new Error("Erro ao buscar lacres");
      const data = await response.json();
      return data.filter((lacre: any) => lacre.violado === "sim");
    },
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });

  // Arrays filtrados para garantir valores válidos nos SelectItems
  const validPolos = polos.filter(polo => isValidSelectValue(polo.id));
  const validCampos = campos.filter(campo => isValidSelectValue(campo.id));
  const validInstalacoes = instalacoes.filter(instalacao => isValidSelectValue(instalacao.id));
  const validLocaisLacre = locaisLacre.filter(local => isValidSelectValue(local));
  const validTiposLacre = tiposLacre.filter(tipo => isValidSelectValue(tipo));

  // Mutation para verificar violações e criar notificações
  const verificarViolacoesMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/lacres/verificar-violacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Erro ao verificar violações");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notificacoes"] });
      queryClient.invalidateQueries({ queryKey: ["lacres-violados"] });
      console.log(`${data.notificacoesCriadas} notificações criadas para lacres violados`);
    },
  });

  // Forms
  const lacreFisicoForm = useForm({
    resolver: zodResolver(lacreFisicoSchema),
    defaultValues: {
      poloId: undefined,
      campoId: undefined,
      instalacaoId: undefined,
      localLacre: "",
      descricaoLacre: "",
      tipoLacre: "",
      observacao: "",
      preenchidoPor: "",
      dataPreenchimento: new Date().toISOString().split('T')[0],
    },
  });

  const lacreEletronicoForm = useForm({
    resolver: zodResolver(lacreEletronicoSchema),
    defaultValues: {
      poloId: undefined,
      campoId: undefined,
      instalacaoId: undefined,
      localLacre: "",
      tag: "",
      tipoAcesso: "",
      login: "",
      senha: "",
      observacao: "",
      preenchidoPor: "",
      dataPreenchimento: new Date().toISOString().split('T')[0],
    },
  });

  const controleLacreForm = useForm({
    resolver: zodResolver(controleLacreSchema),
    defaultValues: {
      poloId: undefined,
      campoId: undefined,
      instalacaoId: undefined,
      concessionario: "",
      dataAtualizacao: new Date().toISOString().split('T')[0],
      nome: "",
      item: 1,
      descricaoEquipamento: "",
      numeroSerie: "",
      lacreNumeracao: "",
      dataLacrado: "",
      violado: "nao",
      dataViolado: "",
      motivo: "",
      dataNovoLacre: "",
      novoLacreNumeracao: "",
      lacradoPor: "",
    },
  });

  // Queries para dados reais dos lacres
  const { data: lacresFisicos = [], isLoading: isLoadingFisicos } = useQuery({
    queryKey: ["lacres-fisicos"],
    queryFn: async () => {
      const response = await fetch("/api/lacres-fisicos");
      if (!response.ok) throw new Error("Erro ao buscar lacres físicos");
      return response.json();
    },
    staleTime: 1000, // 1 segundo
  });

  const { data: lacresEletronicos = [], isLoading: isLoadingEletronicos } = useQuery({
    queryKey: ["lacres-eletronicos"],
    queryFn: async () => {
      const response = await fetch("/api/lacres-eletronicos");
      if (!response.ok) throw new Error("Erro ao buscar lacres eletrônicos");
      return response.json();
    },
    staleTime: 1000, // 1 segundo
  });

  const { data: controleLacres = [], isLoading: isLoadingControle } = useQuery({
    queryKey: ["controle-lacres"],
    queryFn: async () => {
      const response = await fetch("/api/controle-lacres");
      if (!response.ok) throw new Error("Erro ao buscar controle de lacres");
      return response.json();
    },
    staleTime: 1000, // 1 segundo
  });

  // Dados reais serão carregados via API - sem fallback mockado

  // Mutations para criar lacres
  const createLacreFisicoMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/lacres-fisicos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erro ao criar lacre físico");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lacres-fisicos"] });
      setIsModalOpen(false);
      lacreFisicoForm.reset();
    },
  });

  const createLacreEletronicoMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/lacres-eletronicos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erro ao criar lacre eletrônico");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lacres-eletronicos"] });
      setIsModalOpen(false);
      lacreEletronicoForm.reset();
    },
  });

  const createControleLacreMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/controle-lacres", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erro ao criar controle de lacre");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["controle-lacres"] });
      setIsModalOpen(false);
      controleLacreForm.reset();
    },
  });

  const onSubmitLacreFisico = (data: any) => {
    createLacreFisicoMutation.mutate(data);
  };

  const onSubmitLacreEletronico = (data: any) => {
    createLacreEletronicoMutation.mutate(data);
  };

  const onSubmitControleLacre = (data: any) => {
    createControleLacreMutation.mutate(data);
  };

  // Funções para relatórios
  const exportToExcel = async (tipo: "fisico" | "eletronico" | "controle") => {
    try {
      const response = await fetch(`/api/lacres/export/excel?tipo=${tipo}`);
      if (!response.ok) throw new Error("Erro ao exportar para Excel");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `lacres_${tipo}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao exportar:", error);
    }
  };

  const exportToPDF = async (tipo: "fisico" | "eletronico" | "controle") => {
    try {
      const response = await fetch(`/api/lacres/export/pdf?tipo=${tipo}`);
      if (!response.ok) throw new Error("Erro ao exportar para PDF");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `lacres_${tipo}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao exportar:", error);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Proteção e Lacre
          </h1>
          <p className="text-muted-foreground">
            Gestão de lacres físicos, eletrônicos e controle de violações
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => verificarViolacoesMutation.mutate()}
            className="flex items-center gap-2"
            disabled={verificarViolacoesMutation.isPending}
          >
            <Shield className="h-4 w-4" />
            {verificarViolacoesMutation.isPending ? "Verificando..." : "Verificar Violações"}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => exportToExcel(activeTab as "fisico" | "eletronico" | "controle")}
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            Excel
          </Button>
          <Button 
            variant="outline" 
            onClick={() => exportToPDF(activeTab as "fisico" | "eletronico" | "controle")}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Alertas de Lacres Violados */}
      {lacresViolados && lacresViolados.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              ⚠️ {t('violatedSealsAlert')}
            </CardTitle>
            <CardDescription className="text-red-700">
              {lacresViolados.length} {t('violatedSealsDetected')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lacresViolados.slice(0, 3).map((lacre: any) => (
                <div key={lacre.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                  <div>
                    <p className="font-medium text-red-900">{lacre.descricaoEquipamento}</p>
                    <p className="text-sm text-red-700">
                      {t('violatedSeal')}: {lacre.lacreNumeracao} | {t('serie')}: {lacre.numeroSerie}
                    </p>
                    <p className="text-xs text-red-600">
                      {t('violatedOn')}: {lacre.dataViolado ? new Date(lacre.dataViolado).toLocaleDateString('pt-BR') : 'Data não informada'}
                    </p>
                  </div>
                  <Badge variant="destructive">{t('violated')}</Badge>
                </div>
              ))}
              {lacresViolados.length > 3 && (
                <p className="text-sm text-red-600 text-center mt-2">
                  + {lacresViolados.length - 3} lacres violados adicionais
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="fisico">{t('physicalSeals')}</TabsTrigger>
          <TabsTrigger value="eletronico">{t('electronicSeals')}</TabsTrigger>
          <TabsTrigger value="controle">{t('sealControl')}</TabsTrigger>
        </TabsList>

        {/* Aba Lacre Físico */}
        <TabsContent value="fisico" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t('physicalSeals')}</CardTitle>
                  <CardDescription>
                    {t('physicalSealRegistration')}
                  </CardDescription>
                </div>
                <Dialog open={isModalOpen && activeTab === "fisico"} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      {t('addPhysicalSeal')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Novo Lacre Físico</DialogTitle>
                      <DialogDescription>
                        Preencha as informações do lacre físico
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...lacreFisicoForm}>
                      <form onSubmit={lacreFisicoForm.handleSubmit(onSubmitLacreFisico)} className="space-y-4">
                        {/* Campos de localização */}
                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={lacreFisicoForm.control}
                            name="poloId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('pole')}</FormLabel>
                                <Select 
                                  onValueChange={(value) => {
                                    const numValue = value ? parseInt(value) : undefined;
                                    field.onChange(numValue);
                                    setSelectedPolo(numValue || null);
                                    setSelectedCampo(null);
                                    lacreFisicoForm.setValue("campoId", undefined);
                                    lacreFisicoForm.setValue("instalacaoId", undefined);
                                  }} 
                                  value={field.value ? String(field.value) : ""}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={t('selectPole')} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {validPolos.map((polo) => (
                                      <SelectItem key={polo.id} value={polo.id.toString()}>
                                        {polo.nome}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={lacreFisicoForm.control}
                            name="campoId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('field')}</FormLabel>
                                <Select 
                                  onValueChange={(value) => {
                                    const numValue = value ? parseInt(value) : undefined;
                                    field.onChange(numValue);
                                    setSelectedCampo(numValue || null);
                                    lacreFisicoForm.setValue("instalacaoId", undefined);
                                  }} 
                                  value={field.value ? String(field.value) : ""}
                                  disabled={!selectedPolo}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={t('selectField')} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {validCampos.map((campo) => (
                                      <SelectItem key={campo.id} value={campo.id.toString()}>
                                        {campo.nome}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={lacreFisicoForm.control}
                            name="instalacaoId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Instalação</FormLabel>
                                <Select 
                                  onValueChange={(value) => {
                                    const numValue = value ? parseInt(value) : undefined;
                                    field.onChange(numValue);
                                  }} 
                                  value={field.value ? String(field.value) : ""}
                                  disabled={!selectedCampo}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione a instalação" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {validInstalacoes.map((instalacao) => (
                                      <SelectItem key={instalacao.id} value={instalacao.id.toString()}>
                                        {instalacao.nome}
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
                            control={lacreFisicoForm.control}
                            name="localLacre"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Local do Lacre</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione o local" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {locaisLacre.filter(local => local && local.trim() !== '').map((local) => (
                                      <SelectItem key={local} value={local}>
                                        {local}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={lacreFisicoForm.control}
                            name="tipoLacre"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('sealType')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {tiposLacre.filter(tipo => tipo && tipo.trim() !== '').map((tipo) => (
                                      <SelectItem key={tipo} value={tipo}>
                                        {tipo}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={lacreFisicoForm.control}
                          name="descricaoLacre"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descrição do Lacre</FormLabel>
                              <FormControl>
                                <Input placeholder="Descreva o lacre..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={lacreFisicoForm.control}
                          name="observacao"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Observação</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Observações adicionais..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={lacreFisicoForm.control}
                            name="preenchidoPor"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Preenchido por</FormLabel>
                                <FormControl>
                                  <Input placeholder="Nome do responsável" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={lacreFisicoForm.control}
                            name="dataPreenchimento"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Data Preenchimento</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                          >
                            Cancelar
                          </Button>
                          <Button type="submit">Salvar</Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar lacres físicos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Local</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Preenchido por</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingFisicos ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">Carregando...</TableCell>
                      </TableRow>
                    ) : lacresFisicos.length > 0 ? lacresFisicos.map((lacre: any) => (
                      <TableRow key={lacre.id}>
                        <TableCell className="font-medium">{lacre.localLacre || lacre.local}</TableCell>
                        <TableCell>{lacre.descricaoLacre || lacre.descricao}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{lacre.tipoLacre || lacre.tipo}</Badge>
                        </TableCell>
                        <TableCell>{lacre.preenchidoPor || lacre.responsavel}</TableCell>
                        <TableCell>{new Date(lacre.dataPreenchimento || lacre.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          Nenhum lacre físico encontrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Lacre Eletrônico */}
        <TabsContent value="eletronico" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t('electronicSeals')}</CardTitle>
                  <CardDescription>
                    {t('electronicSealRegistration')}
                  </CardDescription>
                </div>
                <Dialog open={isModalOpen && activeTab === "eletronico"} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      {t('addElectronicSeal')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{t('addElectronicSeal')}</DialogTitle>
                      <DialogDescription>
                        Preencha as informações do lacre eletrônico
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...lacreEletronicoForm}>
                      <form onSubmit={lacreEletronicoForm.handleSubmit(onSubmitLacreEletronico)} className="space-y-4">
                        {/* Campos de localização */}
                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={lacreEletronicoForm.control}
                            name="poloId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Polo</FormLabel>
                                <Select 
                                  onValueChange={(value) => {
                                    const numValue = value ? parseInt(value) : undefined;
                                    field.onChange(numValue);
                                    setSelectedPolo(numValue || null);
                                    setSelectedCampo(null);
                                    lacreEletronicoForm.setValue("campoId", undefined);
                                    lacreEletronicoForm.setValue("instalacaoId", undefined);
                                  }} 
                                  value={field.value ? String(field.value) : ""}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione o polo" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {validPolos.map((polo) => (
                                      <SelectItem key={polo.id} value={polo.id.toString()}>
                                        {polo.nome}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={lacreEletronicoForm.control}
                            name="campoId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Campo</FormLabel>
                                <Select 
                                  onValueChange={(value) => {
                                    const numValue = value ? parseInt(value) : undefined;
                                    field.onChange(numValue);
                                    setSelectedCampo(numValue || null);
                                    lacreEletronicoForm.setValue("instalacaoId", undefined);
                                  }} 
                                  value={field.value ? String(field.value) : ""}
                                  disabled={!selectedPolo}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione o campo" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {validCampos.map((campo) => (
                                      <SelectItem key={campo.id} value={campo.id.toString()}>
                                        {campo.nome}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={lacreEletronicoForm.control}
                            name="instalacaoId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Instalação</FormLabel>
                                <Select 
                                  onValueChange={(value) => {
                                    const numValue = value ? parseInt(value) : undefined;
                                    field.onChange(numValue);
                                  }} 
                                  value={field.value ? String(field.value) : ""}
                                  disabled={!selectedCampo}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione a instalação" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {validInstalacoes.map((instalacao) => (
                                      <SelectItem key={instalacao.id} value={instalacao.id.toString()}>
                                        {instalacao.nome}
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
                            control={lacreEletronicoForm.control}
                            name="localLacre"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Local do Lacre</FormLabel>
                                <FormControl>
                                  <Input placeholder="Local do lacre eletrônico" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={lacreEletronicoForm.control}
                            name="tag"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>TAG</FormLabel>
                                <FormControl>
                                  <Input placeholder="TAG do equipamento" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={lacreEletronicoForm.control}
                          name="tipoAcesso"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Acesso</FormLabel>
                              <FormControl>
                                <Input placeholder="Tipo de acesso (ex: Web, Serial, etc.)" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={lacreEletronicoForm.control}
                            name="login"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Login</FormLabel>
                                <FormControl>
                                  <Input placeholder="Nome de usuário" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={lacreEletronicoForm.control}
                            name="senha"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Senha</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="Senha de acesso" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={lacreEletronicoForm.control}
                          name="observacao"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Observação</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Observações adicionais..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={lacreEletronicoForm.control}
                            name="preenchidoPor"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Preenchido por</FormLabel>
                                <FormControl>
                                  <Input placeholder="Nome do responsável" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={lacreEletronicoForm.control}
                            name="dataPreenchimento"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Data Preenchimento</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                          >
                            Cancelar
                          </Button>
                          <Button type="submit">Salvar</Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar lacres eletrônicos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Local</TableHead>
                      <TableHead>TAG</TableHead>
                      <TableHead>Tipo de Acesso</TableHead>
                      <TableHead>Login</TableHead>
                      <TableHead>Preenchido por</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingEletronicos ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">Carregando...</TableCell>
                      </TableRow>
                    ) : lacresEletronicos.length > 0 ? lacresEletronicos.map((lacre: any) => (
                      <TableRow key={lacre.id}>
                        <TableCell className="font-medium">{lacre.localLacre}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{lacre.tag}</Badge>
                        </TableCell>
                        <TableCell>{lacre.tipoAcesso}</TableCell>
                        <TableCell>{lacre.login}</TableCell>
                        <TableCell>{lacre.preenchidoPor}</TableCell>
                        <TableCell>{new Date(lacre.dataPreenchimento).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          Nenhum lacre eletrônico encontrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Controle de Lacres */}
        <TabsContent value="controle" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t('sealControlTable')}</CardTitle>
                  <CardDescription>
                    {t('sealControlDescription')}
                  </CardDescription>
                </div>
                <Dialog open={isModalOpen && activeTab === "controle"} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      {t('addSealControl')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{t('addSealControl')}</DialogTitle>
                      <DialogDescription>
                        Preencha as informações do controle de lacre
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...controleLacreForm}>
                      <form onSubmit={controleLacreForm.handleSubmit(onSubmitControleLacre)} className="space-y-4">
                        {/* Cabeçalho */}
                        <div className="space-y-4">
                          {/* Campos de localização */}
                          <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                            <FormField
                              control={controleLacreForm.control}
                              name="poloId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Polo</FormLabel>
                                  <Select 
                                    onValueChange={(value) => {
                                      const numValue = value ? parseInt(value) : undefined;
                                      field.onChange(numValue);
                                      setSelectedPolo(numValue || null);
                                      setSelectedCampo(null);
                                      controleLacreForm.setValue("campoId", undefined);
                                      controleLacreForm.setValue("instalacaoId", undefined);
                                    }} 
                                    value={field.value ? String(field.value) : ""}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione o polo" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {validPolos.map((polo) => (
                                        <SelectItem key={polo.id} value={polo.id.toString()}>
                                          {polo.nome}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={controleLacreForm.control}
                              name="campoId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Campo *</FormLabel>
                                  <Select 
                                    onValueChange={(value) => {
                                      const numValue = value ? parseInt(value) : undefined;
                                      field.onChange(numValue);
                                      setSelectedCampo(numValue || null);
                                      controleLacreForm.setValue("instalacaoId", undefined);
                                    }} 
                                    value={field.value ? String(field.value) : ""}
                                    disabled={!selectedPolo}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione o campo" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {validCampos.map((campo) => (
                                        <SelectItem key={campo.id} value={campo.id.toString()}>
                                          {campo.nome}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={controleLacreForm.control}
                              name="instalacaoId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Instalação *</FormLabel>
                                  <Select 
                                    onValueChange={(value) => {
                                      const numValue = value ? parseInt(value) : undefined;
                                      field.onChange(numValue);
                                    }} 
                                    value={field.value ? String(field.value) : ""}
                                    disabled={!selectedCampo}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione a instalação" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {validInstalacoes.map((instalacao) => (
                                        <SelectItem key={instalacao.id} value={instalacao.id.toString()}>
                                          {instalacao.nome}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          {/* Outros campos */}
                          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                            <FormField
                              control={controleLacreForm.control}
                              name="concessionario"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Concessionário</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Nome do concessionário" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={controleLacreForm.control}
                              name="dataAtualizacao"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Data da Atualização</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={controleLacreForm.control}
                              name="nome"
                              render={({ field }) => (
                                <FormItem className="col-span-2">
                                  <FormLabel>Nome</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Nome do responsável" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        {/* Dados do Equipamento */}
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={controleLacreForm.control}
                            name="descricaoEquipamento"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Descrição (Equipamento)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Descrição do equipamento" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={controleLacreForm.control}
                            name="numeroSerie"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Número de Série</FormLabel>
                                <FormControl>
                                  <Input placeholder="Número de série" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Dados do Lacre */}
                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={controleLacreForm.control}
                            name="lacreNumeracao"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Lacre (Numeração)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Numeração do lacre" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={controleLacreForm.control}
                            name="dataLacrado"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Data (Lacrado)</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={controleLacreForm.control}
                            name="violado"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Violado</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Sim/Não" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="nao">Não</SelectItem>
                                    <SelectItem value="sim">Sim</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Campos condicionais para violação */}
                        {controleLacreForm.watch("violado") === "sim" && (
                          <div className="grid grid-cols-2 gap-4 p-4 bg-red-50 rounded-lg">
                            <FormField
                              control={controleLacreForm.control}
                              name="dataViolado"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Data (Violado)</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={controleLacreForm.control}
                              name="dataNovoLacre"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Data (Novo Lacre)</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={controleLacreForm.control}
                              name="motivo"
                              render={({ field }) => (
                                <FormItem className="col-span-2">
                                  <FormLabel>Motivo</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="Motivo da violação..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={controleLacreForm.control}
                              name="novoLacreNumeracao"
                              render={({ field }) => (
                                <FormItem className="col-span-2">
                                  <FormLabel>Lacre (Numeração Novo Lacre)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Numeração do novo lacre" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}

                        <FormField
                          control={controleLacreForm.control}
                          name="lacradoPor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Lacrado Por (Nome)</FormLabel>
                              <FormControl>
                                <Input placeholder="Nome do responsável" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end space-x-2 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                          >
                            Cancelar
                          </Button>
                          <Button type="submit">Salvar</Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar registros..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Nº Série</TableHead>
                      <TableHead>Lacre</TableHead>
                      <TableHead>Data Lacrado</TableHead>
                      <TableHead>Violado</TableHead>
                      <TableHead>Lacrado Por</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingControle ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">Carregando...</TableCell>
                      </TableRow>
                    ) : controleLacres.length > 0 ? controleLacres.map((registro: any) => (
                      <TableRow key={registro.id}>
                        <TableCell className="font-medium">{registro.item}</TableCell>
                        <TableCell>{registro.descricaoEquipamento || registro.descricao}</TableCell>
                        <TableCell>{registro.numeroSerie}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{registro.lacreNumeracao || registro.numeracao}</Badge>
                        </TableCell>
                        <TableCell>{new Date(registro.dataLacrado || registro.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={registro.violado === "sim" ? "destructive" : "secondary"}>
                            {registro.violado === "sim" ? "Sim" : "Não"}
                          </Badge>
                        </TableCell>
                        <TableCell>{registro.lacradoPor || registro.responsavel}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                          Nenhum registro de controle encontrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}





