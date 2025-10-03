import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { Storage } from './storage';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export class ReportGenerator {
  constructor(private storage: Storage) {}

  async generateCompliancePDF(): Promise<Buffer> {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Relatório de Conformidade', 20, 20);
    
    // Get data
    const dashboardStats = await this.storage.getDashboardStats();
    const calibrationStats = await this.storage.getCalibrationStats();
    
    // Summary info
    doc.setFontSize(14);
    doc.text('Resumo Executivo', 20, 40);
    
    doc.setFontSize(12);
    const summary = [
      `Total de Equipamentos: ${dashboardStats.totalEquipamentos}`,
      `Calibrações Vencidas: ${calibrationStats.expired}`,
      `Equipamentos Críticos: ${calibrationStats.critical}`,
      `Taxa de Conformidade: ${((calibrationStats.total - calibrationStats.expired - calibrationStats.critical) / calibrationStats.total * 100).toFixed(1)}%`
    ];
    
    summary.forEach((line, index) => {
      doc.text(line, 20, 55 + (index * 10));
    });

    // Get detailed equipment data
    const equipamentos = await this.storage.getEquipamentosWithCalibrationStatus();
    
    // Create table with equipment data
    const tableData = equipamentos.map((eq: any) => [
      eq.tag || 'N/A',
      eq.tipo || 'N/A',
      eq.fabricante || 'N/A',
      eq.proximaCalibracao ? new Date(eq.proximaCalibracao).toLocaleDateString('pt-BR') : 'N/A',
      eq.status || 'N/A'
    ]);

    doc.autoTable({
      head: [['Tag', 'Tipo', 'Fabricante', 'Próxima Calibração', 'Status']],
      body: tableData,
      startY: 100,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });

    return Buffer.from(doc.output('arraybuffer'));
  }

  async generateComplianceExcel(): Promise<Buffer> {
    const dashboardStats = await this.storage.getDashboardStats();
    const calibrationStats = await this.storage.getCalibrationStats();
    const equipamentos = await this.storage.getEquipamentosWithCalibrationStatus();

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ['Métrica', 'Valor'],
      ['Total de Equipamentos', dashboardStats.totalEquipamentos],
      ['Calibrações Vencidas', calibrationStats.expired],
      ['Equipamentos Críticos', calibrationStats.critical],
      ['Taxa de Conformidade (%)', ((calibrationStats.total - calibrationStats.expired - calibrationStats.critical) / calibrationStats.total * 100).toFixed(1)]
    ];
    
    const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWS, 'Resumo');

    // Equipment details sheet
    const equipmentData = [
      ['Tag', 'Tipo', 'Fabricante', 'Modelo', 'Próxima Calibração', 'Dias para Vencer', 'Status']
    ];

    equipamentos.forEach((eq: any) => {
      equipmentData.push([
        eq.tag || 'N/A',
        eq.tipo || 'N/A',
        eq.fabricante || 'N/A',
        eq.modelo || 'N/A',
        eq.proximaCalibracao ? new Date(eq.proximaCalibracao).toLocaleDateString('pt-BR') : 'N/A',
        eq.diasParaVencer !== undefined ? eq.diasParaVencer.toString() : 'N/A',
        eq.status || 'N/A'
      ]);
    });

    const equipmentWS = XLSX.utils.aoa_to_sheet(equipmentData);
    XLSX.utils.book_append_sheet(wb, equipmentWS, 'Equipamentos');

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  async generateComplianceCSV(): Promise<string> {
    const equipamentos = await this.storage.getEquipamentosWithCalibrationStatus();

    const headers = ['Tag', 'Tipo', 'Fabricante', 'Modelo', 'Próxima Calibração', 'Dias para Vencer', 'Status'];
    const csvRows = [headers.join(',')];

    equipamentos.forEach((eq: any) => {
      const row = [
        eq.tag || 'N/A',
        eq.tipo || 'N/A',
        eq.fabricante || 'N/A',
        eq.modelo || 'N/A',
        eq.proximaCalibracao ? new Date(eq.proximaCalibracao).toLocaleDateString('pt-BR') : 'N/A',
        eq.diasParaVencer !== undefined ? eq.diasParaVencer.toString() : 'N/A',
        eq.status || 'N/A'
      ];
      csvRows.push(row.map(field => `"${field.replace(/"/g, '""')}"`).join(','));
    });

    return csvRows.join('\n');
  }

  async generatePoloReportPDF(poloId?: number): Promise<Buffer> {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Relatório por Polo', 20, 20);
    
    // Get polo data
    const polos = await this.storage.getPolos();
    const targetPolo = poloId ? polos.find(p => p.id === poloId) : null;
    
    if (targetPolo) {
      doc.setFontSize(14);
      doc.text(`Polo: ${targetPolo.nome} (${targetPolo.sigla})`, 20, 40);
    }

    // Get equipment data for the polo
    const equipamentos = await this.storage.getEquipamentos({ poloId });
    
    doc.setFontSize(12);
    doc.text(`Total de Equipamentos: ${equipamentos.length}`, 20, 60);

    // Create table
    const tableData = equipamentos.map((eq: any) => [
      eq.tag || 'N/A',
      eq.tipo || 'N/A',
      eq.fabricante || 'N/A',
      eq.instalacao || 'N/A'
    ]);

    doc.autoTable({
      head: [['Tag', 'Tipo', 'Fabricante', 'Instalação']],
      body: tableData,
      startY: 80,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });

    return Buffer.from(doc.output('arraybuffer'));
  }

  async generateANPMonthlyXML(): Promise<string> {
    const equipamentos = await this.storage.getEquipamentosWithCalibrationStatus();
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    // Simplified ANP XML structure
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<relatorio_mensal>\n';
    xml += `  <periodo>\n`;
    xml += `    <mes>${month.toString().padStart(2, '0')}</mes>\n`;
    xml += `    <ano>${year}</ano>\n`;
    xml += `  </periodo>\n`;
    xml += `  <equipamentos>\n`;

    equipamentos.forEach((eq: any) => {
      xml += `    <equipamento>\n`;
      xml += `      <tag>${eq.tag || 'N/A'}</tag>\n`;
      xml += `      <tipo>${eq.tipo || 'N/A'}</tipo>\n`;
      xml += `      <fabricante>${eq.fabricante || 'N/A'}</fabricante>\n`;
      xml += `      <status_calibracao>${eq.status || 'N/A'}</status_calibracao>\n`;
      if (eq.proximaCalibracao) {
        xml += `      <proxima_calibracao>${new Date(eq.proximaCalibracao).toISOString().split('T')[0]}</proxima_calibracao>\n`;
      }
      xml += `    </equipamento>\n`;
    });

    xml += `  </equipamentos>\n`;
    xml += '</relatorio_mensal>';

    return xml;
  }
}