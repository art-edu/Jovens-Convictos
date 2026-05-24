import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product, ProductVariant } from '../types/database';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import ProductCard from '../components/product/ProductCard';
import Footer from '../components/layout/Footer';
import { formatPrice, PLACEHOLDER_IMAGE } from '../lib/utils';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const { addItem, openCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (!slug) return;
    supabase.from('products').select('*').eq('slug', slug).eq('active', true).maybeSingle()
      .then(({ data }) => {
        setProduct(data);
        setLoading(false);
        if (data) {
          supabase.from('product_variants').select('*').eq('product_id', data.id)
            .then(({ data: vars }) => setVariants(vars ?? []));
          supabase.from('products').select('*').eq('category', data.category).neq('slug', slug).eq('active', true).limit(4)
            .then(({ data: rel }) => setRelated(rel ?? []));
        }
      });
  }, [slug]);

  useEffect(() => {
    const v = variants.find(v => v.size === selectedSize);
    setSelectedVariant(v ?? null);
  }, [selectedSize, variants]);

  function handleAddToCart() {
    if (!product) return;
    if (product.stock === 0) {
      toast('Produto esgotado', 'error');
      return;
    }
    const needsSize = product.category === 'camisas' || product.category === 'moletons';
    if (needsSize) {
      if (!selectedSize) {
        toast('Selecione um tamanho', 'error');
        return;
      }
      if (selectedVariant && selectedVariant.stock === 0) {
        toast('Tamanho esgotado', 'error');
        return;
      }
    }
    addItem(product, selectedSize, '', selectedVariant?.id);
    toast(`${product.name} adicionado ao carrinho`);
    openCart();
  }

  if (loading) {
    return (
      <div className="bg-black min-h-screen pt-16 flex items-center justify-center">
        <div className="w-8 h-8 border border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-black min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-500 text-sm mb-4">Produto não encontrado</p>
          <Link to="/catalogo" className="text-amber-400 text-xs tracking-widest uppercase">
            Ver catálogo
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [PLACEHOLDER_IMAGE];
  const needsSize = product.category === 'camisas' || product.category === 'moletons';
  const isOutOfStock = product.stock === 0;

  return (
    <div className="bg-black min-h-screen pt-16">
      {/* Breadcrumb */}
      <div className="max-w-screen-xl mx-auto px-6 py-4">
        <div className="flex items-center gap-2 text-neutral-600 text-xs tracking-widest uppercase">
          <Link to="/" className="hover:text-white transition-colors">Início</Link>
          <span>/</span>
          <Link to="/catalogo" className="hover:text-white transition-colors">Coleção</Link>
          <span>/</span>
          <span className="text-neutral-400">{product.name}</span>
        </div>
      </div>

      {/* Product Layout */}
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[4/5] overflow-hidden bg-neutral-900 cursor-zoom-in group" onClick={() => setZoomed(true)}>
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-4 right-4 bg-black/60 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn size={16} className="text-white" />
              </div>
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedImage(i => (i - 1 + images.length) % images.length); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft size={16} className="text-white" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedImage(i => (i + 1) % images.length); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight size={16} className="text-white" />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-20 overflow-hidden border-2 transition-colors ${
                      selectedImage === i ? 'border-amber-400' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:pt-4"
          >
            <p className="text-neutral-500 text-xs tracking-[0.25em] uppercase mb-3">{product.category}</p>
            <h1 className="font-serif text-white text-3xl md:text-4xl tracking-wide mb-4">{product.name}</h1>
            <p className="text-amber-400 text-2xl font-light mb-8">
              {formatPrice(product.price)}
            </p>

            <div className="border-t border-neutral-900 pt-8 mb-8">
              <p className="text-neutral-400 text-sm leading-relaxed tracking-wide">{product.description}</p>
            </div>

            {needsSize && variants.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white text-xs tracking-[0.2em] uppercase">Tamanho</span>
                  {selectedSize && (
                    <span className="text-amber-400 text-xs tracking-wide">{selectedSize}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {variants.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedSize(v.size)}
                      disabled={v.stock === 0}
                      className={`w-12 h-12 text-xs tracking-widest uppercase border transition-all duration-200 ${
                        v.stock === 0
                          ? 'border-neutral-800 text-neutral-700 line-through cursor-not-allowed'
                          : selectedSize === v.size
                            ? 'bg-white text-black border-white'
                            : 'bg-transparent text-neutral-400 border-neutral-700 hover:border-neutral-500 hover:text-white'
                      }`}
                    >
                      {v.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isOutOfStock ? (
              <div className="w-full bg-neutral-800 text-neutral-400 text-xs tracking-[0.25em] uppercase py-5 flex items-center justify-center mb-4">
                Esgotado
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                className="w-full bg-amber-400 text-black text-xs tracking-[0.25em] uppercase py-5 flex items-center justify-center gap-3 hover:bg-amber-300 transition-colors duration-300 mb-4"
              >
                <ShoppingBag size={16} />
                Adicionar ao Carrinho
              </button>
            )}

            <div className="border-t border-neutral-900 pt-6 space-y-3">
              <p className="text-neutral-600 text-xs tracking-wide">Frete grátis acima de R$ 200</p>
              <p className="text-neutral-600 text-xs tracking-wide">Pagamento via PIX ou cartão</p>
              <p className="text-neutral-600 text-xs tracking-wide">Entrega em 5-8 dias úteis</p>
              {!isOutOfStock && (
                <p className="text-neutral-600 text-xs tracking-wide">
                  {selectedVariant
                    ? selectedVariant.stock <= 5
                      ? `Últimas ${selectedVariant.stock} unidades neste tamanho`
                      : 'Em estoque'
                    : product.stock <= 5
                      ? `Últimas ${product.stock} unidades em estoque`
                      : 'Em estoque'}
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="py-20 px-6 border-t border-neutral-900">
          <div className="max-w-screen-xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-amber-400 text-xs tracking-[0.35em] uppercase mb-3">Você Também Pode Gostar</p>
              <h2 className="font-serif text-white text-2xl tracking-wide">Produtos Relacionados</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* Zoom Modal */}
      <AnimatePresence>
        {zoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setZoomed(false)}
          >
            <button className="absolute top-6 right-6 text-white hover:text-amber-400 transition-colors">
              <X size={24} />
            </button>
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
