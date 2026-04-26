'use client';

import { MONTH_NAMES } from '@/features/map/utils/exportUtils';
import './MonthFilter.css';

interface MonthFilterProps {
  availableYears: number[];
  availableMonths: number[];   // meses disponíveis para o ano selecionado (1-12)
  selectedYear: number;
  selectedMonth: number;       // 0 = todos os meses
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
}

export default function MonthFilter({
  availableYears,
  availableMonths,
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
}: MonthFilterProps) {
  return (
    <div className="month-filter">
      <div className="month-filter-group">
        <label htmlFor="month-select" className="month-filter-label">Mostrar dados do mês:</label>
        <select
          id="month-select"
          className="month-filter-select"
          value={selectedMonth}
          onChange={(e) => onMonthChange(Number(e.target.value))}
        >
          <option value={0}>Todos os meses</option>
          {availableMonths.map((m) => (
            <option key={m} value={m}>
              {MONTH_NAMES[m - 1]}
            </option>
          ))}
        </select>
      </div>

      <div className="month-filter-group">
        <label htmlFor="year-select" className="month-filter-label">Ano:</label>
        <select
          id="year-select"
          className="month-filter-select"
          value={selectedYear}
          onChange={(e) => onYearChange(Number(e.target.value))}
        >
          {availableYears.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
