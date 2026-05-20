import { Link } from 'react-router-dom';
import { Instagram, Youtube, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-neutral-800 pt-16 pb-8">
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <p className="font-serif text-white text-xl tracking-[0.3em] uppercase mb-4">
              Jovens Convictos
            </p>
            <p className="text-neutral-500 text-xs leading-relaxed tracking-wide">
              Vivendo pela fé. Cada peça conta a história de uma geração convicta em seus valores.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a href="#" className="text-neutral-600 hover:text-amber-400 transition-colors duration-300">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-neutral-600 hover:text-amber-400 transition-colors duration-300">
                <Youtube size={18} />
              </a>
              <a href="#" className="text-neutral-600 hover:text-amber-400 transition-colors duration-300">
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          <div>
            <p className="text-white text-xs tracking-[0.2em] uppercase mb-6">Loja</p>
            <ul className="space-y-3">
              {[
                { label: 'Toda a Coleção', href: '/catalogo' },
                { label: 'Camisas', href: '/catalogo?categoria=camisas' },
                { label: 'Bonés', href: '/catalogo?categoria=bones' },
                { label: 'Moletons', href: '/catalogo?categoria=moletons' },
                { label: 'Acessórios', href: '/catalogo?categoria=acessorios' },
              ].map(l => (
                <li key={l.href}>
                  <Link to={l.href} className="text-neutral-500 text-xs tracking-wide hover:text-white transition-colors duration-300">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-white text-xs tracking-[0.2em] uppercase mb-6">Informações</p>
            <ul className="space-y-3">
              {[
                { label: 'Sobre Nós', href: '/sobre' },
                { label: 'Contato', href: '/contato' },
                
              ].map(l => (
                <li key={l.label}>
                  <Link to={l.href} className="text-neutral-500 text-xs tracking-wide hover:text-white transition-colors duration-300">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-white text-xs tracking-[0.2em] uppercase mb-6">Atendimento</p>
            <ul className="space-y-3">
              <li>
                <a href="mailto:contato@jovensconvictos.com" className="text-neutral-500 text-xs tracking-wide hover:text-white transition-colors duration-300">
                  jovensiba07@gmail.com
                </a>
              </li>
              <li>
                <a href="https://wa.me/89 9421-8604" className="text-neutral-500 text-xs tracking-wide hover:text-white transition-colors duration-300">
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-neutral-700 text-xs tracking-wide">
            © {new Date().getFullYear()} Jovens Convictos. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-neutral-700 text-xs tracking-wide">PIX</span>
            <span className="text-neutral-700 text-xs tracking-wide">Cartão de Crédito</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
