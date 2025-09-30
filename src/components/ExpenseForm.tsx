import React, { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { addExpense } from '../utils/storage';
import { Expense } from '../types/finance';
import { getExpenseCategories } from '../utils/catalog';

interface ExpenseFormProps {
  onBack: () => void;
  onSave: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onBack, onSave }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: '' as string,
    supplier: '',
    description: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const categories = getExpenseCategories();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.category) return;

    setIsSubmitting(true);

    const expense: Omit<Expense, 'id'> = {
      date: formData.date,
      amount: parseFloat(formData.amount),
      category: formData.category as Expense['category'],
      supplier: formData.supplier || undefined,
      description: formData.description || undefined,
      type: 'expense'
    };

    addExpense(expense);

    // Simular un pequeño delay para mejor UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setIsSubmitting(false);
    onSave();
  };

  if (categories.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Cargar Egreso</h1>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <p className="text-yellow-800 mb-4">
            No hay categorías de egresos. Crealas en Menú &gt; Categorías.
          </p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={onBack}
          className="mr-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Cargar Egreso</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* Fecha */}
        <div className="mb-6">
          <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-2">
            Fecha
          </label>
          <input
            type="date"
            id="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
            required
          />
        </div>

        {/* Monto */}
        <div className="mb-6">
          <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-2">
            Monto *
          </label>
          <input
            type="number"
            id="amount"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0"
            step="0.01"
            min="0"
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-lg"
            required
          />
        </div>

        {/* Categoría */}
        <div className="mb-6">
          <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
            Categoría *
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
            required
          >
            <option value="">Seleccionar categoría...</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Proveedor */}
        <div className="mb-6">
          <label htmlFor="supplier" className="block text-sm font-semibold text-gray-700 mb-2">
            Proveedor
          </label>
          <input
            type="text"
            id="supplier"
            value={formData.supplier}
            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
            placeholder="Nombre del proveedor..."
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Descripción */}
        <div className="mb-8">
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descripción opcional del egreso..."
            rows={3}
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!formData.amount || !formData.category || isSubmitting}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg transition-all duration-200 hover:shadow-xl transform hover:scale-[1.01] active:scale-[0.99] disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Guardar Egreso
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;