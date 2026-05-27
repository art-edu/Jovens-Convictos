import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ShieldOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const PAGE_SIZE = 10;

interface UserRow {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export default function AdminUsers() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [confirm, setConfirm] = useState<{
    user: UserRow;
    newRole: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    loadUsers();
  }, [isAdmin]);

  async function loadUsers() {
    setLoading(true);
    const { data, error } = await supabase.rpc('admin_list_users');
    if (error) {
      toast('Erro ao carregar usuários', 'error');
    } else {
      setUsers(data ?? []);
    }
    setLoading(false);
  }

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const paginatedUsers = users.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  async function handleRoleChange() {
    if (!confirm) return;
    setSaving(true);
    const { error } = await supabase.rpc('admin_update_user_role', {
      target_user_id: confirm.user.id,
      new_role: confirm.newRole,
    });
    setSaving(false);
    setConfirm(null);
    if (error) {
      toast(error.message, 'error');
      return;
    }
    setUsers(prev =>
      prev.map(u =>
        u.id === confirm.user.id ? { ...u, role: confirm.newRole } : u
      )
    );
    toast(
      confirm.newRole === 'admin'
        ? `${confirm.user.full_name} agora é administrador`
        : `Privilégios de admin removidos de ${confirm.user.full_name}`
    );
  }

  const isSelf = (userId: string) => userId === user?.id;

  return (
    <div className="bg-black min-h-screen pt-16">
      <div className="max-w-screen-xl mx-auto px-6 py-12">
        <div className="mb-10">
          <Link to="/admin" className="text-neutral-500 text-xs tracking-widest uppercase hover:text-white transition-colors">
            ← Painel
          </Link>
          <h1 className="font-serif text-white text-3xl tracking-wide mt-2">Usuários</h1>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-neutral-900 animate-pulse" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <p className="text-neutral-500 text-sm text-center py-20">Nenhum usuário encontrado</p>
        ) : (
          <>
            <div className="border border-neutral-800">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-800">
                    <th className="text-left px-4 py-3 text-neutral-500 text-xs tracking-[0.15em] uppercase font-normal">Nome</th>
                    <th className="text-left px-4 py-3 text-neutral-500 text-xs tracking-[0.15em] uppercase font-normal hidden md:table-cell">Email</th>
                    <th className="text-left px-4 py-3 text-neutral-500 text-xs tracking-[0.15em] uppercase font-normal hidden md:table-cell">Papel</th>
                    <th className="px-4 py-3 text-neutral-500 text-xs tracking-[0.15em] uppercase font-normal text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((u, i) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-neutral-900 hover:bg-neutral-950 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-500 text-xs font-medium uppercase">
                            {u.full_name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <span className="text-white text-sm block">{u.full_name}</span>
                            {isSelf(u.id) && (
                              <span className="text-neutral-500 text-[10px] tracking-widest uppercase">Você</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="text-neutral-400 text-xs">{u.email}</span>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span
                          className={`text-xs tracking-widest uppercase px-2 py-0.5 border ${
                            u.role === 'admin'
                              ? 'border-amber-800 text-amber-400'
                              : 'border-neutral-700 text-neutral-500'
                          }`}
                        >
                          {u.role === 'admin' ? 'Admin' : 'Usuário'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        {u.role === 'admin' ? (
                          <button
                            onClick={() => setConfirm({ user: u, newRole: 'customer' })}
                            disabled={isSelf(u.id)}
                            className="inline-flex items-center gap-1.5 text-neutral-600 hover:text-red-400 transition-colors text-xs tracking-widest uppercase disabled:opacity-30 disabled:cursor-not-allowed"
                            title={isSelf(u.id) ? 'Você não pode remover seus próprios privilégios' : 'Remover administrador'}
                          >
                            <ShieldOff size={12} />
                            Remover Admin
                          </button>
                        ) : (
                          <button
                            onClick={() => setConfirm({ user: u, newRole: 'admin' })}
                            className="inline-flex items-center gap-1.5 text-neutral-600 hover:text-amber-400 transition-colors text-xs tracking-widest uppercase"
                          >
                            <Shield size={12} />
                            Tornar Admin
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 text-xs tracking-widest uppercase border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-8 h-8 text-xs border transition-colors ${
                      i === page
                        ? 'bg-amber-400 text-black border-amber-400'
                        : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 text-xs tracking-widest uppercase border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Próximo
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!confirm}
        title={confirm?.newRole === 'admin' ? 'Promover para administrador' : 'Remover administrador'}
        message={
          confirm
            ? confirm.newRole === 'admin'
              ? `Deseja promover ${confirm.user.full_name} para administrador?`
              : `Deseja remover os privilégios de administrador de ${confirm.user.full_name}?`
            : ''
        }
        variant={confirm?.newRole === 'customer' ? 'danger' : 'default'}
        confirmText={confirm?.newRole === 'admin' ? 'Promover' : 'Remover'}
        loading={saving}
        onConfirm={handleRoleChange}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
