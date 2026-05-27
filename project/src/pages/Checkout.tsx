import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, QrCode, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import type { ShippingAddress } from '../types/database';

type Step = 'payment' | 'review';


export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user, session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('payment');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [loading, setLoading] = useState(false);
  const [serverTotal, setServerTotal] = useState<number | null>(null);


  async function handleOrder() {
    if (!user || !session) { navigate('/auth'); return; }
    setLoading(true);

    try {
      const edgeUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calculate-order`;

      const response = await fetch(edgeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          items: items.map(item => ({
            product_id: item.product.id,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
          })),
          payment_method: paymentMethod,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast(result.error || 'Erro ao criar pedido', 'error');
        setLoading(false);
        return;
      }

      setServerTotal(result.order.total);
      clearCart();
      toast('Pedido realizado com sucesso!');
      navigate('/pedidos');
    } catch {
      toast('Erro de conexão. Tente novamente.', 'error');
    }

    setLoading(false);
  }

  if (items.length === 0) {
    return (
      <div className="bg-black min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-500 text-sm mb-4">Seu carrinho está vazio</p>
          <button onClick={() => navigate('/catalogo')} className="text-amber-400 text-xs tracking-widest uppercase">
            Ir para a loja
          </button>
        </div>
      </div>
    );
  }

  const steps: Step[] = ['payment', 'review'];
  const stepLabels = { payment: 'Pagamento', review: 'Revisão' };
  const displayTotal = serverTotal ?? (paymentMethod === 'pix' ? total * 0.95 : total);
  const displayDiscount = paymentMethod === 'pix' ? total * 0.05 : 0;

  return (
    <div className="bg-black min-h-screen pt-16">
      <div className="max-w-screen-lg mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-blue-300 text-xs tracking-[0.4em] uppercase mb-3">Finalizar</p>
          <h1 className="font-serif text-white text-3xl tracking-wide">Checkout</h1>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-0 mb-12">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`flex items-center gap-2 ${step === s ? 'text-white' : steps.indexOf(step) > i ? 'text-blue-300' : 'text-neutral-600'}`}>
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs ${
                  step === s ? 'border-white bg-white text-black' :
                  steps.indexOf(step) > i ? 'border-blue-300 bg-blue-300 text-black' :
                  'border-neutral-700'
                }`}>
                  {steps.indexOf(step) > i ? <Check size={10} /> : i + 1}
                </div>
                <span className="text-xs tracking-[0.15em] uppercase hidden sm:block">{stepLabels[s]}</span>
              </div>
              {i < steps.length - 1 && <div className={`w-16 h-px mx-3 ${steps.indexOf(step) > i ? 'bg-blue-300' : 'bg-neutral-800'}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            
            {step === 'payment' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-white text-sm tracking-[0.2em] uppercase mb-6">Método de Pagamento</h2>
                <div className="space-y-3">
                  {[
                    { value: 'pix', label: 'PIX', desc: 'Aprovação instantânea', icon: QrCode },
                    { value: 'card', label: 'Cartão de Crédito', desc: 'Parcelamento em até 12x', icon: CreditCard },
                  ].map(opt => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setPaymentMethod(opt.value as 'pix' | 'card')}
                        className={`w-full flex items-center gap-4 p-5 border transition-colors text-left ${
                          paymentMethod === opt.value
                            ? 'border-blue-300 bg-blue-300/5'
                            : 'border-neutral-800 hover:border-neutral-600'
                        }`}
                      >
                        <div className={`w-10 h-10 flex items-center justify-center ${paymentMethod === opt.value ? 'text-blue-300' : 'text-neutral-600'}`}>
                          <Icon size={20} />
                        </div>
                        <div>
                          <p className="text-white text-sm tracking-wide">{opt.label}</p>
                          <p className="text-neutral-500 text-xs mt-0.5">{opt.desc}</p>
                        </div>
                        <div className={`ml-auto w-4 h-4 rounded-full border-2 ${paymentMethod === opt.value ? 'border-blue-300 bg-blue-300' : 'border-neutral-600'}`} />
                      </button>
                    );
                  })}
                </div>
                {paymentMethod === 'pix' && (
                  <div className="mt-6 p-5 bg-neutral-900 border border-neutral-800">
                    <p className="text-neutral-400 text-xs tracking-wide mb-2">Após confirmar, você receberá a chave PIX.</p>
                  </div>
                )}
                <div className="flex gap-4 mt-8">
                
                  <button onClick={() => setStep('review')} className="bg-blue-300 text-black text-xs tracking-[0.2em] uppercase px-12 py-4 hover:bg-blue-300 transition-colors">
                    Continuar
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'review' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-white text-sm tracking-[0.2em] uppercase mb-6">Revisar Pedido</h2>
                <div className="space-y-3 mb-6">
                  {items.map(item => (
                    <div key={`${item.product.id}-${item.size}`} className="flex items-center gap-4 py-3 border-b border-neutral-900">
                      <div className="w-14 h-18 flex-shrink-0 overflow-hidden bg-neutral-900">
                        <img src={item.product.images?.[0] ?? ''} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm">{item.product.name}</p>
                        {item.size && <p className="text-neutral-500 text-xs mt-0.5">Tam: {item.size}</p>}
                        <p className="text-neutral-500 text-xs">Qtd: {item.quantity}</p>
                      </div>
                      <p className="text-blue-300 text-sm">R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-neutral-900 p-4 mb-6 text-xs text-neutral-400 space-y-1">
                  <p><span className="text-neutral-600">Pagamento:</span> {paymentMethod === 'pix' ? 'PIX' : 'Cartão'}</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStep('payment')} className="border border-neutral-700 text-neutral-400 text-xs tracking-widest uppercase px-8 py-4 hover:border-neutral-500 transition-colors">
                    Voltar
                  </button>
                  <button
                    onClick={handleOrder}
                    disabled={loading || !user}
                    className="flex-1 bg-blue-300 text-black text-xs tracking-[0.2em] uppercase py-4 hover:bg-blue-300 transition-colors disabled:opacity-50"
                  >
                    {!user ? 'Faça login para continuar' : loading ? 'Processando...' : 'Confirmar Pedido'}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-950 border border-neutral-800 p-6 sticky top-24">
              <h3 className="text-white text-xs tracking-[0.2em] uppercase mb-6 pb-4 border-b border-neutral-800">
                Resumo
              </h3>
              {items.map(item => (
                <div key={`${item.product.id}-${item.size}`} className="flex justify-between mb-3">
                  <span className="text-neutral-400 text-xs">{item.product.name} x{item.quantity}</span>
                  <span className="text-white text-xs">R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                </div>
              ))}
              <div className="border-t border-neutral-800 pt-4 mt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-neutral-400 text-xs tracking-wide">Subtotal</span>
                  <span className="text-white text-xs">R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
                {paymentMethod === 'pix' && (
                  <div className="flex justify-between mb-2"></div>
                )}
                <div className="flex justify-between mt-4 pt-4 border-t border-neutral-800">
                  <span className="text-white text-xs tracking-[0.15em] uppercase">Total</span>
                  <span className="text-white text-base">R$ {displayTotal.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
