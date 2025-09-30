import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Export data to Excel
export function exportToExcel(data: any[], filename: string, sheetName: string = "Sheet1") {
  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate Excel file buffer
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

  return excelBuffer;
}

// Export multiple sheets to Excel
export function exportMultipleSheets(
  sheets: Array<{ data: any[]; sheetName: string }>,
  filename: string
) {
  const workbook = XLSX.utils.book_new();

  sheets.forEach(({ data, sheetName }) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  });

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
  return excelBuffer;
}

// Export data to PDF (simple table)
export function exportTableToPDF(
  data: any[],
  columns: Array<{ header: string; dataKey: string }>,
  title: string = "Relatório"
) {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(16);
  doc.text(title, 14, 15);

  // Add date
  doc.setFontSize(10);
  const date = new Date().toLocaleDateString("pt-BR");
  doc.text(`Gerado em: ${date}`, 14, 22);

  // Generate table
  autoTable(doc, {
    startY: 30,
    head: [columns.map((col) => col.header)],
    body: data.map((row) => columns.map((col) => row[col.dataKey] || "")),
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 8,
    },
    headStyles: {
      fillColor: [19, 16, 59], // #13103b
      textColor: [212, 252, 4], // #d4fc04
      fontStyle: "bold",
    },
  });

  // Return PDF buffer
  return Buffer.from(doc.output("arraybuffer"));
}

// Export equipment list to PDF
export function exportEquipmentReport(equipments: any[]) {
  const columns = [
    { header: "TAG", dataKey: "tag" },
    { header: "Nome", dataKey: "nome" },
    { header: "Tipo", dataKey: "tipo" },
    { header: "Fabricante", dataKey: "fabricante" },
    { header: "Status", dataKey: "statusOperacional" },
  ];

  return exportTableToPDF(equipments, columns, "Relatório de Equipamentos");
}

// Export calibration report to PDF
export function exportCalibrationReport(calibrations: any[]) {
  const columns = [
    { header: "TAG", dataKey: "tag" },
    { header: "Equipamento", dataKey: "nomeEquipamento" },
    { header: "Última Calibração", dataKey: "dataUltimaCalibracao" },
    { header: "Próxima Calibração", dataKey: "dataProximaCalibracao" },
    { header: "Dias para Vencer", dataKey: "diasParaVencer" },
    { header: "Status", dataKey: "statusCalibracao" },
  ];

  return exportTableToPDF(calibrations, columns, "Relatório de Calibrações");
}

// Export wells (poços) report to PDF
export function exportWellsReport(wells: any[]) {
  const columns = [
    { header: "Código", dataKey: "codigo" },
    { header: "Nome", dataKey: "nome" },
    { header: "Tipo", dataKey: "tipo" },
    { header: "Código ANP", dataKey: "codigoAnp" },
    { header: "Status", dataKey: "status" },
  ];

  return exportTableToPDF(wells, columns, "Relatório de Poços");
}

// Export dashboard stats to Excel
export function exportDashboardStats(stats: any) {
  const summaryData = [
    { Métrica: "Total de Equipamentos", Valor: stats.totalEquipamentos },
    { Métrica: "Total de Calibrações", Valor: stats.totalCalibracoes },
    { Métrica: "Total de Poços", Valor: stats.totalPocos },
    { Métrica: "Total de Placas", Valor: stats.totalPlacas },
  ];

  const polosData = stats.polosDistribution?.map((polo: any) => ({
    Polo: polo.nome,
    Sigla: polo.sigla,
    "Nº Equipamentos": polo.equipCount,
  })) || [];

  return exportMultipleSheets(
    [
      { data: summaryData, sheetName: "Resumo" },
      { data: polosData, sheetName: "Distribuição por Polos" },
    ],
    "dashboard-stats.xlsx"
  );
}
