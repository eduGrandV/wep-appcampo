

export interface Local {
  id: number;
  lote: string;
  latitude: string;
  longitude: string;
  timestamp: string;
}

export interface Planta {
  id: number;
  planta: number;
  doencaOuPraga: string;
  orgao: string;
  nota: number;
  quadrante: string;
  ramo: string;
  numeroLocal: string | null;
  lote: string;
  localId: number;
  centroCusto: string;
  criadoEm: string;
  local: Local;
}




export interface LoginCredentials {
  email: string;
  password?: string; 
  senha?: string;
}

export interface User {
  id: number;
  email: string;
  
}