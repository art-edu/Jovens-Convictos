import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderItemInput {
  product_id: string;
  quantity: number;
  size: string;
  color: string;
  variant_id?: string;
}

interface RequestBody {
  items: OrderItemInput[];
  payment_method: 'pix' | 'card';
  shipping_address: Record<string, string>;
  notes?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: RequestBody = await req.json();

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return new Response(JSON.stringify({ error: 'Carrinho vazio' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: result, error: rpcError } = await supabase.rpc('process_order', {
      p_user_id: user.id,
      p_items: body.items,
      p_payment_method: body.payment_method,
      p_shipping_address: body.shipping_address,
      p_notes: body.notes ?? '',
    });

    if (rpcError) {
      return new Response(JSON.stringify({ error: 'Erro ao processar pedido' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (result?.error) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      order: {
        id: result.order_id,
        total: result.total,
        subtotal: result.subtotal,
        discount: result.discount,
        payment_method: result.payment_method,
      },
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
