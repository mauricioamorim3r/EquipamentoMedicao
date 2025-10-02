import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  HelpCircle, 
  Users, 
  Building2, 
  Wrench, 
  Circle, 
  Ruler, 
  Gauge, 
  FlaskConical,
  Calendar,
  FileText,
  Settings,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  MapPin,
  Flame
} from "lucide-react";

export default function Help() {
  const [activeSection, setActiveSection] = useState("getting-started");

  const prerequisitesFlow = [
    {
      step: 1,
      title: "Polos",
      icon: <Flame className="w-5 h-5" />,
      description: "Primeiro, cadastre os polos (regiões geográficas)",
      fields: ["Nome", "Sigla"],
      example: "Polo de Búzios (BUZ)"
    },
    {
      step: 2,
      title: "Campos",
      icon: <MapPin className="w-5 h-5" />,
      description: "Cadastre os campos vinculados aos polos",
      fields: ["Nome", "Sigla", "Polo"],
      example: "Campo de Búzios vinculado ao Polo BUZ",
      requires: ["Polos"]
    },
    {
      step: 3,
      title: "Instalações",
      icon: <Building2 className="w-5 h-5" />,
      description: "Cadastre as instalações (FPSOs, plataformas)",
      fields: ["Nome", "Sigla", "Polo"],
      example: "FPSO Búzios V",
      requires: ["Polos"]
    },
    {
      step: 4,
      title: "Equipamentos",
      icon: <Wrench className="w-5 h-5" />,
      description: "Cadastre os equipamentos de medição",
      fields: ["TAG", "Nome", "Tipo", "Fabricante", "Polo", "Instalação"],
      example: "PO-GAS-001-BUZ - Placa de Orifício",
      requires: ["Polos", "Instalações"]
    },
    {
      step: 5,
      title: "Componentes Específicos",
      icon: <Circle className="w-5 h-5" />,
      description: "Cadastre componentes específicos (placas, válvulas, etc.)",
      fields: ["Dados técnicos", "Equipamento vinculado"],
      example: "Placa de Orifício DN200 para equipamento PO-GAS-001-BUZ",
      requires: ["Equipamentos"]
    }
  ];

  const fieldGuides = {
    equipamentos: {
      title: "Equipamentos",
      icon: <Wrench className="w-5 h-5" />,
      requiredFields: [
        { name: "TAG", description: "Identificação única do equipamento", example: "PO-GAS-001-BUZ", rules: "Formato: [TIPO]-[FLUIDO]-[NUM]-[POLO]" },
        { name: "Nome", description: "Nome descritivo do equipamento", example: "Placa Orifício Medição Gás Principal" },
        { name: "Número de Série", description: "Número de série do fabricante", example: "PO001-2024" },
        { name: "Tipo", description: "Tipo do equipamento", example: "Placa de Orifício, Trecho Reto, Válvula" },
        { name: "Fabricante", description: "Fabricante do equipamento", example: "Daniel Measurement, Cameron" },
        { name: "Modelo", description: "Modelo específico", example: "PO-DN200-Beta065" }
      ],
      optionalFields: [
        { name: "Polo", description: "Polo onde está instalado", requires: "Cadastro de Polos" },
        { name: "Instalação", description: "Instalação onde está localizado", requires: "Cadastro de Instalações" },
        { name: "Faixa de Medição", description: "Faixa mínima e máxima de operação" },
        { name: "Unidade", description: "Unidade de medição (m³/h, bar, etc.)" },
        { name: "Frequência de Calibração", description: "Período em meses para calibração" }
      ]
    },
    placasOrificio: {
      title: "Placas de Orifício",
      icon: <Circle className="w-5 h-5" />,
      requiredFields: [
        { name: "Equipamento", description: "Equipamento ao qual a placa pertence", requires: "Cadastro de Equipamentos" },
        { name: "Diâmetro Nominal", description: "Diâmetro nominal da tubulação", example: "200 mm" },
        { name: "Diâmetro do Orifício", description: "Diâmetro do furo da placa", example: "130 mm" },
        { name: "Relação Beta", description: "Relação entre diâmetros", example: "0.65" }
      ],
      optionalFields: [
        { name: "Material", description: "Material da placa", example: "AISI 316L" },
        { name: "Espessura", description: "Espessura da placa", example: "3.2 mm" },
        { name: "Certificado", description: "Número do certificado de calibração" }
      ]
    },
    valvulas: {
      title: "Válvulas",
      icon: <Gauge className="w-5 h-5" />,
      requiredFields: [
        { name: "TAG da Válvula", description: "Identificação única da válvula", example: "VL-GAS-001-BUZ" },
        { name: "Número de Série", description: "Número de série da válvula", example: "VL001-2024" }
      ],
      optionalFields: [
        { name: "Tipo", description: "Tipo da válvula", example: "Bloqueio, Controle, Segurança" },
        { name: "Fabricante", description: "Fabricante da válvula", example: "Cameron, Fisher" },
        { name: "Modelo", description: "Modelo específico", example: "DB-600-DN200" },
        { name: "Diâmetro Nominal", description: "Diâmetro nominal em mm", example: "200" },
        { name: "Classe de Pressão", description: "Classe de pressão", example: "600, 900, 1500" }
      ]
    }
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center mb-6">
        <HelpCircle className="w-8 h-8 text-primary mr-3" />
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Central de Ajuda SGM
          </h1>
          <p className="text-muted-foreground">
            Guia completo para utilização do Sistema de Gestão Metrológica
          </p>
        </div>
      </div>

      <Tabs value={activeSection} onValueChange={setActiveSection} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="getting-started">Começando</TabsTrigger>
          <TabsTrigger value="prerequisites">Pré-requisitos</TabsTrigger>
          <TabsTrigger value="field-guides">Guia de Campos</TabsTrigger>
          <TabsTrigger value="workflows">Fluxos de Trabalho</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto mt-4">
          <TabsContent value="getting-started" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  Bem-vindo ao SGM
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Importante:</strong> Este sistema segue uma hierarquia de dados. 
                    Certifique-se de cadastrar os itens na ordem correta.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">🎯 Objetivo do Sistema</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Gerenciar equipamentos de medição, calibrações, certificações 
                        e garantir conformidade metrológica em operações offshore.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">📋 Principais Funcionalidades</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2">
                        <li>• Gestão de equipamentos e componentes</li>
                        <li>• Controle de calibrações e vencimentos</li>
                        <li>• Import/Export de dados via Excel</li>
                        <li>• Notificações automáticas</li>
                        <li>• Relatórios e dashboards</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prerequisites" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>🔗 Fluxo de Pré-requisitos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prerequisitesFlow.map((item, index) => (
                    <div key={item.step} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                          {item.step}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {item.icon}
                          <h3 className="font-semibold">{item.title}</h3>
                          {item.requires && (
                            <Badge variant="outline" className="text-xs">
                              Requer: {item.requires.join(", ")}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                        <p className="text-xs text-primary font-medium">
                          Exemplo: {item.example}
                        </p>
                        <div className="mt-2">
                          <span className="text-xs text-muted-foreground">Campos: </span>
                          {item.fields.map((field, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs mr-1">
                              {field}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {index < prerequisitesFlow.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-muted-foreground mt-2" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="field-guides" className="space-y-6">
            <Accordion type="single" collapsible className="w-full">
              {Object.entries(fieldGuides).map(([key, guide]) => (
                <AccordionItem key={key} value={key}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center space-x-2">
                      {guide.icon}
                      <span>{guide.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg text-red-600">Campos Obrigatórios</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {guide.requiredFields.map((field, idx) => (
                              <div key={idx} className="border-l-4 border-red-500 pl-4">
                                <h4 className="font-semibold text-sm">{field.name}</h4>
                                <p className="text-sm text-muted-foreground">{field.description}</p>
                                {field.example && (
                                  <p className="text-xs text-primary">Exemplo: {field.example}</p>
                                )}
                                {field.rules && (
                                  <p className="text-xs text-orange-600">Regra: {field.rules}</p>
                                )}
                                {field.requires && (
                                  <Badge variant="outline" className="text-xs mt-1">
                                    Requer: {field.requires}
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg text-blue-600">Campos Opcionais</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {guide.optionalFields.map((field, idx) => (
                              <div key={idx} className="border-l-4 border-blue-500 pl-4">
                                <h4 className="font-semibold text-sm">{field.name}</h4>
                                <p className="text-sm text-muted-foreground">{field.description}</p>
                                {field.example && (
                                  <p className="text-xs text-primary">Exemplo: {field.example}</p>
                                )}
                                {field.requires && (
                                  <Badge variant="outline" className="text-xs mt-1">
                                    Requer: {field.requires}
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>

          <TabsContent value="workflows" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Fluxo de Cadastro Inicial
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="text-sm space-y-2">
                    <li>1. Cadastrar <strong>Polos</strong> (regiões)</li>
                    <li>2. Cadastrar <strong>Campos</strong> vinculados aos polos</li>
                    <li>3. Cadastrar <strong>Instalações</strong> (FPSOs/plataformas)</li>
                    <li>4. Cadastrar <strong>Equipamentos</strong> principais</li>
                    <li>5. Cadastrar <strong>Pontos de Medição</strong></li>
                    <li>6. Cadastrar <strong>Componentes específicos</strong></li>
                  </ol>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Fluxo de Calibração
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="text-sm space-y-2">
                    <li>1. Verificar <strong>Notificações</strong> de vencimento</li>
                    <li>2. Acessar <strong>Plano de Calibrações</strong></li>
                    <li>3. Executar calibração via <strong>Execução de Calibrações</strong></li>
                    <li>4. Upload do certificado</li>
                    <li>5. Verificar no <strong>Histórico</strong></li>
                  </ol>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Import/Export de Dados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="text-sm space-y-2">
                    <li>1. <strong>Baixar Template</strong> na página desejada</li>
                    <li>2. Preencher dados no Excel seguindo exemplos</li>
                    <li>3. Verificar pré-requisitos (polos, instalações)</li>
                    <li>4. Fazer <strong>Upload</strong> do arquivo</li>
                    <li>5. Verificar mensagens de erro/sucesso</li>
                  </ol>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Resolução de Problemas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-2">
                    <li>• <strong>Equipamento não aparece:</strong> Verificar se polo/instalação estão cadastrados</li>
                    <li>• <strong>Erro no import:</strong> Verificar formato do template e pré-requisitos</li>
                    <li>• <strong>Calibração não salva:</strong> Verificar se equipamento existe</li>
                    <li>• <strong>Notificação não funciona:</strong> Verificar data de calibração</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}