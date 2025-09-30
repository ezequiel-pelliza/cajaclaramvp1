import React from 'react';
import { Product } from '../types/pos';
import { formatCurrency } from '../utils/posStorage';

interface ProductMenuProps {
  products: Product[];
  categories: readonly { id: string; name: string; icon: string }[];
  selectedCategory: Product['category'];
  onCategoryChange: (category: Product['category']) => void;
  onProductSelect: (product: Product) => void;
}

const ProductMenu: React.FC<ProductMenuProps> = ({
  products,
  categories,
  selectedCategory,
  onCategoryChange,
  onProductSelect
}) => {
  const filteredProducts = products.filter(
    product => product.category === selectedCategory && product.available
  );

  return (
    <div className="h-full flex flex-col">
      {/* Category Tabs */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Menú</h2>
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id as Product['category'])}
              className={`p-3 rounded-lg text-left transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center">
                <span className="text-lg mr-2">{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="grid grid-cols-1 gap-3">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => onProductSelect(product)}
              className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:shadow-md hover:border-blue-300 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                  {product.name}
                </h3>
                <span className="text-blue-600 font-bold text-sm ml-2">
                  {formatCurrency(product.price)}
                </span>
              </div>
              {product.description && (
                <p className="text-xs text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductMenu;