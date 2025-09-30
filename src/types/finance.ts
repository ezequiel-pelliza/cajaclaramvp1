export interface Transaction {
  id: string;
  date: string;
  amount: number;
  description?: string;
  type: 'income' | 'expense';
}

export interface Income extends Transaction {
  type: 'income';
  paymentMethod: 'efectivo' | 'tarjeta' | 'transferencia' | 'mercadopago';
}

export interface Expense extends Transaction {
  type: 'expense';
  category: 'proveedores-comida' | 'bebidas' | 'salarios' | 'alquiler' | 'marketing' | 'servicios-publicos' | 'impuestos' | 'descartables' | 'otros';
  supplier?: string;
}

export interface FinanceData {
  incomes: Income[];
  expenses: Expense[];
}

export interface KPIs {
  totalIncome: number;
  totalExpenses: number;
  netResult: number;
  expensesByCategory: Record<string, number>;
  last7Days: { date: string; income: number; expense: number }[];
}