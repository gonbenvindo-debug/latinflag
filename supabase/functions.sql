-- Create customer after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.customers (id, name, email, phone, company_name, company_tax_id, company_website, is_guest, is_active, email_verified)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'company_tax_id',
    NEW.raw_user_meta_data->>'company_website',
    false,
    true,
    NEW.email_confirmed_at IS NOT NULL
  );
  RETURN NEW;
END;
$$;

-- Trigger to handle new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to get user orders
CREATE OR REPLACE FUNCTION public.get_user_orders()
RETURNS TABLE (
  id UUID,
  order_number VARCHAR,
  items JSONB,
  totals JSONB,
  status VARCHAR,
  created_at TIMESTAMP
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.order_number,
    o.items,
    o.totals,
    o.status,
    o.created_at
  FROM orders o
  WHERE o.customer_id = auth.uid()
  ORDER BY o.created_at DESC;
END;
$$;

-- Function to create order
CREATE OR REPLACE FUNCTION public.create_order(
  p_items JSONB,
  p_shipping_address JSONB,
  p_billing_address JSONB,
  p_totals JSONB,
  p_payment_method VARCHAR,
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  order_number VARCHAR,
  status VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
  v_order_number VARCHAR;
BEGIN
  INSERT INTO orders (
    customer_id,
    items,
    shipping_address,
    billing_address,
    totals,
    payment_method,
    notes,
    status
  )
  VALUES (
    auth.uid(),
    p_items,
    p_shipping_address,
    p_billing_address,
    p_totals,
    p_payment_method,
    p_notes,
    'pending'
  )
  RETURNING id, order_number, status INTO v_order_id, v_order_number, status;
  
  RETURN QUERY SELECT v_order_id, v_order_number, status;
END;
$$;

-- Function to update customer profile
CREATE OR REPLACE FUNCTION public.update_customer_profile(
  p_name VARCHAR,
  p_phone VARCHAR,
  p_company_name VARCHAR DEFAULT NULL,
  p_company_tax_id VARCHAR DEFAULT NULL,
  p_company_website VARCHAR DEFAULT NULL,
  p_preferences JSONB DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE customers 
  SET 
    name = p_name,
    phone = p_phone,
    company_name = p_company_name,
    company_tax_id = p_company_tax_id,
    company_website = p_company_website,
    preferences = COALESCE(p_preferences, preferences),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = auth.uid();
  
  RETURN FOUND;
END;
$$;

-- Function to add address
CREATE OR REPLACE FUNCTION public.add_address(
  p_name VARCHAR,
  p_company VARCHAR DEFAULT NULL,
  p_address TEXT,
  p_city VARCHAR,
  p_postal_code VARCHAR,
  p_country VARCHAR DEFAULT 'Portugal',
  p_phone VARCHAR DEFAULT NULL,
  p_is_default BOOLEAN DEFAULT FALSE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_address_id UUID;
BEGIN
  -- If setting as default, unset other addresses
  IF p_is_default THEN
    UPDATE addresses 
    SET is_default = FALSE 
    WHERE customer_id = auth.uid();
  END IF;
  
  INSERT INTO addresses (
    customer_id,
    name,
    company,
    address,
    city,
    postal_code,
    country,
    phone,
    is_default
  )
  VALUES (
    auth.uid(),
    p_name,
    p_company,
    p_address,
    p_city,
    p_postal_code,
    p_country,
    p_phone,
    p_is_default
  )
  RETURNING id INTO v_address_id;
  
  RETURN v_address_id;
END;
$$;

-- Function to update address
CREATE OR REPLACE FUNCTION public.update_address(
  p_address_id UUID,
  p_name VARCHAR,
  p_company VARCHAR DEFAULT NULL,
  p_address TEXT,
  p_city VARCHAR,
  p_postal_code VARCHAR,
  p_country VARCHAR DEFAULT 'Portugal',
  p_phone VARCHAR DEFAULT NULL,
  p_is_default BOOLEAN DEFAULT FALSE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If setting as default, unset other addresses
  IF p_is_default THEN
    UPDATE addresses 
    SET is_default = FALSE 
    WHERE customer_id = auth.uid() AND id != p_address_id;
  END IF;
  
  UPDATE addresses 
  SET 
    name = p_name,
    company = p_company,
    address = p_address,
    city = p_city,
    postal_code = p_postal_code,
    country = p_country,
    phone = p_phone,
    is_default = p_is_default,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = p_address_id AND customer_id = auth.uid();
  
  RETURN FOUND;
END;
$$;

-- Function to delete address
CREATE OR REPLACE FUNCTION public.delete_address(p_address_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM addresses 
  WHERE id = p_address_id AND customer_id = auth.uid();
  
  RETURN FOUND;
END;
$$;

-- Grant permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_orders() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_order(JSONB, JSONB, JSONB, JSONB, VARCHAR, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_customer_profile(VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_address(VARCHAR, VARCHAR, TEXT, VARCHAR, VARCHAR, VARCHAR, VARCHAR, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_address(UUID, VARCHAR, VARCHAR, TEXT, VARCHAR, VARCHAR, VARCHAR, VARCHAR, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_address(UUID) TO authenticated;

-- Grant access to tables
GRANT SELECT, INSERT, UPDATE ON public.customers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.addresses TO authenticated;
GRANT SELECT, INSERT ON public.orders TO authenticated;

-- Admin functions (requires service role key)
CREATE OR REPLACE FUNCTION public.admin_get_all_orders()
RETURNS TABLE (
  id UUID,
  order_number VARCHAR,
  customer_id UUID,
  items JSONB,
  totals JSONB,
  status VARCHAR,
  created_at TIMESTAMP
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.order_number,
    o.customer_id,
    o.items,
    o.totals,
    o.status,
    o.created_at
  FROM orders o
  ORDER BY o.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_order_status(
  p_order_id UUID,
  p_status VARCHAR,
  p_supplier_order_reference VARCHAR DEFAULT NULL,
  p_supplier_tracking_number VARCHAR DEFAULT NULL,
  p_supplier_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE orders 
  SET 
    status = p_status,
    supplier_order_reference = p_supplier_order_reference,
    supplier_tracking_number = p_supplier_tracking_number,
    supplier_notes = p_supplier_notes,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = p_order_id;
  
  RETURN FOUND;
END;
$$;

-- Grant admin permissions (you'll need to check if user is admin in your application)
GRANT EXECUTE ON FUNCTION public.admin_get_all_orders() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_order_status(UUID, VARCHAR, VARCHAR, VARCHAR, TEXT) TO authenticated;
