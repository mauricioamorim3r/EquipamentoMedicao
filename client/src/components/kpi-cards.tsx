import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import type { DashboardStats } from "@/types";

interface KpiCardsProps {
  stats: DashboardStats;
  isLoading: boolean;
}

export default function KpiCards({ stats, isLoading }: KpiCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const kpiData = [
    {
      title: "Total Equipamentos",
      value: stats.totalEquipamentos,
      change: "+2 novos esta semana",
      icon: CheckCircle,
      color: "text-chart-1",
      bgColor: "bg-chart-1/20",
      changeColor: "text-green-600",
      changeIcon: TrendingUp,
    },
    {
      title: "Calibrações Vencidas",
      value: stats.calibracoesVencidas,
      change: "Ação necessária",
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-500/20",
      changeColor: "text-red-600",
      changeIcon: AlertTriangle,
    },
    {
      title: "Críticos (≤7 dias)",
      value: stats.criticos,
      change: "Programar urgente",
      icon: AlertTriangle,
      color: "text-orange-500",
      bgColor: "bg-orange-500/20",
      changeColor: "text-orange-600",
      changeIcon: TrendingDown,
    },
    {
      title: "Conformidade",
      value: `${stats.conformidade}%`,
      change: "Meta: 95%",
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/20",
      changeColor: stats.conformidade >= 95 ? "text-green-600" : "text-orange-600",
      changeIcon: stats.conformidade >= 95 ? CheckCircle : AlertTriangle,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {kpiData.map((kpi, index) => (
        <Card key={index} data-testid={`kpi-card-${index}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground" data-testid={`kpi-title-${index}`}>
                  {kpi.title}
                </p>
                <p className="text-3xl font-bold text-foreground" data-testid={`kpi-value-${index}`}>
                  {kpi.value}
                </p>
                <p className={`text-xs mt-1 flex items-center ${kpi.changeColor}`}>
                  <kpi.changeIcon className="w-3 h-3 mr-1" />
                  {kpi.change}
                </p>
              </div>
              <div className={`w-12 h-12 ${kpi.bgColor} rounded-lg flex items-center justify-center`}>
                <kpi.icon className={`${kpi.color} text-xl w-6 h-6`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
