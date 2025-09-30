/**
 * Almacenamiento de Categorías de Egresos y Menú en localStorage.
 * Sin dependencias. IDs string. Defaults si está vacío.
 */
export type ExpenseCategory = { id: string; name: string };
export type MenuCategory    = { id: string; name: string };
export type MenuItem       = { id: string; name: string; price: number; categoryId: string; active: boolean };

const K_EC = 'expense_categories';
const K_MC = 'menu_categories';
const K_MI = 'menu_items';

const safeParse = <T>(k: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(k);
    if (!raw) return fallback;
    const val = JSON.parse(raw);
    return Array.isArray(val) || typeof val === 'object' ? val as T : fallback;
  } catch { return fallback; }
};

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

// Defaults
const DEFAULT_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: 'insumos', name: 'Insumos' },
  { id: 'personal', name: 'Personal' },
  { id: 'alquiler', name: 'Alquiler' },
  { id: 'servicios', name: 'Servicios' },
  { id: 'impuestos', name: 'Impuestos' },
  { id: 'delivery', name: 'Delivery' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'mantenimiento', name: 'Mantenimiento' },
  { id: 'otros', name: 'Otros' }
];

const DEFAULT_MENU_CATEGORIES: MenuCategory[] = [
  { id: 'rolls', name: 'Rolls' },
  { id: 'bebidas', name: 'Bebidas' },
  { id: 'postres', name: 'Postres' }
];

const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: uid(), name: 'California Roll', price: 4500, categoryId: 'rolls',   active: true },
  { id: uid(), name: 'Coca-Cola 500ml', price: 1800, categoryId: 'bebidas', active: true },
  { id: uid(), name: 'Cheesecake',      price: 3200, categoryId: 'postres', active: true }
];

// Getters
export const getExpenseCategories = (): ExpenseCategory[] => {
  const v = safeParse<ExpenseCategory[]>(K_EC, []);
  if (v.length === 0) { localStorage.setItem(K_EC, JSON.stringify(DEFAULT_EXPENSE_CATEGORIES)); return [...DEFAULT_EXPENSE_CATEGORIES]; }
  return v;
};
export const getMenuCategories = (): MenuCategory[] => {
  const v = safeParse<MenuCategory[]>(K_MC, []);
  if (v.length === 0) { localStorage.setItem(K_MC, JSON.stringify(DEFAULT_MENU_CATEGORIES)); return [...DEFAULT_MENU_CATEGORIES]; }
  return v;
};
export const getMenuItems = (): MenuItem[] => {
  const v = safeParse<MenuItem[]>(K_MI, []);
  if (v.length === 0) { localStorage.setItem(K_MI, JSON.stringify(DEFAULT_MENU_ITEMS)); return [...DEFAULT_MENU_ITEMS]; }
  return v;
};

// Setters
const setExpenseCategories = (arr: ExpenseCategory[]) => localStorage.setItem(K_EC, JSON.stringify(arr));
const setMenuCategories    = (arr: MenuCategory[])    => localStorage.setItem(K_MC, JSON.stringify(arr));
const setMenuItems         = (arr: MenuItem[])        => localStorage.setItem(K_MI, JSON.stringify(arr));

// CRUD Expense Categories
export const addExpenseCategory = (name: string) => {
  const arr = getExpenseCategories();
  const item = { id: uid(), name: name.trim() };
  setExpenseCategories([...arr, item]); return item;
};
export const updateExpenseCategory = (id: string, name: string) => {
  const arr = getExpenseCategories().map(c => c.id === id ? { ...c, name: name.trim() } : c);
  setExpenseCategories(arr);
};
export const deleteExpenseCategory = (id: string) => {
  setExpenseCategories(getExpenseCategories().filter(c => c.id !== id));
};

// CRUD Menu Categories
export const addMenuCategory = (name: string) => {
  const arr = getMenuCategories();
  const item = { id: uid(), name: name.trim() };
  setMenuCategories([...arr, item]); return item;
};
export const updateMenuCategory = (id: string, name: string) => {
  const arr = getMenuCategories().map(c => c.id === id ? { ...c, name: name.trim() } : c);
  setMenuCategories(arr);
};
export const deleteMenuCategory = (id: string) => {
  // Al borrar categoría, quitar categoryId de items
  setMenuCategories(getMenuCategories().filter(c => c.id !== id));
  const items = getMenuItems().map(i => i.categoryId === id ? { ...i, categoryId: '' } : i);
  setMenuItems(items);
};

// CRUD Menu Items
export const addMenuItem = (payload: { name: string; price: number; categoryId: string; active?: boolean; }) => {
  const items = getMenuItems();
  const item: MenuItem = { id: uid(), name: payload.name.trim(), price: Math.max(0, payload.price || 0), categoryId: payload.categoryId, active: payload.active ?? true };
  setMenuItems([ ...items, item ]); return item;
};
export const updateMenuItem = (id: string, patch: Partial<Omit<MenuItem,'id'>>) => {
  const items = getMenuItems().map(i => i.id === id ? { ...i, ...patch } : i);
  setMenuItems(items);
};
export const deleteMenuItem = (id: string) => {
  setMenuItems(getMenuItems().filter(i => i.id !== id));
};

// Helpers
export const resetMenuToDefaults = () => {
  setMenuCategories(DEFAULT_MENU_CATEGORIES);
  setMenuItems(DEFAULT_MENU_ITEMS.map(i => ({ ...i, id: uid() })));
};
export const resetExpenseCategoriesToDefaults = () => {
  setExpenseCategories(DEFAULT_EXPENSE_CATEGORIES);
};