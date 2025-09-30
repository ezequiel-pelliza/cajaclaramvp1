import React, { useEffect, useState } from 'react';
import { setRole } from '../utils/auth';

interface PinGateProps { onUnlock: () => void; }

const PinGate: React.FC<PinGateProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // si ya está logueado, seguir
    try {
      if (localStorage.getItem('pin_ok') === '1') onUnlock();
    } catch {}
  }, [onUnlock]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const ownerPin = import.meta.env.VITE_OWNER_PIN ?? '9999';
    const cashierPin = import.meta.env.VITE_CASHIER_PIN ?? '1111';

    if (pin === String(ownerPin)) {
      setRole('owner');
      onUnlock();
      return;
    }
    if (pin === String(cashierPin)) {
      setRole('cashier');
      onUnlock();
      return;
    }
    setError('PIN incorrecto');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <form onSubmit={submit} className="bg-white border rounded-xl p-6 w-full max-w-xs">
        <h1 className="text-lg font-semibold mb-4">Ingresá tu PIN</h1>
        <input
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={e => setPin(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-2"
          placeholder="****"
          autoFocus
        />
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-2">
          Entrar
        </button>
      </form>
    </div>
  );
};

export default PinGate;