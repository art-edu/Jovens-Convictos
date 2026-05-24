import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="bg-black min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <p className="text-amber-400 text-xs tracking-[0.4em] uppercase mb-4">Erro 404</p>
        <h1 className="font-serif text-white text-5xl tracking-wide mb-4">Página não encontrada</h1>
        <p className="text-neutral-500 text-sm tracking-wide mb-10">
          A página que você procura não existe ou foi movida.
        </p>
        <Link
          to="/"
          className="inline-block bg-amber-400 text-black text-xs tracking-[0.2em] uppercase px-10 py-4 hover:bg-amber-300 transition-colors"
        >
          Voltar ao Início
        </Link>
      </motion.div>
    </div>
  );
}
