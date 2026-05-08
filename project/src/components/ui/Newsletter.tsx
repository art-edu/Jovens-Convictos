import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.from('newsletter_subscribers').insert({ email });
    setLoading(false);
    if (error) {
      toast('Este e-mail já está cadastrado.', 'error');
    } else {
      toast('Cadastrado com sucesso! Bem-vindo.');
      setEmail('');
    }
  }

  return (
    <section className="py-24 px-6 border-t border-neutral-900">
      <div className="max-w-screen-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-xl mx-auto"
        >
          <p className="text-amber-400 text-xs tracking-[0.35em] uppercase mb-4">Newsletter</p>
          <h2 className="font-serif text-white text-3xl tracking-wide mb-4">Fique por Dentro</h2>
          <p className="text-neutral-500 text-sm tracking-wide mb-10">
            Receba novidades, lançamentos exclusivos e mensagens de fé diretamente no seu e-mail.
          </p>
          <form onSubmit={handleSubmit} className="flex gap-0">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Seu melhor e-mail"
              className="flex-1 bg-neutral-900 border border-neutral-700 text-white text-sm px-5 py-4 focus:outline-none focus:border-amber-400 transition-colors placeholder-neutral-600"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-400 text-black px-6 py-4 hover:bg-amber-300 transition-colors flex items-center gap-2 text-xs tracking-widest uppercase disabled:opacity-50"
            >
              {loading ? '...' : <ArrowRight size={16} />}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
