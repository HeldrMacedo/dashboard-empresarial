import React, { useState, useMemo, useEffect } from 'react';
import { 
  Store, 
  DollarSign, 
  AlertCircle, 
  Archive, 
  TrendingUp, 
  ShoppingCart, 
  CreditCard,
  Filter,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  LayoutDashboard
} from 'lucide-react';
import { generateMockData, getStores, getSummary, fetchApiSalesData, mapApiToSalesSummary } from './services/dataService';
import { SummaryCard } from './components/SummaryCard';
import { StoreEvolutionChart } from './components/StoreEvolutionChart';
import { StoreComparisonPieChart } from './components/StoreComparisonPieChart';
import { DateRangeSelector } from './components/DateRangeSelector';
import { formatCurrency, formatDateBR, getLocalDateString } from './utils';

// Metrics available for the Pie Chart comparison
const METRIC_OPTIONS = [
  { key: 'total_notas', label: 'Total Notas' },
  { key: 'total_cancelados', label: 'Total Cancelados' },
  { key: 'total_devolvido', label: 'Total Devolvido' },
  { key: 'total_liquido', label: 'Total Líquido' },
  { key: 'total_vendabl', label: 'Venda Online (BL)' },
  { key: 'total_liquidobl', label: 'Líquido Online (BL)' },
];

