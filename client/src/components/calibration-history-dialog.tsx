import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, FileText, Building2, CheckCircle, AlertCircle } from "lucide-react";
import type { HistoricoCalibracao } from "@shared/schema";

interface CalibrationHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  historico: HistoricoCalibracao[];
  equipmentTag: string;
}

export default function CalibrationHistoryDialog({
  isOpen,
  onClose,
  historico,
  equipmentTag
}: CalibrationHistoryDialogProps) {
  const formatDate = (dateStr?: string | Date) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status?: string | null) => {
    switch (status?.toLowerCase()) {
      case 'conforme':
      case 'aprovado':
        return 'bg-green-100 text-green-800';
      case 'não conforme':
      case 'reprovado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Histórico de Calibrações - {equipmentTag}
          </DialogTitle>
          <DialogDescription>
            Visualize todas as calibrações realizadas neste equipamento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {historico.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Nenhum histórico encontrado</p>
              <p className="text-sm">Este equipamento ainda não possui registros de calibração.</p>
            </div>
          ) : (
            historico.map((item, index) => (
              <Card key={item.id} className="border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <span className="text-muted-foreground">#{historico.length - index}</span>
                        Calibração - {formatDate(item.dataCalibracão)}
                      </h3>
                      {item.tagPontoMedicaoSnapshot && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Ponto de Medição: {item.tagPontoMedicaoSnapshot}
                          {item.nomePontoMedicaoSnapshot && ` - ${item.nomePontoMedicaoSnapshot}`}
                        </p>
                      )}
                    </div>
                    {item.resultado && (
                      <Badge className={getStatusColor(item.resultado)}>
                        {item.resultado === 'conforme' || item.resultado === 'aprovado' ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <AlertCircle className="w-3 h-3 mr-1" />
                        )}
                        {item.resultado}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Certificado Atual */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-muted-foreground border-b pb-2">
                        <FileText className="w-4 h-4 inline mr-1" />
                        Certificado Principal
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Número:</p>
                          <p className="font-medium font-mono">{item.certificadoNumero || 'N/A'}</p>
                        </div>
                        {item.certificadoRevisao && (
                          <div>
                            <p className="text-muted-foreground">Revisão:</p>
                            <p className="font-medium">{item.certificadoRevisao}</p>
                          </div>
                        )}
                        {item.certificadoStatus && (
                          <div>
                            <p className="text-muted-foreground">Status:</p>
                            <Badge variant="outline" className="text-xs">
                              {item.certificadoStatus}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Penúltimo Certificado */}
                    {item.certificadoNumeroPenultimo && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-muted-foreground border-b pb-2">
                          <FileText className="w-4 h-4 inline mr-1" />
                          Penúltimo Certificado
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Número:</p>
                            <p className="font-medium font-mono">{item.certificadoNumeroPenultimo}</p>
                          </div>
                          {item.dataPenultimoCertificado && (
                            <div>
                              <p className="text-muted-foreground">Data:</p>
                              <p className="font-medium">{formatDate(item.dataPenultimoCertificado)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Antepenúltimo Certificado */}
                    {item.certificadoNumeroAntepenultimo && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-muted-foreground border-b pb-2">
                          <FileText className="w-4 h-4 inline mr-1" />
                          Antepenúltimo Certificado
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Número:</p>
                            <p className="font-medium font-mono">{item.certificadoNumeroAntepenultimo}</p>
                          </div>
                          {item.dataAntepenultimoCertificado && (
                            <div>
                              <p className="text-muted-foreground">Data:</p>
                              <p className="font-medium">{formatDate(item.dataAntepenultimoCertificado)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Informações Adicionais */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-4 border-t">
                    {item.laboratorio && (
                      <div className="flex items-start gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div className="text-sm">
                          <p className="text-muted-foreground">Laboratório:</p>
                          <p className="font-medium">{item.laboratorio}</p>
                        </div>
                      </div>
                    )}
                    {item.periodicidadeCalibracao && (
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div className="text-sm">
                          <p className="text-muted-foreground">Periodicidade:</p>
                          <p className="font-medium">{item.periodicidadeCalibracao} meses</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {item.observacao && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-md">
                      <p className="text-sm text-muted-foreground mb-1">Observações:</p>
                      <p className="text-sm">{item.observacao}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
