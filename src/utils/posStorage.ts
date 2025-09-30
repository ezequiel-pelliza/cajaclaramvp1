import { Order, OrderItem } from '../types/pos';

const ORDERS_KEY = 'finanapp-orders';

export const saveOrder = (order: Order): void => {
  const orders = getOrders();
  orders.push(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
};

export const getOrders = (): Order[] => {
  const stored = localStorage.getItem(ORDERS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const generateOrderId = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
};

export const calculateOrderTotals = (items: OrderItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = Math.round(subtotal * 0.21); // 21% IVA
  const total = subtotal + tax;
  
  return { subtotal, tax, total };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0
  }).format(amount);
};