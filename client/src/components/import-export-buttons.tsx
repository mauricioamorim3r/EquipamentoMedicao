import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, FileSpreadsheet, FileUp } from "lucide-react";
import { useImportExport, type TemplateType } from "@/hooks/use-import-export";

interface ImportExportButtonsProps {
  templateType: TemplateType;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  showLabels?: boolean;
}

export default function ImportExportButtons({
  templateType,
  variant = "outline",
  size = "default",
  showLabels = true,
}: ImportExportButtonsProps) {
  const { downloadTemplate, exportData, importData, isDownloading, isUploading, isExporting } =
    useImportExport(templateType);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await importData(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={downloadTemplate}
        disabled={isDownloading}
        data-testid="button-download-template"
        title="Baixar template Excel vazio para importação"
      >
        <FileDown className="w-4 h-4 mr-2" />
        {showLabels && "Baixar Template"}
      </Button>

      <Button
        variant={variant}
        size={size}
        onClick={exportData}
        disabled={isExporting}
        data-testid="button-export-data"
        title="Exportar dados existentes para Excel"
      >
        <FileSpreadsheet className="w-4 h-4 mr-2" />
        {showLabels && "Exportar Dados"}
      </Button>

      <Button
        variant={variant}
        size={size}
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        data-testid="button-import-data"
        title="Importar dados de arquivo Excel"
      >
        <FileUp className="w-4 h-4 mr-2" />
        {showLabels && "Importar Dados"}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Selecionar arquivo Excel para importação"
      />
    </>
  );
}
