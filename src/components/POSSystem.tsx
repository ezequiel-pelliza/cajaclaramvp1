import React, { useEffect, useMemo, useState } from 'react';
import { getMenuItems, getMenuCategories } from '../utils/catalog';
import { addIncome } from '../utils/storage';
import { computeDiscount, DiscountMode } from '../utils/discounts';
import { getOpenOrders, openOrder, upsertOrder, closeOrder, OpenOrder, CartItem as OItem } from '../utils/orders';

type PaymentMethod = 'transferencia' | 'credito' | 'qr' | 'efectivo';
type OrderType = 'salon' | 'takeaway' | 'delivery';

type CartItem = { id: string; name: string; price: number; qty: number; note?: string };
const currency = (n:number) => n.toLocaleString('es-AR');

const POSSystem: React.FC = () => {
  // Catálogo
  const items = useMemo(() => getMenuItems().filter(i => i.active), []);
  const cats  = useMemo(() => getMenuCategories(), []);

  // Filtros / canal
  const [category, setCategory] = useState<string>('');
  const [orderType, setOrderType] = useState<OrderType>('salon');

  // Meta por canal
  const [tableNumber, setTableNumber] = useState<string>(''); // salón
  const [pax, setPax] = useState<string>('');                 // salón
  const [customerName, setCustomerName] = useState<string>('');     // takeaway/delivery
  const [customerPhone, setCustomerPhone] = useState<string>('');   // takeaway/delivery
  const [customerAddress, setCustomerAddress] = useState<string>(''); // delivery
  const [shippingCost, setShippingCost] = useState<string>('');       // delivery
  const [notes, setNotes] = useState<string>('');                     // observaciones

  // Carrito
  const [cart, setCart] = useState<CartItem[]>([]);

  // Descuento
  const [discountMode, setDiscountMode] = useState<DiscountMode>('none');
  const [discountValue, setDiscountValue] = useState<string>('');

  // Pagos múltiples
  const [defaultMethod, setDefaultMethod] = useState<PaymentMethod>('efectivo');
  const [payments, setPayments] = useState<{ method: PaymentMethod; amount: string }[]>([]);

  // Órdenes abiertas (solo salón)
  const [openListVersion, setOpenListVersion] = useState(0);
  const openOrders = useMemo(() => getOpenOrders(), [openListVersion]);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  // Productos filtrados
  const filtered = useMemo(
    () => !category ? items : items.filter(i => i.categoryId === category),
    [items, category]
  );

  // Totales
  const subtotal = useMemo(() => cart.reduce((s, it) => s + it.price * it.qty, 0), [cart]);
  const parsedDiscount = Number(String(discountValue).replace(',', '.'));
  const { discount, total: afterDiscount } = useMemo(
    () => computeDiscount(subtotal, discountMode, Number.isFinite(parsedDiscount) ? parsedDiscount : 0),
    [subtotal, discountMode, parsedDiscount]
  );
  const parsedShipping = Math.max(0, Number(String(shippingCost).replace(',', '.')) || 0);
  const totalToCharge = afterDiscount + (orderType === 'delivery' ? parsedShipping : 0);

  const sumPayments = useMemo(
    () => payments.reduce((s, p) => s + (Number(p.amount.replace(',', '.')) || 0), 0),
    [payments]
  );
  const remaining = Math.max(0, totalToCharge - sumPayments);
  const change = Math.max(0, sumPayments - totalToCharge);

  // Helpers carrito
  const addToCart = (id: string) => {
    const prod = items.find(i => i.id === id);
    if (!prod) return;
    setCart(prev => {
      const ex = prev.find(p => p.id === id);
      if (ex) return prev.map(p => p.id === id ? { ...p, qty: p.qty + 1 } : p);
      return [...prev, { id, name: prod.name, price: prod.price, qty: 1 }];
    });
  };
  const dec = (id: string) =>
    setCart(prev => prev.map(p => p.id===id ? { ...p, qty: Math.max(0, p.qty-1) } : p).filter(p => p.qty>0));
  const changeNote = (id: string, note: string) =>
    setCart(prev => prev.map(p => p.id===id ? { ...p, note } : p));
  const clearCart = () => setCart([]);

  // Guardado automático de orden abierta
  useEffect(() => {
    if (!currentOrderId) return;
    const order = getOpenOrders().find(o => o.id === currentOrderId);
    if (!order) return;
    const updated: OpenOrder = {
      ...order,
      items: cart.map(c => ({ id:c.id, name:c.name, price:c.price, qty:c.qty, note: c.note })) as OItem[],
      discountMode,
      discountValue: Number(String(discountValue).replace(',', '.')) || 0,
      notes
    };
    upsertOrder(updated);
    setOpenListVersion(v => v + 1);
  }, [cart, discountMode, discountValue, notes, currentOrderId]);

  // Acciones órdenes
  const doOpenOrder = () => {
    if (!tableNumber.trim()) return alert('Indicá número de mesa.');
    const o = openOrder(tableNumber.trim(), pax ? Number(pax) : undefined);
    setCurrentOrderId(o.id);
    setCart([]);
    setNotes('');
    setDiscountMode('none'); setDiscountValue('');
    setOpenListVersion(v => v + 1);
  };
  const loadOrder = (id: string) => {
    const o = getOpenOrders().find(x => x.id === id);
    if (!o) return;
    setCurrentOrderId(o.id);
    setOrderType('salon');
    setTableNumber(o.tableNumber || '');
    setPax(o.pax ? String(o.pax) : '');
    setCart(o.items || []);
    setDiscountMode((o.discountMode as DiscountMode) || 'none');
    setDiscountValue(String(o.discountValue ?? ''));
    setNotes(o.notes || '');
  };

  // Pagos
  const addPayment = () => {
    const toFill = Math.max(0, totalToCharge - sumPayments);
    setPayments(prev => [...prev, { method: defaultMethod, amount: toFill ? String(toFill) : '' }]);
  };
  const removePayment = (idx: number) => setPayments(prev => prev.filter((_,i) => i!==idx));
  const updatePayment = (idx: number, patch: Partial<{method: PaymentMethod; amount: string}>) =>
    setPayments(prev => prev.map((p,i) => i===idx ? { ...p, ...patch } : p));

  // Confirmar venta
  const confirmSale = () => {
    if (cart.length === 0) return alert('No hay productos en el carrito.');
    // Validaciones por canal
    if (orderType === 'delivery') {
      if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
        return alert('En Delivery son obligatorios: Nombre, Teléfono y Dirección.');
      }
      if (parsedShipping < 0) return alert('Costo de envío inválido.');
    }
    // Si no cargaron pagos, agregamos uno por el total con el método por defecto
    const effPayments = payments.length
      ? payments
      : [{ method: defaultMethod, amount: String(totalToCharge) }];

    const paid = effPayments.reduce((s,p)=> s + (Number(p.amount.replace(',', '.'))||0), 0);
    if (paid < totalToCharge) return alert('Pagos insuficientes para cubrir el total.');
    // payload
    const payload = {
      // Totales
      totalBefore: subtotal,
      discountType: discountMode === 'none' ? null : discountMode,
      discountValue: discountMode==='percent' ? Number(parsedDiscount) : (discountMode==='amount' ? Number(parsedDiscount) : 0),
      discountAmountApplied: discount,
      shippingCost: orderType==='delivery' ? parsedShipping : 0,
      totalAfter: totalToCharge,

      // Venta
      amount: totalToCharge,
      paymentMethod: effPayments.length > 1 ? 'mixto' : effPayments[0].method,
      payments: effPayments.map(p => ({ method: p.method, amount: Number(p.amount.replace(',', '.')) || 0 })),

      description: 'Venta POS',

      // Canal
      orderType,
      tableNumber: orderType==='salon' ? (tableNumber || undefined) : undefined,
      pax: orderType==='salon' && pax ? Number(pax) : undefined,
      customerName: orderType!=='salon' ? (customerName || undefined) : undefined,
      customerPhone: orderType!=='salon' ? (customerPhone || undefined) : undefined,
      customerAddress: orderType==='delivery' ? (customerAddress || undefined) : undefined,
      notes: notes || undefined,

      // Ítems
      items: cart.map(c => ({ id:c.id, name:c.name, price:c.price, qty:c.qty, note: c.note }))
    };

    try {
      addIncome(payload as any);
      // Si había orden abierta, cerrarla
      if (currentOrderId) { closeOrder(currentOrderId); setCurrentOrderId(null); setOpenListVersion(v=>v+1); }
      // Reset parcial
      setCart([]);
      setDiscountMode('none'); setDiscountValue('');
      if (orderType==='delivery') setShippingCost('');
      setNotes('');
      setPayments([]);
      alert('Venta registrada.');
    } catch (e:any) {
      alert(e?.message || 'Error registrando la venta.');
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Panel de productos */}
      <div>
        <div className="flex flex-wrap gap-2 mb-3">
          <select value={category} onChange={e=>setCategory(e.target.value)} className="border rounded px-3 py-2">
            <option value="">Todas las categorías</option>
            {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {/* Medio por defecto para nuevos pagos */}
          <select value={defaultMethod} onChange={e=>setDefaultMethod(e.target.value as PaymentMethod)} className="border rounded px-3 py-2">
            <option value="efectivo">Efectivo</option>
            <option value="credito">Tarjeta de crédito</option>
            <option value="qr">QR</option>
            <option value="transferencia">Transferencia</option>
          </select>
          <select value={orderType} onChange={e=>setOrderType(e.target.value as OrderType)} className="border rounded px-3 py-2">
            <option value="salon">Salón</option>
            <option value="takeaway">Para llevar</option>
            <option value="delivery">Delivery</option>
          </select>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(!category ? items : items.filter(i=>i.categoryId===category)).map(p => (
            <button key={p.id} onClick={()=>addToCart(p.id)} className="bg-white border rounded p-3 text-left hover:shadow">
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-gray-600">${currency(p.price)}</div>
            </button>
          ))}
          {filtered.length === 0 && <div className="text-sm text-gray-500">No hay productos activos.</div>}
        </div>
      </div>

      {/* Carrito / Orden */}
      <div className="bg-white border rounded p-4">
        <h2 className="font-semibold mb-3">Carrito</h2>

        {/* Solo Salón: órdenes abiertas */}
        {orderType === 'salon' && (
          <div className="mb-3 border rounded p-3">
            <div className="flex flex-wrap gap-2 items-end mb-2">
              <input value={tableNumber} onChange={e=>setTableNumber(e.target.value)} placeholder="Mesa (#)" className="border rounded px-3 py-2 w-32" />
              <input value={pax} onChange={e=>setPax(e.target.value)} placeholder="Comensales" inputMode="numeric" className="border rounded px-3 py-2 w-32" />
              <button onClick={doOpenOrder} className="px-3 py-2 border rounded">Abrir mesa</button>
            </div>
            <div className="text-sm text-gray-600 mb-1">Órdenes abiertas:</div>
            <div className="flex flex-wrap gap-2">
              {openOrders.length === 0 && <span className="text-sm text-gray-500">No hay mesas abiertas.</span>}
              {openOrders.map(o => (
                <button key={o.id} onClick={()=>loadOrder(o.id)}
                  className={`px-3 py-1 rounded border ${currentOrderId===o.id ? 'bg-gray-900 text-white' : 'hover:bg-gray-50'}`}>
                  Mesa {o.tableNumber || 's/n'} {o.pax ? `(${o.pax})` : ''}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Campos por canal */}
        <div className="mb-3 space-y-2">
          {orderType !== 'salon' && (
            <div className="grid grid-cols-2 gap-2">
              <input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Nombre" className="border rounded px-3 py-2" />
              <input value={customerPhone} onChange={e=>setCustomerPhone(e.target.value)} placeholder="Teléfono" className="border rounded px-3 py-2" />
            </div>
          )}
          {orderType === 'delivery' && (
            <div className="grid grid-cols-2 gap-2">
              <input value={customerAddress} onChange={e=>setCustomerAddress(e.target.value)} placeholder="Dirección" className="border rounded px-3 py-2 col-span-2 sm:col-span-2" />
              <input value={shippingCost} onChange={e=>setShippingCost(e.target.value)} placeholder="Costo de envío" inputMode="decimal" className="border rounded px-3 py-2 w-full sm:w-40" />
            </div>
          )}
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Observaciones (opcional)" rows={2} className="border rounded px-3 py-2 w-full" />
        </div>

        {/* Ítems */}
        <div className="space-y-2 mb-3">
          {cart.map(it => (
            <div key={it.id} className="border rounded p-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{it.name}</div>
                  <div className="text-xs text-gray-500">${currency(it.price)} x {it.qty}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>dec(it.id)} className="px-2 py-1 border rounded">-</button>
                  <span className="w-6 text-center">{it.qty}</span>
                  <button onClick={()=>addToCart(it.id)} className="px-2 py-1 border rounded">+</button>
                </div>
              </div>
              <input
                value={it.note || ''}
                onChange={e=>changeNote(it.id, e.target.value.slice(0, 200))}
                placeholder="Nota para este ítem (opcional)"
                className="mt-2 border rounded px-3 py-2 w-full"
              />
            </div>
          ))}
          {cart.length === 0 && <div className="text-sm text-gray-500">Agregá productos para empezar.</div>}
        </div>

        {/* Descuento */}
        <div className="mt-2 border-t pt-3">
          <div className="text-sm text-gray-600 mb-2">Descuento</div>
          <div className="flex gap-2 items-center">
            <select
              value={discountMode}
              onChange={e=>setDiscountMode(e.target.value as DiscountMode)}
              className="border rounded px-3 py-2"
            >
              <option value="none">Sin descuento</option>
              <option value="percent">% porcentaje</option>
              <option value="amount">$ monto</option>
            </select>
            <input
              value={discountValue}
              onChange={e=>setDiscountValue(e.target.value)}
              placeholder={discountMode==='percent' ? '0 - 100%' : '$ 0,00'}
              className="border rounded px-3 py-2 w-40"
              disabled={discountMode==='none'}
              inputMode="decimal"
            />
          </div>
        </div>

        {/* Totales */}
        <div className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>${currency(subtotal)}</span></div>
          <div className="flex justify-between"><span>Descuento</span><span>- ${currency(discount)}</span></div>
          {orderType === 'delivery' && (
            <div className="flex justify-between"><span>Envío</span><span>${currency(parsedShipping)}</span></div>
          )}
          <div className="flex justify-between font-semibold text-lg">
            <span>Total a cobrar</span><span>${currency(totalToCharge)}</span>
          </div>
        </div>

        {/* Pagos múltiples */}
        <div className="mt-4 border-t pt-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Pagos</div>
            <button onClick={addPayment} className="px-3 py-1 border rounded">Agregar pago</button>
          </div>
          <div className="space-y-2">
            {payments.map((p, idx) => (
              <div key={idx} className="flex gap-2">
                <select
                  value={p.method}
                  onChange={e=>updatePayment(idx, { method: e.target.value as PaymentMethod })}
                  className="border rounded px-3 py-2"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="credito">Tarjeta de crédito</option>
                  <option value="qr">QR</option>
                  <option value="transferencia">Transferencia</option>
                </select>
                <input
                  value={p.amount}
                  onChange={e=>updatePayment(idx, { amount: e.target.value })}
                  placeholder="$ 0,00"
                  inputMode="decimal"
                  className="border rounded px-3 py-2 w-40"
                />
                <button onClick={()=>removePayment(idx)} className="px-3 py-2 border rounded">Quitar</button>
              </div>
            ))}
            {payments.length === 0 && <div className="text-sm text-gray-500">Podés agregar uno o más pagos. Si no agregás, se creará uno por el total con el medio por defecto.</div>}
          </div>
          <div className="mt-3 text-sm">
            <div className="flex justify-between"><span>Pagado</span><span>${currency(sumPayments)}</span></div>
            <div className="flex justify-between"><span>Restante</span><span>${currency(remaining)}</span></div>
            {change > 0 && <div className="flex justify-between"><span>Vuelto</span><span>${currency(change)}</span></div>}
          </div>
        </div>

        {/* Acciones */}
        <div className="mt-4 flex gap-2">
          <button onClick={confirmSale} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-2">Confirmar venta</button>
          <button onClick={clearCart} className="px-3 py-2 border rounded">Vaciar</button>
        </div>
      </div>
    </div>
  );
};

export default POSSystem;