import { FinanceData, Income, Expense } from '../types/finance';

const STORAGE_KEY = 'finanapp-data';

// Datos de ejemplo para el prototipo
const sampleData: FinanceData = {
  incomes: [
    {
      id: '1',
      date: '2025-01-15',
      amount: 45000,
      description: 'Ventas del día',
      type: 'income',
      paymentMethod: 'efectivo'
    },
    {
      id: '2', 
      date: '2025-01-14',
      amount: 52000,
      description: 'Ventas del día',
      type: 'income',
      paymentMethod: 'tarjeta'
    },
    {
      id: '3',
      date: '2025-01-13', 
      amount: 38000,
      description: 'Ventas del día',
      type: 'income',
      paymentMethod: 'mercadopago'
    }
  ],
  expenses: [
    {
      id: '4',
      date: '2025-01-15',
      amount: 15000,
      description: 'Compra de carne',
      type: 'expense',
      category: 'proveedores-comida',
      supplier: 'Carnicería Central'
    },
    {
      id: '5',
      date: '2025-01-14',
      amount: 8000,
      description: 'Gaseosas',
      type: 'expense', 
      category: 'bebidas',
      supplier: 'Distribuidora Los Andes'
    },
    {
      id: '6',
      date: '2025-01-13',
      amount: 25000,
      description: 'Salario parte tiempo',
      type: 'expense',
      category: 'salarios'
    }
  ]
};

export const getFinanceData = (): FinanceData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    saveFinanceData(sampleData);
    return sampleData;
  }
  return JSON.parse(stored);
};

export const saveFinanceData = (data: FinanceData): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const addIncome = (income: Omit<Income, 'id'>): void => {
  const data = getFinanceData();
  const newIncome: Income = {
    ...income,
    id: Date.now().toString()
  };
  data.incomes.push(newIncome);
  saveFinanceData(data);
};

export const addExpense = (expense: Omit<Expense, 'id'>): void => {
  const data = getFinanceData();
  const newExpense: Expense = {
    ...expense,
    id: Date.now().toString()
  };
  data.expenses.push(newExpense);
  saveFinanceData(data);
};