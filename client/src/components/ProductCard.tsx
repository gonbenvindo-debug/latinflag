import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Palette } from 'lucide-react';
import { Product } from '../types';
import { useCartStore } from '../hooks/useCartStore';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, 1);
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      <Link to={`/produtos/${product.slug}`}>
        {/* Product Image */}
        <div className="relative h-64 bg-gray-100 overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="text-6xl text-blue-300">🚩</div>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-2">
            {product.featured && (
              <span className="bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-1 rounded-full">
                Destaque
              </span>
            )}
            {product.customizationOptions.allowsCustomDesign && (
              <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                <Palette size={12} />
                Personalizável
              </span>
            )}
          </div>

          {/* Quick Add to Cart */}
          <button
            onClick={handleAddToCart}
            className="absolute bottom-2 right-2 bg-white text-blue-600 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600 hover:text-white"
            title="Adicionar ao carrinho"
          >
            <ShoppingCart size={20} />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <div className="mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-wide">
              {product.category}
            </span>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>

          {/* Specifications */}
          {product.specifications && (
            <div className="flex gap-4 text-xs text-gray-500 mb-4">
              {product.specifications.width && product.specifications.height && (
                <span>
                  {product.specifications.width}×{product.specifications.height}cm
                </span>
              )}
              {product.specifications.material && (
                <span>{product.specifications.material}</span>
              )}
            </div>
          )}

          {/* Price and Actions */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                €{product.basePrice.toFixed(2)}
              </div>
              {product.customizationOptions.allowsCustomDesign && (
                <div className="text-xs text-green-600">
                  + Personalização disponível
                </div>
              )}
            </div>
            
            <button
              onClick={handleAddToCart}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
              title="Adicionar ao carrinho"
            >
              <ShoppingCart size={20} />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
