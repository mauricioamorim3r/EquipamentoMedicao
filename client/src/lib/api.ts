import { apiRequest } from "./queryClient";

export const api = {
  // Generic GET method
  get: (url: string) => fetch(url).then(res => res.json()),
  
  // Dashboard
  getDashboardStats: () => {
    console.log('Making request to /api/dashboard/stats');
    return fetch("/api/dashboard/stats", {
      signal: AbortSignal.timeout(30000) // 30 segundos de timeout
    }).then(async res => {
      console.log('Dashboard stats response:', res.status, res.statusText);
      if (!res.ok) {
        const text = await res.text();
        console.error('Dashboard stats error response:', text);
        throw new Error(`${res.status}: ${text}`);
      }
      const data = await res.json();
      console.log('Dashboard stats data:', data);
      return data;
    }).catch(error => {
      console.error('Dashboard stats request failed:', error);
      throw error;
    });
  },
  
  // Polos
  getPolos: () => fetch("/api/polos").then(res => res.json()),
  createPolo: (data: any) => apiRequest("POST", "/api/polos", data),

  // Campos
  getCampos: (poloId?: number) => {
    const url = poloId ? `/api/campos?poloId=${poloId}` : "/api/campos";
    return fetch(url).then(res => res.json());
  },
  getCampo: (id: string) => fetch(`/api/campos/${id}`).then(res => res.json()),
  createCampo: (data: any) => apiRequest("POST", "/api/campos", data),
  updateCampo: (id: number, data: any) => apiRequest("PUT", `/api/campos/${id}`, data),
  deleteCampo: (id: number) => apiRequest("DELETE", `/api/campos/${id}`),

  // Instalações
  getInstalacoes: (poloId?: number) => {
    const url = poloId ? `/api/instalacoes?poloId=${poloId}` : "/api/instalacoes";
    return fetch(url).then(res => res.json());
  },
  getInstalacao: (id: string) => fetch(`/api/instalacoes/${id}`).then(res => res.json()),
  createInstalacao: (data: any) => apiRequest("POST", "/api/instalacoes", data),
  
  // Equipamentos
  getEquipamentos: (filters?: { poloId?: number; instalacaoId?: number; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.poloId) params.append("poloId", filters.poloId.toString());
    if (filters?.instalacaoId) params.append("instalacaoId", filters.instalacaoId.toString());
    if (filters?.status) params.append("status", filters.status);
    
    const url = params.toString() ? `/api/equipamentos?${params}` : "/api/equipamentos";
    return fetch(url).then(res => res.json());
  },
  getEquipamentosWithCalibration: () => fetch("/api/equipamentos/with-calibration").then(res => res.json()),
  getEquipamento: (id: number) => fetch(`/api/equipamentos/${id}`).then(res => res.json()),
  createEquipamento: (data: any) => apiRequest("POST", "/api/equipamentos", data),
  updateEquipamento: (id: number, data: any) => apiRequest("PUT", `/api/equipamentos/${id}`, data),
  deleteEquipamento: (id: number) => apiRequest("DELETE", `/api/equipamentos/${id}`),
  
  // Calibrações
  getCalibracoes: (equipamentoId?: number) => {
    const url = equipamentoId ? `/api/calibracoes?equipamentoId=${equipamentoId}` : "/api/calibracoes";
    return fetch(url).then(res => res.json());
  },
  getCalibrationStats: () => fetch("/api/calibracoes/stats").then(res => res.json()),
  createCalibracao: (data: any) => apiRequest("POST", "/api/calibracoes", data),
  
  // Poços
  getPocos: (filters?: { poloId?: number; instalacaoId?: number }) => {
    const params = new URLSearchParams();
    if (filters?.poloId) params.append("poloId", filters.poloId.toString());
    if (filters?.instalacaoId) params.append("instalacaoId", filters.instalacaoId.toString());
    
    const url = params.toString() ? `/api/pocos?${params}` : "/api/pocos";
    return fetch(url).then(res => res.json());
  },
  createPoco: (data: any) => apiRequest("POST", "/api/pocos", data),
  
  // Testes de Poços
  getWellTests: (wellId: number) => fetch(`/api/pocos/${wellId}/testes`).then(res => res.json()),
  createWellTest: (wellId: number, data: any) => apiRequest("POST", `/api/pocos/${wellId}/testes`, data),
  
  // Placas de Orifício
  getPlacasOrificio: (equipamentoId?: number) => {
    const url = equipamentoId ? `/api/placas-orificio?equipamentoId=${equipamentoId}` : "/api/placas-orificio";
    return fetch(url).then(res => res.json());
  },
  createPlacaOrificio: (data: any) => apiRequest("POST", "/api/placas-orificio", data),
  updatePlacaOrificio: (id: number, data: any) => apiRequest("PUT", `/api/placas-orificio/${id}`, data),
  deletePlacaOrificio: (id: number) => apiRequest("DELETE", `/api/placas-orificio/${id}`),
  
  // Pontos de Medição
  getPontosMedicao: (equipamentoId?: number) => {
    const url = equipamentoId ? `/api/pontos-medicao?equipamentoId=${equipamentoId}` : "/api/pontos-medicao";
    return fetch(url).then(res => res.json());
  },
  createPontoMedicao: (data: any) => apiRequest("POST", "/api/pontos-medicao", data),
  
  // Planos de Coleta
  getPlanosColeta: (pontoMedicaoId?: number) => {
    const url = pontoMedicaoId ? `/api/planos-coleta?pontoMedicaoId=${pontoMedicaoId}` : "/api/planos-coleta";
    return fetch(url).then(res => res.json());
  },
  createPlanoColeta: (data: any) => apiRequest("POST", "/api/planos-coleta", data),
  updatePlanoColeta: (id: number, data: any) => apiRequest("PUT", `/api/planos-coleta/${id}`, data),
  deletePlanoColeta: (id: number) => apiRequest("DELETE", `/api/planos-coleta/${id}`),

  getAnalisesQuimicas: (planoColetaId?: number) => {
    const url = planoColetaId ? `/api/analises-quimicas?planoColetaId=${planoColetaId}` : "/api/analises-quimicas";
    return fetch(url).then(res => res.json());
  },
  createAnaliseQuimica: (data: any) => apiRequest("POST", "/api/analises-quimicas", data),
  updateAnaliseQuimica: (id: number, data: any) => apiRequest("PUT", `/api/analises-quimicas/${id}`, data),
  deleteAnaliseQuimica: (id: number) => apiRequest("DELETE", `/api/analises-quimicas/${id}`),

  // Válvulas
  getValvulas: (equipamentoId?: number) => {
    const url = equipamentoId ? `/api/valvulas?equipamentoId=${equipamentoId}` : "/api/valvulas";
    return fetch(url).then(res => res.json());
  },
  createValvula: (data: any) => apiRequest("POST", "/api/valvulas", data),
  updateValvula: (id: number, data: any) => apiRequest("PUT", `/api/valvulas/${id}`, data),
  deleteValvula: (id: number) => apiRequest("DELETE", `/api/valvulas/${id}`),

  // Calendário de Calibrações
  getCalendarioCalibracoes: (filters?: { poloId?: number; instalacaoId?: number; mes?: number; ano?: number }) => {
    const params = new URLSearchParams();
    if (filters?.poloId) params.append("poloId", filters.poloId.toString());
    if (filters?.instalacaoId) params.append("instalacaoId", filters.instalacaoId.toString());
    if (filters?.mes) params.append("mes", filters.mes.toString());
    if (filters?.ano) params.append("ano", filters.ano.toString());
    const url = params.toString() ? `/api/calendario-calibracoes?${params}` : "/api/calendario-calibracoes";
    return fetch(url).then(res => res.json());
  },
  createCalendarioCalibracao: (data: any) => apiRequest("POST", "/api/calendario-calibracoes", data),
  updateCalendarioCalibracao: (id: number, data: any) => apiRequest("PUT", `/api/calendario-calibracoes/${id}`, data),
  deleteCalendarioCalibracao: (id: number) => apiRequest("DELETE", `/api/calendario-calibracoes/${id}`),

  // Trechos Retos
  getTrechosRetos: () => fetch("/api/trechos-retos").then(res => res.json()),
  createTrechoReto: (data: any) => apiRequest("POST", "/api/trechos-retos", data),
  updateTrechoReto: (id: number, data: any) => apiRequest("PUT", `/api/trechos-retos/${id}`, data),
  deleteTrechoReto: (id: number) => apiRequest("DELETE", `/api/trechos-retos/${id}`),

  // Medidores Primários
  getMedidoresPrimarios: (filters?: { campoId?: number; instalacaoId?: number; tipoMedidor?: string }) => {
    const params = new URLSearchParams();
    if (filters?.campoId) params.append("campoId", filters.campoId.toString());
    if (filters?.instalacaoId) params.append("instalacaoId", filters.instalacaoId.toString());
    if (filters?.tipoMedidor) params.append("tipoMedidor", filters.tipoMedidor);
    
    const url = params.toString() ? `/api/medidores-primarios?${params}` : "/api/medidores-primarios";
    return fetch(url).then(res => res.json());
  },
  getMedidorPrimario: (id: number) => fetch(`/api/medidores-primarios/${id}`).then(res => res.json()),
  createMedidorPrimario: (data: any) => apiRequest("POST", "/api/medidores-primarios", data),
  updateMedidorPrimario: (id: number, data: any) => apiRequest("PUT", `/api/medidores-primarios/${id}`, data),
  deleteMedidorPrimario: (id: number) => apiRequest("DELETE", `/api/medidores-primarios/${id}`),

  // Gestão de Cilindros
  getGestaoCilindros: () => fetch("/api/gestao-cilindros").then(res => res.json()),
  createGestaoCilindro: (data: any) => apiRequest("POST", "/api/gestao-cilindros", data),
  updateGestaoCilindro: (id: number, data: any) => apiRequest("PUT", `/api/gestao-cilindros/${id}`, data),
  deleteGestaoCilindro: (id: number) => apiRequest("DELETE", `/api/gestao-cilindros/${id}`),

  // Controle de Incertezas
  getControleIncertezas: (equipamentoId?: number) => {
    const url = equipamentoId ? `/api/controle-incertezas?equipamentoId=${equipamentoId}` : "/api/controle-incertezas";
    return fetch(url).then(res => res.json());
  },
  createControleIncerteza: (data: any) => apiRequest("POST", "/api/controle-incertezas", data),
  updateControleIncerteza: (id: number, data: any) => apiRequest("PUT", `/api/controle-incertezas/${id}`, data),
  deleteControleIncerteza: (id: number) => apiRequest("DELETE", `/api/controle-incertezas/${id}`),

  // Limites de Incerteza
  getIncertezaLimites: () => fetch("/api/incerteza-limites").then(res => res.json()),
  createIncertezaLimite: (data: any) => apiRequest("POST", "/api/incerteza-limites", data),

  // Sistema de Notificações
  getNotificacoes: (filters?: { status?: string; categoria?: string; limit?: number }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.categoria) params.append("categoria", filters.categoria);
    if (filters?.limit) params.append("limit", filters.limit.toString());
    
    const url = params.toString() ? `/api/notificacoes?${params}` : "/api/notificacoes";
    return fetch(url).then(res => res.json());
  },
  createNotificacao: (data: any) => apiRequest("POST", "/api/notificacoes", data),
  markNotificationAsRead: (id: number) => apiRequest("PUT", `/api/notificacoes/${id}/read`),
  getUnreadNotificationsCount: () => fetch("/api/notificacoes/unread-count").then(res => res.json()),

  // Certificados de Calibração
  getCertificadosCalibração: () => fetch("/api/certificados-calibracao").then(res => res.json()),
  createCertificadoCalibracao: (data: any) => apiRequest("POST", "/api/certificados-calibracao", data),
  updateCertificadoCalibracao: (id: number, data: any) => apiRequest("PUT", `/api/certificados-calibracao/${id}`, data),

  // Execução de Calibrações
  getExecucaoCalibracoes: () => fetch("/api/execucao-calibracoes").then(res => res.json()),
  createExecucaoCalibracao: (data: any) => apiRequest("POST", "/api/execucao-calibracoes", data),
  updateExecucaoCalibracao: (id: number, data: any) => apiRequest("PUT", `/api/execucao-calibracoes/${id}`, data),

  // Métodos ausentes para Instalações
  updateInstalacao: (id: number, data: any) => apiRequest("PUT", `/api/instalacoes/${id}`, data),
  deleteInstalacao: (id: number) => apiRequest("DELETE", `/api/instalacoes/${id}`),
  
  // Métodos ausentes para Pontos de Medição  
  updatePontoMedicao: (id: number, data: any) => apiRequest("PUT", `/api/pontos-medicao/${id}`, data),
  deletePontoMedicao: (id: number) => apiRequest("DELETE", `/api/pontos-medicao/${id}`),

  // Testes de Poços
  getTestesPocos: (filters?: { poloId?: number; instalacaoId?: number; pocoId?: number }) => {
    const params = new URLSearchParams();
    if (filters?.poloId) params.append("poloId", filters.poloId.toString());
    if (filters?.instalacaoId) params.append("instalacaoId", filters.instalacaoId.toString());
    if (filters?.pocoId) params.append("pocoId", filters.pocoId.toString());
    
    const url = params.toString() ? `/api/testes-pocos?${params}` : "/api/testes-pocos";
    return fetch(url).then(res => res.json());
  },
  getTestePoco: (id: number) => fetch(`/api/testes-pocos/${id}`).then(res => res.json()),
  createTestePoco: (data: any) => apiRequest("POST", "/api/testes-pocos", data),
  updateTestePoco: (id: number, data: any) => apiRequest("PUT", `/api/testes-pocos/${id}`, data),
  deleteTestePoco: (id: number) => apiRequest("DELETE", `/api/testes-pocos/${id}`),

  // Reports
  generateReport: async (type: string, format: string, filters?: any) => {
    const response = await fetch("/api/reports/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type, format, filters }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao gerar relatório: ${response.statusText}`);
    }

    // Get filename from Content-Disposition header
    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = contentDisposition?.match(/filename="([^"]+)"/)?.[1] || `relatorio.${format}`;

    const blob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return { success: true, filename };
  },

  downloadComplianceReport: (format: 'pdf' | 'excel' | 'csv') => {
    const url = `/api/reports/compliance/${format}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_conformidade.${format === 'excel' ? 'xlsx' : format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },

  downloadPoloReport: (poloId?: number, format: 'pdf' = 'pdf') => {
    const url = poloId ? `/api/reports/polo/${format}?poloId=${poloId}` : `/api/reports/polo/${format}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_polo.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },

  downloadANPReport: (format: 'xml' = 'xml') => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    
    const url = `/api/reports/anp/monthly-${format}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `anp_mensal_${year}_${month}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },
};
