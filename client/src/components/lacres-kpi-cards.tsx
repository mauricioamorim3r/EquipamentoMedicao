import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";

interface LacresKPIs {
  totalLacresFisicos: number;
  totalLacresEletronicos: number;
  totalControleLacres: number;
  lacresViolados: number;
  percentualViolacao: number;
  lacresAtivos: number;
}

export default function LacresKpiCards() {
  const { data: kpis, isLoading } = useQuery<LacresKPIs>({
    queryKey: ["lacres-kpis"],
    queryFn: async () => {
      const response = await fetch("/api/lacres/kpis");
      if (!response.ok) throw new Error("Erro ao buscar KPIs de lacres");
      return response.json();
    },
    refetchInterval: 60000, // Atualiza a cada minuto
  });

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="h-6 bg-muted rounded"></CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!kpis) return null;

  const kpiData = [
    {
      title: "Lacres Físicos",
      value: kpis.totalLacresFisicos,
      subtitle: "Total registrados",
      icon: Shield,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Lacres Eletrônicos",
      value: kpis.totalLacresEletronicos,
      subtitle: "Total registrados",
      icon: Shield,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Lacres Violados",
      value: kpis.lacresViolados,
      subtitle: `${kpis.percentualViolacao}% do total`,
      icon: AlertTriangle,
      color: kpis.lacresViolados > 0 ? "text-red-600" : "text-green-600",
      bgColor: kpis.lacresViolados > 0 ? "bg-red-100" : "bg-green-100",
    },
    {
      title: "Lacres Íntegros",
      value: kpis.lacresAtivos,
      subtitle: `${(100 - kpis.percentualViolacao).toFixed(1)}% do total`,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Controle de Lacres
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiData.map((kpi, index) => (
            <div key={index} className="flex items-center space-x-3 p-4 rounded-lg border bg-card">
              <div className={`w-12 h-12 ${kpi.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <kpi.icon className={`${kpi.color} w-6 h-6`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground truncate">
                  {kpi.title}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {kpi.value}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {kpi.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Status summary */}
        <div className="mt-4 p-3 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total de lacres controlados</span>
            <span className="font-medium">{kpis.totalControleLacres}</span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${kpis.percentualViolacao > 10 ? 'bg-red-500 w-1/2' : kpis.percentualViolacao > 5 ? 'bg-yellow-500 w-3/4' : 'bg-green-500 w-full'}`}
            ></div>
          </div>
          <div className="flex items-center justify-between text-xs mt-1 text-muted-foreground">
            <span>Integridade: {(100 - kpis.percentualViolacao).toFixed(1)}%</span>
            <span className={kpis.percentualViolacao > 10 ? 'text-red-600' : kpis.percentualViolacao > 5 ? 'text-yellow-600' : 'text-green-600'}>
              {kpis.percentualViolacao > 10 ? 'Crítico' : kpis.percentualViolacao > 5 ? 'Atenção' : 'Excelente'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}