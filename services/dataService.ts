import { DailySalesData, SalesSummary, StoreOption } from '../types';
import { getDatesInRange } from '../utils';

const STORES: StoreOption[] = [
  { id: '002', name: 'Loja Centro' },
  { id: '003', name: 'Loja Shopping' },
  { id: '004', name: 'Loja Norte' },
  { id: '005', name: 'Loja Sul' },
  { id: '006', name: 'Loja Express' },
  { id: '007', name: 'Loja Matriz' },
];

// Helper to generate random consistent-ish data
const seededRandom = (seed: number) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

export const getStores = (): StoreOption[] => STORES;

export const generateMockData = (startDate: string, endDate: string): DailySalesData[] => {
  const dates = getDatesInRange(startDate, endDate);
  const data: DailySalesData[] = [];

  dates.forEach((date) => {
    STORES.forEach((store, index) => {
      // Create a pseudo-random seed based on date and store to keep data consistent on re-renders
      const seed = date.split('-').reduce((acc, val) => acc + parseInt(val), 0) + index;
      
      const baseVolume = 10000 + (seededRandom(seed) * 50000); // 10k to 60k
      
      const total_notas = baseVolume;
      const total_cancelados = baseVolume * (0.02 + seededRandom(seed + 1) * 0.05); // 2-7%
      const total_devolvido = baseVolume * (0.01 + seededRandom(seed + 2) * 0.03); // 1-4%
      
      const total_liquido = total_notas - total_cancelados - total_devolvido;
      
      // BL (Online/Balcony logic)
      const total_vendabl = total_notas * (0.3 + seededRandom(seed + 3) * 0.2); // 30-50% of total
      const total_canceladosbl = total_vendabl * 0.03;
      const total_liquidobl = total_vendabl - total_canceladosbl;

      data.push({
        data: date,
        loja: store.id,
        total_notas,
        total_cancelados,
        total_devolvido,
        total_liquido,
        total_vendabl,
        total_canceladosbl,
        total_liquidobl
      });
    });
  });

  return data;
};

export const getSummary = (allData: DailySalesData[]): SalesSummary => {
  return allData.reduce(
    (acc, curr) => ({
      total_notas: acc.total_notas + curr.total_notas,
      total_cancelados: acc.total_cancelados + curr.total_cancelados,
      total_devolvido: acc.total_devolvido + curr.total_devolvido,
      total_liquido: acc.total_liquido + curr.total_liquido,
      total_vendabl: acc.total_vendabl + curr.total_vendabl,
      total_liquidobl: acc.total_liquidobl + curr.total_liquidobl,
    }),
    {
      total_notas: 0,
      total_cancelados: 0,
      total_devolvido: 0,
      total_liquido: 0,
      total_vendabl: 0,
      total_liquidobl: 0,
    }
  );
};

// Interface for API response
export interface ApiSalesMetric {
  titulo: string;
  '002'?: number;
  '003'?: number;
  '004'?: number;
  '005'?: number;
  '006'?: number;
  '007'?: number;
  total_operacao: number;
}

// Function to fetch data from the API
export const fetchApiSalesData = async (startDate: string, endDate: string): Promise<ApiSalesMetric[]> => {
  const response = await fetch('https://serv-api.ce.br.saveincloud.net.br/sec/resumoVendasPeriodo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      guididusuario: '2F913CCB-58FF-49B1-9794-C0984F909DEB',
      datainicial: startDate,
      datafinal: endDate,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: ApiSalesMetric[] = await response.json();
  return data;
};

// Function to map API response to SalesSummary based on store selection
export const mapApiToSalesSummary = (apiData: ApiSalesMetric[], storeId: string): SalesSummary => {
  // Create a mapping from API titles to our summary keys
  const titleToKeyMap: Record<string, keyof SalesSummary> = {
    'Total Notas': 'total_notas',
    'Total Cancelados': 'total_cancelados',
    'Total Devolvido': 'total_devolvido',
    'Total Líquido': 'total_liquido',
    'Total Venda BL': 'total_vendabl',
    'Total Líquido BL': 'total_liquidobl',
  };

  const summary: SalesSummary = {
    total_notas: 0,
    total_cancelados: 0,
    total_devolvido: 0,
    total_liquido: 0,
    total_vendabl: 0,
    total_liquidobl: 0,
  };

  apiData.forEach(item => {
    const key = titleToKeyMap[item.titulo];
    if (key) {
      // If storeId is empty (meaning "All Stores"), use total_operacao
      // Otherwise, use the value for the specific store
      const value = storeId ? (item[storeId as keyof ApiSalesMetric] as number || 0) : item.total_operacao;
      summary[key] = value;
    }
  });

  return summary;
};
