export type Role = 'owner' | 'cashier';

const ROLE_KEY = 'role';
const PIN_OK_KEY = 'pin_ok';

export const setRole = (role: Role) => {
  localStorage.setItem(ROLE_KEY, role);
  localStorage.setItem(PIN_OK_KEY, '1');
};

export const getRole = (): Role | null => {
  if (typeof window === 'undefined') return null;
  if (localStorage.getItem(PIN_OK_KEY) !== '1') return null;
  const r = localStorage.getItem(ROLE_KEY);
  return (r === 'owner' || r === 'cashier') ? r : null;
};

export const isOwner = () => getRole() === 'owner';
export const isCashier = () => getRole() === 'cashier';

export const logout = () => {
  localStorage.removeItem(PIN_OK_KEY);
  localStorage.removeItem(ROLE_KEY);
};

export const canAccess = (page: string, role: Role) => {
  if (role === 'owner') return true;
  // cajero solo puede usar POS / ventas
  return ['pos'].includes(page);
};