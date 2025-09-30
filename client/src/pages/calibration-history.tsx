import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  History, 
  Download, 
  FileText, 
  Calendar, 
  Filter,
  ChevronDown,
  ChevronUp,
  Search
} from "lucide-react";
import { api } from "@/lib/api";
import type { CertificadoCalibracao } from "@shared/schema";

export default function CalibrationHistory() {
  const [selectedEquipment, setSelectedEquipment] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedEquipment, setExpandedEquipment] = useState<number | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificadoCalibracao | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const { data: certificados, isLoading: certificatesLoading } = useQuery({
    queryKey: ["/api/certificados-calibracao"],
    queryFn: () => api.getCertificadosCalibração(),
  });

  const { data: equipamentos } = useQuery({
    queryKey: ["/api/equipamentos"],
    queryFn: () => api.getEquipamentos(),
  });

  // Group certificates by equipment
  const certificatesByEquipment = certificados?.reduce((acc: Record<number, CertificadoCalibracao[]>, cert: CertificadoCalibracao) => {
    if (!acc[cert.equipamentoId]) {
      acc[cert.equipamentoId] = [];
    }
    acc[cert.equipamentoId].push(cert);
    return acc;
  }, {} as Record<number, CertificadoCalibracao[]>) || {};

  // Sort certificates by date (newest first) for each equipment
  Object.keys(certificatesByEquipment).forEach(key => {
    certificatesByEquipment[parseInt(key)].sort((a: CertificadoCalibracao, b: CertificadoCalibracao) => 
      new Date(b.dataCertificado).getTime() - new Date(a.dataCertificado).getTime()
    );
  });

  const filteredEquipments = equipamentos?.filter((eq: any) => {
    const matchesEquipment = selectedEquipment === "all" || eq.id.toString() === selectedEquipment;
    const matchesSearch = searchTerm === "" || 
      eq.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.numeroSerie.toLowerCase().includes(searchTerm.toLowerCase());
    
    const hasCertificates = certificatesByEquipment[eq.id] && certificatesByEquipment[eq.id].length > 0;
    
    if (selectedStatus !== "all") {
      const certificates = certificatesByEquipment[eq.id] || [];
      const latestCert = certificates[0];
      if (selectedStatus === "valido" && (!latestCert || latestCert.statusCertificado !== "valido")) return false;
      if (selectedStatus === "vencido" && (!latestCert || latestCert.statusCertificado !== "vencido")) return false;
    }
    
    return matchesEquipment && matchesSearch && hasCertificates;
  }) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valido':
        return <Badge className="bg-green-100 text-green-800">Válido</Badge>;
      case 'vencido':
        return <Badge className="bg-red-100 text-red-800">Vencido</Badge>;
      case 'cancelado':
        return <Badge className="bg-gray-100 text-gray-800">Cancelado</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Sem Status</Badge>;
    }
  };

  const getOrderBadge = (ordem: number) => {
    switch (ordem) {
      case 1:
        return <Badge className="bg-green-100 text-green-800">Atual</Badge>;
      case 2:
        return <Badge className="bg-blue-100 text-blue-800">Anterior</Badge>;
      case 3:
        return <Badge className="bg-gray-100 text-gray-800">Histórico</Badge>;
      default:
        return <Badge className="bg-purple-100 text-purple-800">Arquivado</Badge>;
    }
  };

  const handleViewCertificate = (certificate: CertificadoCalibracao) => {
    setSelectedCertificate(certificate);
    setIsDetailDialogOpen(true);
  };

  const toggleEquipmentExpansion = (equipmentId: number) => {
    setExpandedEquipment(expandedEquipment === equipmentId ? null : equipmentId);
  };

  const exportHistory = (equipmentId?: number) => {
    // TODO: Implement export functionality
    console.log("Export history for:", equipmentId || "all");
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Histórico Geral de Calibrações
          </h1>
          <p className="text-muted-foreground">
            Visualize o histórico completo de todos os certificados por equipamento
          </p>
        </div>
        <Button onClick={() => exportHistory()}>
          <Download className="h-4 w-4 mr-2" />
          Exportar Histórico
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por equipamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Equipamentos</SelectItem>
                  {equipamentos?.map((eq: any) => (
                    <SelectItem key={eq.id} value={eq.id.toString()}>
                      {eq.tag} - {eq.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="valido">Válido</SelectItem>
                  <SelectItem value="vencido">Vencido</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por TAG, nome ou número de série..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="space-y-4">
        {certificatesLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-muted-foreground">Carregando histórico...</p>
          </div>
        ) : filteredEquipments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Nenhum histórico encontrado</h3>
              <p className="text-muted-foreground">
                Não há certificados de calibração para os filtros selecionados
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredEquipments.map((equipment: any) => {
            const certificates = certificatesByEquipment[equipment.id] || [];
            const isExpanded = expandedEquipment === equipment.id;
            const latestCert = certificates[0];

            return (
              <Card key={equipment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleEquipmentExpansion(equipment.id)}
                      >
                        {isExpanded ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                        }
                      </Button>
                      <div>
                        <CardTitle className="text-lg">
                          {equipment.tag} - {equipment.nome}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Série: {equipment.numeroSerie} | Total de certificados: {certificates.length}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {latestCert && getStatusBadge(latestCert.statusCertificado)}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => exportHistory(equipment.id)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ordem</TableHead>
                          <TableHead>Número</TableHead>
                          <TableHead>Revisão</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Laboratório</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {certificates.map((cert: CertificadoCalibracao, index: number) => (
                          <TableRow key={cert.id}>
                            <TableCell>
                              {getOrderBadge(cert.ordemCertificado)}
                            </TableCell>
                            <TableCell className="font-medium">
                              {cert.numeroCertificado}
                            </TableCell>
                            <TableCell>
                              {cert.revisaoCertificado || 'N/A'}
                            </TableCell>
                            <TableCell>
                              {new Date(cert.dataCertificado).toLocaleDateString('pt-BR')}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(cert.statusCertificado)}
                            </TableCell>
                            <TableCell>
                              {cert.laboratorio || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewCertificate(cert)}
                                >
                                  <FileText className="h-4 w-4 mr-1" />
                                  Detalhes
                                </Button>
                                {cert.certificadoPath && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => cert.certificadoPath && window.open(cert.certificadoPath, '_blank')}
                                  >
                                    <Download className="h-4 w-4 mr-1" />
                                    Baixar
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Certificate Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Detalhes do Certificado {selectedCertificate?.numeroCertificado}
            </DialogTitle>
          </DialogHeader>
          
          {selectedCertificate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Equipamento:</span>
                  <p>{selectedCertificate.tagEquipamento} - {selectedCertificate.nomeEquipamento}</p>
                </div>
                <div>
                  <span className="font-medium">Número de Série:</span>
                  <p>{selectedCertificate.numeroSerieEquipamento}</p>
                </div>
                <div>
                  <span className="font-medium">Número do Certificado:</span>
                  <p>{selectedCertificate.numeroCertificado}</p>
                </div>
                <div>
                  <span className="font-medium">Revisão:</span>
                  <p>{selectedCertificate.revisaoCertificado || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium">Data:</span>
                  <p>{new Date(selectedCertificate.dataCertificado).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <div>{getStatusBadge(selectedCertificate.statusCertificado)}</div>
                </div>
                <div>
                  <span className="font-medium">Laboratório:</span>
                  <p>{selectedCertificate.laboratorio || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium">Periodicidade:</span>
                  <p>{selectedCertificate.periodicidadeCalibracao ? 
                    `${selectedCertificate.periodicidadeCalibracao} dias` : 'N/A'}</p>
                </div>
              </div>

              {selectedCertificate.responsavelTecnico && (
                <div>
                  <span className="font-medium">Responsável Técnico:</span>
                  <p>{selectedCertificate.responsavelTecnico}</p>
                </div>
              )}

              {selectedCertificate.resultadoCalibracao && (
                <div>
                  <span className="font-medium">Resultado da Calibração:</span>
                  <p className="text-sm">{selectedCertificate.resultadoCalibracao}</p>
                </div>
              )}

              {selectedCertificate.incertezaExpandida && (
                <div>
                  <span className="font-medium">Incerteza Expandida:</span>
                  <p>{selectedCertificate.incertezaExpandida}</p>
                </div>
              )}

              {selectedCertificate.analiseCriticaResultados && (
                <div>
                  <span className="font-medium">Análise Crítica dos Resultados:</span>
                  <p className="text-sm">{selectedCertificate.analiseCriticaResultados}</p>
                </div>
              )}

              {selectedCertificate.observacoes && (
                <div>
                  <span className="font-medium">Observações:</span>
                  <p className="text-sm">{selectedCertificate.observacoes}</p>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                {selectedCertificate.certificadoPath && (
                  <Button
                    onClick={() => selectedCertificate.certificadoPath && window.open(selectedCertificate.certificadoPath, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Certificado
                  </Button>
                )}
                <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}