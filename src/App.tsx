import React, { useEffect, useMemo, useState } from 'react';
import Dashboard from './components/Dashboard';
import POSSystem from './components/POSSystem';
import ExpenseForm from './components/ExpenseForm';
import History from './components/History';
import PinGate from './components/PinGate';
import ManageExpenseCategories from './components/ManageExpenseCategories';
import ManageMenu from './components/ManageMenu';
import SuccessMessage from './components/SuccessMessage';
import { canAccess, getRole, isOwner, logout, Role } from './utils/auth';
import { Order } from './types/pos';
import { addIncome } from './utils/storage';

type Page = 'dashboard' | 'pos' | 'expense' | 'history' | 'manageCategories' | 'manageMenu';

const App: React.FC = () => {
  const [unlocked, setUnlocked] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const defaultPage: Page = role === 'cashier' ? 'pos' : 'dashboard';
  const [page, setPage] = useState<Page>(defaultPage);

  useEffect(() => {
    const r = getRole();
    setRole(r);
    setUnlocked(!!r);
    setPage(r === 'cashier' ? 'pos' as Page : 'dashboard');
  }, []);

  // Redirección si el rol cambia o intenta ir a página no permitida
  useEffect(() => {
    if (!role) return;
    if (!canAccess(page, role)) {
      setPage(role === 'cashier' ? 'pos' : 'dashboard');
    }
  }, [role, page]);

  const onUnlock = () => {
    const r = getRole();
    setRole(r);
    setUnlocked(true);
    setPage(r === 'cashier' ? 'pos' : 'dashboard');
  };

  const handleOrderComplete = (order: Order) => {
    // Convertir la orden del POS en un ingreso para el sistema financiero
    const income = {
      date: order.date,
      amount: order.total,
      description: `Pedido #${order.id} - ${order.items.length} productos`,
      type: 'income' as const,
      paymentMethod: order.paymentMethod === 'mixto' ? 'efectivo' : order.paymentMethod
    };
    
    addIncome(income);
    setSuccessMessage('¡Pedido completado y registrado exitosamente!');
    setRefreshTrigger(prev => prev + 1);
    if (role === 'owner') {
      setPage('dashboard');
    }
  };

  const handleFormSave = (type: 'income' | 'expense') => {
    const messages = {
      income: '¡Ingreso guardado exitosamente!',
      expense: '¡Egreso guardado exitosamente!'
    };
    
    setSuccessMessage(messages[type]);
    setRefreshTrigger(prev => prev + 1);
    setPage('dashboard');
  };

  const Nav = useMemo(() => {
    if (!role) return null;
    if (role === 'cashier') {
      return (
        <div className="sticky top-0 z-10 bg-white border-b">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <h1 className="font-semibold">Cargar venta</h1>
            <button
              onClick={() => { logout(); location.reload(); }}
              className="text-sm text-red-600 hover:underline"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      );
    }
    // dueño
    return (
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage('dashboard')}
              className={`px-3 py-1 rounded ${page==='dashboard'?'bg-gray-900 text-white':'hover:bg-gray-100'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setPage('pos')}
              className={`px-3 py-1 rounded ${page==='pos'?'bg-gray-900 text-white':'hover:bg-gray-100'}`}
            >
              Ventas (POS)
            </button>
            <button
              onClick={() => setPage('expense')}
              className={`px-3 py-1 rounded ${page==='expense'?'bg-gray-900 text-white':'hover:bg-gray-100'}`}
            >
              Egresos
            </button>
            <button
              onClick={() => setPage('history')}
              className={`px-3 py-1 rounded ${page==='history'?'bg-gray-900 text-white':'hover:bg-gray-100'}`}
            >
              Historial
            </button>
            <button
              onClick={() => setPage('manageCategories')}
              className={`px-3 py-1 rounded ${page==='manageCategories'?'bg-gray-900 text-white':'hover:bg-gray-100'}`}
            >
              Categorías
            </button>
            <button
              onClick={() => setPage('manageMenu')}
              className={`px-3 py-1 rounded ${page==='manageMenu'?'bg-gray-900 text-white':'hover:bg-gray-100'}`}
            >
              Menú
            </button>
          </div>
          <button
            onClick={() => { logout(); location.reload(); }}
            className="text-sm text-red-600 hover:underline"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }, [role, page]);

  if (!unlocked) {
    return <PinGate onUnlock={onUnlock} />;
  }

  // Render protegido por rol
  const renderPage = () => {
    if (!role) return null;
    if (role === 'cashier') {
      // cajero solo POS
      return (
        <POSSystem
          onBack={() => {}}
          onOrderComplete={handleOrderComplete}
        />
      );
    }
    // dueño
    if (page === 'dashboard') {
      return (
        <Dashboard
          onNavigate={(newPage) => setPage(newPage)}
          refreshTrigger={refreshTrigger}
        />
      );
    }
    if (page === 'expense') {
      return (
        <ExpenseForm
          onBack={() => setPage('dashboard')}
          onSave={() => handleFormSave('expense')}
        />
      );
    }
    if (page === 'pos') {
      return (
        <POSSystem
          onBack={() => setPage('dashboard')}
          onOrderComplete={handleOrderComplete}
        />
      );
    }
    if (page === 'history') {
      return (
        <History
          onBack={() => setPage('dashboard')}
        />
      );
    }
    if (page === 'manageCategories') {
      return (
        <ManageExpenseCategories
          onBack={() => setPage('dashboard')}
        />
      );
    }
    if (page === 'manageMenu') {
      return (
        <ManageMenu
          onBack={() => setPage('dashboard')}
        />
      );
    }
    return (
      <Dashboard
        onNavigate={(newPage) => setPage(newPage)}
        refreshTrigger={refreshTrigger}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {Nav}
      <main className="max-w-5xl mx-auto px-4 py-4">
        {renderPage()}
      </main>
      {successMessage && (
        <SuccessMessage
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}
    </div>
  );
};

export default App;