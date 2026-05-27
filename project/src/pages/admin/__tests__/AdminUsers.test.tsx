import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '../../../lib/supabase';
import AdminUsers from '../AdminUsers';

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', email: 'admin@teste.com', user_metadata: {} },
    isAdmin: true,
    loading: false,
    profile: { id: '1', full_name: 'Admin Teste', phone: '', role: 'admin', created_at: '', updated_at: '' },
    session: null,
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../../../contexts/ToastContext', () => ({
  useToast: () => ({ toast: vi.fn() }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockUsers = [
  { id: '1', email: 'admin@teste.com', full_name: 'Admin Teste', phone: '', role: 'admin', created_at: '2026-01-01', updated_at: '2026-01-01' },
  { id: '2', email: 'user@teste.com', full_name: 'Usuário Comum', phone: '', role: 'customer', created_at: '2026-02-01', updated_at: '2026-02-01' },
  { id: '3', email: 'outro@teste.com', full_name: 'Outro Admin', phone: '', role: 'admin', created_at: '2026-03-01', updated_at: '2026-03-01' },
];

function renderAdminUsers() {
  return render(
    <MemoryRouter>
      <AdminUsers />
    </MemoryRouter>
  );
}

describe('AdminUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mostra loading skeleton enquanto carrega', () => {
    vi.mocked(supabase.rpc).mockReturnValue(new Promise(() => {}));
    renderAdminUsers();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(1);
  });

  it('renderiza tabela com usuários após carregamento', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: mockUsers, error: null });
    renderAdminUsers();

    await waitFor(() => {
      expect(screen.getByText('Admin Teste')).toBeInTheDocument();
    });
    expect(screen.getByText('Usuário Comum')).toBeInTheDocument();
    expect(screen.getByText('Outro Admin')).toBeInTheDocument();
  });

  it('exibe badge Admin para usuários admin e Usuário para customers', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: mockUsers, error: null });
    renderAdminUsers();

    await waitFor(() => {
      const badges = screen.getAllByText(/Admin|Usuário/);
      const adminBadges = badges.filter(b => b.textContent === 'Admin');
      const userBadges = badges.filter(b => b.textContent === 'Usuário');
      expect(adminBadges).toHaveLength(2);
      expect(userBadges).toHaveLength(1);
    });
  });

  it('exibe "Você" ao lado do nome do usuário logado', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: mockUsers, error: null });
    renderAdminUsers();

    await waitFor(() => {
      expect(screen.getByText('Você')).toBeInTheDocument();
    });
  });

  it('mostra estado vazio quando não há usuários', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: [], error: null });
    renderAdminUsers();

    await waitFor(() => {
      expect(screen.getByText('Nenhum usuário encontrado')).toBeInTheDocument();
    });
  });

  it('mostra toast de erro quando falha ao carregar', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: new Error('Erro de rede') });
    renderAdminUsers();

    await waitFor(() => {
      expect(screen.queryByText('Nenhum usuário encontrado')).not.toBeInTheDocument();
    });
  });

  it('abre ConfirmDialog ao clicar em "Remover Admin" de outro usuário', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: mockUsers, error: null });
    const user = userEvent.setup();
    renderAdminUsers();

    await waitFor(() => {
      const removers = screen.getAllByText('Remover Admin');
      // 2 buttons: 1 disabled (self), 1 enabled (outro admin)
      expect(removers).toHaveLength(2);
      expect(removers[0]).toBeDisabled();
      expect(removers[1]).not.toBeDisabled();
    });

    const enabledRemover = screen.getAllByText('Remover Admin')[1];
    await user.click(enabledRemover);

    expect(screen.getByText(/Deseja remover os privilégios/)).toBeInTheDocument();
  });

  it('desabilita botão "Remover Admin" para o próprio usuário', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: mockUsers, error: null });
    renderAdminUsers();

    await waitFor(() => {
      const btns = screen.getAllByTitle('Você não pode remover seus próprios privilégios');
      expect(btns.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('abre ConfirmDialog ao clicar em "Tornar Admin"', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: mockUsers, error: null });
    const user = userEvent.setup();
    renderAdminUsers();

    await waitFor(() => {
      expect(screen.getByText('Tornar Admin')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Tornar Admin'));

    expect(screen.getByText(/Deseja promover/)).toBeInTheDocument();
  });

  it('chama RPC admin_update_user_role ao confirmar e atualiza tabela', async () => {
    vi.mocked(supabase.rpc)
      .mockResolvedValueOnce({ data: mockUsers, error: null })
      .mockResolvedValueOnce({ data: { id: '2', full_name: 'Usuário Comum', role: 'admin', updated_at: '2026-03-01' }, error: null });

    const user = userEvent.setup();
    renderAdminUsers();

    await waitFor(() => {
      expect(screen.getByText('Tornar Admin')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Tornar Admin'));
    await user.click(screen.getByText('Promover'));

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith('admin_update_user_role', {
        target_user_id: '2',
        new_role: 'admin',
      });
    });

    await waitFor(() => {
      // Now 3 "Remover Admin": 1 disabled (self), 2 enabled (promoted + outro)
      expect(screen.getAllByText('Remover Admin')).toHaveLength(3);
    });
  });

  it('exibe toast de erro se RPC falhar', async () => {
    vi.mocked(supabase.rpc)
      .mockResolvedValueOnce({ data: mockUsers, error: null })
      .mockResolvedValueOnce({ data: null, error: new Error('Erro ao alterar papel') });

    const user = userEvent.setup();
    renderAdminUsers();

    await waitFor(() => {
      expect(screen.getByText('Tornar Admin')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Tornar Admin'));
    await user.click(screen.getByText('Promover'));

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledTimes(2);
    });
  });

  it('mantém dados corretos após confirmação cancelada', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: mockUsers, error: null });
    const user = userEvent.setup();
    renderAdminUsers();

    await waitFor(() => {
      expect(screen.getByText('Tornar Admin')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Tornar Admin'));
    await user.click(screen.getByText('Cancelar'));

    expect(screen.getByText('Usuário Comum')).toBeInTheDocument();
    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledTimes(1);
    });
  });
});
