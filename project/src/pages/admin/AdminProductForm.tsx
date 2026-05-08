import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Plus, Image } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import type { Product } from '../../types/database';

const CATEGORIES = ['camisas', 'bones', 'moletons', 'garrafas', 'figurinhas', 'acessorios', 'outros'];

const empty: Partial<Product> = {
  name: '', slug: '', description: '', price: 0,
  category: 'camisas', images: [], featured: false, active: true, stock: 0,
};

export default function AdminProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState<Partial<Product>>(empty);
  const [newImage, setNewImage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate('/');
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isEdit && id) {
      supabase.from('products').select('*').eq('id', id).maybeSingle()
        .then(({ data }) => { if (data) setForm(data); });
    }
  }, [id, isEdit]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked
               : type === 'number' ? parseFloat(value) || 0
               : value,
    }));
  }

  function autoSlug(name: string) {
    return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value;
    setForm(prev => ({ ...prev, name, slug: prev.slug || autoSlug(name) }));
  }

  function addImage() {
    if (!newImage.trim()) return;
    setForm(prev => ({ ...prev, images: [...(prev.images ?? []), newImage.trim()] }));
    setNewImage('');
  }

  function removeImage(idx: number) {
    setForm(prev => ({ ...prev, images: prev.images?.filter((_, i) => i !== idx) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.slug || !form.price) {
      toast('Preencha todos os campos obrigatórios', 'error');
      return;
    }
    setLoading(true);
    if (isEdit) {
      const { error } = await supabase.from('products').update({ ...form, updated_at: new Date().toISOString() }).eq('id', id!);
      if (error) { toast('Erro ao atualizar produto', 'error'); }
      else { toast('Produto atualizado com sucesso'); navigate('/admin/produtos'); }
    } else {
      const { error } = await supabase.from('products').insert(form);
      if (error) { toast(error.message || 'Erro ao criar produto', 'error'); }
      else { toast('Produto criado com sucesso'); navigate('/admin/produtos'); }
    }
    setLoading(false);
  }

  return (
    <div className="bg-black min-h-screen pt-16">
      <div className="max-w-screen-lg mx-auto px-6 py-12">
        <div className="mb-10">
          <Link to="/admin/produtos" className="text-neutral-500 text-xs tracking-widest uppercase hover:text-white transition-colors">
            ← Produtos
          </Link>
          <h1 className="font-serif text-white text-3xl tracking-wide mt-2">
            {isEdit ? 'Editar Produto' : 'Novo Produto'}
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-neutral-950 border border-neutral-800 p-6 space-y-5">
                <h3 className="text-white text-xs tracking-[0.2em] uppercase pb-4 border-b border-neutral-800">Informações</h3>
                <div>
                  <label className="text-neutral-400 text-xs tracking-[0.15em] uppercase block mb-2">Nome *</label>
                  <input name="name" value={form.name ?? ''} onChange={handleNameChange} className="w-full bg-neutral-900 border border-neutral-700 text-white text-sm px-4 py-3.5 focus:outline-none focus:border-amber-400 transition-colors" required />
                </div>
                <div>
                  <label className="text-neutral-400 text-xs tracking-[0.15em] uppercase block mb-2">Slug *</label>
                  <input name="slug" value={form.slug ?? ''} onChange={handleChange} className="w-full bg-neutral-900 border border-neutral-700 text-white text-sm px-4 py-3.5 focus:outline-none focus:border-amber-400 transition-colors font-mono" required />
                </div>
                <div>
                  <label className="text-neutral-400 text-xs tracking-[0.15em] uppercase block mb-2">Descrição</label>
                  <textarea name="description" value={form.description ?? ''} onChange={handleChange} rows={4} className="w-full bg-neutral-900 border border-neutral-700 text-white text-sm px-4 py-3.5 focus:outline-none focus:border-amber-400 transition-colors resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-neutral-400 text-xs tracking-[0.15em] uppercase block mb-2">Preço (R$) *</label>
                    <input name="price" type="number" step="0.01" min="0" value={form.price ?? 0} onChange={handleChange} className="w-full bg-neutral-900 border border-neutral-700 text-white text-sm px-4 py-3.5 focus:outline-none focus:border-amber-400 transition-colors" required />
                  </div>
                  <div>
                    <label className="text-neutral-400 text-xs tracking-[0.15em] uppercase block mb-2">Estoque</label>
                    <input name="stock" type="number" min="0" value={form.stock ?? 0} onChange={handleChange} className="w-full bg-neutral-900 border border-neutral-700 text-white text-sm px-4 py-3.5 focus:outline-none focus:border-amber-400 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="text-neutral-400 text-xs tracking-[0.15em] uppercase block mb-2">Categoria</label>
                  <select name="category" value={form.category ?? 'camisas'} onChange={handleChange} className="w-full bg-neutral-900 border border-neutral-700 text-white text-sm px-4 py-3.5 focus:outline-none focus:border-amber-400 transition-colors">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              {/* Images */}
              <div className="bg-neutral-950 border border-neutral-800 p-6">
                <h3 className="text-white text-xs tracking-[0.2em] uppercase pb-4 border-b border-neutral-800 mb-5">Imagens</h3>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {(form.images ?? []).map((img, idx) => (
                    <div key={idx} className="relative aspect-square bg-neutral-900 group overflow-hidden">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-black/80 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <div className="aspect-square bg-neutral-900 border-2 border-dashed border-neutral-700 flex items-center justify-center">
                    <Image size={20} className="text-neutral-600" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newImage}
                    onChange={e => setNewImage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImage())}
                    placeholder="Cole a URL da imagem (Pexels, etc.)"
                    className="flex-1 bg-neutral-900 border border-neutral-700 text-white text-sm px-4 py-3 focus:outline-none focus:border-amber-400 transition-colors placeholder-neutral-600"
                  />
                  <button type="button" onClick={addImage} className="bg-amber-400 text-black px-4 hover:bg-amber-300 transition-colors">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-neutral-950 border border-neutral-800 p-6">
                <h3 className="text-white text-xs tracking-[0.2em] uppercase pb-4 border-b border-neutral-800 mb-5">Publicação</h3>
                <div className="space-y-4">
                  {[
                    { name: 'active', label: 'Produto Ativo' },
                    { name: 'featured', label: 'Produto em Destaque' },
                  ].map(opt => (
                    <label key={opt.name} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-10 h-5 rounded-full transition-colors relative ${form[opt.name as keyof Product] ? 'bg-amber-400' : 'bg-neutral-700'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form[opt.name as keyof Product] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        <input type="checkbox" name={opt.name} checked={Boolean(form[opt.name as keyof Product])} onChange={handleChange} className="sr-only" />
                      </div>
                      <span className="text-neutral-400 text-xs tracking-wide">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-400 text-black text-xs tracking-[0.25em] uppercase py-5 hover:bg-amber-300 transition-colors disabled:opacity-50"
              >
                {loading ? 'Salvando...' : isEdit ? 'Atualizar Produto' : 'Criar Produto'}
              </button>
              <Link to="/admin/produtos" className="block w-full text-center text-neutral-500 text-xs tracking-widest uppercase py-3 hover:text-white transition-colors">
                Cancelar
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
