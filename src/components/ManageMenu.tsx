import React, { useMemo, useState } from 'react';
import { isOwner } from '../utils/auth';
import {
  getMenuCategories, addMenuCategory, updateMenuCategory, deleteMenuCategory,
  getMenuItems, addMenuItem, updateMenuItem, deleteMenuItem, resetMenuToDefaults,
  MenuCategory, MenuItem
} from '../utils/catalog';

const ManageMenu: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  if (!isOwner()) return <div className="p-4 text-sm text-red-700 bg-red-50 rounded">Acceso denegado.</div>;

  const [v, setV] = useState(0);
  const refresh = () => setV(x => x + 1);

  // Categorías
  const [catName, setCatName] = useState('');
  const [catQuery, setCatQuery] = useState('');
  const cats = useMemo(() => {
    const all = getMenuCategories();
    if (!catQuery.trim()) return all;
    return all.filter(c => c.name.toLowerCase().includes(catQuery.toLowerCase()));
  }, [v, catQuery]);

  const addCat = () => { if (!catName.trim()) return; addMenuCategory(catName.trim()); setCatName(''); refresh(); };
  const saveCat = (id: string, name: string) => { if (!name.trim()) return; updateMenuCategory(id, name.trim()); refresh(); };
  const delCat  = (id: string) => { if (confirm('¿Eliminar categoría? Los productos quedarán sin categoría.')) { deleteMenuCategory(id); refresh(); } };

  // Items
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState<string>('');
  const [itemCat, setItemCat] = useState<string>('');
  const [itemQuery, setItemQuery] = useState('');
  const items = useMemo(() => {
    const all = getMenuItems();
    if (!itemQuery.trim()) return all;
    return all.filter(i =>
      i.name.toLowerCase().includes(itemQuery.toLowerCase())
      || (getMenuCategories().find(c => c.id === i.categoryId)?.name.toLowerCase() || '').includes(itemQuery.toLowerCase())
    );
  }, [v, itemQuery]);

  const addItem = () => {
    const price = Number(itemPrice);
    if (!itemName.trim() || !itemCat) return;
    if (isNaN(price) || price < 0) return;
    addMenuItem({ name: itemName.trim(), price, categoryId: itemCat, active: true });
    setItemName(''); setItemPrice(''); setItemCat(''); refresh();
  };
  const saveItem = (id: string, patch: Partial<MenuItem>) => { updateMenuItem(id, patch); refresh(); };
  const delItem = (id: string) => { if (confirm('¿Eliminar producto?')) { deleteMenuItem(id); refresh(); } };

  const restoreMenu = () => { if (confirm('¿Restaurar menú por defecto?')) { resetMenuToDefaults(); refresh(); } };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="px-3 py-1 rounded border hover:bg-gray-50">Volver</button>
        <h1 className="text-xl font-semibold">Menú</h1>
        <div className="ml-auto">
          <button onClick={restoreMenu} className="px-3 py-1 rounded border hover:bg-gray-50">Restaurar defaults</button>
        </div>
      </div>

      {/* Categorías */}
      <section className="mb-8">
        <h2 className="font-semibold mb-2">Categorías</h2>
        <div className="flex gap-2 mb-2">
          <input value={catQuery} onChange={e=>setCatQuery(e.target.value)} placeholder="Buscar..." className="border rounded px-3 py-2 flex-1" />
        </div>
        <div className="bg-white border rounded-lg overflow-hidden mb-3">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50"><tr><th className="text-left px-4 py-2">Nombre</th><th className="px-4 py-2 w-40">Acciones</th></tr></thead>
            <tbody>
              {cats.map((c: MenuCategory) => (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-2">
                    <input defaultValue={c.name} onBlur={e=>saveCat(c.id, e.target.value)} className="border rounded px-3 py-1 w-full"/>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2 justify-end">
                      <button onClick={()=>delCat(c.id)} className="px-3 py-1 rounded border">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {cats.length===0 && <tr><td colSpan={2} className="px-4 py-6 text-center text-gray-500">Sin categorías.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex gap-2">
          <input value={catName} onChange={e=>setCatName(e.target.value)} placeholder="Nueva categoría" className="border rounded px-3 py-2 flex-1"/>
          <button onClick={addCat} className="px-4 py-2 rounded bg-green-600 text-white">Agregar</button>
        </div>
      </section>

      {/* Items */}
      <section>
        <h2 className="font-semibold mb-2">Productos</h2>
        <div className="flex flex-col sm:flex-row gap-2 mb-2">
          <input value={itemQuery} onChange={e=>setItemQuery(e.target.value)} placeholder="Buscar producto o categoría..." className="border rounded px-3 py-2 flex-1" />
        </div>
        <div className="bg-white border rounded-lg overflow-x-auto mb-3">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2">Nombre</th>
                <th className="text-right px-4 py-2">Precio</th>
                <th className="text-left px-4 py-2">Categoría</th>
                <th className="text-left px-4 py-2">Activo</th>
                <th className="px-4 py-2 w-40">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i: MenuItem) => {
                const catName = getMenuCategories().find(c=>c.id===i.categoryId)?.name || '-';
                return (
                  <tr key={i.id} className="border-t">
                    <td className="px-4 py-2">
                      <input defaultValue={i.name} onBlur={e=>saveItem(i.id, { name: e.target.value })} className="border rounded px-3 py-1 w-full"/>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <input defaultValue={String(i.price)} onBlur={e=>{ const n=Number(e.target.value); if(!isNaN(n)&&n>=0) saveItem(i.id,{price:n}); }} className="border rounded px-3 py-1 w-24 text-right"/>
                    </td>
                    <td className="px-4 py-2">
                      <select defaultValue={i.categoryId} onChange={e=>saveItem(i.id,{categoryId:e.target.value})} className="border rounded px-3 py-1">
                        <option value="">(sin categoría)</option>
                        {getMenuCategories().map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <input type="checkbox" defaultChecked={i.active} onChange={e=>saveItem(i.id,{active:e.target.checked})}/>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2 justify-end">
                        <button onClick={()=>delItem(i.id)} className="px-3 py-1 rounded border">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {items.length===0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">Sin productos.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input value={itemName} onChange={e=>setItemName(e.target.value)} placeholder="Nuevo producto" className="border rounded px-3 py-2 flex-1"/>
          <input value={itemPrice} onChange={e=>setItemPrice(e.target.value)} placeholder="Precio" inputMode="decimal" className="border rounded px-3 py-2 w-32 text-right"/>
          <select value={itemCat} onChange={e=>setItemCat(e.target.value)} className="border rounded px-3 py-2">
            <option value="">Categoría…</option>
            {getMenuCategories().map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={addItem} className="px-4 py-2 rounded bg-green-600 text-white">Agregar</button>
        </div>
      </section>
    </div>
  );
};

export default ManageMenu;