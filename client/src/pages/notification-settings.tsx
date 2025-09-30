import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, 
  Settings, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Mail,
  Plus,
  Edit,
  Trash2,
  BarChart3,
  TrendingUp,
  Activity,
  Wrench,
  FlaskConical,
  Gauge
} from "lucide-react";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import NotificationGanttChart from "@/components/notification-gantt-chart";

// Tipos de notificações configuráveis
const NOTIFICATION_TYPES = [
  {
    id: "calibracao",
    name: "Prazos de Calibração",
    description: "Monitora vencimentos de certificados de calibração de equipamentos",
    icon: Wrench,
    color: "bg-blue-500",
    defaultDays: 30,
    category: "equipamento"
  },
  {
    id: "testes_pocos",
    name: "Cronograma de Testes de Poços",
    description: "Acompanha cronograma de testes BTP e análises de poços",
    icon: Activity,
    color: "bg-green-500",
    defaultDays: 15,
    category: "poco"
  },
  {
    id: "cromatografia",
    name: "Análises de Cromatografia",
    description: "Monitora coletas, análises, emissão e implementação de resultados",
    icon: FlaskConical,
    color: "bg-purple-500",
    defaultDays: 7,
    category: "analise"
  },
  {
    id: "retorno_equipamentos",
    name: "Retorno de Equipamentos",
    description: "Acompanha envio e retorno de equipamentos para calibração externa",
    icon: Gauge,
    color: "bg-orange-500",
    defaultDays: 5,
    category: "equipamento"
  },
  {
    id: "renovacao_certificados",
    name: "Renovação de Certificados",
    description: "Monitora vencimentos de certificados e documentações técnicas",
    icon: CheckCircle,
    color: "bg-red-500",
    defaultDays: 45,
    category: "documento"
  },
  {
    id: "manutencao",
    name: "Cronograma de Manutenção",
    description: "Acompanha prazos de manutenções preventivas e corretivas",
    icon: Settings,
    color: "bg-yellow-500",
    defaultDays: 20,
    category: "manutencao"
  }
];

interface NotificationConfig {
  id: string;
  type: string;
  name: string;
  enabled: boolean;
  daysAdvance: number;
  priority: "low" | "medium" | "high" | "critical";
  emailEnabled: boolean;
  autoGenerate: boolean;
  repeatInterval?: number;
  conditions?: any;
}

