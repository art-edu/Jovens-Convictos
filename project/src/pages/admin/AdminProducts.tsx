import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import type { Product } from '../../types/database';
import { formatPrice } from '../../lib/utils';

export default function AdminProducts() {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate('/');
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    loadProducts();
  }, [isAdmin]);

  async function loadProducts() {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts(data ?? []);
    setLoading(false);
  }

  async function toggleActive(product: Product) {
    await supabase.from('products').update({ active: !product.active }).eq('id', product.id);
    toast(`Produto ${!product.active ? 'ativado' : 'desativado'}`);
    loadProducts();
  }

  async function deleteProduct(id: string) {
    if (!confirm('Tem certeza que deseja remover este produto?')) return;
    await supabase.from('products').update({ active: false }).eq('id', id);
    toast('Produto removido');
    loadProducts();
  }

  return (
    <div className="bg-black min-h-screen pt-16">
      <div className="max-w-screen-xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <Link to="/admin" className="text-neutral-500 text-xs tracking-widest uppercase hover:text-white transition-colors">
              ← Painel
            </Link>
            <h1 className="font-serif text-white text-3xl tracking-wide mt-2">Produtos</h1>
          </div>
          <Link
            to="/admin/produtos/novo"
            className="flex items-center gap-2 bg-amber-400 text-black text-xs tracking-[0.2em] uppercase px-6 py-3 hover:bg-amber-300 transition-colors"
          >
            <Plus size={14} />
            Novo Produto
          </Link>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-neutral-900 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="border border-neutral-800">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="text-left px-4 py-3 text-neutral-500 text-xs tracking-[0.15em] uppercase font-normal">Produto</th>
                  <th className="text-left px-4 py-3 text-neutral-500 text-xs tracking-[0.15em] uppercase font-normal hidden md:table-cell">Categoria</th>
                  <th className="text-left px-4 py-3 text-neutral-500 text-xs tracking-[0.15em] uppercase font-normal hidden md:table-cell">Preço</th>
                  <th className="text-left px-4 py-3 text-neutral-500 text-xs tracking-[0.15em] uppercase font-normal hidden md:table-cell">Status</th>
                  <th className="px-4 py-3 text-neutral-500 text-xs tracking-[0.15em] uppercase font-normal text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, i) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-neutral-900 hover:bg-neutral-950 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 bg-neutral-900 flex-shrink-0 overflow-hidden">
                          {product.images?.[0] && (
                            <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <span className="text-white text-sm">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-neutral-400 text-xs tracking-widest uppercase">{product.category}</span>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-amber-400 text-sm">{formatPrice(product.price)}</span>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <button
                        onClick={() => toggleActive(product)}
                        className={`text-xs tracking-widest uppercase px-3 py-1 border transition-colors ${
                          product.active
                            ? 'border-green-800 text-green-400 hover:bg-red-900/20 hover:border-red-800 hover:text-red-400'
                            : 'border-neutral-700 text-neutral-500 hover:border-green-800 hover:text-green-400'
                        }`}
                      >
                        {product.active ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/produto/${product.slug}`} className="text-neutral-600 hover:text-white transition-colors p-1.5">
                          <Eye size={14} />
                        </Link>
                        <Link to={`/admin/produtos/editar/${product.id}`} className="text-neutral-600 hover:text-amber-400 transition-colors p-1.5">
                          <Pencil size={14} />
                        </Link>
                        <button onClick={() => deleteProduct(product.id)} className="text-neutral-600 hover:text-red-400 transition-colors p-1.5">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
