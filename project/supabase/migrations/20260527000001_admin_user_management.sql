/*
  # Admin User Management

  Adds RLS policy for admins to update any profile,
  and RPC functions for listing users and changing roles.

  ## Security
  - admin_list_users: returns profiles with auth.users email (SECURITY DEFINER)
  - admin_update_user_role: validates role, prevents last-admin removal,
    prevents self-demotion (SECURITY DEFINER)
*/

-- 1. RLS: Admins can update any profile
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2. RPC: List all users with auth email
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  phone text,
  role text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT
    p.id,
    u.email,
    p.full_name,
    p.phone,
    p.role,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE public.is_admin()
  ORDER BY p.created_at DESC;
$$;

-- 3. RPC: Update user role with validations
CREATE OR REPLACE FUNCTION public.admin_update_user_role(
  target_user_id uuid,
  new_role text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  current_admin_count bigint;
  current_caller_role text;
  result jsonb;
BEGIN
  -- Only admins can call this function
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acesso negado'
      USING HINT = 'Somente administradores podem alterar papéis';
  END IF;

  -- Validate role value
  IF new_role NOT IN ('admin', 'customer') THEN
    RAISE EXCEPTION 'Papel inválido: %', new_role;
  END IF;

  -- Prevent self-demotion
  IF target_user_id = auth.uid() AND new_role = 'customer' THEN
    RAISE EXCEPTION 'Você não pode remover seus próprios privilégios de administrador';
  END IF;

  -- Prevent removing the last admin
  IF new_role = 'customer' THEN
    SELECT COUNT(*) INTO current_admin_count
    FROM public.profiles
    WHERE role = 'admin';

    IF current_admin_count <= 1 THEN
      RAISE EXCEPTION 'Não é possível remover o único administrador do sistema';
    END IF;
  END IF;

  -- Perform the update
  UPDATE public.profiles
  SET role = new_role, updated_at = now()
  WHERE id = target_user_id;

  -- Return updated profile
  SELECT jsonb_build_object(
    'id', p.id,
    'full_name', p.full_name,
    'role', p.role,
    'updated_at', p.updated_at
  ) INTO result
  FROM public.profiles p
  WHERE p.id = target_user_id;

  RETURN result;
END;
$$;
