import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import QRCodeLib from "qrcode";
import type { EquipmentWithCalibration } from "@/types";

interface QRCodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: EquipmentWithCalibration;
}

export default function QRCodeDialog({
  isOpen,
  onClose,
  equipment
}: QRCodeDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrGenerated, setQrGenerated] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      generateQRCode();
    }
  }, [isOpen]);

  const generateQRCode = async () => {
    if (!canvasRef.current) return;

    // Prepare equipment data for QR code
    const equipmentData = {
      id: equipment.id,
      tag: equipment.tag,
      nome: equipment.nome,
      numeroSerie: equipment.numeroSerie,
      fabricante: equipment.fabricante,
      modelo: equipment.modelo,
      status: equipment.status,
      dataProximaCalibracao: equipment.dataProximaCalibracão,
      certificado: equipment.certificado,
      url: `${window.location.origin}/equipamentos?id=${equipment.id}`
    };

    try {
      await QRCodeLib.toCanvas(canvasRef.current, JSON.stringify(equipmentData), {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrGenerated(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;

    const url = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `qrcode-${equipment.tag}.png`;
    link.href = url;
    link.click();
  };

  const handlePrint = () => {
    if (!canvasRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const imageUrl = canvasRef.current.toDataURL('image/png');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${equipment.tag}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              flex-direction: column;
              align-items: center;
              font-family: Arial, sans-serif;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .info {
              margin-bottom: 20px;
              text-align: center;
            }
            .info p {
              margin: 5px 0;
            }
            img {
              max-width: 300px;
            }
            @media print {
              body {
                padding: 10px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Equipamento: ${equipment.tag}</h1>
          </div>
          <div class="info">
            <p><strong>Nome:</strong> ${equipment.nome}</p>
            <p><strong>N° Série:</strong> ${equipment.numeroSerie || 'N/A'}</p>
            <p><strong>Fabricante:</strong> ${equipment.fabricante || 'N/A'}</p>
            <p><strong>Modelo:</strong> ${equipment.modelo || 'N/A'}</p>
          </div>
          <img src="${imageUrl}" alt="QR Code"/>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            QR Code - {equipment.tag}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Equipment Info */}
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg">{equipment.nome}</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>TAG:</strong> {equipment.tag}</p>
              {equipment.numeroSerie && (
                <p><strong>N° Série:</strong> {equipment.numeroSerie}</p>
              )}
              {equipment.fabricante && (
                <p><strong>Fabricante:</strong> {equipment.fabricante}</p>
              )}
              {equipment.modelo && (
                <p><strong>Modelo:</strong> {equipment.modelo}</p>
              )}
            </div>
          </div>

          {/* QR Code Canvas */}
          <div className="flex justify-center p-4 bg-white rounded-lg border">
            <canvas ref={canvasRef} />
          </div>

          {/* Instructions */}
          <div className="text-xs text-muted-foreground text-center bg-muted/50 p-3 rounded-md">
            <p>Escaneie o QR Code para acessar as informações do equipamento</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={!qrGenerated}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Baixar
            </Button>
            <Button
              variant="outline"
              onClick={handlePrint}
              disabled={!qrGenerated}
              className="flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
