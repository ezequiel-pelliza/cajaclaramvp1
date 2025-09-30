export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'rolls' | 'entradas' | 'bebidas' | 'postres' | 'extras';
  description?: string;
  available: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export interface Customer {
  name: string;
  phone: string;
  address: string;
}

export interface Order {
  id: string;
  date: string;
  time: string;
  type: 'dine-in' | 'takeaway' | 'delivery';
  tableNumber?: number;
  customer?: Customer;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'efectivo' | 'tarjeta' | 'mercadopago' | 'mixto';
  paymentDetails?: {
    cash?: number;
    card?: number;
  };
  status: 'pending' | 'preparing' | 'ready' | 'completed';
}

export interface POSState {
  currentOrder: {
    type: Order['type'];
    tableNumber?: number;
    customer?: Customer;
    items: OrderItem[];
  };
  selectedCategory: Product['category'];
  paymentMode: boolean;
}