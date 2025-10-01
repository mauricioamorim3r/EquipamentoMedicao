import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Search, Edit, Trash2, MapPin, Building, Users } from "lucide-react";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCampoSchema, type InsertCampo, type Campo, type Polo } from "@shared/schema";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";

const formSchema = insertCampoSchema;
type FormValues = z.infer<typeof formSchema>;

interface CampoFormProps {
  campo?: Campo | null;
  polos: Polo[];
  onClose: () => void;
  onSuccess: () => void;
}

function CampoForm({ campo, polos, onClose, onSuccess }: CampoFormProps) {
  const { toast } = useToast();
  const isEditing = !!campo;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      poloId: campo?.poloId || 0,
      nome: campo?.nome || "",
      sigla: campo?.sigla || "",
      diretoria: campo?.diretoria || "",
      empresa: campo?.empresa || "",
      cnpj: campo?.cnpj || "",
      status: campo?.status || "ativo",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: FormValues) => api.createCampo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campos"] });
      toast({
        title: "Sucesso",
        description: "Campo criado com sucesso",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar campo",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormValues) => api.updateCampo(campo!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campos"] });
      toast({
        title: "Sucesso",
        description: "Campo atualizado com sucesso",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar campo",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="poloId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Polo *</FormLabel>
              <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                <FormControl>
                  <SelectTrigger data-testid="select-polo">
                    <SelectValue placeholder="Selecione o polo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {polos?.map((polo: Polo) => (
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
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Campo *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Campo de Produção Norte"
                  data-testid="input-nome"
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
          name="sigla"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sigla *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: CPN"
                  data-testid="input-sigla"
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
          name="diretoria"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Diretoria</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nome da diretoria"
                  data-testid="input-diretoria"
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
          name="empresa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Empresa</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nome da empresa"
                  data-testid="input-empresa"
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
          name="cnpj"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CNPJ</FormLabel>
              <FormControl>
                <Input
                  placeholder="00.000.000/0000-00"
                  data-testid="input-cnpj"
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
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-status">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-4">
          <Button
            type="submit"
            data-testid="button-submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending ? "Salvando..." : isEditing ? "Atualizar Campo" : "Criar Campo"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            data-testid="button-cancel"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function Campos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPolo, setSelectedPolo] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCampo, setEditingCampo] = useState<Campo | null>(null);
  const { toast } = useToast();

  const { data: campos = [], isLoading: camposLoading } = useQuery({
    queryKey: ["/api/campos"],
    queryFn: () => api.getCampos(),
  });

  const { data: polos = [] } = useQuery({
    queryKey: ["/api/polos"],
    queryFn: api.getPolos,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteCampo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campos"] });
      toast({
        title: "Sucesso",
        description: "Campo removido com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao remover campo",
        variant: "destructive",
      });
    },
  });

  const filteredCampos = campos.filter((campo: Campo) => {
    const matchesSearch =
      campo.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campo.sigla?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campo.empresa?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPolo = !selectedPolo || selectedPolo === "all" || campo.poloId === parseInt(selectedPolo);
    const matchesStatus = !selectedStatus || selectedStatus === "all" || campo.status === selectedStatus;

    return matchesSearch && matchesPolo && matchesStatus;
  });

  const openNewCampoForm = () => {
    setEditingCampo(null);
    setIsFormOpen(true);
  };

  const openEditCampoForm = (campo: Campo) => {
    setEditingCampo(campo);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCampo(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja remover este campo?")) {
      deleteMutation.mutate(id);
    }
  };

  const stats = {
    total: filteredCampos.length,
    ativos: filteredCampos.filter((c: Campo) => c.status === 'ativo').length,
    inativos: filteredCampos.filter((c: Campo) => c.status === 'inativo').length,
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground" data-testid="page-title">
            Gestão de Campos
          </h1>
          <p className="text-muted-foreground">
            Gerenciar campos de produção
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewCampoForm} data-testid="button-new-campo">
              <Plus className="w-4 h-4 mr-2" />
              Novo Campo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCampo ? 'Editar Campo' : 'Novo Campo'}
              </DialogTitle>
            </DialogHeader>
            <CampoForm
              campo={editingCampo}
              polos={polos}
              onClose={closeForm}
              onSuccess={closeForm}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card data-testid="card-total-campos">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Campos</p>
                <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <MapPin className="text-primary w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-ativos">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Campos Ativos</p>
                <p className="text-3xl font-bold text-green-700">{stats.ativos}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Building className="text-green-500 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-inativos">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Campos Inativos</p>
                <p className="text-3xl font-bold text-gray-600">{stats.inativos}</p>
              </div>
              <div className="w-12 h-12 bg-gray-500/20 rounded-lg flex items-center justify-center">
                <MapPin className="text-gray-500 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, sigla ou empresa"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                data-testid="search-input"
              />
            </div>

            <Select value={selectedPolo} onValueChange={setSelectedPolo}>
              <SelectTrigger data-testid="polo-filter">
                <SelectValue placeholder="Todos os Polos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Polos</SelectItem>
                {polos.map((polo: Polo) => (
                  <SelectItem key={polo.id} value={polo.id.toString()}>
                    {polo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger data-testid="status-filter">
                <SelectValue placeholder="Todos os Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Campos ({filteredCampos.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {camposLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-muted rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : filteredCampos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Nenhum campo encontrado</p>
              <p className="text-sm">
                {searchTerm || selectedPolo || selectedStatus
                  ? 'Tente ajustar os filtros de busca'
                  : 'Adicione o primeiro campo'
                }
              </p>
              {!searchTerm && !selectedPolo && !selectedStatus && (
                <Button className="mt-4" onClick={openNewCampoForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Campo
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCampos.map((campo: Campo) => {
                const polo = polos.find((p: Polo) => p.id === campo.poloId);
                const statusBadge = campo.status === 'ativo'
                  ? { text: 'Ativo', className: 'bg-green-100 text-green-800' }
                  : { text: 'Inativo', className: 'bg-gray-100 text-gray-800' };

                return (
                  <div
                    key={campo.id}
                    className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                    data-testid={`campo-card-${campo.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="font-semibold text-lg">
                            {campo.nome}
                          </h3>
                          <Badge className="font-mono">
                            {campo.sigla}
                          </Badge>
                          <Badge className={statusBadge.className}>
                            {statusBadge.text}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div>
                            <p className="font-medium text-foreground">Polo: {polo?.nome || 'N/A'}</p>
                            <p>Empresa: {campo.empresa || 'N/A'}</p>
                          </div>
                          <div>
                            <p>Diretoria: {campo.diretoria || 'N/A'}</p>
                            <p>CNPJ: {campo.cnpj || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditCampoForm(campo)}
                          data-testid={`edit-campo-${campo.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(campo.id)}
                          className="text-red-500 hover:text-red-700"
                          data-testid={`delete-campo-${campo.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}