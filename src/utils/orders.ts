export type CartItem = { id: string; name: string; price: number; qty: number; note?: string };
export type OrderType = 'salon' | 'takeaway' | 'delivery';

export type OpenOrder = {
  id: string;                 // uid
  tableNumber?: string;       // salón
  pax?: number;               // salón
  orderType: 'salon';
  items: CartItem[];
  discountMode?: 'none'|'percent'|'amount';
  discountValue?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

const KEY = 'open_orders';

const safeParse = <T>(k: string, fb: T): T => {
  try { const raw = localStorage.getItem(k); return raw ? JSON.parse(raw) as T : fb; } catch { return fb; }
};
const save = (arr: OpenOrder[]) => localStorage.setItem(KEY, JSON.stringify(arr));
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export const getOpenOrders = (): OpenOrder[] => safeParse<OpenOrder[]>(KEY, []);
export const getOpenOrder = (id: string): OpenOrder | undefined => getOpenOrders().find(o => o.id === id);

export const openOrder = (tableNumber: string, pax?: number): OpenOrder => {
  const arr = getOpenOrders();
  const o: OpenOrder = {
    id: uid(),
    tableNumber: tableNumber.trim(),
    pax,
    orderType: 'salon',
    items: [],
    discountMode: 'none',
    discountValue: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  save([o, ...arr]);
  return o;
};

export const upsertOrder = (order: OpenOrder) => {
  const arr = getOpenOrders();
  const idx = arr.findIndex(o => o.id === order.id);
  const upd = { ...order, updatedAt: new Date().toISOString() };
  if (idx === -1) save([upd, ...arr]); else { arr[idx] = upd; save(arr); }
};

export const closeOrder = (id: string) => {
  const arr = getOpenOrders().filter(o => o.id !== id);
  save(arr);
};