export default function NotificationSettings() {
  const { toast } = useToast();
  const [configurations, setConfigurations] = useState<NotificationConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<NotificationConfig | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("config");

  // Load configurations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("notification-configs");
    if (saved) {
      setConfigurations(JSON.parse(saved));
    } else {
      // Initialize with default configurations
      const defaultConfigs = NOTIFICATION_TYPES.map(type => ({
        id: type.id,
        type: type.id,
        name: type.name,
        enabled: true,
        daysAdvance: type.defaultDays,
        priority: "medium" as const,
        emailEnabled: false,
        autoGenerate: true,
        conditions: {}
      }));
      setConfigurations(defaultConfigs);
      localStorage.setItem("notification-configs", JSON.stringify(defaultConfigs));
    }
  }, []);

  // Fetch data for smart integrations
  const { data: equipamentos } = useQuery({
    queryKey: ["/api/equipamentos"],
    queryFn: () => api.getEquipamentos(),
  });

  const { data: pocos } = useQuery({
    queryKey: ["/api/pocos"],
    queryFn: () => api.getPocos(),
  });

  const { data: calibracoes } = useQuery({
    queryKey: ["/api/calibracoes"],
    queryFn: () => api.getCalibracoes(),
  });

  const saveConfigurations = (configs: NotificationConfig[]) => {
    setConfigurations(configs);
    localStorage.setItem("notification-configs", JSON.stringify(configs));
    toast({
      title: "Configurações salvas",
      description: "As configurações de notificação foram atualizadas com sucesso!",
    });
  };

  const handleConfigSave = (config: NotificationConfig) => {
    const updatedConfigs = configurations.map(c => 
      c.id === config.id ? config : c
    );
    saveConfigurations(updatedConfigs);
    setIsConfigModalOpen(false);
    setSelectedConfig(null);
  };

  const handleToggleNotification = (id: string, enabled: boolean) => {
    const updatedConfigs = configurations.map(c => 
      c.id === id ? { ...c, enabled } : c
    );
    saveConfigurations(updatedConfigs);
  };

  const getNotificationTypeInfo = (typeId: string) => {
    return NOTIFICATION_TYPES.find(t => t.id === typeId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "critical": return "Crítica";
      case "high": return "Alta";
      case "medium": return "Média";
      case "low": return "Baixa";
      default: return priority;
    }
  };

  const getActiveNotificationsStats = () => {
    const active = configurations.filter(c => c.enabled);
    const byPriority = active.reduce((acc, c) => {
      acc[c.priority] = (acc[c.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: active.length,
      byPriority,
      emailEnabled: active.filter(c => c.emailEnabled).length
    };
  };

  const stats = getActiveNotificationsStats();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Configurações de Notificações</h1>
          <p className="text-muted-foreground">
            Configure alertas inteligentes para monitoramento de atividades críticas
          </p>
        </div>
        <Button 
          onClick={() => {
            setSelectedConfig(null);
            setIsConfigModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Configuração
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Notificações Ativas</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prioridade Crítica</p>
                <p className="text-2xl font-bold">{stats.byPriority.critical || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Com Email</p>
                <p className="text-2xl font-bold">{stats.emailEnabled}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monitoramento</p>
                <p className="text-2xl font-bold">24/7</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="config">Configurações</TabsTrigger>
          <TabsTrigger value="timeline">Timeline Visual</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          {/* Notification Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {configurations.map((config) => {
              const typeInfo = getNotificationTypeInfo(config.type);
              if (!typeInfo) return null;

              const IconComponent = typeInfo.icon;

              return (
                <Card key={config.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 ${typeInfo.color} rounded-lg`}>
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-sm">{typeInfo.name}</CardTitle>
                          <p className="text-xs text-muted-foreground mt-1">
                            {typeInfo.description}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={config.enabled}
                        onCheckedChange={(enabled) => handleToggleNotification(config.id, enabled)}
                      />
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Antecedência:</span>
                        <Badge variant="outline">{config.daysAdvance} dias</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Prioridade:</span>
                        <Badge className={getPriorityColor(config.priority)}>
                          {getPriorityLabel(config.priority)}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Email:</span>
                        <Badge variant={config.emailEnabled ? "default" : "secondary"}>
                          {config.emailEnabled ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>

                      <Separator />

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setSelectedConfig(config);
                          setIsConfigModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Configurar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Timeline de Atividades Críticas
              </CardTitle>
              <p className="text-muted-foreground">
                Visualização em tempo real das próximas atividades baseadas nas configurações
              </p>
            </CardHeader>
            <CardContent>
              <NotificationGanttChart 
                configurations={configurations.filter(c => c.enabled)}
                equipamentos={equipamentos}
                pocos={pocos}
                calibracoes={calibracoes}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Configuration Modal */}
      <Dialog open={isConfigModalOpen} onOpenChange={setIsConfigModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedConfig ? "Editar Configuração" : "Nova Configuração"}
            </DialogTitle>
          </DialogHeader>
          
          {selectedConfig && (
            <NotificationConfigForm
              config={selectedConfig}
              onSave={handleConfigSave}
              onCancel={() => {
                setIsConfigModalOpen(false);
                setSelectedConfig(null);
              }}
              availableTypes={NOTIFICATION_TYPES}
              equipamentos={equipamentos}
              pocos={pocos}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Configuration Form Component
interface NotificationConfigFormProps {
  config: NotificationConfig;
  onSave: (config: NotificationConfig) => void;
  onCancel: () => void;
  availableTypes: typeof NOTIFICATION_TYPES;
  equipamentos?: any[];
  pocos?: any[];
}

function NotificationConfigForm({ 
  config, 
  onSave, 
  onCancel, 
  availableTypes,
  equipamentos,
  pocos
}: NotificationConfigFormProps) {
  const [formData, setFormData] = useState<NotificationConfig>(config);

  const typeInfo = availableTypes.find(t => t.id === formData.type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="daysAdvance">Dias de Antecedência</Label>
          <Input
            id="daysAdvance"
            type="number"
            min="1"
            max="90"
            value={formData.daysAdvance}
            onChange={(e) => setFormData({
              ...formData,
              daysAdvance: parseInt(e.target.value) || 1
            })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Prioridade</Label>
          <Select value={formData.priority} onValueChange={(value: any) => 
            setFormData({ ...formData, priority: value })
          }>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="critical">Crítica</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="emailEnabled"
          checked={formData.emailEnabled}
          onCheckedChange={(enabled) => setFormData({
            ...formData,
            emailEnabled: enabled
          })}
        />
        <Label htmlFor="emailEnabled">Enviar notificações por email</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="autoGenerate"
          checked={formData.autoGenerate}
          onCheckedChange={(enabled) => setFormData({
            ...formData,
            autoGenerate: enabled
          })}
        />
        <Label htmlFor="autoGenerate">Gerar automaticamente baseado nos dados do sistema</Label>
      </div>

      {formData.autoGenerate && (
        <div className="space-y-4 p-4 bg-muted rounded-lg">
          <h4 className="font-medium">Integração Inteligente</h4>
          <p className="text-sm text-muted-foreground">
            Este tipo de notificação será gerado automaticamente baseado nos dados de{" "}
            {typeInfo?.category === "equipamento" && "equipamentos e calibrações"}
            {typeInfo?.category === "poco" && "poços e testes"}
            {typeInfo?.category === "analise" && "análises químicas"}
            {typeInfo?.category === "documento" && "certificados e documentos"}
            {typeInfo?.category === "manutencao" && "manutenções programadas"}
            {" "}do sistema.
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Salvar Configuração
        </Button>
      </div>
    </form>
  );
}