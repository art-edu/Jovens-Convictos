import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Instagram } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';
import Footer from '../components/layout/Footer';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('contact_messages').insert({
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject,
      message: form.message.trim(),
    });

    if (error) {
      toast('Erro ao enviar mensagem. Tente novamente mais tarde.', 'error');
      setLoading(false);
      return;
    }

    toast('Mensagem enviada! Retornaremos em breve.');
    setForm({ name: '', email: '', subject: '', message: '' });
    setLoading(false);
  }

  return (
    <div className="bg-black min-h-screen pt-16">
      <div className="py-20 px-6 border-b border-neutral-900 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-amber-400 text-xs tracking-[0.4em] uppercase mb-4">Fale Conosco</p>
          <h1 className="font-serif text-white text-4xl tracking-wide">Contato</h1>
        </motion.div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <h2 className="font-serif text-white text-2xl tracking-wide mb-8">Estamos aqui para você</h2>
            <p className="text-neutral-400 text-sm leading-relaxed tracking-wide mb-12">
              Dúvidas sobre produtos, tamanhos, rastreamento de pedidos ou qualquer outra questão — nossa equipe responde em até 24 horas.
            </p>

            <div className="space-y-8">
              {[
                { icon: Mail, label: 'E-mail', value: 'contato@jovensconvictos.com', href: 'mailto:contato@jovensconvictos.com' },
                { icon: MessageSquare, label: 'WhatsApp', value: '+55 (11) 99999-9999', href: 'https://wa.me/5511999999999' },
                { icon: Instagram, label: 'Instagram', value: '@jovensconvictos', href: '#' },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <a key={item.label} href={item.href} className="flex items-start gap-4 group">
                    <div className="w-10 h-10 border border-neutral-800 flex items-center justify-center group-hover:border-amber-400 transition-colors">
                      <Icon size={16} className="text-neutral-500 group-hover:text-amber-400 transition-colors" />
                    </div>
                    <div>
                      <p className="text-neutral-500 text-xs tracking-[0.15em] uppercase mb-1">{item.label}</p>
                      <p className="text-white text-sm group-hover:text-amber-400 transition-colors">{item.value}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-neutral-400 text-xs tracking-[0.15em] uppercase block mb-2">Nome</label>
                  <input name="name" value={form.name} onChange={handleChange} required className="w-full bg-neutral-900 border border-neutral-700 text-white text-sm px-4 py-4 focus:outline-none focus:border-amber-400 transition-colors placeholder-neutral-600" placeholder="Seu nome" />
                </div>
                <div>
                  <label className="text-neutral-400 text-xs tracking-[0.15em] uppercase block mb-2">E-mail</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full bg-neutral-900 border border-neutral-700 text-white text-sm px-4 py-4 focus:outline-none focus:border-amber-400 transition-colors placeholder-neutral-600" placeholder="seu@email.com" />
                </div>
              </div>
              <div>
                <label className="text-neutral-400 text-xs tracking-[0.15em] uppercase block mb-2">Assunto</label>
                <select name="subject" value={form.subject} onChange={handleChange} required className="w-full bg-neutral-900 border border-neutral-700 text-white text-sm px-4 py-4 focus:outline-none focus:border-amber-400 transition-colors">
                  <option value="">Selecione um assunto</option>
                  <option>Dúvida sobre produto</option>
                  <option>Rastreamento de pedido</option>
                  <option>Troca e devolução</option>
                  <option>Outro</option>
                </select>
              </div>
              <div>
                <label className="text-neutral-400 text-xs tracking-[0.15em] uppercase block mb-2">Mensagem</label>
                <textarea name="message" value={form.message} onChange={handleChange} required rows={6} className="w-full bg-neutral-900 border border-neutral-700 text-white text-sm px-4 py-4 focus:outline-none focus:border-amber-400 transition-colors resize-none placeholder-neutral-600" placeholder="Sua mensagem..." />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-amber-400 text-black text-xs tracking-[0.25em] uppercase py-5 hover:bg-amber-300 transition-colors disabled:opacity-50">
                {loading ? 'Enviando...' : 'Enviar Mensagem'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
