import { useState } from "react";
import { useToast } from "./use-toast";
import { queryClient } from "@/lib/queryClient";

export type TemplateType =
  | "equipamentos"
  | "pocos"
  | "placas_orificio"
  | "valvulas"
  | "campos"
  | "trechos_retos"
  | "analises_quimicas"
  | "controle_incertezas"
  | "instalacoes"
  | "pontos_medicao"
  | "plano_calibracoes";

export interface ImportResult {
  success: boolean;
  message: string;
  inserted: number;
  failed: number;
  errors: Array<{ row: number; error?: string; errors?: string[] }>;
  summary: {
    total: number;
    valid: number;
    invalid: number;
  };
}

export function useImportExport(templateType: TemplateType) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Download empty template
  const downloadTemplate = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/templates/${templateType}`);

      if (!response.ok) {
        throw new Error("Erro ao baixar template");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `template_${templateType}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Sucesso",
        description: "Template baixado com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao baixar template",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Export existing data with template format
  const exportData = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/export/${templateType}/template`);

      if (!response.ok) {
        throw new Error("Erro ao exportar dados");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `export_${templateType}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Sucesso",
        description: "Dados exportados com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao exportar dados",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Import data from Excel file
  const importData = async (file: File, validate: boolean = false): Promise<ImportResult | null> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const url = validate
        ? `/api/import/${templateType}?validate=true`
        : `/api/import/${templateType}`;

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao importar dados");
      }

      const result: ImportResult = await response.json();

      if (validate) {
        toast({
          title: "Validação concluída",
          description: `${result.summary.valid} registros válidos, ${result.summary.invalid} inválidos`,
        });
      } else {
        toast({
          title: result.inserted > 0 ? "Sucesso" : "Atenção",
          description: result.message,
          variant: result.failed > 0 ? "destructive" : "default",
        });

        // Invalidate queries to refresh data
        if (result.inserted > 0) {
          queryClient.invalidateQueries({ queryKey: [`/api/${templateType}`] });
        }
      }

      return result;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao importar dados",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    downloadTemplate,
    exportData,
    importData,
    isDownloading,
    isUploading,
    isExporting,
  };
}
