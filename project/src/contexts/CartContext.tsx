import { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import type { CartItem } from '../types/database';

const STORAGE_KEY = 'jovens-convictos-cart';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { productId: string; size: string; color: string; variantId?: string } }
  | { type: 'UPDATE_QTY'; payload: { productId: string; size: string; color: string; variantId?: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'RESTORE_CART'; payload: CartItem[] };

function itemKey(i: CartItem) {
  return i.variant_id ? `${i.product.id}-${i.variant_id}` : `${i.product.id}-${i.size}-${i.color}`;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: import('../types/database').Product, size: string, color: string, variantId?: string) => void;
  removeItem: (productId: string, size: string, color: string, variantId?: string) => void;
  updateQty: (productId: string, size: string, color: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage full or unavailable
  }
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const newKey = itemKey(action.payload);
      const exists = state.items.find(i => itemKey(i) === newKey);
      if (exists) {
        return {
          ...state,
          items: state.items.map(i => itemKey(i) === newKey ? { ...i, quantity: i.quantity + action.payload.quantity } : i),
        };
      }
      return { ...state, items: [...state.items, action.payload] };
    }
    case 'REMOVE_ITEM': {
      const payload = action.payload;
      return {
        ...state,
        items: state.items.filter(i => {
          const id = payload.variantId ?? `${payload.productId}-${payload.size}-${payload.color}`;
          return itemKey(i) !== id;
        }),
      };
    }
    case 'UPDATE_QTY': {
      const payload = action.payload;
      return {
        ...state,
        items: state.items.map(i =>
          itemKey(i) === (payload.variantId ?? `${payload.productId}-${payload.size}-${payload.color}`)
            ? { ...i, quantity: payload.quantity }
            : i
        ).filter(i => i.quantity > 0),
      };
    }
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };
    case 'OPEN_CART':
      return { ...state, isOpen: true };
    case 'CLOSE_CART':
      return { ...state, isOpen: false };
    case 'RESTORE_CART':
      return { ...state, items: action.payload };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: loadCart(), isOpen: false });

  useEffect(() => {
    saveCart(state.items);
  }, [state.items]);

  const total = state.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const count = state.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items: state.items,
      isOpen: state.isOpen,
      addItem: (product, size, color, variantId) => dispatch({
        type: 'ADD_ITEM', payload: { product, quantity: 1, size, color, ...(variantId ? { variant_id: variantId } : {}) },
      }),
      removeItem: (productId, size, color, variantId) => dispatch({ type: 'REMOVE_ITEM', payload: { productId, size, color, variantId } }),
      updateQty: (productId, size, color, quantity, variantId) => dispatch({ type: 'UPDATE_QTY', payload: { productId, size, color, quantity, variantId } }),
      clearCart: () => dispatch({ type: 'CLEAR_CART' }),
      toggleCart: () => dispatch({ type: 'TOGGLE_CART' }),
      openCart: () => dispatch({ type: 'OPEN_CART' }),
      closeCart: () => dispatch({ type: 'CLOSE_CART' }),
      total,
      count,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
