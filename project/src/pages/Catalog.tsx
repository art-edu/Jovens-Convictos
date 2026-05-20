import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product } from '../types/database';
import ProductCard from '../components/product/ProductCard';
import Footer from '../components/layout/Footer';

const CATEGORIES = [
  { value: '', label: 'Todos' },
  { value: 'camisas', label: 'Camisas' },
  { value: 'bones', label: 'Bonés' },
  { value: 'moletons', label: 'Moletons' },
  { value: 'garrafas', label: 'Garrafas' },
  { value: 'figurinhas', label: 'Figurinhas' },
  { value: 'acessorios', label: 'Acessórios' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mais Recentes' },
  { value: 'price_asc', label: 'Menor Preço' },
  { value: 'price_desc', label: 'Maior Preço' },
];

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const category = params.get('categoria') ?? '';
  const sort = params.get('ordem') ?? 'newest';

  useEffect(() => {
    setLoading(true);
    let query = supabase.from('products').select('*').eq('active', true);
    if (category) query = query.eq('category', category);
    if (sort === 'price_asc') query = query.order('price', { ascending: true });
    else if (sort === 'price_desc') query = query.order('price', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    query.then(({ data }) => {
      setProducts(data ?? []);
      setLoading(false);
    });
  }, [category, sort]);

  function setCategory(val: string) {
    const p = new URLSearchParams(params);
    if (val) p.set('categoria', val);
    else p.delete('categoria');
    setParams(p);
  }

  function setSort(val: string) {
    const p = new URLSearchParams(params);
    p.set('ordem', val);
    setParams(p);
  }

  const activeCategory = CATEGORIES.find(c => c.value === category) ?? CATEGORIES[0];

  return (
    <div className="bg-black min-h-screen pt-16">
      {/* Page Header */}
      <div className="py-20 px-6 border-b border-neutral-900 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-blue-300 text-xs tracking-[0.4em] uppercase mb-4">Loja</p>
          <h1 className="font-serif text-white text-4xl md:text-5xl tracking-wide">
            {activeCategory.label === 'Todos' ? 'Toda a Coleção' : activeCategory.label}
          </h1>
        </motion.div>
      </div>

      {/* Filters Bar */}
      <div className="sticky top-16 z-20 bg-black/95 backdrop-blur-sm border-b border-neutral-900">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          {/* Category filters - desktop */}
          <div className="hidden md:flex items-center gap-6">
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`text-xs tracking-[0.15em] uppercase transition-colors duration-200 ${
                  category === c.value ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-2 text-neutral-400 text-xs tracking-widest uppercase"
          >
            <SlidersHorizontal size={14} />
            Filtros
          </button>

          <div className="flex items-center gap-3">
            <span className="text-neutral-600 text-xs tracking-wide hidden md:block">{products.length} peças</span>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="bg-transparent text-neutral-400 text-xs tracking-widest uppercase border-none outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value} className="bg-neutral-900">
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mobile categories dropdown */}
        {showFilters && (
          <div className="md:hidden px-6 pb-4 flex flex-wrap gap-3 border-t border-neutral-900 pt-4">
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                onClick={() => { setCategory(c.value); setShowFilters(false); }}
                className={`text-xs tracking-widest uppercase px-3 py-2 border transition-colors ${
                  category === c.value
                    ? 'border-amber-400 text-amber-400'
                    : 'border-neutral-700 text-neutral-500 hover:border-neutral-500'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Active filter indicator */}
      {category && (
        <div className="max-w-screen-xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 text-xs tracking-wide">Filtrando por:</span>
            <span className="flex items-center gap-2 bg-neutral-900 text-white text-xs tracking-widest uppercase px-3 py-1.5">
              {activeCategory.label}
              <button onClick={() => setCategory('')}>
                <X size={12} />
              </button>
            </span>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="max-w-screen-xl mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-neutral-900" />
                <div className="h-3 bg-neutral-900 mt-4 w-2/3" />
                <div className="h-3 bg-neutral-900 mt-2 w-1/3" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-neutral-600 text-sm tracking-wide">Nenhum produto encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
