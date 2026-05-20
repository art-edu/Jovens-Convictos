import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';

export default function CartSidebar() {
  const { items, isOpen, closeCart, removeItem, updateQty, total } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 z-[70] backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-neutral-950 border-l border-neutral-800 z-[80] flex flex-col"
          >
            <div className="flex items-center justify-between px-6 h-16 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <ShoppingBag size={18} className="text-blue-400" />
                <span className="text-white text-xs tracking-[0.2em] uppercase">
                  Carrinho {items.length > 0 && `(${items.length})`}
                </span>
              </div>
              <button onClick={closeCart} className="text-neutral-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
                <ShoppingBag size={40} className="text-neutral-700" />
                <p className="text-neutral-500 text-sm tracking-wide text-center">
                  Seu carrinho está vazio
                </p>
                <button
                  onClick={closeCart}
                  className="mt-4 text-xs tracking-[0.2em] uppercase text-blue-300 hover:text-blue-300 transition-colors border border-blue-300/30 hover:border-blue-300/50 px-6 py-3"
                >
                  Continuar Comprando
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto py-4">
                  {items.map(item => (
                    <div key={`${item.product.id}-${item.size}-${item.color}`} className="px-6 py-4 border-b border-neutral-900 flex gap-4">
                      <div className="w-20 h-24 bg-neutral-900 flex-shrink-0 overflow-hidden">
                        <img
                          src={item.product.images?.[0] || ''}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs tracking-wide font-light truncate">{item.product.name}</p>
                        {item.size && <p className="text-neutral-500 text-xs mt-1">Tamanho: {item.size}</p>}
                        {item.color && <p className="text-neutral-500 text-xs">Cor: {item.color}</p>}
                        <p className="text-blue-300 text-sm mt-2">
                          R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          <button
                            onClick={() => updateQty(item.product.id, item.size, item.color, item.quantity - 1)}
                            className="text-neutral-500 hover:text-white transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-white text-xs w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQty(item.product.id, item.size, item.color, item.quantity + 1)}
                            className="text-neutral-500 hover:text-white transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                          <button
                            onClick={() => removeItem(item.product.id, item.size, item.color)}
                            className="ml-auto text-neutral-700 hover:text-red-400 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-6 py-6 border-t border-neutral-800">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-neutral-400 text-xs tracking-[0.15em] uppercase">Total</span>
                    <span className="text-white text-lg font-light">
                      R$ {total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <Link
                    to="/checkout"
                    onClick={closeCart}
                    className="block w-full bg-amber-400 text-black text-xs tracking-[0.2em] uppercase text-center py-4 hover:bg-amber-300 transition-colors duration-300"
                  >
                    Finalizar Compra
                  </Link>
                  <button
                    onClick={closeCart}
                    className="block w-full text-neutral-500 text-xs tracking-[0.15em] uppercase text-center py-3 mt-2 hover:text-white transition-colors"
                  >
                    Continuar Comprando
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
