import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Flame, 
  Cylinder, 
  Gauge, 
  TestTube, 
  Ship, 
  Calendar, 
  AlertCircle,
  TrendingUp,
  Clock,
  ArrowRight,
  MapPin
} from "lucide-react";
import { useLocation } from "wouter";

interface OperationalCardsProps {
  isLoading?: boolean;
}

// Mock data - in real application this would come from props or API calls
const operationalData = {
  proximosTestesPocos: {
    total: 12,
    proximos7dias: 3,
    proximos30dias: 5,
    atrasados: 1,
    proximoTeste: { poco: "POC-001", data: "2025-10-05", instalacao: "FPSO-RJ" }
  },
  cilindros: {
    totalAtivo: 45,
    aguardandoTeste: 8,
    prontos: 32,
    manutencao: 5,
    distribuicao: [
      { instalacao: "FPSO-RJ", quantidade: 15 },
      { instalacao: "FPSO-ES", quantidade: 12 },
      { instalacao: "FPSO-BA", quantidade: 18 }
    ]
  },
  proximasValvulas: {
    total: 28,
    criticas: 4,
    proximas: 8,
    proximaValvula: { tag: "PSV-001", data: "2025-10-03", tipo: "Pressão" }
  },
  cromatografias: {
    ultimasRecebidas: 15,
    pendentesAnalise: 3,
    proximaColeta: "2025-10-07",
    ultimaData: "2025-09-28"
  },
  janelasEmbarque: {
    proximaJanela: "2025-10-08",
    destino: "FPSO-RJ",
    coletasPendentes: 6,
    diasRestantes: 8
  }
};

