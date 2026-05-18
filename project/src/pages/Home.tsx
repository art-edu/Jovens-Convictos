import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product } from '../types/database';
import ProductCard from '../components/product/ProductCard';
import Footer from '../components/layout/Footer';
import Newsletter from '../components/ui/Newsletter';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  useEffect(() => {
    supabase.from('products').select('*').eq('featured', true).eq('active', true).limit(4)
      .then(({ data }) => setFeaturedProducts(data ?? []));
  }, []);

  return (
    <div className="bg-black min-h-screen">
      {/* Hero */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <img
            src="https://files.catbox.moe/8k3riu.jpg"
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/80" />
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xs tracking-[0.4em] uppercase mb-6"
          >
            Coleção 2025
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="font-serif text-white text-5xl md:text-7xl lg:text-8xl tracking-[0.12em] uppercase leading-none mb-4"
          >
            Jovens
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.65 }}
            className="font-serif text-white text-5xl md:text-7xl lg:text-8xl tracking-[0.12em] uppercase leading-none mb-8"
          >
            Convictos
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="text-neutral-300 text-sm tracking-[0.3em] uppercase mb-12"
          >
            Vivendo pela fé
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
          >
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-3 border border-white/40 text-white text-xs tracking-[0.25em] uppercase px-10 py-4 hover:bg-white hover:text-black transition-all duration-500"
            >
              Explorar Coleção
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
            <ChevronDown size={20} className="text-white/40" />
          </motion.div>
        </motion.div>
      </section>

      {/* Manifesto */}
      <section className="py-32 px-6">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-blue-300 text-xs tracking-[0.35em] uppercase mb-6">Nossa Missão</p>
              <h2 className="font-serif text-white text-4xl md:text-5xl tracking-wide leading-tight mb-8">
                Cada peça carrega<br />uma mensagem
              </h2>
              <p className="text-neutral-400 text-sm leading-relaxed tracking-wide mb-8">
                Cada peça da Jovens Convictos foi criada para ser mais do que vestuário — é uma declaração de fé. Somos jovens que vivem o que creem, e cada detalhe reflete essa convicção.
              </p>
              <Link
                to="/sobre"
                className="inline-flex items-center gap-2 text-blue-300 text-xs tracking-[0.2em] uppercase hover:gap-4 transition-all duration-300"
              >
                Conhecer Nossa História <ArrowRight size={14} />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src="https://files.catbox.moe/e7c2tg.jpg"
                  alt="Nossa missão"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 border border-amber-400/20" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categorias */}
      <section className="py-20 px-6 border-t border-neutral-900">
        <div className="max-w-screen-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-blue-300 text-xs tracking-[0.35em] uppercase mb-4">Explorar</p>
            <h2 className="font-serif text-white text-3xl md:text-4xl tracking-wide">Nossas Categorias</h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Camisas', cat: 'camisas', img: 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg' },
              { label: 'Bonés', cat: 'bones', img: 'https://files.catbox.moe/mjgqyp.jpg' },
              { label: 'Moletons', cat: 'moletons', img: 'https://images.pexels.com/photos/6311655/pexels-photo-6311655.jpeg' },
              { label: 'Acessórios', cat: 'acessorios', img: 'https://files.catbox.moe/2q43wz.jpg' },
            ].map((cat, i) => (
              <motion.div
                key={cat.cat}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/catalogo?categoria=${cat.cat}`} className="group block relative overflow-hidden aspect-[3/4]">
                  <img src={cat.img} alt={cat.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white font-serif text-lg tracking-[0.12em] uppercase">{cat.label}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Produtos em Destaque */}
      <section className="py-24 px-6">
        <div className="max-w-screen-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-16"
          >
            <div>
              <p className="text-blue-300 text-xs tracking-[0.35em] uppercase mb-4">Destaques</p>
              <h2 className="font-serif text-white text-3xl md:text-4xl tracking-wide">Peças da Coleção</h2>
            </div>
            <Link to="/catalogo" className="hidden md:flex items-center gap-2 text-neutral-400 text-xs tracking-[0.2em] uppercase hover:text-white transition-colors">
              Ver tudo <ArrowRight size={12} />
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-3 border border-neutral-700 text-neutral-300 text-xs tracking-[0.25em] uppercase px-10 py-4 hover:border-white hover:text-white transition-all duration-300"
            >
              Ver Toda Coleção
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Banner secundário */}
      <section className="relative py-0 overflow-hidden">
        <div className="h-[60vh] relative">
          <img
            src="https://files.catbox.moe/6hd5ek.jpg"
            alt="Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 flex items-center justify-center text-center px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-blue-300 text-xs tracking-[0.4em] uppercase mb-6">Versículo</p>
              <blockquote className="font-serif text-white text-2xl md:text-4xl lg:text-5xl tracking-wide leading-tight max-w-3xl">
                "Tudo posso naquele que me fortalece"
              </blockquote>
              <p className="text-neutral-400 text-sm tracking-widest mt-6">Filipenses 4:13</p>
            </motion.div>
          </div>
        </div>
      </section>

      <Newsletter />
      <Footer />
    </div>
  );
}
