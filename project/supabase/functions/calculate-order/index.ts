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

    const productIds = body.items.map(i => i.product_id);
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name, price, stock, active, images')
      .in('id', productIds);

    if (fetchError || !products) {
      return new Response(JSON.stringify({ error: 'Erro ao buscar produtos' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const productMap = new Map(products.map(p => [p.id, p]));

    for (const item of body.items) {
      const product = productMap.get(item.product_id);
      if (!product) {
        return new Response(JSON.stringify({ error: `Produto não encontrado` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (!product.active) {
        return new Response(JSON.stringify({ error: `Produto "${product.name}" não está disponível` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (product.stock < item.quantity) {
        return new Response(JSON.stringify({
          error: `Estoque insuficiente para "${product.name}". Disponível: ${product.stock}`
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    let subtotal = 0;
    const orderItems = body.items.map(item => {
      const product = productMap.get(item.product_id)!;
      const itemTotal = Number(product.price) * item.quantity;
      subtotal += itemTotal;
      return {
        product_id: item.product_id,
        product_name: product.name,
        product_image: product.images?.[0] ?? '',
        variant_size: item.size,
        variant_color: item.color,
        quantity: item.quantity,
        unit_price: Number(product.price),
      };
    });

    const isPix = body.payment_method === 'pix';
    const discount = isPix ? subtotal * 0.05 : 0;
    const total = subtotal - discount;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'pending',
        total,
        payment_method: body.payment_method,
        payment_status: 'pending',
        shipping_address: body.shipping_address,
        notes: body.notes ?? '',
      })
      .select()
      .maybeSingle();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: 'Erro ao criar pedido' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const itemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsWithOrderId);

    if (itemsError) {
      await supabase.from('orders').delete().eq('id', order.id);
      return new Response(JSON.stringify({ error: 'Erro ao salvar itens do pedido' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    for (const item of body.items) {
      await supabase.rpc('decrement_stock', {
        product_id: item.product_id,
        quantity: item.quantity,
      });
    }

    return new Response(JSON.stringify({
      success: true,
      order: {
        id: order.id,
        total,
        subtotal,
        discount,
        payment_method: body.payment_method,
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
