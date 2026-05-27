export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: Partial<ProfileInsert>;
        Relationships: [];
      };
      products: {
        Row: Product;
        Insert: ProductInsert;
        Update: Partial<ProductInsert>;
        Relationships: [];
      };
      product_variants: {
        Row: ProductVariant;
        Insert: ProductVariantInsert;
        Update: Partial<ProductVariantInsert>;
        Relationships: [];
      };
      orders: {
        Row: Order;
        Insert: OrderInsert;
        Update: Partial<OrderInsert>;
        Relationships: [];
      };
      order_items: {
        Row: OrderItem;
        Insert: OrderItemInsert;
        Update: Partial<OrderItemInsert>;
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: NewsletterSubscriber;
        Insert: NewsletterSubscriberInsert;
        Update: Partial<NewsletterSubscriberInsert>;
        Relationships: [];
      };
      contact_messages: {
        Row: ContactMessage;
        Insert: ContactMessageInsert;
        Update: Partial<ContactMessageInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, {
      Row: Record<string, unknown>;
      Relationships: [];
    }>;
    Functions: {
      decrement_stock: {
        Args: { product_id: string; quantity: number };
        Returns: undefined;
      };
      process_order: {
        Args: Record<string, unknown>;
        Returns: Record<string, unknown>;
      };
      increment_stock: {
        Args: { p_product_id: string; p_quantity: number };
        Returns: undefined;
      };
      admin_list_users: {
        Args: Record<string, never>;
        Returns: Array<{
          id: string;
          email: string;
          full_name: string;
          phone: string;
          role: string;
          created_at: string;
          updated_at: string;
        }>;
      };
      admin_update_user_role: {
        Args: { target_user_id: string; new_role: string };
        Returns: Record<string, unknown>;
      };
    };
  };
}

export interface ProfileInsert {
  id: string;
  full_name: string;
  phone?: string;
  role?: string;
}

export interface ProductInsert {
  name: string;
  slug: string;
  description?: string;
  price: number;
  category?: string;
  images?: string[];
  featured?: boolean;
  active?: boolean;
  stock?: number;
}

export interface ProductVariantInsert {
  product_id: string;
  size?: string;
  color?: string;
  stock?: number;
}

export interface OrderInsert {
  user_id: string;
  status?: string;
  total: number;
  payment_method: string;
  payment_status?: string;
  shipping_address?: ShippingAddress;
  notes?: string;
}

export interface OrderItemInsert {
  order_id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  variant_size?: string;
  variant_color?: string;
  quantity: number;
  unit_price: number;
}

export interface NewsletterSubscriberInsert {
  email: string;
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at?: string;
}

export interface ContactMessageInsert {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  featured: boolean;
  active: boolean;
  stock: number;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  color: string;
  stock: number;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: string;
  total: number;
  payment_method: string;
  payment_status: string;
  shipping_address: ShippingAddress;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  variant_size: string;
  variant_color: string;
  quantity: number;
  unit_price: number;
  created_at: string;
}

export interface ShippingAddress {
  full_name?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribed_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
  variant_id?: string;
}
