import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Order, OrderItem } from '../types/database';
import Footer from '../components/layout/Footer';
import { formatPrice, formatDate, STATUS_LABELS, STATUS_COLORS } from '../lib/utils';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface OrderWithItems extends Order {
  items?: OrderItem[];
}

export default function Orders() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders(data ?? []);
        setLoading(false);
      });
  }, [user]);

  async function loadItems(orderId: string) {
    if (expanded === orderId) { setExpanded(null); return; }
    const { data } = await supabase.from('order_items').select('*').eq('order_id', orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, items: data ?? [] } : o));
    setExpanded(orderId);
  }

  if (loading || authLoading) {
    return (
      <div className="bg-black min-h-screen pt-16 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen pt-16">
      <div className="max-w-screen-lg mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-amber-400 text-xs tracking-[0.4em] uppercase mb-3">Conta</p>
          <h1 className="font-serif text-white text-4xl tracking-wide mb-12">Meus Pedidos</h1>
        </motion.div>

        {orders.length === 0 ? (
          <div className="text-center py-24">
            <Package size={40} className="text-neutral-700 mx-auto mb-4" />
            <p className="text-neutral-500 text-sm tracking-wide mb-6">Você ainda não fez nenhum pedido</p>
            <Link to="/catalogo" className="text-amber-400 text-xs tracking-[0.2em] uppercase hover:text-amber-300 transition-colors">
              Explorar Coleção
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="border border-neutral-800 bg-neutral-950"
              >
                <button
                  onClick={() => loadItems(order.id)}
                  className="w-full px-6 py-5 flex items-center justify-between hover:bg-neutral-900/50 transition-colors"
                >
                  <div className="flex items-center gap-6">
                    <div className="text-left">
                      <p className="text-white text-sm font-light">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-neutral-600 text-xs mt-0.5">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="hidden md:block">
                      <span className={`text-xs tracking-widest uppercase ${STATUS_COLORS[order.status] ?? 'text-neutral-400'}`}>
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-amber-400 text-sm">{formatPrice(order.total)}</span>
                    <ChevronRight size={16} className={`text-neutral-600 transition-transform duration-300 ${expanded === order.id ? 'rotate-90' : ''}`} />
                  </div>
                </button>

                {expanded === order.id && order.items && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-neutral-900 px-6 py-4"
                  >
                    <div className="space-y-3">
                      {order.items.map(item => (
                        <div key={item.id} className="flex items-center gap-4">
                          <div className="w-12 h-16 bg-neutral-900 flex-shrink-0 overflow-hidden">
                            {item.product_image && (
                              <img src={item.product_image} alt="" className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-white text-xs">{item.product_name}</p>
                            {item.variant_size && <p className="text-neutral-500 text-xs">Tam: {item.variant_size}</p>}
                            <p className="text-neutral-500 text-xs">Qtd: {item.quantity}</p>
                          </div>
                          <p className="text-amber-400 text-xs">{formatPrice(item.unit_price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-neutral-900 text-xs text-neutral-500">
                      <p>Pagamento: {order.payment_method === 'pix' ? 'PIX' : 'Cartão'}</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
