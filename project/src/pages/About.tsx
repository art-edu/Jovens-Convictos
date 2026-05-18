import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Footer from '../components/layout/Footer';
import Newsletter from '../components/ui/Newsletter';

export default function About() {
  return (
    <div className="bg-black min-h-screen pt-16">
      {/* Hero */}
      <div className="relative h-[60vh] overflow-hidden">
        <img
          src="https://files.catbox.moe/6hd5ek.jpg"
          alt="About Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="text-blue-300 text-xs tracking-[0.4em] uppercase mb-4">Nossa História</p>
            <h1 className="font-serif text-white text-4xl md:text-6xl tracking-wide">Sobre Nós</h1>
          </motion.div>
        </div>
      </div>

      {/* Manifesto */}
      <section className="py-24 px-6">
        <div className="max-w-screen-md mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-blue-300 text-xs tracking-[0.4em] uppercase mb-6">Manifesto</p>
            <h2 className="font-serif text-white text-3xl md:text-4xl tracking-wide leading-tight mb-8">
              Somos jovens que vivem o que creem
            </h2>
            <p className="text-neutral-400 text-sm leading-relaxed tracking-wide">
              Jovens Convictos nasceu dentro da comunidade de jovens de uma igreja com um propósito simples: criar peças que expressam a fé de uma geração inteira. Cada produto é pensado para que quem o usa carregue uma mensagem viva — de esperança, de convicção, de identidade.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 border-t border-neutral-900">
        <div className="max-w-screen-xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-blue-300 text-xs tracking-[0.4em] uppercase mb-4">Nossos Valores</p>
            <h2 className="font-serif text-white text-3xl tracking-wide">O que nos guia</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: 'Fé', text: 'Cada decisão, cada design, cada detalhe nasce de uma convicção profunda. Não somos apenas uma marca — somos um ministério.' },
              { title: 'Qualidade', text: 'Usamos materiais de primeira porque valorizamos o que carrega nossa mensagem. Excelência é uma forma de honrar o que acreditamos.' },
              { title: 'Comunidade', text: 'Você não está apenas comprando uma roupa. Está fazendo parte de uma família de jovens convictos em todo o Brasil.' },
            ].map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="w-px h-12 bg-blue-300 mx-auto mb-6" />
                <h3 className="font-serif text-white text-2xl tracking-wide mb-4">{v.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed tracking-wide">{v.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Image section */}
      <section className="py-20 px-6">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="aspect-[4/3] overflow-hidden">
            <img src="https://files.catbox.moe/dzmfmc.png" alt="Community" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex items-center">
            <div className="p-8">
              <p className="text-blue-300 text-xs tracking-[0.4em] uppercase mb-6">Nossa Visão</p>
              <h2 className="font-serif text-white text-3xl tracking-wide mb-6">Uma geração marcada pela fé</h2>
              <p className="text-neutral-400 text-sm leading-relaxed tracking-wide mb-8">
                Queremos ver os jovens da nossa igreja usando cada peça como uma declaração pública de sua fé — nas ruas, nas universidades, nos ambientes de trabalho.
              </p>
              <Link to="/catalogo" className="inline-flex items-center gap-2 text-blue-300 text-xs tracking-[0.2em] uppercase hover:gap-4 transition-all duration-300">
                Ver a Coleção <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Newsletter />
      <Footer />
    </div>
  );
}
