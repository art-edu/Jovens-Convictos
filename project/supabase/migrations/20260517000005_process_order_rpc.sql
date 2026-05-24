CREATE OR REPLACE FUNCTION process_order(
  p_user_id UUID,
  p_items JSONB,
  p_payment_method TEXT,
  p_shipping_address JSONB,
  p_notes TEXT DEFAULT ''
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
  v_subtotal NUMERIC := 0;
  v_discount NUMERIC := 0;
  v_total NUMERIC := 0;
  v_item JSONB;
  v_product RECORD;
  v_is_pix BOOLEAN;
  v_items_data JSONB := '[]'::JSONB;
BEGIN
  v_is_pix := p_payment_method = 'pix';

  -- Lock products and validate stock in one atomic pass
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT id, name, price, stock, active, images INTO v_product
    FROM products
    WHERE id = (v_item->>'product_id')::UUID
    FOR UPDATE;

    IF NOT FOUND THEN
      RETURN jsonb_build_object('error', 'Produto não encontrado');
    END IF;

    IF NOT v_product.active THEN
      RETURN jsonb_build_object('error', 'Produto "' || v_product.name || '" não está disponível');
    END IF;

    IF v_product.stock < (v_item->>'quantity')::INTEGER THEN
      RETURN jsonb_build_object(
        'error',
        'Estoque insuficiente para "' || v_product.name || '". Disponível: ' || v_product.stock
      );
    END IF;

    v_subtotal := v_subtotal + (v_product.price * (v_item->>'quantity')::INTEGER);

    v_items_data := v_items_data || jsonb_build_object(
      'product_id', v_product.id,
      'product_name', v_product.name,
      'product_image', COALESCE(v_product.images[1], ''),
      'variant_size', COALESCE(v_item->>'size', ''),
      'variant_color', COALESCE(v_item->>'color', ''),
      'quantity', (v_item->>'quantity')::INTEGER,
      'unit_price', v_product.price
    );
  END LOOP;

  v_discount := CASE WHEN v_is_pix THEN v_subtotal * 0.05 ELSE 0 END;
  v_total := v_subtotal - v_discount;

  INSERT INTO orders (user_id, status, total, payment_method, payment_status, shipping_address, notes)
  VALUES (p_user_id, 'pending', v_total, p_payment_method, 'pending', p_shipping_address, p_notes)
  RETURNING id INTO v_order_id;

  INSERT INTO order_items (order_id, product_id, product_name, product_image, variant_size, variant_color, quantity, unit_price)
  SELECT
    v_order_id,
    (x.item->>'product_id')::UUID,
    x.item->>'product_name',
    x.item->>'product_image',
    x.item->>'variant_size',
    x.item->>'variant_color',
    (x.item->>'quantity')::INTEGER,
    (x.item->>'unit_price')::NUMERIC
  FROM jsonb_array_elements(v_items_data) AS x(item);

  UPDATE products p
  SET stock = p.stock - x.qty
  FROM (
    SELECT
      (item->>'product_id')::UUID AS pid,
      (item->>'quantity')::INTEGER AS qty
    FROM jsonb_array_elements(p_items) AS item
  ) AS x
  WHERE p.id = x.pid
    AND p.stock >= x.qty;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'total', v_total,
    'subtotal', v_subtotal,
    'discount', v_discount,
    'payment_method', p_payment_method
  );
END;
$$;
