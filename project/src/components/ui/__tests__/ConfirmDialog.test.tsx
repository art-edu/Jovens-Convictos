import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ConfirmDialog from '../ConfirmDialog';

function setup(overrides = {}) {
  const props = {
    isOpen: true,
    title: 'Confirmar ação',
    message: 'Tem certeza?',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    ...overrides,
  };
  return { user: userEvent.setup(), props };
}

describe('ConfirmDialog', () => {
  it('renderiza quando isOpen é true', () => {
    const { props } = setup();
    render(<ConfirmDialog {...props} />);
    expect(screen.getByText('Confirmar ação')).toBeInTheDocument();
    expect(screen.getByText('Tem certeza?')).toBeInTheDocument();
  });

  it('não renderiza quando isOpen é false', () => {
    const { props } = setup({ isOpen: false });
    render(<ConfirmDialog {...props} />);
    expect(screen.queryByText('Confirmar ação')).not.toBeInTheDocument();
  });

  it('chama onConfirm ao clicar em confirmar', async () => {
    const { user, props } = setup();
    render(<ConfirmDialog {...props} />);
    await user.click(screen.getByText('Confirmar'));
    expect(props.onConfirm).toHaveBeenCalledOnce();
  });

  it('chama onCancel ao clicar em cancelar', async () => {
    const { user, props } = setup();
    render(<ConfirmDialog {...props} />);
    await user.click(screen.getByText('Cancelar'));
    expect(props.onCancel).toHaveBeenCalledOnce();
  });

  it('chama onCancel ao pressionar Escape', async () => {
    const { user, props } = setup();
    render(<ConfirmDialog {...props} />);
    await user.keyboard('{Escape}');
    expect(props.onCancel).toHaveBeenCalledOnce();
  });

  it('chama onCancel ao clicar no overlay', async () => {
    const { user, props } = setup();
    render(<ConfirmDialog {...props} />);
    const overlay = document.querySelector('.bg-black\\/60');
    expect(overlay).toBeInTheDocument();
    if (overlay) await user.click(overlay);
    expect(props.onCancel).toHaveBeenCalledOnce();
  });

  it('mostra variante danger com botão vermelho', () => {
    const { props } = setup({ variant: 'danger' });
    render(<ConfirmDialog {...props} />);
    expect(screen.getByText('Confirmar')).toHaveClass('bg-red-600');
  });

  it('mostra botão desabilitado e texto Aguarde durante loading', () => {
    const { props } = setup({ loading: true });
    render(<ConfirmDialog {...props} />);
    const btn = screen.getByText('Aguarde...');
    expect(btn).toBeDisabled();
    expect(screen.getByText('Cancelar')).toBeDisabled();
  });

  it('usa textos customizados de confirm/cancel', () => {
    const { props } = setup({ confirmText: 'Sim', cancelText: 'Não' });
    render(<ConfirmDialog {...props} />);
    expect(screen.getByText('Sim')).toBeInTheDocument();
    expect(screen.getByText('Não')).toBeInTheDocument();
  });
});
