export function formatPrice(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

export function formatDate(date: string, options?: Intl.DateTimeFormatOptions): string {
  return new Date(date).toLocaleDateString('pt-BR', options ?? {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export const CATEGORIES = [
  { value: 'camisas', label: 'Camisas' },
  { value: 'bones', label: 'Bonés' },
  { value: 'moletons', label: 'Moletons' },
  { value: 'garrafas', label: 'Garrafas' },
  { value: 'figurinhas', label: 'Figurinhas' },
  { value: 'acessorios', label: 'Acessórios' },
] as const;

export const CATEGORY_VALUES = CATEGORIES.map(c => c.value);

export const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const;

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  processing: 'Processando',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

export const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 300 400%22%3E%3Crect fill=%22%23262626%22 width=%22300%22 height=%22400%22/%3E%3Ctext fill=%22%23666%22 font-family=%22sans-serif%22 font-size=%2214%22 text-anchor=%22middle%22 x=%22150%22 y=%22210%22%3ESem imagem%3C/text%3E%3C/svg%3E';

export const STATUS_COLORS: Record<string, string> = {
  pending: 'text-amber-400',
  processing: 'text-blue-400',
  shipped: 'text-teal-400',
  delivered: 'text-green-400',
  cancelled: 'text-red-400',
};
