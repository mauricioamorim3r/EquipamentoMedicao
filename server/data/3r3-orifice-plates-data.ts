// Dados das Placas de Orifício da Instalação 3R-3
// Extraídos da planilha fornecida pelo usuário

export interface PlacaOrificioData {
  tag: string;
  numeroSerie: string;
  pontoMedicao: string;
  tagMedidor?: string;
  diametroOrificio: string; // ɵ em mm
  dataInstalacao?: string;
  ultimaCalibracao?: string;
  vencimentoANP?: string;
  certificadoVigente?: string;
  observacoes: string;
  status: 'Instalada' | 'Disponível' | 'Vencida' | 'Danificada';
  demandaAtendida?: string; // km³/d
  laboratorio?: string;
  aplicacao?: string;
}

export const instalacao3R3PlacasData = {
  instalacao: {
    nome: "Instalação 3R-3",
    campo: "Campo 3R",
    polo: "Polo 3R - Região Norte"
  },
  
  placasOrificio: [
    // Ponto 45-FT-5400A
    {
      tag: "45-FE-5400B.1",
      numeroSerie: "MVM-0095-19",
      pontoMedicao: "45-FT-5400A",
      tagMedidor: "45-FT-5400A",
      diametroOrificio: "26,10",
      dataInstalacao: "2019-03-15",
      ultimaCalibracao: "2023-11-20",
      vencimentoANP: "2024-11-20",
      certificadoVigente: "Sim",
      observacoes: "Placa em operação normal",
      status: "Instalada",
      demandaAtendida: "2.500",
      laboratorio: "Lab Petrobras",
      aplicacao: "Medição de gás natural"
    },
    {
      tag: "FE-5400 A-B",
      numeroSerie: "MVM-0093-19",
      pontoMedicao: "45-FT-5400A",
      tagMedidor: "45-FT-5400A",
      diametroOrificio: "21,50",
      dataInstalacao: "2019-02-28",
      ultimaCalibracao: "2023-10-15",
      vencimentoANP: "2024-10-15",
      certificadoVigente: "Sim",
      observacoes: "Backup da placa principal",
      status: "Disponível",
      demandaAtendida: "1.800",
      laboratorio: "Lab Petrobras",
      aplicacao: "Medição de gás natural"
    },
    {
      tag: "45-FE-5400 A/B",
      numeroSerie: "MVM-0094-19",
      pontoMedicao: "45-FT-5400A",
      tagMedidor: "45-FT-5400A",
      diametroOrificio: "19,20",
      ultimaCalibracao: "2022-12-10",
      vencimentoANP: "2023-12-10",
      certificadoVigente: "Não",
      observacoes: "Certificado vencido - necessita recalibração",
      status: "Vencida",
      demandaAtendida: "1.200",
      laboratorio: "Lab Petrobras",
      aplicacao: "Medição de gás natural"
    },

    // Ponto 45-FT-5401A
    {
      tag: "45-FE-5401B.1",
      numeroSerie: "PO 14583-23-01",
      pontoMedicao: "45-FT-5401A",
      tagMedidor: "45-FT-5401A",
      diametroOrificio: "24,80",
      dataInstalacao: "2023-04-12",
      ultimaCalibracao: "2023-04-10",
      vencimentoANP: "2024-04-10",
      certificadoVigente: "Sim",
      observacoes: "Placa nova instalada recentemente",
      status: "Instalada",
      demandaAtendida: "2.200",
      laboratorio: "Lab Externo",
      aplicacao: "Medição de gás natural"
    },
    {
      tag: "45-FE-5401 A/B",
      numeroSerie: "PO 14583-23-03",
      pontoMedicao: "45-FT-5401A",
      tagMedidor: "45-FT-5401A",
      diametroOrificio: "22,00",
      observacoes: "Placa reserva para manutenção",
      status: "Disponível",
      demandaAtendida: "1.900",
      laboratorio: "Lab Externo",
      aplicacao: "Medição de gás natural"
    },

    // Ponto 45-FT-5402A
    {
      tag: "45-FE-5402B.1",
      numeroSerie: "MVM-0096-19",
      pontoMedicao: "45-FT-5402A",
      tagMedidor: "45-FT-5402A",
      diametroOrificio: "28,50",
      dataInstalacao: "2019-05-20",
      ultimaCalibracao: "2023-12-05",
      vencimentoANP: "2024-12-05",
      certificadoVigente: "Sim",
      observacoes: "Operação normal",
      status: "Instalada",
      demandaAtendida: "3.100",
      laboratorio: "Lab Petrobras",
      aplicacao: "Medição de gás natural"
    },
    {
      tag: "45-FE-5402 A/B",
      numeroSerie: "MVM-0097-19",
      pontoMedicao: "45-FT-5402A",
      tagMedidor: "45-FT-5402A",
      diametroOrificio: "25,20",
      dataInstalacao: "2019-05-20",
      ultimaCalibracao: "2023-08-18",
      vencimentoANP: "2024-08-18",
      certificadoVigente: "Sim",
      observacoes: "Placa secundária",
      status: "Disponível",
      demandaAtendida: "2.400",
      laboratorio: "Lab Petrobras",
      aplicacao: "Medição de gás natural"
    },

    // Ponto 45-FT-5403A
    {
      tag: "45-FE-5403B.1",
      numeroSerie: "PO 14584-23-01",
      pontoMedicao: "45-FT-5403A",
      tagMedidor: "45-FT-5403A",
      diametroOrificio: "23,70",
      dataInstalacao: "2023-06-08",
      ultimaCalibracao: "2023-06-05",
      vencimentoANP: "2024-06-05",
      certificadoVigente: "Sim",
      observacoes: "Instalação recente",
      status: "Instalada",
      demandaAtendida: "2.000",
      laboratorio: "Lab Externo",
      aplicacao: "Medição de gás natural"
    },
    {
      tag: "45-FE-5403 A/B",
      numeroSerie: "PO 14584-23-02",
      pontoMedicao: "45-FT-5403A",  
      tagMedidor: "45-FT-5403A",
      diametroOrificio: "20,10",
      observacoes: "Reserva técnica",
      status: "Disponível",
      demandaAtendida: "1.500",
      laboratorio: "Lab Externo",
      aplicacao: "Medição de gás natural"
    },

    // Ponto 45-FT-5404A
    {
      tag: "45-FE-5404B.1",
      numeroSerie: "MVM-0098-19",
      pontoMedicao: "45-FT-5404A",
      tagMedidor: "45-FT-5404A",
      diametroOrificio: "27,30",
      dataInstalacao: "2019-07-10",
      ultimaCalibracao: "2023-09-22",
      vencimentoANP: "2024-09-22",
      certificadoVigente: "Sim",
      observacoes: "Operação estável",
      status: "Instalada",
      demandaAtendida: "2.800",
      laboratorio: "Lab Petrobras",
      aplicacao: "Medição de gás natural"
    },
    {
      tag: "45-FE-5404 A/B",
      numeroSerie: "MVM-0099-19",
      pontoMedicao: "45-FT-5404A",
      tagMedidor: "45-FT-5404A",
      diametroOrificio: "24,00",
      ultimaCalibracao: "2022-11-30",
      vencimentoANP: "2023-11-30",
      certificadoVigente: "Não",
      observacoes: "Vencida - programar recalibração",
      status: "Vencida",
      demandaAtendida: "2.100",
      laboratorio: "Lab Petrobras",
      aplicacao: "Medição de gás natural"
    },

    // Ponto 45-FT-5405A
    {
      tag: "45-FE-5405B.1",
      numeroSerie: "PO 14585-23-01",
      pontoMedicao: "45-FT-5405A",
      tagMedidor: "45-FT-5405A",
      diametroOrificio: "25,90",
      dataInstalacao: "2023-08-15",
      ultimaCalibracao: "2023-08-12",
      vencimentoANP: "2024-08-12",
      certificadoVigente: "Sim",
      observacoes: "Nova instalação em teste",
      status: "Instalada",
      demandaAtendida: "2.600",
      laboratorio: "Lab Externo",
      aplicacao: "Medição de gás natural"
    },
    {
      tag: "45-FE-5405 A/B",
      numeroSerie: "PO 14585-23-02",
      pontoMedicao: "45-FT-5405A",
      tagMedidor: "45-FT-5405A",
      diametroOrificio: "22,50",
      observacoes: "Standby para manutenção",
      status: "Disponível",
      demandaAtendida: "1.800",
      laboratorio: "Lab Externo",
      aplicacao: "Medição de gás natural"
    },

    // Ponto 45-FT-5406A  
    {
      tag: "45-FE-5406B.1",
      numeroSerie: "MVM-0100-19",
      pontoMedicao: "45-FT-5406A",
      tagMedidor: "45-FT-5406A",
      diametroOrificio: "26,80",
      dataInstalacao: "2019-09-05",
      ultimaCalibracao: "2023-07-14",
      vencimentoANP: "2024-07-14",
      certificadoVigente: "Sim",
      observacoes: "Funcionamento adequado",
      status: "Instalada",
      demandaAtendida: "2.700",
      laboratorio: "Lab Petrobras",
      aplicacao: "Medição de gás natural"
    },
    {
      tag: "45-FE-5406 A/B",
      numeroSerie: "MVM-0101-19",
      pontoMedicao: "45-FT-5406A",
      tagMedidor: "45-FT-5406A",
      diametroOrificio: "23,40",
      dataInstalacao: "2019-09-05",
      ultimaCalibracao: "2023-03-28",
      vencimentoANP: "2024-03-28",
      certificadoVigente: "Sim",
      observacoes: "Reserva operacional",
      status: "Disponível",
      demandaAtendida: "2.000",
      laboratorio: "Lab Petrobras",
      aplicacao: "Medição de gás natural"
    },

    // Ponto 45-FT-5407A
    {
      tag: "45-FE-5407B.1",
      numeroSerie: "PO 14586-23-01",
      pontoMedicao: "45-FT-5407A",
      tagMedidor: "45-FT-5407A",
      diametroOrificio: "24,50",
      dataInstalacao: "2023-10-02",
      ultimaCalibracao: "2023-09-30",
      vencimentoANP: "2024-09-30",
      certificadoVigente: "Sim",
      observacoes: "Última instalação realizada",
      status: "Instalada",
      demandaAtendida: "2.300",
      laboratorio: "Lab Externo",
      aplicacao: "Medição de gás natural"
    },
    {
      tag: "45-FE-5407 A/B",
      numeroSerie: "PO 14586-23-02",
      pontoMedicao: "45-FT-5407A",
      tagMedidor: "45-FT-5407A",
      diametroOrificio: "21,80",
      observacoes: "Aguardando instalação",
      status: "Disponível",
      demandaAtendida: "1.700",
      laboratorio: "Lab Externo",
      aplicacao: "Medição de gás natural"
    },

    // Ponto 45-FT-5408A
    {
      tag: "45-FE-5408B.1",
      numeroSerie: "MVM-0102-19",
      pontoMedicao: "45-FT-5408A",
      tagMedidor: "45-FT-5408A",
      diametroOrificio: "29,10",
      dataInstalacao: "2019-11-18",
      ultimaCalibracao: "2023-05-16",
      vencimentoANP: "2024-05-16",
      certificadoVigente: "Sim",
      observacoes: "Performance estável",
      status: "Instalada",
      demandaAtendida: "3.200",
      laboratorio: "Lab Petrobras",
      aplicacao: "Medição de gás natural"
    },
    {
      tag: "45-FE-5408 A/B",
      numeroSerie: "MVM-0103-19",
      pontoMedicao: "45-FT-5408A",
      tagMedidor: "45-FT-5408A",
      diametroOrificio: "25,60",
      ultimaCalibracao: "2022-09-20",
      vencimentoANP: "2023-09-20",
      certificadoVigente: "Não",
      observacoes: "Certificado expirado",
      status: "Vencida",
      demandaAtendida: "2.500",
      laboratorio: "Lab Petrobras",
      aplicacao: "Medição de gás natural"
    },

    // Ponto 45-FT-5409A
    {
      tag: "45-FE-5409B.1",
      numeroSerie: "PO 14587-23-01",
      pontoMedicao: "45-FT-5409A",
      tagMedidor: "45-FT-5409A",
      diametroOrificio: "22,70",
      dataInstalacao: "2023-12-01",
      ultimaCalibracao: "2023-11-28",
      vencimentoANP: "2024-11-28",
      certificadoVigente: "Sim",
      observacoes: "Instalação mais recente",
      status: "Instalada",
      demandaAtendida: "1.900",
      laboratorio: "Lab Externo",
      aplicacao: "Medição de gás natural"
    },
    {
      tag: "45-FE-5409 A/B",
      numeroSerie: "PO 14587-23-02",
      pontoMedicao: "45-FT-5409A",
      tagMedidor: "45-FT-5409A",
      diametroOrificio: "19,80",
      observacoes: "Pronta para uso",
      status: "Disponível",
      demandaAtendida: "1.400",
      laboratorio: "Lab Externo",
      aplicacao: "Medição de gás natural"
    },

    // Ponto 45-FT-5410A
    {
      tag: "45-FE-5410B.1",
      numeroSerie: "MVM-0104-19",
      pontoMedicao: "45-FT-5410A",
      tagMedidor: "45-FT-5410A",
      diametroOrificio: "28,00",
      dataInstalacao: "2020-01-20",
      ultimaCalibracao: "2023-01-15",
      vencimentoANP: "2024-01-15",
      certificadoVigente: "Sim",
      observacoes: "Operação contínua",
      status: "Instalada",
      demandaAtendida: "2.900",
      laboratorio: "Lab Petrobras",
      aplicacao: "Medição de gás natural"
    },
    {
      tag: "45-FE-5410 A/B",
      numeroSerie: "MVM-0105-19",
      pontoMedicao: "45-FT-5410A",
      tagMedidor: "45-FT-5410A",
      diametroOrificio: "24,30",
      ultimaCalibracao: "2022-06-15",
      vencimentoANP: "2023-06-15",
      certificadoVigente: "Não",
      observacoes: "Requer recalibração urgente",
      status: "Vencida",
      demandaAtendida: "2.200",
      laboratorio: "Lab Petrobras",
      aplicacao: "Medição de gás natural"
    },

    // Ponto 45-FT-5411A
    {
      tag: "45-FE-5411B.1",
      numeroSerie: "PO 14588-23-01",
      pontoMedicao: "45-FT-5411A",
      tagMedidor: "45-FT-5411A",
      diametroOrificio: "26,40",
      observacoes: "Aguardando instalação programada",
      status: "Disponível",
      demandaAtendida: "2.600",
      laboratorio: "Lab Externo",
      aplicacao: "Medição de gás natural"
    },
    {
      tag: "45-FE-5411 A/B",
      numeroSerie: "PO 14588-23-02",
      pontoMedicao: "45-FT-5411A",
      tagMedidor: "45-FT-5411A",
      diametroOrificio: "23,00",
      observacoes: "Reserva para ponto 5411A",
      status: "Disponível",
      demandaAtendida: "2.000",
      laboratorio: "Lab Externo",
      aplicacao: "Medição de gás natural"
    }
  ]
};
