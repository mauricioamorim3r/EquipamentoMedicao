import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Polo, Campo, Instalacao, Equipamento } from "@shared/schema";

export interface AutoFillData {
  polos: Polo[];
  campos: Campo[];
  instalacoes: Instalacao[];
  equipamentos: Equipamento[];
}

export interface AutoFillHookReturn {
  data: AutoFillData;
  loading: boolean;
  error: any;
  getFilteredCampos: (poloId?: number) => Campo[];
  getFilteredInstalacoes: (poloId?: number, campoId?: number) => Instalacao[];
  getFilteredEquipamentos: (instalacaoId?: number) => Equipamento[];
  getPoloByInstalacao: (instalacaoId: number) => Polo | undefined;
  getCampoByInstalacao: (instalacaoId: number) => Campo | undefined;
  getEquipamentoByNumeroSerie: (numeroSerie: string) => Equipamento | undefined;
  getEquipamentoByTag: (tag: string) => Equipamento | undefined;
}

/**
 * Hook customizado para gerenciar auto preenchimento de formulários
 * Fornece dados filtrados e funções utilitárias para relacionamentos entre entidades
 */
export function useAutoFill(): AutoFillHookReturn {
  // Fetch all base data
  const { data: polos = [], isLoading: polosLoading, error: polosError } = useQuery({
    queryKey: ["/api/polos"],
    queryFn: api.getPolos,
  });

  const { data: campos = [], isLoading: camposLoading, error: camposError } = useQuery({
    queryKey: ["/api/campos"],
    queryFn: () => api.getCampos(),
  });

  const { data: instalacoes = [], isLoading: instalacoesLoading, error: instalacoesError } = useQuery({
    queryKey: ["/api/instalacoes"],
    queryFn: () => api.getInstalacoes(),
  });

  const { data: equipamentos = [], isLoading: equipamentosLoading, error: equipamentosError } = useQuery({
    queryKey: ["/api/equipamentos"],
    queryFn: () => api.getEquipamentos(),
  });

  const loading = polosLoading || camposLoading || instalacoesLoading || equipamentosLoading;
  const error = polosError || camposError || instalacoesError || equipamentosError;

  // Utility functions for filtering and relationships
  const getFilteredCampos = (poloId?: number): Campo[] => {
    if (!poloId) return campos;
    return campos.filter((campo: Campo) => campo.poloId === poloId);
  };

  const getFilteredInstalacoes = (poloId?: number, campoId?: number): Instalacao[] => {
    let filtered = instalacoes;
    
    if (poloId) {
      filtered = filtered.filter((instalacao: Instalacao) => instalacao.poloId === poloId);
    }
    
    if (campoId) {
      filtered = filtered.filter((instalacao: Instalacao) => instalacao.campoId === campoId);
    }
    
    return filtered;
  };

  const getFilteredEquipamentos = (instalacaoId?: number): Equipamento[] => {
    if (!instalacaoId) return equipamentos;
    return equipamentos.filter((equipamento: Equipamento) => equipamento.instalacaoId === instalacaoId);
  };

  const getPoloByInstalacao = (instalacaoId: number): Polo | undefined => {
    const instalacao = instalacoes.find((inst: Instalacao) => inst.id === instalacaoId);
    if (!instalacao) return undefined;
    return polos.find((polo: Polo) => polo.id === instalacao.poloId);
  };

  const getCampoByInstalacao = (instalacaoId: number): Campo | undefined => {
    const instalacao = instalacoes.find((inst: Instalacao) => inst.id === instalacaoId);
    if (!instalacao || !instalacao.campoId) return undefined;
    return campos.find((campo: Campo) => campo.id === instalacao.campoId);
  };

  const getEquipamentoByNumeroSerie = (numeroSerie: string): Equipamento | undefined => {
    return equipamentos.find((equipamento: Equipamento) => equipamento.numeroSerie === numeroSerie);
  };

  const getEquipamentoByTag = (tag: string): Equipamento | undefined => {
    return equipamentos.find((equipamento: Equipamento) => equipamento.tag === tag);
  };

  return {
    data: {
      polos,
      campos,
      instalacoes,
      equipamentos,
    },
    loading,
    error,
    getFilteredCampos,
    getFilteredInstalacoes,
    getFilteredEquipamentos,
    getPoloByInstalacao,
    getCampoByInstalacao,
    getEquipamentoByNumeroSerie,
    getEquipamentoByTag,
  };
}

/**
 * Hook específico para auto preenchimento baseado em equipamento selecionado
 */
export function useEquipmentAutoFill(equipamentoId?: number) {
  const { data, loading, error, getPoloByInstalacao, getCampoByInstalacao } = useAutoFill();
  
  const selectedEquipamento = data.equipamentos.find((eq: Equipamento) => eq.id === equipamentoId);
  
  const autoFillData = selectedEquipamento ? {
    equipamento: selectedEquipamento,
    instalacao: data.instalacoes.find((inst: Instalacao) => inst.id === selectedEquipamento.instalacaoId),
    polo: getPoloByInstalacao(selectedEquipamento.instalacaoId),
    campo: getCampoByInstalacao(selectedEquipamento.instalacaoId),
  } : null;

  return {
    data: autoFillData,
    loading,
    error,
    selectedEquipamento,
  };
}

/**
 * Hook específico para auto preenchimento baseado em instalação selecionada
 */
export function useInstallationAutoFill(instalacaoId?: number) {
  const { data, loading, error, getPoloByInstalacao, getCampoByInstalacao, getFilteredEquipamentos } = useAutoFill();
  
  const selectedInstalacao = data.instalacoes.find((inst: Instalacao) => inst.id === instalacaoId);
  
  const autoFillData = selectedInstalacao ? {
    instalacao: selectedInstalacao,
    polo: getPoloByInstalacao(selectedInstalacao.id),
    campo: getCampoByInstalacao(selectedInstalacao.id),
    equipamentos: getFilteredEquipamentos(selectedInstalacao.id),
  } : null;

  return {
    data: autoFillData,
    loading,
    error,
    selectedInstalacao,
  };
}

/**
 * Hook específico para auto preenchimento baseado em polo selecionado
 */
export function usePoloAutoFill(poloId?: number) {
  const { data, loading, error, getFilteredCampos, getFilteredInstalacoes } = useAutoFill();
  
  const selectedPolo = data.polos.find((polo: Polo) => polo.id === poloId);
  
  const autoFillData = selectedPolo ? {
    polo: selectedPolo,
    campos: getFilteredCampos(selectedPolo.id),
    instalacoes: getFilteredInstalacoes(selectedPolo.id),
  } : null;

  return {
    data: autoFillData,
    loading,
    error,
    selectedPolo,
  };
}