export default function OperationalCards({ isLoading = false }: OperationalCardsProps) {
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-32 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Seção: Operações de Campo */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Flame className="w-5 h-5 mr-2 text-orange-500" />
          Operações de Campo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card: Próximos Testes de Poços */}
          <Card 
            className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setLocation('/wells')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-blue-700">
                  Próximos Testes de Poços
                </CardTitle>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Flame className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {operationalData.proximosTestesPocos.total}
                    </p>
                    <p className="text-xs text-muted-foreground">testes programados</p>
                  </div>
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    {operationalData.proximosTestesPocos.proximos7dias} próx. 7 dias
                  </Badge>
                </div>
                
                <div className="bg-blue-50 p-2 rounded-md">
                  <p className="text-xs font-medium text-blue-800">Próximo:</p>
                  <p className="text-sm text-blue-700">
                    {operationalData.proximosTestesPocos.proximoTeste.poco} - {operationalData.proximosTestesPocos.proximoTeste.data}
                  </p>
                  <p className="text-xs text-blue-600">
                    {operationalData.proximosTestesPocos.proximoTeste.instalacao}
                  </p>
                </div>
                
                {operationalData.proximosTestesPocos.atrasados > 0 && (
                  <div className="flex items-center text-xs text-orange-600">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {operationalData.proximosTestesPocos.atrasados} teste(s) atrasado(s)
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card: Cilindros nas Instalações */}
          <Card 
            className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setLocation('/gestao-cilindros')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-green-700">
                  Cilindros nas Instalações
                </CardTitle>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Cylinder className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {operationalData.cilindros.totalAtivo}
                    </p>
                    <p className="text-xs text-muted-foreground">cilindros ativos</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">{operationalData.cilindros.prontos}</p>
                    <p className="text-xs text-muted-foreground">prontos</p>
                  </div>
                </div>

                <div className="flex justify-between text-xs">
                  <div className="text-center">
                    <p className="font-medium text-orange-600">{operationalData.cilindros.aguardandoTeste}</p>
                    <p className="text-muted-foreground">aguardando</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-red-600">{operationalData.cilindros.manutencao}</p>
                    <p className="text-muted-foreground">manutenção</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  {operationalData.cilindros.distribuicao.slice(0, 2).map((dist, index) => (
                    <div key={index} className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">{dist.instalacao}</span>
                      <Badge variant="outline" className="text-green-600">{dist.quantidade}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card: Próximas Válvulas a Testar */}
          <Card 
            className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setLocation('/valvulas')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-purple-700">
                  Próximas Válvulas
                </CardTitle>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Gauge className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-purple-600">
                      {operationalData.proximasValvulas.total}
                    </p>
                    <p className="text-xs text-muted-foreground">válvulas programadas</p>
                  </div>
                  <Badge variant="destructive" className="bg-red-100 text-red-600 border-red-200">
                    {operationalData.proximasValvulas.criticas} críticas
                  </Badge>
                </div>
                
                <div className="bg-purple-50 p-2 rounded-md">
                  <p className="text-xs font-medium text-purple-800">Próxima:</p>
                  <p className="text-sm text-purple-700">
                    {operationalData.proximasValvulas.proximaValvula.tag} - {operationalData.proximasValvulas.proximaValvula.data}
                  </p>
                  <p className="text-xs text-purple-600">
                    Válvula de {operationalData.proximasValvulas.proximaValvula.tipo}
                  </p>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Próx. 30 dias:</span>
                  <span className="font-medium text-purple-600">{operationalData.proximasValvulas.proximas}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Seção: Análises e Coletas */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <TestTube className="w-5 h-5 mr-2 text-cyan-500" />
          Análises e Coletas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Card: Últimas Cromatografias */}
          <Card 
            className="border-l-4 border-l-cyan-500 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setLocation('/chemical-analysis')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-cyan-700">
                  Cromatografias Recebidas
                </CardTitle>
                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <TestTube className="w-5 h-5 text-cyan-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-cyan-600">
                      {operationalData.cromatografias.ultimasRecebidas}
                    </p>
                    <p className="text-xs text-muted-foreground">este mês</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-orange-600">
                      {operationalData.cromatografias.pendentesAnalise}
                    </p>
                    <p className="text-xs text-muted-foreground">pendentes</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Última recebida:</span>
                    <span className="font-medium text-cyan-600">{operationalData.cromatografias.ultimaData}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Próxima coleta:</span>
                    <span className="font-medium text-cyan-600">{operationalData.cromatografias.proximaColeta}</span>
                  </div>
                </div>
                
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +3 vs. mês anterior
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card: Janela de Embarque */}
          <Card 
            className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => alert('Funcionalidade de embarque em desenvolvimento')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-orange-700">
                  Próxima Janela de Embarque
                </CardTitle>
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Ship className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-orange-600">
                      {operationalData.janelasEmbarque.diasRestantes}
                    </p>
                    <p className="text-xs text-muted-foreground">dias restantes</p>
                  </div>
                  <Badge variant="outline" className="text-orange-600 border-orange-200">
                    {operationalData.janelasEmbarque.coletasPendentes} coletas
                  </Badge>
                </div>
                
                <div className="bg-orange-50 p-2 rounded-md">
                  <div className="flex items-center mb-1">
                    <Calendar className="w-3 h-3 text-orange-600 mr-1" />
                    <p className="text-xs font-medium text-orange-800">
                      {operationalData.janelasEmbarque.proximaJanela}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 text-orange-600 mr-1" />
                    <p className="text-xs text-orange-700">
                      Destino: {operationalData.janelasEmbarque.destino}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center text-xs text-orange-600">
                  <Clock className="w-3 h-3 mr-1" />
                  Preparar documentação e amostras
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card: Status Geral das Operações */}
          <Card 
            className="border-l-4 border-l-indigo-500 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setLocation('/reports')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-indigo-700">
                  Status Operacional
                </CardTitle>
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-green-50 p-2 rounded text-center">
                    <p className="font-bold text-green-600">87%</p>
                    <p className="text-green-700">Eficiência</p>
                  </div>
                  <div className="bg-blue-50 p-2 rounded text-center">
                    <p className="font-bold text-blue-600">94%</p>
                    <p className="text-blue-700">Pontualidade</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Atividades abertas:</span>
                    <span className="font-medium text-indigo-600">23</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Concluídas hoje:</span>
                    <span className="font-medium text-green-600">8</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Pendências:</span>
                    <span className="font-medium text-orange-600">5</span>
                  </div>
                </div>
                
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Ver Relatório Completo
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}