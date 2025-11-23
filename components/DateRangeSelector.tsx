import React from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import { getLocalDateString } from '../utils';

interface DateRangeSelectorProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  hideToday?: boolean;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  hideToday = false,
}) => {
  
  // Calculate reference dates for visual feedback
  const todayObj = new Date();
  const todayStr = getLocalDateString(todayObj);

  // Week Start (Monday)
  const tempDate = new Date(todayObj);
  const day = tempDate.getDay();
  const diff = tempDate.getDate() - (day === 0 ? 6 : day - 1);
  const mondayDate = new Date(tempDate.setDate(diff));
  const weekStartStr = getLocalDateString(mondayDate);

  // Month Start
  const firstDayDate = new Date(todayObj.getFullYear(), todayObj.getMonth(), 1);
  const monthStartStr = getLocalDateString(firstDayDate);

  // Check active states
  const isTodayActive = !hideToday && startDate === todayStr && endDate === todayStr;
  const isWeekActive = startDate === weekStartStr && endDate === todayStr;
  const isMonthActive = startDate === monthStartStr && endDate === todayStr;

  const handleToday = () => {
    onStartDateChange(todayStr);
    onEndDateChange(todayStr);
  };

  const handleWeek = () => {
    onStartDateChange(weekStartStr);
    onEndDateChange(todayStr);
  };

  const handleMonth = () => {
    onStartDateChange(monthStartStr);
    onEndDateChange(todayStr);
  };

  const inputStyle = "w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 shadow-sm";
  const buttonStyle = "px-3 py-1 text-xs font-medium rounded-md transition-colors border";
  
  const getButtonStyle = (isActive: boolean) => 
    isActive 
      ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-sm"
      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
          <Calendar className="w-3 h-3" /> Período
        </label>
        <div className="flex gap-1">
          {!hideToday && (
            <button onClick={handleToday} className={`${buttonStyle} ${getButtonStyle(isTodayActive)}`}>
              Hoje
            </button>
          )}
          <button onClick={handleWeek} className={`${buttonStyle} ${getButtonStyle(isWeekActive)}`}>
            Semana
          </button>
          <button onClick={handleMonth} className={`${buttonStyle} ${getButtonStyle(isMonthActive)}`}>
            Mês
          </button>
        </div>
      </div>
      
      <div className="flex gap-2 items-center">
        <div className="relative w-full">
           <input 
            type="date" 
            value={startDate}
            max={endDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className={inputStyle}
          />
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <div className="relative w-full">
          <input 
            type="date" 
            value={endDate}
            min={startDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className={inputStyle}
          />
        </div>
      </div>
    </div>
  );
};