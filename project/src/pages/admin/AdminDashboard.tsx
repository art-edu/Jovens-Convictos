import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, Users, TrendingUp, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState<Stats>({ totalProducts: 0, totalOrders: 0, pendingOrders: 0, totalRevenue: 0 });

  useEffect(() => {
    if (!isAdmin) return;
    Promise.all([
      supabase.from('products').select('id', { count: 'exact' }),
      supabase.from('orders').select('id, total, status'),
    ]).then(([products, orders]) => {
      const orderData = orders.data ?? [];
      setStats({
        totalProducts: products.count ?? 0,
        totalOrders: orderData.length,
        pendingOrders: orderData.filter(o => o.status === 'pending').length,
        totalRevenue: orderData.reduce((sum, o) => sum + (o.total ?? 0), 0),
      });
    });
  }, [isAdmin]);

  const cards = [
    { label: 'Produtos', value: stats.totalProducts, icon: Package, color: 'text-amber-400' },
    { label: 'Pedidos', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-400' },
    { label: 'Pendentes', value: stats.pendingOrders, icon: TrendingUp, color: 'text-orange-400' },
    { label: 'Receita (R$)', value: stats.totalRevenue.toFixed(2), icon: Users, color: 'text-green-400' },
  ];

  return (
    <div className="bg-black min-h-screen pt-16">
      <div className="max-w-screen-xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="text-amber-400 text-xs tracking-[0.4em] uppercase mb-2">Painel</p>
            <h1 className="font-serif text-white text-3xl tracking-wide">Administração</h1>
          </div>
          <Link
            to="/admin/produtos/novo"
            className="flex items-center gap-2 bg-amber-400 text-black text-xs tracking-[0.2em] uppercase px-6 py-3 hover:bg-amber-300 transition-colors"
          >
            <Plus size={14} />
            Novo Produto
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-neutral-950 border border-neutral-800 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-neutral-500 text-xs tracking-[0.15em] uppercase">{card.label}</span>
                  <Icon size={16} className={card.color} />
                </div>
                <p className="text-white text-2xl font-light">{card.value}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/admin/produtos"
            className="group border border-neutral-800 bg-neutral-950 p-8 hover:border-amber-400/40 transition-colors"
          >
            <Package size={24} className="text-amber-400 mb-4" />
            <h3 className="text-white text-sm tracking-[0.1em] uppercase mb-2">Gerenciar Produtos</h3>
            <p className="text-neutral-500 text-xs leading-relaxed">Adicionar, editar ou remover produtos do catálogo.</p>
          </Link>
          <Link
            to="/admin/pedidos"
            className="group border border-neutral-800 bg-neutral-950 p-8 hover:border-amber-400/40 transition-colors"
          >
            <ShoppingBag size={24} className="text-blue-400 mb-4" />
            <h3 className="text-white text-sm tracking-[0.1em] uppercase mb-2">Gerenciar Pedidos</h3>
            <p className="text-neutral-500 text-xs leading-relaxed">Visualizar e atualizar o status dos pedidos.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
