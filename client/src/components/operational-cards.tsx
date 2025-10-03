import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Flame, 
  Cylinder, 
  Gauge, 
  TestTube, 
  Calendar, 
  AlertCircle,
  TrendingUp,
  Clock,
  ArrowRight,
  MapPin
} from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface OperationalCardsProps {
  isLoading?: boolean;
}



export default function OperationalCards({ isLoading = false }: OperationalCardsProps) {
  const [, setLocation] = useLocation();

  // Query real data from APIs
  const { data: testesPocos = [] } = useQuery({
    queryKey: ["/api/testes-pocos"],
    queryFn: () => api.getTestesPocos(),
  });

  const { data: cilindros = [] } = useQuery({
    queryKey: ["/api/gestao-cilindros"],
    queryFn: () => api.getGestaoCilindros(),
  });

  const { data: valvulas = [] } = useQuery({
    queryKey: ["/api/valvulas"],
    queryFn: () => api.getValvulas(),
  });

  const { data: planosColeta = [] } = useQuery({
    queryKey: ["/api/planos-coleta"],
    queryFn: () => api.getPlanosColeta(),
  });

  const { data: trechosRetos = [] } = useQuery({
    queryKey: ["/api/trechos-retos"],
    queryFn: () => api.getTrechosRetos(),
  });

  const { data: placasOrificio = [] } = useQuery({
    queryKey: ["/api/placas-orificio"],
    queryFn: () => api.getPlacasOrificio(),
  });

  // Calculate real operational data from queries
  const operationalData = {
    proximosTestesPocos: {
      total: testesPocos.length,
      proximos7dias: testesPocos.filter((t: any) => {
        if (!t.dataProximoTeste) return false;
        const proxima = new Date(t.dataProximoTeste);
        const hoje = new Date();
        const diff = Math.ceil((proxima.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        return diff >= 0 && diff <= 7;
      }).length,
      proximos30dias: testesPocos.filter((t: any) => {
        if (!t.dataProximoTeste) return false;
        const proxima = new Date(t.dataProximoTeste);
        const hoje = new Date();
        const diff = Math.ceil((proxima.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        return diff >= 0 && diff <= 30;
      }).length,
      atrasados: testesPocos.filter((t: any) => {
        if (!t.dataProximoTeste) return false;
        const proxima = new Date(t.dataProximoTeste);
        const hoje = new Date();
        return proxima < hoje;
      }).length,
      proximoTeste: testesPocos.length > 0 ? {
        poco: testesPocos[0].pocoId || 'N/A',
        data: testesPocos[0].dataProximoTeste || 'N/A',
        instalacao: 'N/A'
      } : null
    },
    cilindros: {
      totalAtivo: cilindros.length,
      aguardandoTeste: cilindros.filter((c: any) => c.status === 'aguardando_teste').length,
      prontos: cilindros.filter((c: any) => c.status === 'pronto').length,
      manutencao: cilindros.filter((c: any) => c.status === 'manutencao').length,
      distribuicao: []
    },
    proximasValvulas: {
      total: valvulas.length,
      criticas: valvulas.filter((v: any) => {
        if (!v.proximaCalibracao) return false;
        const proxima = new Date(v.proximaCalibracao);
        const hoje = new Date();
        const diff = Math.ceil((proxima.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        return diff <= 7;
      }).length,
      proximas: valvulas.filter((v: any) => {
        if (!v.proximaCalibracao) return false;
        const proxima = new Date(v.proximaCalibracao);
        const hoje = new Date();
        const diff = Math.ceil((proxima.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        return diff > 7 && diff <= 30;
      }).length,
      proximaValvula: valvulas.length > 0 ? {
        tag: valvulas[0].tag || 'N/A',
        data: valvulas[0].proximaCalibracao || 'N/A',
        tipo: valvulas[0].tipoValvula || 'N/A'
      } : null
    },
    cromatografias: {
      ultimasRecebidas: planosColeta.filter((p: any) => p.status === 'concluido').length,
      pendentesAnalise: planosColeta.filter((p: any) => p.status === 'laboratorio').length,
      proximaColeta: planosColeta.find((p: any) => p.status === 'agendado')?.dataColeta || null,
      ultimaData: planosColeta.filter((p: any) => p.status === 'concluido').sort((a: any, b: any) => 
        new Date(b.dataColeta || 0).getTime() - new Date(a.dataColeta || 0).getTime()
      )[0]?.dataColeta || null
    },
    trechosRetos: {
      total: trechosRetos.length,
      ativos: trechosRetos.filter((tr: any) => tr.status !== 'inativo').length,
      aguardandoInspecao: trechosRetos.filter((tr: any) => {
        if (!tr.dataInspecao) return false;
        const inspecao = new Date(tr.dataInspecao);
        const hoje = new Date();
        const diff = Math.ceil((hoje.getTime() - inspecao.getTime()) / (1000 * 60 * 60 * 24));
        return diff > 365; // Mais de 1 ano desde última inspeção
      }).length,
      proximoTrecho: trechosRetos.length > 0 ? {
        numeroSerie: trechosRetos[0].numeroSerie || 'N/A',
        dataInspecao: trechosRetos[0].dataInspecao || 'N/A',
        classe: trechosRetos[0].classe || 'N/A'
      } : null
    },
    placasOrificio: {
      total: placasOrificio.length,
      ativas: placasOrificio.filter((po: any) => po.status !== 'inativa').length,
      aguardandoInspecao: placasOrificio.filter((po: any) => {
        if (!po.dataInspecao) return false;
        const inspecao = new Date(po.dataInspecao);
        const hoje = new Date();
        const diff = Math.ceil((hoje.getTime() - inspecao.getTime()) / (1000 * 60 * 60 * 24));
        return diff > 180; // Mais de 6 meses desde última inspeção
      }).length,
      proximaPlaca: placasOrificio.length > 0 ? {
        numeroSerie: placasOrificio[0].numeroSerie || 'N/A',
        dataInspecao: placasOrificio[0].dataInspecao || 'N/A',
        diametroOrificio: placasOrificio[0].diametroOrificio20c || 'N/A'
      } : null
    }
  };

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
                
                {operationalData.proximosTestesPocos.proximoTeste ? (
                  <div className="bg-blue-50 p-2 rounded-md">
                    <p className="text-xs font-medium text-blue-800">Próximo:</p>
                    <p className="text-sm text-blue-700">
                      {operationalData.proximosTestesPocos.proximoTeste.poco} - {operationalData.proximosTestesPocos.proximoTeste.data}
                    </p>
                    <p className="text-xs text-blue-600">
                      {operationalData.proximosTestesPocos.proximoTeste.instalacao}
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-2 rounded-md">
                    <p className="text-xs text-gray-600">Nenhum teste programado</p>
                  </div>
                )}
                
                {operationalData.proximosTestesPocos.atrasados > 0 && (
                  <div className="flex items-center text-xs text-orange-700">
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
                  <Cylinder className="w-5 h-5 text-green-700" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-green-700">
                      {operationalData.cilindros.totalAtivo}
                    </p>
                    <p className="text-xs text-muted-foreground">cilindros ativos</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-700">{operationalData.cilindros.prontos}</p>
                    <p className="text-xs text-muted-foreground">prontos</p>
                  </div>
                </div>

                <div className="flex justify-between text-xs">
                  <div className="text-center">
                    <p className="font-medium text-orange-700">{operationalData.cilindros.aguardandoTeste}</p>
                    <p className="text-muted-foreground">aguardando</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-red-600">{operationalData.cilindros.manutencao}</p>
                    <p className="text-muted-foreground">manutenção</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  {operationalData.cilindros && operationalData.cilindros.distribuicao ? 
                    operationalData.cilindros.distribuicao.slice(0, 2).map((dist, index) => (
                      <div key={index} className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">{dist.instalacao}</span>
                        <Badge variant="outline" className="text-green-700">{dist.quantidade}</Badge>
                      </div>
                    )) : (
                      <p className="text-xs text-muted-foreground">Aguardando dados...</p>
                    )
                  }
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
                
                {operationalData.proximasValvulas.proximaValvula ? (
                  <div className="bg-purple-50 p-2 rounded-md">
                    <p className="text-xs font-medium text-purple-800">Próxima:</p>
                    <p className="text-sm text-purple-700">
                      {operationalData.proximasValvulas.proximaValvula.tag} - {operationalData.proximasValvulas.proximaValvula.data}
                    </p>
                    <p className="text-xs text-purple-600">
                      Válvula de {operationalData.proximasValvulas.proximaValvula.tipo}
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-2 rounded-md">
                    <p className="text-xs text-gray-600">Nenhuma válvula programada</p>
                  </div>
                )}
                
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
                  <TestTube className="w-5 h-5 text-cyan-700" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-cyan-700">
                      {operationalData.cromatografias.ultimasRecebidas}
                    </p>
                    <p className="text-xs text-muted-foreground">este mês</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-orange-700">
                      {operationalData.cromatografias.pendentesAnalise}
                    </p>
                    <p className="text-xs text-muted-foreground">pendentes</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Última recebida:</span>
                    <span className="font-medium text-cyan-700">{operationalData.cromatografias.ultimaData}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Próxima coleta:</span>
                    <span className="font-medium text-cyan-700">{operationalData.cromatografias.proximaColeta}</span>
                  </div>
                </div>
                
                <div className="flex items-center text-xs text-green-700">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +3 vs. mês anterior
                </div>
              </div>
            </CardContent>
          </Card>



          {/* Card: Trechos Retos */}
          <Card 
            className="border-l-4 border-l-violet-500 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setLocation('/trechos-retos')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-violet-700">
                  Trechos Retos
                </CardTitle>
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                  <Gauge className="w-5 h-5 text-violet-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-violet-600">
                      {operationalData.trechosRetos.total}
                    </p>
                    <p className="text-xs text-muted-foreground">total instalados</p>
                  </div>
                  <Badge variant="outline" className="text-violet-600 border-violet-200">
                    {operationalData.trechosRetos.ativos} ativos
                  </Badge>
                </div>
                
                {operationalData.trechosRetos.proximoTrecho ? (
                  <div className="bg-violet-50 p-2 rounded-md">
                    <p className="text-xs font-medium text-violet-800">Próxima Inspeção:</p>
                    <p className="text-sm text-violet-700">
                      {operationalData.trechosRetos.proximoTrecho.numeroSerie} - Classe {operationalData.trechosRetos.proximoTrecho.classe}
                    </p>
                    <p className="text-xs text-violet-600">
                      Última: {operationalData.trechosRetos.proximoTrecho.dataInspecao}
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-2 rounded-md">
                    <p className="text-xs text-gray-600">Nenhum trecho cadastrado</p>
                  </div>
                )}
                
                {operationalData.trechosRetos.aguardandoInspecao > 0 && (
                  <div className="flex items-center text-xs text-orange-700">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {operationalData.trechosRetos.aguardandoInspecao} aguardando inspeção
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card: Placas de Orifício */}
          <Card 
            className="border-l-4 border-l-pink-500 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setLocation('/placas-orificio')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-pink-700">
                  Placas de Orifício
                </CardTitle>
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-pink-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-pink-600">
                      {operationalData.placasOrificio.total}
                    </p>
                    <p className="text-xs text-muted-foreground">placas instaladas</p>
                  </div>
                  <Badge variant="outline" className="text-pink-600 border-pink-200">
                    {operationalData.placasOrificio.ativas} ativas
                  </Badge>
                </div>
                
                {operationalData.placasOrificio.proximaPlaca ? (
                  <div className="bg-pink-50 p-2 rounded-md">
                    <p className="text-xs font-medium text-pink-800">Próxima Verificação:</p>
                    <p className="text-sm text-pink-700">
                      {operationalData.placasOrificio.proximaPlaca.numeroSerie}
                    </p>
                    <p className="text-xs text-pink-600">
                      Ø {operationalData.placasOrificio.proximaPlaca.diametroOrificio}mm - {operationalData.placasOrificio.proximaPlaca.dataInspecao}
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-2 rounded-md">
                    <p className="text-xs text-gray-600">Nenhuma placa cadastrada</p>
                  </div>
                )}
                
                {operationalData.placasOrificio.aguardandoInspecao > 0 && (
                  <div className="flex items-center text-xs text-orange-700">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {operationalData.placasOrificio.aguardandoInspecao} aguardando verificação
                  </div>
                )}
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
                    <p className="font-bold text-green-700">87%</p>
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
                    <span className="font-medium text-green-700">8</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Pendências:</span>
                    <span className="font-medium text-orange-700">5</span>
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