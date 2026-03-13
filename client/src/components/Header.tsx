import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, User, Menu, X, Search, ChevronDown } from 'lucide-react';
import { useCartStore } from '../hooks/useCartStore';
import { useAuthStore } from '../hooks/useAuthStore';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { getTotalItems, getTotalPrice } = useCartStore();
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  const categories = [
    {
      name: 'Bandeiras',
      subcategories: ['Horizontais', 'Verticais', 'Parede', 'Mesa', 'Carro'],
      href: '/produtos?category=flags'
    },
    {
      name: 'Fly Banners',
      subcategories: ['Feather', 'Drop', 'Retangulares', 'Mini'],
      href: '/produtos?category=fly-banners'
    },
    {
      name: 'Banners',
      subcategories: ['Com Ilhoses', 'Com Velcro', 'Costurados'],
      href: '/produtos?category=banners'
    },
    {
      name: 'Gazebos',
      subcategories: ['1.5x1.5m', '3x3m', '3x4.5m', '3x6m'],
      href: '/produtos?category=gazebos'
    },
    {
      name: 'Displays',
      subcategories: ['Roll Up', 'X-Banner', 'Cubos Promocionais'],
      href: '/produtos?category=displays'
    },
    {
      name: 'Mastros',
      subcategories: ['Escritório', 'Telescópicos', 'Parede'],
      href: '/produtos?category=masts'
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/produtos?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-blue-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-4">
              <span>📞 +351 123 456 789</span>
              <span>✉️ info@latinflag.pt</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Entrega em 24h</span>
              <span>Qualidade Premium</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">LF</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Latin Flag</span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar produtos..."
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
              >
                <Search size={20} />
              </button>
            </div>
          </form>

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex items-center space-x-8">
            <div className="relative">
              <button
                onMouseEnter={() => setIsCategoriesOpen(true)}
                onMouseLeave={() => setIsCategoriesOpen(false)}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <span>Produtos</span>
                <ChevronDown size={16} />
              </button>
              
              <AnimatePresence>
                {isCategoriesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onMouseEnter={() => setIsCategoriesOpen(true)}
                    onMouseLeave={() => setIsCategoriesOpen(false)}
                    className="absolute top-full left-0 w-screen max-w-md bg-white shadow-lg rounded-lg mt-2 p-6"
                  >
                    <div className="grid grid-cols-2 gap-6">
                      {categories.map((category) => (
                        <div key={category.name}>
                          <Link
                            to={category.href}
                            className="font-semibold text-gray-900 hover:text-blue-600 block mb-2"
                          >
                            {category.name}
                          </Link>
                          <div className="space-y-1">
                            {category.subcategories.map((sub) => (
                              <Link
                                key={sub}
                                to={`${category.href}&subcategory=${encodeURIComponent(sub.toLowerCase())}`}
                                className="text-sm text-gray-600 hover:text-blue-600 block"
                              >
                                {sub}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/sobre" className="text-gray-700 hover:text-blue-600 transition-colors">
              Sobre Nós
            </Link>
            
            <Link to="/contacto" className="text-gray-700 hover:text-blue-600 transition-colors">
              Contacto
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link to="/carrinho" className="relative group">
              <ShoppingCart size={24} className="text-gray-700 group-hover:text-blue-600 transition-colors" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
              {totalItems > 0 && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-lg rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="text-sm">
                    <div className="font-semibold">{totalItems} itens</div>
                    <div className="text-blue-600 font-bold">€{totalPrice.toFixed(2)}</div>
                  </div>
                </div>
              )}
            </Link>

            {/* User Menu */}
            <div className="relative">
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
                    <User size={20} />
                    <span className="hidden md:block">{user?.name}</span>
                  </button>
                  <div className="hidden lg:flex items-center space-x-2">
                    <Link
                      to="/perfil"
                      className="text-sm text-gray-600 hover:text-blue-600"
                    >
                      Perfil
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Sair
                    </button>
                  </div>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/registo"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Registar
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-gray-700"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t"
          >
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="flex">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar produtos..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700"
                >
                  <Search size={20} />
                </button>
              </form>

              {/* Mobile Navigation */}
              <nav className="space-y-2">
                {categories.map((category) => (
                  <div key={category.name}>
                    <Link
                      to={category.href}
                      className="block font-semibold text-gray-900 hover:text-blue-600 py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                    <div className="pl-4 space-y-1">
                      {category.subcategories.map((sub) => (
                        <Link
                          key={sub}
                          to={`${category.href}&subcategory=${encodeURIComponent(sub.toLowerCase())}`}
                          className="block text-sm text-gray-600 hover:text-blue-600 py-1"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {sub}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
                
                <Link
                  to="/sobre"
                  className="block text-gray-700 hover:text-blue-600 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sobre Nós
                </Link>
                
                <Link
                  to="/contacto"
                  className="block text-gray-700 hover:text-blue-600 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contacto
                </Link>
              </nav>

              {/* Mobile User Menu */}
              {!isAuthenticated && (
                <div className="space-y-2 pt-4 border-t">
                  <Link
                    to="/login"
                    className="block w-full text-center text-gray-700 hover:text-blue-600 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/registo"
                    className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Registar
                  </Link>
                </div>
              )}

              {isAuthenticated && (
                <div className="space-y-2 pt-4 border-t">
                  <Link
                    to="/perfil"
                    className="block text-center text-gray-700 hover:text-blue-600 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Perfil
                  </Link>
                  <Link
                    to="/encomendas"
                    className="block text-center text-gray-700 hover:text-blue-600 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Minhas Encomendas
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="block text-center text-blue-600 hover:text-blue-700 py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Painel Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-center text-red-600 hover:text-red-700 py-2"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
