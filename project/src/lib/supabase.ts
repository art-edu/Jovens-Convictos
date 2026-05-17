import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

const PRODUCT_IMAGES_BUCKET = 'product-images';

export async function uploadProductImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(fileName, file, { contentType: file.type });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(fileName);

  return data.publicUrl;
}

export async function deleteProductImage(imageUrl: string): Promise<void> {
  const path = imageUrl.split('/').pop();
  if (!path) return;

  await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .remove([path]);
}
