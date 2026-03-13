import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { ArrowRight, Star, Shield, Truck, Clock, Palette, Award } from 'lucide-react';
import { productService } from '../services/supabase';
import ProductCard from '../components/ProductCard';

const Home: React.FC = () => {
  const { data: featuredProducts, isLoading } = useQuery(
    'featuredProducts',
    productService.getFeaturedProducts
  );

  const features = [
    {
      icon: Clock,
      title: 'Entrega em 24h',
      description: 'Produção e entrega rápidas para não atrasar os seus projetos'
    },
    {
      icon: Palette,
      title: 'Personalização Total',
      description: 'Design personalizado com as suas cores, logótipo e mensagem'
    },
    {
      icon: Shield,
      title: 'Qualidade Premium',
      description: 'Materiais de alta qualidade e impressão digital de última geração'
    },
    {
      icon: Truck,
      title: 'Envio Seguro',
      description: 'Embalagem segura e entrega garantida para todo o Portugal'
    }
  ];

  const categories = [
    {
      name: 'Bandeiras',
      image: '/images/flags-hero.jpg',
      href: '/produtos?category=flags',
      description: 'Bandeiras horizontais, verticais e personalizadas'
    },
    {
      name: 'Fly Banners',
      image: '/images/fly-banners-hero.jpg',
      href: '/produtos?category=fly-banners',
      description: 'Bandeiras suspensas ideais para eventos e promoções'
    },
    {
      name: 'Banners',
      image: '/images/banners-hero.jpg',
      href: '/produtos?category=banners',
      description: 'Banners publicitários com diversos acabamentos'
    },
    {
      name: 'Gazebos',
      image: '/images/gazebos-hero.jpg',
      href: '/produtos?category=gazebos',
      description: 'Estruturas perfeitas para eventos exteriores'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Bandeiras e Produtos
                <span className="text-yellow-400"> Personalizados</span>
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Qualidade premium, entrega em 24h e personalização total. 
                A solução perfeita para empresas, eventos e campanhas publicitárias.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/produtos"
                  className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg font-semibold hover:bg-yellow-300 transition-colors flex items-center justify-center group"
                >
                  Ver Produtos
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                </Link>
                <Link
                  to="/contacto"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all flex items-center justify-center"
                >
                  Pedir Orçamento
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-yellow-400">500+</div>
                    <div className="text-sm">Clientes Satisfeitos</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-yellow-400">24h</div>
                    <div className="text-sm">Entrega Garantida</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-yellow-400">100%</div>
                    <div className="text-sm">Personalizável</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-yellow-400">5★</div>
                    <div className="text-sm">Qualidade</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Por que escolher a Latin Flag?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Somos líderes em qualidade e velocidade, com foco total na satisfação do cliente
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors">
                  <feature.icon size={32} className="text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nossas Categorias
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Soluções completas para comunicação visual e marketing
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <Link to={category.href}>
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <div className="text-6xl text-blue-600">🚩</div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                      <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
                        Explorar
                        <ArrowRight size={16} className="ml-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Produtos em Destaque
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Os nossos produtos mais populares com a melhor qualidade
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts?.slice(0, 8).map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/produtos"
              className="inline-flex items-center bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Ver Todos os Produtos
              <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para criar o seu projeto?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Entre em contacto connosco e receba um orçamento personalizado em menos de 24h
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contacto"
                className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg font-semibold hover:bg-yellow-300 transition-colors flex items-center justify-center"
              >
                Pedir Orçamento
              </Link>
              <Link
                to="/produtos"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all flex items-center justify-center"
              >
                Ver Catálogo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
