import React, { useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format, addDays, differenceInDays, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, AlertTriangle, CheckCircle } from "lucide-react";



interface GanttTask {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  priority: "low" | "medium" | "high" | "critical";
  category: string;
  status: "pending" | "in-progress" | "completed" | "overdue";
  relatedEntity?: {
    type: string;
    id: number;
    name: string;
  };
}

interface NotificationGanttChartProps {
  configurations: Array<{
    id: string;
    type: string;
    name: string;
    enabled: boolean;
    daysAdvance: number;
    priority: "low" | "medium" | "high" | "critical";
    autoGenerate: boolean;
  }>;
  equipamentos?: any[];
  pocos?: any[];
  calibracoes?: any[];
}

export default function NotificationGanttChart({ 
  configurations, 
  equipamentos, 
  pocos, 
  calibracoes 
}: NotificationGanttChartProps) {
  
  const ganttTasks = useMemo(() => {
    const tasks: GanttTask[] = [];
    const today = new Date();
    const endRange = addDays(today, 90); // Próximos 90 dias

    configurations.forEach(config => {
      if (!config.enabled || !config.autoGenerate) return;

      switch (config.type) {
        case "calibracao":
          equipamentos?.forEach(eq => {
            if (!eq.proximaCalibracao) return;
            
            const calibrationDate = new Date(eq.proximaCalibracao);
            const alertDate = addDays(calibrationDate, -config.daysAdvance);
            
            if (calibrationDate >= today && calibrationDate <= endRange) {
              const isOverdue = calibrationDate < today;
              const isAlert = alertDate <= today && calibrationDate >= today;
              
              tasks.push({
                id: `cal-${eq.id}`,
                title: `Calibração - ${eq.tag}`,
                description: `Calibração do equipamento ${eq.nome} - ${eq.numeroSerie}`,
                startDate: alertDate > today ? alertDate : today,
                endDate: calibrationDate,
                priority: isOverdue ? "critical" : config.priority,
                category: "calibracao",
                status: isOverdue ? "overdue" : isAlert ? "in-progress" : "pending",
                relatedEntity: {
                  type: "equipamento",
                  id: eq.id,
                  name: eq.tag
                }
              });
            }
          });
          break;

        case "testes_pocos":
          pocos?.forEach(poco => {
            // Gerar testes baseados na frequência padrão
            const nextTestDate = addDays(today, 30); // Exemplo: teste a cada 30 dias
            const alertDate = addDays(nextTestDate, -config.daysAdvance);

            tasks.push({
              id: `test-${poco.id}`,
              title: `Teste BTP - ${poco.nome}`,
              description: `Teste de produção do poço ${poco.nome}`,
              startDate: alertDate,
              endDate: nextTestDate,
              priority: config.priority,
              category: "testes_pocos",
              status: "pending",
              relatedEntity: {
                type: "poco",
                id: poco.id,
                name: poco.nome
              }
            });
          });
          break;

        case "cromatografia":
          // Gerar análises baseadas em cronograma padrão
          for (let i = 0; i < 4; i++) {
            const analysisDate = addDays(today, 7 * (i + 1)); // Semanalmente
            const alertDate = addDays(analysisDate, -config.daysAdvance);

            if (analysisDate <= endRange) {
              tasks.push({
                id: `crom-${i}`,
                title: `Análise Cromatográfica`,
                description: `Coleta e análise cromatográfica programada`,
                startDate: alertDate,
                endDate: analysisDate,
                priority: config.priority,
                category: "cromatografia",
                status: "pending"
              });
            }
          }
          break;

        case "retorno_equipamentos":
          // Equipamentos em calibração externa (exemplo)
          const equipmentosExternal = equipamentos?.filter(eq => eq.status === "calibracao_externa") || [];
          equipmentosExternal.forEach((eq, index) => {
            const returnDate = addDays(today, 14 + index * 3); // Retornos escalonados
            const alertDate = addDays(returnDate, -config.daysAdvance);

            tasks.push({
              id: `ret-${eq.id}`,
              title: `Retorno - ${eq.tag}`,
              description: `Retorno previsto do equipamento ${eq.nome}`,
              startDate: alertDate,
              endDate: returnDate,
              priority: config.priority,
              category: "retorno_equipamentos",
              status: "pending",
              relatedEntity: {
                type: "equipamento",
                id: eq.id,
                name: eq.tag
              }
            });
          });
          break;

        case "renovacao_certificados":
          equipamentos?.forEach(eq => {
            if (!eq.validadeCertificado) return;
            
            const expiryDate = new Date(eq.validadeCertificado);
            const alertDate = addDays(expiryDate, -config.daysAdvance);
            
            if (expiryDate >= today && expiryDate <= endRange) {
              const isNearExpiry = differenceInDays(expiryDate, today) <= config.daysAdvance;
              
              tasks.push({
                id: `cert-${eq.id}`,
                title: `Renovação Certificado - ${eq.tag}`,
                description: `Renovação do certificado do equipamento ${eq.nome}`,
                startDate: alertDate,
                endDate: expiryDate,
                priority: isNearExpiry ? "critical" : config.priority,
                category: "renovacao_certificados",
                status: isNearExpiry ? "in-progress" : "pending",
                relatedEntity: {
                  type: "equipamento",
                  id: eq.id,
                  name: eq.tag
                }
              });
            }
          });
          break;

        case "manutencao":
          equipamentos?.forEach((eq, index) => {
            // Manutenção preventiva baseada em cronograma
            const maintenanceDate = addDays(today, 45 + index * 5); // Escalonado
            const alertDate = addDays(maintenanceDate, -config.daysAdvance);

            if (maintenanceDate <= endRange) {
              tasks.push({
                id: `maint-${eq.id}`,
                title: `Manutenção - ${eq.tag}`,
                description: `Manutenção preventiva do equipamento ${eq.nome}`,
                startDate: alertDate,
                endDate: maintenanceDate,
                priority: config.priority,
                category: "manutencao",
                status: "pending",
                relatedEntity: {
                  type: "equipamento",
                  id: eq.id,
                  name: eq.tag
                }
              });
            }
          });
          break;
      }
    });

    // Ordenar por data de início
    return tasks.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }, [configurations, equipamentos, pocos, calibracoes]);

  // Apply dynamic styles to gantt bars
  useEffect(() => {
    const bars = document.querySelectorAll('[data-position]');
    bars.forEach((bar) => {
      const position = bar.getAttribute('data-position');
      const width = bar.getAttribute('data-width');
      if (position && width && bar instanceof HTMLElement) {
        bar.style.left = `${position}%`;
        bar.style.width = `${width}%`;
        bar.style.minWidth = '2px';
      }
    });
  }, [ganttTasks]);

  const dateRange = useMemo(() => {
    const today = new Date();
    const endDate = addDays(today, 90);
    const totalDays = differenceInDays(endDate, today);
    
    return {
      start: today,
      end: endDate,
      totalDays
    };
  }, []);

  const getPositionPercentage = (date: Date) => {
    const dayFromStart = differenceInDays(date, dateRange.start);
    return Math.max(0, Math.min(100, (dayFromStart / dateRange.totalDays) * 100));
  };

  const getWidthPercentage = (startDate: Date, endDate: Date) => {
    const duration = differenceInDays(endDate, startDate);
    return Math.max(1, (duration / dateRange.totalDays) * 100);
  };

  const getPriorityColor = (priority: string, status: string) => {
    if (status === "overdue") return "bg-red-600";
    
    switch (priority) {
      case "critical": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-3 w-3" />;
      case "overdue": return <AlertTriangle className="h-3 w-3" />;
      case "in-progress": return <Clock className="h-3 w-3" />;
      default: return <Calendar className="h-3 w-3" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      calibracao: "Calibração",
      testes_pocos: "Testes",
      cromatografia: "Análises",
      retorno_equipamentos: "Retorno",
      renovacao_certificados: "Certificados",
      manutencao: "Manutenção"
    };
    return labels[category] || category;
  };

  if (ganttTasks.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhuma atividade programada</h3>
        <p className="text-muted-foreground">
          Configure as notificações para ver a timeline de atividades críticas
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header with time scale */}
        <div className="relative">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Hoje</span>
            <span>+30 dias</span>
            <span>+60 dias</span>
            <span>+90 dias</span>
          </div>
          <div className="h-1 bg-muted rounded-full relative">
            <div className="absolute left-0 top-0 w-0.5 h-4 bg-blue-500 -mt-1.5"></div>
            <div className="absolute left-1/3 top-0 w-0.5 h-4 bg-muted-foreground -mt-1.5"></div>
            <div className="absolute left-2/3 top-0 w-0.5 h-4 bg-muted-foreground -mt-1.5"></div>
            <div className="absolute right-0 top-0 w-0.5 h-4 bg-muted-foreground -mt-1.5"></div>
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-3">
          {ganttTasks.map((task) => {
            const leftPosition = getPositionPercentage(task.startDate);
            const width = getWidthPercentage(task.startDate, task.endDate);
            const priorityColor = getPriorityColor(task.priority, task.status);

            return (
              <div key={task.id} className="relative">
                <div className="flex items-center gap-4 mb-1">
                  <div className="w-48 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <span className="text-sm font-medium truncate">{task.title}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {getCategoryLabel(task.category)}
                      </Badge>
                      <Badge className={`text-xs ${priorityColor} text-white`}>
                        {task.priority.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex-1 relative h-6 bg-muted rounded">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-full h-full relative">
                          <div 
                            className={`absolute top-0 h-full ${priorityColor} rounded cursor-pointer transition-all hover:opacity-80`}
                            data-position={leftPosition}
                            data-width={width}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm">{task.description}</p>
                          <div className="flex items-center gap-2 text-xs">
                            <span>
                              {format(task.startDate, "dd/MM", { locale: ptBR })} - {format(task.endDate, "dd/MM", { locale: ptBR })}
                            </span>
                          </div>
                          {task.relatedEntity && (
                            <p className="text-xs text-muted-foreground">
                              {task.relatedEntity.type}: {task.relatedEntity.name}
                            </p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  
                  <div className="w-24 text-xs text-muted-foreground">
                    {format(task.endDate, "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded"></div>
              <span>Vencido</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Crítico</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span>Alto</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Médio</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Baixo</span>
            </div>
          </div>
        </Card>
      </div>
    </TooltipProvider>
  );
}