import { FinanceData, KPIs } from '../types/finance';

const CATEGORY_NAMES: Record<string, string> = {
  'proveedores-comida': 'Proveedores de Comida',
  'bebidas': 'Bebidas',
  'salarios': 'Salarios',
  'alquiler': 'Alquiler',
  'marketing': 'Marketing', 
  'servicios-publicos': 'Servicios Públicos',
  'impuestos': 'Impuestos',
  'descartables': 'Descartables',
  'otros': 'Otros'
};

export const calculateKPIs = (data: FinanceData): KPIs => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Filtrar transacciones del mes actual
  const currentMonthIncomes = data.incomes.filter(income => {
    const date = new Date(income.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const currentMonthExpenses = data.expenses.filter(expense => {
    const date = new Date(expense.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  // Calcular totales del mes
  const totalIncome = currentMonthIncomes.reduce((sum, income) => sum + income.amount, 0);
  const totalExpenses = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netResult = totalIncome - totalExpenses;

  // Calcular egresos por categoría
  const expensesByCategory = currentMonthExpenses.reduce((acc, expense) => {
    const categoryName = CATEGORY_NAMES[expense.category] || expense.category;
    acc[categoryName] = (acc[categoryName] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // Calcular últimos 7 días
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayIncomes = data.incomes
      .filter(income => income.date === dateStr)
      .reduce((sum, income) => sum + income.amount, 0);
    
    const dayExpenses = data.expenses
      .filter(expense => expense.date === dateStr)
      .reduce((sum, expense) => sum + expense.amount, 0);

    last7Days.push({
      date: dateStr,
      income: dayIncomes,
      expense: dayExpenses
    });
  }

  return {
    totalIncome,
    totalExpenses,
    netResult,
    expensesByCategory,
    last7Days
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit'
  });
};

export { CATEGORY_NAMES };