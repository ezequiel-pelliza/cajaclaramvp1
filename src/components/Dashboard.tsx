import React, { useEffect, useState } from 'react';
import { KPIs } from '../types/finance';
import { calculateKPIs, formatCurrency, formatDate } from '../utils/calculations';
import { getFinanceData } from '../utils/storage';
import { TrendingUp, TrendingDown, DollarSign, Plus } from 'lucide-react';
import ExpenseChart from './ExpenseChart';
import WeeklyChart from './WeeklyChart';
import { History } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: 'pos' | 'expense' | 'history') => void;
  refreshTrigger: number;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, refreshTrigger }) => {
  const [kpis, setKpis] = useState<KPIs | null>(null);

  useEffect(() => {
    const data = getFinanceData();
    const calculatedKPIs = calculateKPIs(data);
    setKpis(calculatedKPIs);
  }, [refreshTrigger]);

  if (!kpis) return <div>Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sushi Roll To Go</h1>
        <p className="text-gray-600">Sistema de Gestion</p>
      </div>

      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Ingresos Totales */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Ingresos del Mes</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(kpis.totalIncome)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Egresos Totales */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Egresos del Mes</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(kpis.totalExpenses)}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Resultado Neto */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Resultado Neto</p>
              <p className={`text-2xl font-bold ${kpis.netResult >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(kpis.netResult)}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => onNavigate('pos')}
          className="bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg transition-all duration-200 hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-6 h-6 mx-auto mb-2" />
          Sistema POS
        </button>
        <button
          onClick={() => onNavigate('expense')}
          className="bg-red-600 hover:bg-red-700 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg transition-all duration-200 hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-6 h-6 mx-auto mb-2" />
          Cargar Egreso
        </button>
        <button
          onClick={() => onNavigate('history')}
          className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg transition-all duration-200 hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <History className="w-6 h-6 mx-auto mb-2" />
          Ver Historial
        </button>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Egresos</h3>
          <ExpenseChart data={kpis.expensesByCategory} />
        </div>

        {/* Weekly Comparison */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Últimos 7 Días</h3>
          <WeeklyChart data={kpis.last7Days} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;