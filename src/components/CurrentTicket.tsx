import React, { useState } from 'react';
import { Plus, Minus, Trash2, Printer, CreditCard, RotateCcw, MessageSquare, ShoppingCart } from 'lucide-react';
import { OrderItem } from '../types/pos';
import { formatCurrency } from '../utils/posStorage';

interface CurrentTicketProps {
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onUpdateNotes: (productId: string, notes: string) => void;
  onPrintOrder: () => void;
  onStartPayment: () => void;
  onClearOrder: () => void;
  paymentMode: boolean;
  isProcessing: boolean;
}

const CurrentTicket: React.FC<CurrentTicketProps> = ({
  items,
  subtotal,
  tax,
  total,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateNotes,
  onPrintOrder,
  onStartPayment,
  onClearOrder,
  paymentMode,
  isProcessing
}) => {
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');

  const startEditingNotes = (productId: string, currentNotes?: string) => {
    setEditingNotes(productId);
    setTempNotes(currentNotes || '');
  };

  const saveNotes = (productId: string) => {
    onUpdateNotes(productId, tempNotes);
    setEditingNotes(null);
    setTempNotes('');
  };

  const cancelEditingNotes = () => {
    setEditingNotes(null);
    setTempNotes('');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-900">Ticket Actual</h2>
        <p className="text-sm text-gray-600">
          {items.length} productos • {items.reduce((sum, item) => sum + item.quantity, 0)} unidades
        </p>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <ShoppingCart className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-center">
              Selecciona productos del menú<br />para comenzar el pedido
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="bg-white rounded-lg border border-gray-200 p-4">
                {/* Product Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {item.productName}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {formatCurrency(item.unitPrice)} c/u
                    </p>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.productId)}
                    className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(item.totalPrice)}
                  </span>
                </div>

                {/* Notes Section */}
                <div className="border-t border-gray-100 pt-3">
                  {editingNotes === item.productId ? (
                    <div className="space-y-2">
                      <textarea
                        value={tempNotes}
                        onChange={(e) => setTempNotes(e.target.value)}
                        placeholder="Agregar notas especiales..."
                        className="w-full p-2 border border-gray-200 rounded text-xs resize-none"
                        rows={2}
                        autoFocus
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => saveNotes(item.productId)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={cancelEditingNotes}
                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditingNotes(item.productId, item.notes)}
                      className="flex items-center text-xs text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      {item.notes ? item.notes : 'Agregar notas'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Totals and Actions */}
      {items.length > 0 && (
        <div className="border-t border-gray-200 bg-white p-4">
          {/* Totals */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">IVA (21%):</span>
              <span className="font-medium">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
              <span>Total:</span>
              <span className="text-blue-600">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          {!paymentMode && (
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={onPrintOrder}
                className="flex items-center justify-center py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-md"
              >
                <Printer className="w-4 h-4 mr-2" />
                Enviar a Cocina
              </button>
              <button
                onClick={onStartPayment}
                className="flex items-center justify-center py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-md"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Procesar Pago
              </button>
              <button
                onClick={onClearOrder}
                className="flex items-center justify-center py-2 px-4 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-all duration-200"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Limpiar Pedido
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CurrentTicket;