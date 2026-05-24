import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import type { Product } from '../../types/database';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { formatPrice, PLACEHOLDER_IMAGE } from '../../lib/utils';

interface Props {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: Props) {
  const [hovered, setHovered] = useState(false);
  const { addItem, openCart } = useCart();
  const { toast } = useToast();

  const isOutOfStock = product.stock === 0;

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    if (isOutOfStock) {
      toast('Produto esgotado', 'error');
      return;
    }
    addItem(product, '', '');
    toast(`${product.name} adicionado ao carrinho`);
    openCart();
  }

  const image = product.images?.[0] || PLACEHOLDER_IMAGE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
    >
      <Link
        to={`/produto/${product.slug}`}
        className="group block"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="relative overflow-hidden bg-neutral-900 aspect-[3/4]">
          <motion.img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover"
            animate={{ scale: hovered ? 1.06 : 1 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />

          {isOutOfStock ? (
            <div className="absolute bottom-4 left-4 right-4 bg-black/80 text-neutral-400 text-xs tracking-[0.15em] uppercase py-3 flex items-center justify-center">
              Esgotado
            </div>
          ) : (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 10 }}
              transition={{ duration: 0.25 }}
              onClick={handleQuickAdd}
              className="absolute bottom-4 left-4 right-4 bg-white text-black text-xs tracking-[0.15em] uppercase py-3 flex items-center justify-center gap-2 hover:bg-amber-400 transition-colors duration-300"
            >
              <ShoppingBag size={14} />
              Adicionar
            </motion.button>
          )}
        </div>

        <div className="pt-4 pb-6">
          <p className="text-neutral-500 text-[10px] tracking-[0.2em] uppercase mb-1">
            {product.category}
          </p>
          <p className="text-white text-sm tracking-[0.08em] font-light group-hover:text-amber-400 transition-colors duration-300">
            {product.name}
          </p>
          <p className="text-neutral-400 text-sm mt-1 font-light">
            {formatPrice(product.price)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