const App: React.FC = () => {
  // --- Global State (Top Section) ---
  const todayObj = new Date();
  const todayStr = getLocalDateString(todayObj);
  const firstDayOfMonthObj = new Date(todayObj.getFullYear(), todayObj.getMonth(), 1);
  const firstDayOfMonthStr = getLocalDateString(firstDayOfMonthObj);
  
  const [globalStartDate, setGlobalStartDate] = useState(todayStr);
  const [globalEndDate, setGlobalEndDate] = useState(todayStr);
  const [globalStoreId, setGlobalStoreId] = useState<string>(''); // '' means all stores

  // --- Comparison State (Now Middle Section) ---
  const [pieMetric, setPieMetric] = useState<string>('total_notas');
  const [pieStartDate, setPieStartDate] = useState(todayStr);
  const [pieEndDate, setPieEndDate] = useState(todayStr);

  // --- Analysis State (Now Bottom Section) ---
  const [selectedStoreId, setSelectedStoreId] = useState<string>('002');
  // Default to Month start for Analysis section
  const [analysisStartDate, setAnalysisStartDate] = useState(firstDayOfMonthStr);
  const [analysisEndDate, setAnalysisEndDate] = useState(todayStr);

  const stores = getStores();

  // --- Data Logic ---
  const globalData = useMemo(() => {
    let data = generateMockData(globalStartDate, globalEndDate);
    if (globalStoreId) {
      data = data.filter(item => item.loja === globalStoreId);
    }
    return data;
  }, [globalStartDate, globalEndDate, globalStoreId]);

  // Fetch API data for summary cards
  const [apiSummary, setApiSummary] = useState<{ total_notas: number; total_cancelados: number; total_devolvido: number; total_liquido: number; total_vendabl: number; total_liquidobl: number }>({
    total_notas: 0,
    total_cancelados: 0,
    total_devolvido: 0,
    total_liquido: 0,
    total_vendabl: 0,
    total_liquidobl: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch API data when dates or store selection changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiData = await fetchApiSalesData(globalStartDate, globalEndDate);
        const summary = mapApiToSalesSummary(apiData, globalStoreId);
        setApiSummary(summary);
      } catch (err) {
        console.error('Error fetching API data:', err);
        setError('Erro ao carregar dados da API');
        // Set empty summary in case of error
        setApiSummary({
          total_notas: 0,
          total_cancelados: 0,
          total_devolvido: 0,
          total_liquido: 0,
          total_vendabl: 0,
          total_liquidobl: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [globalStartDate, globalEndDate, globalStoreId]);

  const globalSummary = apiSummary;

  const analysisData = useMemo(() => {
    const rawData = generateMockData(analysisStartDate, analysisEndDate);
    return rawData.filter(item => item.loja === selectedStoreId);
  }, [analysisStartDate, analysisEndDate, selectedStoreId]);

  const pieChartData = useMemo(() => {
    const rawData = generateMockData(pieStartDate, pieEndDate);
    const aggregated = rawData.reduce((acc, curr) => {
      const storeName = stores.find(s => s.id === curr.loja)?.name || curr.loja;
      if (!acc[storeName]) {
        acc[storeName] = 0;
      }
      // @ts-ignore
      acc[storeName] += (curr[pieMetric] || 0);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(aggregated).map(([name, value]) => ({
      name,
      value
    })).sort((a, b) => b.value - a.value);
  }, [pieStartDate, pieEndDate, pieMetric, stores]);

  const selectedMetricLabel = METRIC_OPTIONS.find(m => m.key === pieMetric)?.label || '';

  // --- Styles ---
  // High contrast input style to fix visibility issues
  const inputStyle = "w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 shadow-sm";
  const labelStyle = "block mb-1 text-xs font-bold text-slate-500 uppercase tracking-wide";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* Dark Header */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Dashboard Empresarial</h1>
              <p className="text-xs text-slate-400 hidden sm:block">Analytics & Performance</p>
            </div>
          </div>
          <div className="text-sm text-slate-300">
            {formatDateBR(todayStr)}
          </div>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Global Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-800 uppercase">Filtros Globais</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div>
              <label className={labelStyle}>Loja</label>
              <select 
                value={globalStoreId}
                onChange={(e) => setGlobalStoreId(e.target.value)}
                className={inputStyle}
              >
                <option value="">Todas as Lojas</option>
                {stores.map(store => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
            </div>
            
            {/* Spans 2 columns */}
            <div className="md:col-span-2">
              <DateRangeSelector 
                startDate={globalStartDate}
                endDate={globalEndDate}
                onStartDateChange={setGlobalStartDate}
                onEndDateChange={setGlobalEndDate}
              />
            </div>

            <div className="flex items-end h-full pb-[2px]">
               <div className="w-full bg-blue-50 border border-blue-100 rounded-lg p-2.5 flex items-center justify-center text-blue-700 text-sm font-medium h-[42px]">
                 {globalStoreId ? stores.find(s => s.id === globalStoreId)?.name : 'Visão Consolidada'}
               </div>
            </div>
          </div>
        </div>

        {/* Section 1: Summary Cards */}
        <div className="space-y-4">
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-slate-600">Carregando dados...</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}
          
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <SummaryCard title="Total Notas" value={globalSummary.total_notas} icon={DollarSign} colorClass="bg-blue-600" />
              <SummaryCard title="Total Cancelados" value={globalSummary.total_cancelados} icon={AlertCircle} colorClass="bg-red-500" />
              <SummaryCard title="Total Devolvido" value={globalSummary.total_devolvido} icon={Archive} colorClass="bg-orange-500" />
              <SummaryCard title="Total Líquido" value={globalSummary.total_liquido} icon={TrendingUp} colorClass="bg-emerald-600" />
              <SummaryCard title="Venda Online (BL)" value={globalSummary.total_vendabl} icon={ShoppingCart} colorClass="bg-indigo-500" />
              <SummaryCard title="Líquido Online (BL)" value={globalSummary.total_liquidobl} icon={CreditCard} colorClass="bg-purple-600" />
            </div>
          )}
        </div>

        {/* Section 2: Stores Comparison Pie Chart */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <PieChartIcon className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-bold text-slate-800">Comparativo entre Lojas</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div>
                <label className={labelStyle}>Métrica de Comparação</label>
                <select 
                  value={pieMetric}
                  onChange={(e) => setPieMetric(e.target.value)}
                  className={inputStyle}
                >
                  {METRIC_OPTIONS.map(opt => (
                    <option key={opt.key} value={opt.key}>{opt.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <DateRangeSelector 
                  startDate={pieStartDate}
                  endDate={pieEndDate}
                  onStartDateChange={setPieStartDate}
                  onEndDateChange={setPieEndDate}
                />
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              <div className="w-full lg:w-1/2 h-[400px]">
                <StoreComparisonPieChart data={pieChartData} metricLabel={selectedMetricLabel} />
              </div>
              <div className="w-full lg:w-1/2">
                <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">
                  Ranking de Participação
                </h3>
                <div className="overflow-hidden border border-slate-200 rounded-lg shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 text-xs font-bold text-slate-600 uppercase border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left">Loja</th>
                        <th className="px-4 py-3 text-right">Valor</th>
                        <th className="px-4 py-3 text-right">%</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {pieChartData.map((item, idx) => {
                        const total = pieChartData.reduce((acc, curr) => acc + curr.value, 0);
                        const percent = total > 0 ? (item.value / total) * 100 : 0;
                        return (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-800 flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][idx % 6] }}></span>
                              {item.name}
                            </td>
                            <td className="px-4 py-3 text-right text-slate-600 font-mono">{formatCurrency(item.value)}</td>
                            <td className="px-4 py-3 text-right text-slate-500">{percent.toFixed(1)}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                      <tr>
                        <td className="px-4 py-3">Total</td>
                        <td className="px-4 py-3 text-right">
                          {formatCurrency(pieChartData.reduce((acc, curr) => acc + curr.value, 0))}
                        </td>
                        <td className="px-4 py-3 text-right">100%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Store Evolution Analysis (Moved to Bottom) */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <Store className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-800">Análise Detalhada por Loja</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div>
                <label className={labelStyle}>Selecionar Loja</label>
                <select 
                  value={selectedStoreId}
                  onChange={(e) => setSelectedStoreId(e.target.value)}
                  className={inputStyle}
                >
                  {stores.map(store => (
                    <option key={store.id} value={store.id}>{store.name} ({store.id})</option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <DateRangeSelector 
                  startDate={analysisStartDate}
                  endDate={analysisEndDate}
                  onStartDateChange={setAnalysisStartDate}
                  onEndDateChange={setAnalysisEndDate}
                  hideToday={true} // Hide Today option here
                />
              </div>
            </div>
          </div>

          <div className="p-6 grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-3 xl:col-span-1 min-h-[300px] flex flex-col">
              <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase flex items-center gap-2 tracking-wider">
                <TrendingUp className="w-4 h-4" /> Evolução no Tempo
              </h3>
              <div className="flex-1 bg-white border border-slate-100 rounded-lg p-2 shadow-inner">
                <StoreEvolutionChart data={analysisData} />
              </div>
            </div>

            <div className="lg:col-span-3 xl:col-span-2 flex flex-col">
               <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase flex items-center gap-2 tracking-wider">
                 <BarChart3 className="w-4 h-4" /> Dados Diários
               </h3>
               <div className="overflow-x-auto border border-slate-200 rounded-lg custom-scrollbar max-h-[420px]">
                 <table className="w-full text-sm text-left">
                   <thead className="text-xs text-slate-600 uppercase bg-slate-100 sticky top-0 z-10 shadow-sm">
                     <tr>
                       <th className="px-4 py-3 font-bold border-b border-slate-200">Data</th>
                       <th className="px-4 py-3 font-bold border-b border-slate-200 text-right text-blue-700">T. Notas</th>
                       <th className="px-4 py-3 font-bold border-b border-slate-200 text-right text-red-600">Cancel.</th>
                       <th className="px-4 py-3 font-bold border-b border-slate-200 text-right text-orange-600">Devol.</th>
                       <th className="px-4 py-3 font-bold border-b border-slate-200 text-right text-emerald-700">Líquido</th>
                       <th className="px-4 py-3 font-bold border-b border-slate-200 text-right text-indigo-700">V. BL</th>
                       <th className="px-4 py-3 font-bold border-b border-slate-200 text-right text-purple-700">L. BL</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {analysisData.length === 0 ? (
                       <tr>
                         <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                           Nenhum dado encontrado.
                         </td>
                       </tr>
                     ) : (
                       analysisData.map((row, index) => (
                         <tr key={index} className="hover:bg-blue-50/50 transition-colors even:bg-slate-50/30">
                           <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap border-r border-slate-100">
                             {formatDateBR(row.data)}
                           </td>
                           <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(row.total_notas)}</td>
                           <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(row.total_cancelados)}</td>
                           <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(row.total_devolvido)}</td>
                           <td className="px-4 py-3 text-right font-bold text-slate-800 bg-slate-50/50">{formatCurrency(row.total_liquido)}</td>
                           <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(row.total_vendabl)}</td>
                           <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(row.total_liquidobl)}</td>
                         </tr>
                       ))
                     )}
                   </tbody>
                   {analysisData.length > 0 && (
                      <tfoot className="bg-slate-100 text-xs font-bold uppercase text-slate-800 sticky bottom-0 border-t-2 border-slate-200">
                        <tr>
                          <td className="px-4 py-3">Total Geral</td>
                          <td className="px-4 py-3 text-right text-blue-700">
                            {formatCurrency(analysisData.reduce((acc, r) => acc + r.total_notas, 0))}
                          </td>
                          <td className="px-4 py-3 text-right text-red-600">
                            {formatCurrency(analysisData.reduce((acc, r) => acc + r.total_cancelados, 0))}
                          </td>
                          <td className="px-4 py-3 text-right text-orange-600">
                            {formatCurrency(analysisData.reduce((acc, r) => acc + r.total_devolvido, 0))}
                          </td>
                          <td className="px-4 py-3 text-right text-emerald-700 bg-slate-200/50">
                            {formatCurrency(analysisData.reduce((acc, r) => acc + r.total_liquido, 0))}
                          </td>
                           <td className="px-4 py-3 text-right text-indigo-700">
                            {formatCurrency(analysisData.reduce((acc, r) => acc + r.total_vendabl, 0))}
                          </td>
                           <td className="px-4 py-3 text-right text-purple-700">
                            {formatCurrency(analysisData.reduce((acc, r) => acc + r.total_liquidobl, 0))}
                          </td>
                        </tr>
                      </tfoot>
                   )}
                 </table>
               </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default App;