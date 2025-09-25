import { apiRequest } from "./queryClient";

export const api = {
  // Dashboard
  getDashboardStats: () => fetch("/api/dashboard/stats").then(res => res.json()),
  
  // Polos
  getPolos: () => fetch("/api/polos").then(res => res.json()),
  createPolo: (data: any) => apiRequest("POST", "/api/polos", data),
  
  // Instalações
  getInstalacoes: (poloId?: number) => {
    const url = poloId ? `/api/instalacoes?poloId=${poloId}` : "/api/instalacoes";
    return fetch(url).then(res => res.json());
  },
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
};
