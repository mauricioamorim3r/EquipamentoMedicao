import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Edit, History, QrCode, MapPin, Settings, FileText } from "lucide-react";
import type { EquipmentWithCalibration } from "@/types";

interface EquipmentModalProps {
  equipment: EquipmentWithCalibration | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (equipment: EquipmentWithCalibration) => void;
  onScheduleCalibration?: (equipment: EquipmentWithCalibration) => void;
}

export default function EquipmentModal({ 
  equipment, 
  isOpen, 
  onClose,
  onEdit,
  onScheduleCalibration 
}: EquipmentModalProps) {
  if (!equipment) return null;

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800';
      case 'inativo': return 'bg-gray-100 text-gray-800';
      case 'manutencao': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCalibrationStatusColor = (dias?: number) => {
    if (!dias && dias !== 0) return 'bg-gray-100 text-gray-800';
    if (dias <= 0) return 'bg-red-100 text-red-800';
    if (dias <= 7) return 'bg-orange-100 text-orange-800';
    if (dias <= 30) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getCalibrationStatusText = (dias?: number) => {
    if (!dias && dias !== 0) return 'Sem dados';
    if (dias <= 0) return 'Vencido';
    if (dias <= 7) return 'Crítico';
    if (dias <= 30) return 'Alerta';
    return 'OK';
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-screen overflow-y-auto" data-testid="equipment-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span data-testid="modal-title">Detalhes do Equipamento</span>
            <div className="flex space-x-2">
              <Badge className={getStatusColor(equipment.status)} data-testid="equipment-status">
                {equipment.status}
              </Badge>
              <Badge className={getCalibrationStatusColor(equipment.diasParaVencer)} data-testid="calibration-status">
                {getCalibrationStatusText(equipment.diasParaVencer)}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground border-b border-border pb-2">
              Informações Básicas
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">TAG:</p>
                <p className="font-medium font-mono" data-testid="equipment-tag">{equipment.tag}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Nome:</p>
                <p className="font-medium" data-testid="equipment-name">{equipment.nome}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Fabricante:</p>
                <p className="font-medium" data-testid="equipment-manufacturer">{equipment.fabricante || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Modelo:</p>
                <p className="font-medium" data-testid="equipment-model">{equipment.modelo || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Polo ID:</p>
                <p className="font-medium" data-testid="equipment-polo">{equipment.poloId}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Instalação ID:</p>
                <p className="font-medium" data-testid="equipment-installation">{equipment.instalacaoId}</p>
              </div>
            </div>
          </div>

          {/* Dados de Calibração */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground border-b border-border pb-2">
              Dados de Calibração
            </h3>
            
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Próxima Calibração:</p>
                <p className="font-medium" data-testid="next-calibration">
                  {formatDate(equipment.dataProximaCalibracão)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Dias para Vencer:</p>
                <p className={`font-medium ${equipment.diasParaVencer && equipment.diasParaVencer <= 7 ? 'text-red-600' : ''}`} data-testid="days-to-expire">
                  {equipment.diasParaVencer !== undefined ? `${equipment.diasParaVencer} dias` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Status Calibração:</p>
                <p className="font-medium" data-testid="calibration-status-text">
                  {equipment.statusCalibracao || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Certificado:</p>
                <p className="font-medium font-mono text-xs" data-testid="certificate-number">
                  {equipment.certificado || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status de Calibração Card */}
        {equipment.diasParaVencer !== undefined && (
          <div className={`mt-6 p-4 rounded-lg border-l-4 ${
            equipment.diasParaVencer <= 0 ? 'bg-red-50 border-red-500' :
            equipment.diasParaVencer <= 7 ? 'bg-orange-50 border-orange-500' :
            equipment.diasParaVencer <= 30 ? 'bg-yellow-50 border-yellow-500' :
            'bg-green-50 border-green-500'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`font-medium ${
                  equipment.diasParaVencer <= 0 ? 'text-red-800' :
                  equipment.diasParaVencer <= 7 ? 'text-orange-800' :
                  equipment.diasParaVencer <= 30 ? 'text-yellow-800' :
                  'text-green-800'
                }`}>
                  Status de Calibração
                </h4>
                <p className={`text-sm mt-1 ${
                  equipment.diasParaVencer <= 0 ? 'text-red-600' :
                  equipment.diasParaVencer <= 7 ? 'text-orange-600' :
                  equipment.diasParaVencer <= 30 ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  Próxima calibração: {formatDate(equipment.dataProximaCalibracão)}
                  {equipment.certificado && (
                    <>
                      <br />
                      Certificado: {equipment.certificado}
                    </>
                  )}
                </p>
              </div>
              <Badge className={getCalibrationStatusColor(equipment.diasParaVencer)}>
                {equipment.diasParaVencer <= 0 
                  ? `${Math.abs(equipment.diasParaVencer)} dias vencido`
                  : `${equipment.diasParaVencer} dias restantes`
                }
              </Badge>
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button 
            onClick={() => onEdit?.(equipment)}
            className="flex items-center gap-2"
            data-testid="button-edit-equipment"
          >
            <Edit className="w-4 h-4" />
            Editar
          </Button>
          <Button 
            variant="outline"
            onClick={() => onScheduleCalibration?.(equipment)}
            className="flex items-center gap-2"
            data-testid="button-schedule-calibration"
          >
            <Calendar className="w-4 h-4" />
            Agendar Calibração
          </Button>
          <Button 
            variant="outline"
            className="flex items-center gap-2"
            data-testid="button-view-history"
          >
            <History className="w-4 h-4" />
            Histórico
          </Button>
          <Button 
            variant="outline"
            className="flex items-center gap-2"
            data-testid="button-generate-qr"
          >
            <QrCode className="w-4 h-4" />
            QR Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
