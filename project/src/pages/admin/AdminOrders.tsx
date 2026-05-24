import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import type { Order } from '../../types/database';
import { formatPrice, formatDate, STATUSES, STATUS_LABELS, STATUS_COLORS } from '../../lib/utils';

const PAGE_SIZE = 10;

export default function AdminOrders() {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [customerNames, setCustomerNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate('/');
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    supabase.from('orders').select('*').order('created_at', { ascending: false })
      .then(({ data }) => {
        const orders = data ?? [];
        setOrders(orders);
        const ids = [...new Set(orders.map(o => o.user_id))];
        if (ids.length > 0) {
          supabase.from('profiles').select('id, full_name').in('id', ids)
            .then(({ data: profiles }) => {
              const map: Record<string, string> = {};
              profiles?.forEach(p => { map[p.id] = p.full_name; });
              setCustomerNames(map);
            });
        }
        setLoading(false);
      });
  }, [isAdmin]);

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const paginatedOrders = orders.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  async function updateStatus(orderId: string, status: string) {
    await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    toast('Status atualizado');
  }

  return (
    <div className="bg-black min-h-screen pt-16">
      <div className="max-w-screen-xl mx-auto px-6 py-12">
        <div className="mb-10">
          <Link to="/admin" className="text-neutral-500 text-xs tracking-widest uppercase hover:text-white transition-colors">
            ← Painel
          </Link>
          <h1 className="font-serif text-white text-3xl tracking-wide mt-2">Pedidos</h1>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-neutral-900 animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <p className="text-neutral-500 text-sm text-center py-20">Nenhum pedido encontrado</p>
        ) : (
          <>
            <div className="border border-neutral-800">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-800">
                    {['Pedido', 'Cliente', 'Total', 'Pagamento', 'Status', 'Data', 'Ações'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-neutral-500 text-xs tracking-[0.15em] uppercase font-normal hidden md:table-cell first:table-cell last:table-cell">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order, i) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-neutral-900 hover:bg-neutral-950 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <span className="text-white text-sm font-mono">#{order.id.slice(0, 8).toUpperCase()}</span>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="text-neutral-400 text-xs">{customerNames[order.user_id] ?? order.user_id?.slice(0, 8)}</span>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="text-amber-400 text-sm">{formatPrice(order.total)}</span>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="text-neutral-400 text-xs uppercase tracking-widest">{order.payment_method}</span>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className={`text-xs tracking-widest uppercase ${STATUS_COLORS[order.status] ?? 'text-neutral-400'}`}>
                          {STATUS_LABELS[order.status] ?? order.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="text-neutral-500 text-xs">
                          {formatDate(order.created_at, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="relative group inline-block">
                          <select
                            value={order.status}
                            onChange={e => updateStatus(order.id, e.target.value)}
                            className="bg-neutral-900 border border-neutral-700 text-white text-xs px-3 py-1.5 focus:outline-none focus:border-amber-400 transition-colors appearance-none pr-6 cursor-pointer"
                          >
                            {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                          </select>
                          <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 text-xs tracking-widest uppercase border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-8 h-8 text-xs border transition-colors ${
                      i === page
                        ? 'bg-amber-400 text-black border-amber-400'
                        : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 text-xs tracking-widest uppercase border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Próximo
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
