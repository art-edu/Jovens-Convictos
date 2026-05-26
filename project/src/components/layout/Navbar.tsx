import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, User, X, Menu } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const navLinks = [
  { label: 'Coleção', href: '/catalogo' },
  { label: 'Camisas', href: '/catalogo?categoria=camisas' },
  { label: 'Bonés', href: '/catalogo?categoria=bones' },
  { label: 'Moletons', href: '/catalogo?categoria=moletons' },
  { label: 'Acessórios', href: '/catalogo?categoria=acessorios' },
  { label: 'Sobre', href: '/sobre' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { count, openCart } = useCart();
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-black/95 backdrop-blur-sm border-b border-neutral-800' : 'bg-transparent'
        }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-serif text-white text-lg tracking-[0.25em] uppercase hover:text-amber-400 transition-colors duration-300">
            Jovens Convictos
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className="text-neutral-300 hover:text-white text-xs tracking-[0.15em] uppercase transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link to="/admin" className="hidden lg:block text-amber-400 text-xs tracking-[0.15em] uppercase hover:text-amber-300 transition-colors">
                Admin
              </Link>
            )}
            {user ? (
              <div className="hidden lg:flex items-center gap-4">
                <Link to="/pedidos" className="text-neutral-300 hover:text-white transition-colors">
                  <User size={18} />
                </Link>
                <button onClick={handleSignOut} className="text-neutral-500 text-xs tracking-widest uppercase hover:text-white transition-colors">
                  Sair
                </button>
              </div>
            ) : (
              <Link to="/auth" className="hidden lg:block text-neutral-300 hover:text-white transition-colors">
                <User size={18} />
              </Link>
            )}
            <button
              onClick={openCart}
              className="relative text-neutral-300 hover:text-white transition-colors"
            >
              <ShoppingBag size={18} />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-400 text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden text-neutral-300 hover:text-white transition-colors"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-black flex flex-col"
          >
            <div className="flex items-center justify-between px-6 h-16 border-b border-neutral-800">
              <Link to="/" onClick={() => setMenuOpen(false)} className="font-serif text-white text-lg tracking-[0.25em] uppercase">
                Jovens Convictos
              </Link>
              <button onClick={() => setMenuOpen(false)} className="text-neutral-400 hover:text-white transition-colors">
                <X size={22} />
              </button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 + 0.1 }}
                >
                  <Link
                    to={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="text-white text-3xl font-serif tracking-widest uppercase hover:text-amber-400 transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              {user ? (
                <>
                  {isAdmin && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
                      <Link to="/admin" onClick={() => setMenuOpen(false)} className="text-amber-400 text-sm tracking-widest uppercase hover:text-amber-300 transition-colors">
                        Admin
                      </Link>
                    </motion.div>
                  )}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                    <Link to="/pedidos" onClick={() => setMenuOpen(false)} className="text-neutral-400 text-sm tracking-widest uppercase hover:text-white transition-colors">
                      Minha Conta
                    </Link>
                  </motion.div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
                    <button onClick={() => { handleSignOut(); setMenuOpen(false); }} className="text-neutral-500 text-sm tracking-widest uppercase hover:text-white transition-colors">
                      Sair
                    </button>
                  </motion.div>
                </>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                  <Link to="/auth" onClick={() => setMenuOpen(false)} className="text-neutral-400 text-sm tracking-widest uppercase hover:text-white transition-colors">
                    Entrar
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
