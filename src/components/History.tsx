import React, { useMemo, useState } from 'react';
import { ArrowLeft, Download, Filter } from 'lucide-react';
import { getFinanceData } from '../utils/storage';
import { formatDate, formatCurrency } from '../utils/calculations';
import { toCSV, downloadCSV } from '../utils/csv';

interface HistoryProps {
  onBack: () => void;
}

type Row = {
  tipo: 'Ingreso' | 'Egreso';
  fecha: string;
  monto: number;
  categoria?: string;
  medio?: string;
  descripcion?: string;
};

const History: React.FC<HistoryProps> = ({ onBack }) => {
  const data = getFinanceData();

  const rows: Row[] = useMemo(() => {
    const fromIncomes = (data.incomes || []).map(i => ({
      tipo: 'Ingreso' as const,
      fecha: i.date,
      monto: i.amount,
      medio: i.paymentMethod,
      descripcion: i.description || 'Venta'
    }));
    const fromExpenses = (data.expenses || []).map(e => ({
      tipo: 'Egreso' as const,
      fecha: e.date,
      monto: e.amount,
      categoria: e.category,
      descripcion: e.supplier || e.description || 'Gasto'
    }));
    return [...fromIncomes, ...fromExpenses].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
  }, [data]);

  const [q, setQ] = useState('');
  const [tipo, setTipo] = useState<'Todos' | 'Ingresos' | 'Egresos'>('Todos');

  const filtered = rows.filter(r => {
    const okTipo =
      tipo === 'Todos' ||
      (tipo === 'Ingresos' && r.tipo === 'Ingreso') ||
      (tipo === 'Egresos' && r.tipo === 'Egreso');
    const hay = (s?: string) => (s || '').toLowerCase().includes(q.toLowerCase());
    const okQ = hay(r.descripcion) || hay(r.categoria) || hay(r.medio);
    return okTipo && (q.trim() ? okQ : true);
  });

  const exportar = () => {
    const plain = filtered.map(r => ({
      tipo: r.tipo,
      fecha: r.fecha,
      monto: r.monto,
      categoria: r.categoria || '',
      medio: r.medio || '',
      descripcion: r.descripcion || ''
    }));
    const csv = toCSV(plain);
    downloadCSV('historial.csv', csv);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="p-2 rounded hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold">Historial</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex items-center gap-2 flex-1">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={tipo}
            onChange={e => setTipo(e.target.value as any)}
            className="border rounded px-3 py-2"
          >
            <option>Todos</option>
            <option>Ingresos</option>
            <option>Egresos</option>
          </select>
          <input
            placeholder="Buscar por texto/categoría/medio…"
            value={q}
            onChange={e => setQ(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
          />
        </div>
        <button
          onClick={exportar}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </button>
      </div>

      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-2">Tipo</th>
              <th className="text-left px-4 py-2">Fecha</th>
              <th className="text-right px-4 py-2">Monto</th>
              <th className="text-left px-4 py-2">Categoría</th>
              <th className="text-left px-4 py-2">Medio</th>
              <th className="text-left px-4 py-2">Descripción</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-4 py-2">{r.tipo}</td>
                <td className="px-4 py-2">{formatDate(r.fecha)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(r.monto)}</td>
                <td className="px-4 py-2">{r.categoria || '-'}</td>
                <td className="px-4 py-2">{r.medio || '-'}</td>
                <td className="px-4 py-2">{r.descripcion || '-'}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Sin resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;