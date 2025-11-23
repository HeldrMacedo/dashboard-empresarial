export interface DailySalesData {
  data: string; // YYYY-MM-DD
  loja: string;
  total_notas: number;
  total_cancelados: number;
  total_devolvido: number;
  total_liquido: number;
  total_vendabl: number;
  total_canceladosbl: number;
  total_liquidobl: number;
}

export interface SalesSummary {
  total_notas: number;
  total_cancelados: number;
  total_devolvido: number;
  total_liquido: number;
  total_vendabl: number;
  total_liquidobl: number;
}

export interface StoreOption {
  id: string;
  name: string;
}
