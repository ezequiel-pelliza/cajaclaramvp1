import React, { useMemo, useState } from 'react';
import { isOwner } from '../utils/auth';
import {
  getExpenseCategories, addExpenseCategory, updateExpenseCategory,
  deleteExpenseCategory, resetExpenseCategoriesToDefaults, ExpenseCategory
} from '../utils/catalog';

const ManageExpenseCategories: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  if (!isOwner()) return <div className="p-4 text-sm text-red-700 bg-red-50 rounded">Acceso denegado.</div>;

  const [query, setQuery] = useState('');
  const [name, setName] = useState('');
  const [edited, setEdited] = useState<Record<string, string>>({});
  const [version, setVersion] = useState(0); // trigger re-render

  const categories = useMemo(() => {
    const list = getExpenseCategories();
    if (!query.trim()) return list;
    return list.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));
  }, [query, version]);

  const refresh = () => setVersion(v => v + 1);

  const add = () => {
    if (!name.trim()) return;
    addExpenseCategory(name.trim());
    setName(''); refresh();
  };
  const save = (id: string) => {
    const n = (edited[id] ?? '').trim();
    if (!n) return;
    updateExpenseCategory(id, n); setEdited(s => ({ ...s, [id]: '' })); refresh();
  };
  const remove = (id: string) => {
    if (confirm('¿Eliminar categoría?')) { deleteExpenseCategory(id); refresh(); }
  };
  const restore = () => {
    if (confirm('¿Restaurar categorías por defecto? Se perderán cambios.')) {
      resetExpenseCategoriesToDefaults(); refresh();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="px-3 py-1 rounded border hover:bg-gray-50">Volver</button>
        <h1 className="text-xl font-semibold">Categorías de Egresos</h1>
        <div className="ml-auto">
          <button onClick={restore} className="px-3 py-1 rounded border hover:bg-gray-50">Restaurar defaults</button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar..." className="border rounded px-3 py-2 flex-1"/>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2">Nombre</th>
              <th className="px-4 py-2 w-40">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c: ExpenseCategory) => (
              <tr key={c.id} className="border-t">
                <td className="px-4 py-2">
                  <input
                    defaultValue={c.name}
                    onChange={e => setEdited(s => ({ ...s, [c.id]: e.target.value }))}
                    className="border rounded px-3 py-1 w-full"
                  />
                </td>
                <td className="px-4 py-2">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => save(c.id)} className="px-3 py-1 rounded bg-blue-600 text-white">Guardar</button>
                    <button onClick={() => remove(c.id)} className="px-3 py-1 rounded border">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td className="px-4 py-6 text-center text-gray-500" colSpan={2}>Sin categorías.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex gap-2">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nueva categoría" className="border rounded px-3 py-2 flex-1"/>
        <button onClick={add} className="px-4 py-2 rounded bg-green-600 text-white">Agregar</button>
      </div>
    </div>
  );
};

export default ManageExpenseCategories;