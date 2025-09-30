import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Banknote, Smartphone, Users, Calculator } from 'lucide-react';
import { Order } from '../types/pos';
import { formatCurrency } from '../utils/posStorage';

interface PaymentInterfaceProps {
  total: number;
  onCompleteOrder: (paymentMethod: Order['paymentMethod'], paymentDetails?: Order['paymentDetails']) => void;
  onBack: () => void;
  isProcessing: boolean;
}

const PaymentInterface: React.FC<PaymentInterfaceProps> = ({
  total,
  onCompleteOrder,
  onBack,
  isProcessing
}) => {
  const [paymentMethod, setPaymentMethod] = useState<Order['paymentMethod']>('efectivo');
  const [splitCount, setSplitCount] = useState(1);
  const [cashAmount, setCashAmount] = useState('');
  const [cardAmount, setCardAmount] = useState('');
  const [showSplitCalculator, setShowSplitCalculator] = useState(false);

  const paymentMethods = [
    { id: 'efectivo', name: 'Efectivo', icon: Banknote, color: 'green' },
    { id: 'tarjeta', name: 'Tarjeta', icon: CreditCard, color: 'blue' },
    { id: 'mercadopago', name: 'Mercado Pago', icon: Smartphone, color: 'purple' },
    { id: 'mixto', name: 'Pago Mixto', icon: Calculator, color: 'orange' }
  ] as const;

  const handleCompletePayment = () => {
    if (paymentMethod === 'mixto') {
      const cash = parseFloat(cashAmount) || 0;
      const card = parseFloat(cardAmount) || 0;
      
      if (cash + card !== total) {
        alert('El total de efectivo + tarjeta debe ser igual al total del pedido');
        return;
      }
      
      onCompleteOrder(paymentMethod, { cash, card });
    } else {
      onCompleteOrder(paymentMethod);
    }
  };

  const splitAmount = total / splitCount;
  const isValidMixedPayment = paymentMethod === 'mixto' 
    ? (parseFloat(cashAmount) || 0) + (parseFloat(cardAmount) || 0) === total
    : true;

  return (
    <div className="h-full p-4 overflow-y-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-3 p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900">Procesar Pago</h2>
      </div>

      {/* Total Amount */}
      <div className="bg-blue-50 rounded-xl p-6 mb-6 text-center">
        <p className="text-sm text-blue-600 mb-1">Total a Pagar</p>
        <p className="text-3xl font-bold text-blue-900">{formatCurrency(total)}</p>
      </div>

      {/* Split Calculator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">División de Cuenta</h3>
          <button
            onClick={() => setShowSplitCalculator(!showSplitCalculator)}
            className="text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Users className="w-5 h-5" />
          </button>
        </div>
        
        {showSplitCalculator && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <label className="text-sm text-gray-600">Dividir entre:</label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSplitCount(Math.max(1, splitCount - 1))}
                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                >
                  -
                </button>
                <span className="w-8 text-center font-semibold">{splitCount}</span>
                <button
                  onClick={() => setSplitCount(splitCount + 1)}
                  className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-700">
              Cada persona paga: <span className="font-bold text-blue-600">{formatCurrency(splitAmount)}</span>
            </p>
          </div>
        )}
      </div>

      {/* Payment Methods */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Método de Pago</h3>
        <div className="space-y-2">
          {paymentMethods.map(method => {
            const IconComponent = method.icon;
            const isSelected = paymentMethod === method.id;
            
            return (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${
                  isSelected
                    ? `border-${method.color}-500 bg-${method.color}-50`
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center">
                  <IconComponent 
                    className={`w-5 h-5 mr-3 ${
                      isSelected ? `text-${method.color}-600` : 'text-gray-500'
                    }`} 
                  />
                  <span className={`font-medium ${
                    isSelected ? `text-${method.color}-900` : 'text-gray-700'
                  }`}>
                    {method.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mixed Payment Details */}
      {paymentMethod === 'mixto' && (
        <div className="mb-6 bg-orange-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-orange-800 mb-3">Detalle del Pago Mixto</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Efectivo
              </label>
              <input
                type="number"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                placeholder="0"
                step="0.01"
                min="0"
                max={total}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Tarjeta
              </label>
              <input
                type="number"
                value={cardAmount}
                onChange={(e) => setCardAmount(e.target.value)}
                placeholder="0"
                step="0.01"
                min="0"
                max={total}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div className="text-xs text-gray-600">
              Restante: {formatCurrency(total - (parseFloat(cashAmount) || 0) - (parseFloat(cardAmount) || 0))}
            </div>
          </div>
        </div>
      )}

      {/* Complete Payment Button */}
      <button
        onClick={handleCompletePayment}
        disabled={!isValidMixedPayment || isProcessing}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg transition-all duration-200 hover:shadow-xl transform hover:scale-[1.01] active:scale-[0.99] disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isProcessing ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            Finalizar y Cerrar Pedido
          </>
        )}
      </button>

      {/* Quick Amount Buttons for Cash */}
      {paymentMethod === 'efectivo' && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Montos Rápidos</h4>
          <div className="grid grid-cols-2 gap-2">
            {[1000, 2000, 5000, 10000].map(amount => (
              <button
                key={amount}
                onClick={() => setCashAmount(amount.toString())}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                {formatCurrency(amount)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentInterface;