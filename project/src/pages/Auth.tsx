import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const GENERIC_ERROR = 'Ocorreu um erro. Tente novamente mais tarde.';

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  function sanitizeInput(value: string): string {
    return value.trim().replace(/[<>]/g, '');
  }

  function validateEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validatePassword(value: string): string | null {
    if (value.length < 6) return 'A senha deve ter no mínimo 6 caracteres';
    if (value.length > 128) return 'A senha deve ter no máximo 128 caracteres';
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const sanitizedFullName = sanitizeInput(fullName);

    if (!validateEmail(sanitizedEmail)) {
      toast('E-mail inválido', 'error');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast(passwordError, 'error');
      return;
    }

    setLoading(true);

    if (mode === 'login') {
      const { error } = await signIn(sanitizedEmail, password);
      if (error) {
        toast('E-mail ou senha inválidos', 'error');
      } else {
        toast('Bem-vindo de volta!');
        navigate('/');
      }
    } else {
      if (!sanitizedFullName) {
        toast('Informe seu nome completo', 'error');
        setLoading(false);
        return;
      }
      if (sanitizedFullName.length > 100) {
        toast('Nome muito longo', 'error');
        setLoading(false);
        return;
      }
      const { error } = await signUp(sanitizedEmail, password, sanitizedFullName);
      if (error) {
        toast(GENERIC_ERROR, 'error');
      } else {
        toast('Conta criada! Faça login para continuar.');
        setMode('login');
      }
    }
    setLoading(false);
  }

  return (
    <div className="bg-black min-h-screen flex">
      {/* Left image */}
      <div className="hidden lg:block w-1/2 relative">
        <img
          src="https://images.pexels.com/photos/2897531/pexels-photo-2897531.jpeg"
          alt="Auth"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Link to="/" className="font-serif text-white text-2xl tracking-[0.3em] uppercase">
              Jovens Convictos
            </Link>
            <p className="text-neutral-300 text-sm tracking-widest mt-2">Vivendo pela fé</p>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-8 py-24">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden block font-serif text-white text-xl tracking-[0.3em] uppercase text-center mb-12">
            Jovens Convictos
          </Link>

          <div className="flex border-b border-neutral-800 mb-10">
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 text-xs tracking-[0.2em] uppercase py-4 transition-colors ${
                  mode === m ? 'text-white border-b-2 border-amber-400 -mb-[2px]' : 'text-neutral-600 hover:text-neutral-400'
                }`}
              >
                {m === 'login' ? 'Entrar' : 'Criar Conta'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {mode === 'register' && (
                <div>
                  <label className="text-neutral-400 text-xs tracking-[0.15em] uppercase block mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    maxLength={100}
                    className="w-full bg-neutral-900 border border-neutral-700 text-white text-sm px-4 py-4 focus:outline-none focus:border-amber-400 transition-colors placeholder-neutral-600"
                    placeholder="Seu nome"
                    required
                  />
                </div>
              )}
              <div>
                <label className="text-neutral-400 text-xs tracking-[0.15em] uppercase block mb-2">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 text-white text-sm px-4 py-4 focus:outline-none focus:border-amber-400 transition-colors placeholder-neutral-600"
                  placeholder="seu@email.com"
                  required
                />
              </div>
              <div>
                <label className="text-neutral-400 text-xs tracking-[0.15em] uppercase block mb-2">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  minLength={6}
                  maxLength={128}
                  className="w-full bg-neutral-900 border border-neutral-700 text-white text-sm px-4 py-4 focus:outline-none focus:border-amber-400 transition-colors placeholder-neutral-600"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-400 text-black text-xs tracking-[0.25em] uppercase py-5 hover:bg-amber-300 transition-colors disabled:opacity-50 mt-4"
              >
                {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar Conta'}
              </button>
            </motion.form>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
