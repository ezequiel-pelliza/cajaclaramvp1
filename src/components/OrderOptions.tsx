import React, { useState } from 'react';
import { Store, Package, Truck, MapPin, User, Phone } from 'lucide-react';
import { Order, Customer } from '../types/pos';

interface OrderOptionsProps {
  orderType: Order['type'];
  tableNumber?: number;
  customer?: Customer;
  onUpdateOrderType: (type: Order['type']) => void;
  onUpdateTableNumber: (tableNumber: number) => void;
  onUpdateCustomer: (customer: Customer) => void;
}

const OrderOptions: React.FC<OrderOptionsProps> = ({
  orderType,
  tableNumber,
  customer,
  onUpdateOrderType,
  onUpdateTableNumber,
  onUpdateCustomer
}) => {
  const [customerForm, setCustomerForm] = useState<Customer>(
    customer || { name: '', phone: '', address: '' }
  );

  const orderTypes = [
    { id: 'dine-in', name: 'Comer Aquí', icon: Store, color: 'blue' },
    { id: 'takeaway', name: 'Para Llevar', icon: Package, color: 'green' },
    { id: 'delivery', name: 'Delivery', icon: Truck, color: 'purple' }
  ] as const;

  const handleCustomerUpdate = (field: keyof Customer, value: string) => {
    const updatedCustomer = { ...customerForm, [field]: value };
    setCustomerForm(updatedCustomer);
    onUpdateCustomer(updatedCustomer);
  };

  return (
    <div className="h-full p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Opciones del Pedido</h2>

      {/* Order Type Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Tipo de Pedido</h3>
        <div className="space-y-2">
          {orderTypes.map(type => {
            const IconComponent = type.icon;
            const isSelected = orderType === type.id;
            
            return (
              <button
                key={type.id}
                onClick={() => onUpdateOrderType(type.id)}
                className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${
                  isSelected
                    ? `border-${type.color}-500 bg-${type.color}-50`
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center">
                  <IconComponent 
                    className={`w-5 h-5 mr-3 ${
                      isSelected ? `text-${type.color}-600` : 'text-gray-500'
                    }`} 
                  />
                  <span className={`font-medium ${
                    isSelected ? `text-${type.color}-900` : 'text-gray-700'
                  }`}>
                    {type.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Selection for Dine-in */}
      {orderType === 'dine-in' && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Número de Mesa</h3>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 16 }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                onClick={() => onUpdateTableNumber(num)}
                className={`p-3 rounded-lg border-2 font-semibold transition-all duration-200 ${
                  tableNumber === num
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Customer Information for Delivery */}
      {orderType === 'delivery' && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Datos del Cliente</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={customerForm.name}
                  onChange={(e) => handleCustomerUpdate('name', e.target.value)}
                  placeholder="Nombre del cliente"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Teléfono
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={customerForm.phone}
                  onChange={(e) => handleCustomerUpdate('phone', e.target.value)}
                  placeholder="Número de teléfono"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Dirección
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea
                  value={customerForm.address}
                  onChange={(e) => handleCustomerUpdate('address', e.target.value)}
                  placeholder="Dirección de entrega"
                  rows={2}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrderOptions;