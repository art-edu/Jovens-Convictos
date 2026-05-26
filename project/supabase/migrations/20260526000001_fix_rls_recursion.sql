/*
  # Fix RLS Recursion on profiles table

  Creates a SECURITY DEFINER function to check admin role
  (bypasses RLS, preventing infinite recursion), fixes all
  admin policies to use it, and cleans up profiles policies.
*/

-- 1. Drop ALL existing policies on profiles (including any
--    manually added ones that cause recursion)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Enable users to view their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable admin to view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- 2. SECURITY DEFINER function – bypasses RLS, no recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 3. Recreate profiles policies (safe – uses auth.uid() directly)
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- 4. Fix all admin policies on other tables to use is_admin()
--    (replaces (SELECT role FROM profiles …) which can trigger recursion)

-- Products
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;

CREATE POLICY "Admins can insert products"
  ON products FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE TO authenticated
  USING (public.is_admin());

-- Product variants
DROP POLICY IF EXISTS "Admins can manage variants" ON product_variants;
DROP POLICY IF EXISTS "Admins can update variants" ON product_variants;
DROP POLICY IF EXISTS "Admins can delete variants" ON product_variants;

CREATE POLICY "Admins can manage variants"
  ON product_variants FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update variants"
  ON product_variants FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete variants"
  ON product_variants FOR DELETE TO authenticated
  USING (public.is_admin());

-- Orders
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update all orders"
  ON orders FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Order items
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;

CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT TO authenticated
  USING (public.is_admin());

-- Newsletter subscribers
DROP POLICY IF EXISTS "Admins can view subscribers" ON newsletter_subscribers;

CREATE POLICY "Admins can view subscribers"
  ON newsletter_subscribers FOR SELECT TO authenticated
  USING (public.is_admin());
