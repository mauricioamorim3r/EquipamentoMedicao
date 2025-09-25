export interface DashboardStats {
  totalEquipamentos: number;
  calibracoesVencidas: number;
  criticos: number;
  conformidade: number;
  polosDistribution: PoloDistribution[];
}

export interface PoloDistribution {
  id: number;
  nome: string;
  sigla: string;
  equipCount: number;
}

export interface CalibrationStats {
  total: number;
  expired: number;
  critical: number;
  alert: number;
  proximo: number;
  ok: number;
}

export interface EquipmentWithCalibration {
  id: number;
  tag: string;
  nome: string;
  fabricante: string;
  modelo: string;
  status: string;
  poloId: number;
  instalacaoId: number;
  dataProximaCalibracão?: string;
  diasParaVencer?: number;
  statusCalibracao?: string;
  certificado?: string;
}

export interface CalibrationStatus {
  status: 'ok' | 'proximo' | 'alerta' | 'critico' | 'vencido';
  label: string;
  count: number;
  percentage: number;
  color: string;
  bgColor: string;
}
