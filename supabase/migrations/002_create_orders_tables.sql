-- Migrasi: tabel pesanan (orders) B2C KWU
-- Dibuat sesuai spesifikasi bab 1.4 dan fase 3 master prompt KWU.

-- Tipe status pesanan
CREATE TYPE order_status AS ENUM (
  'pending',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

-- Tabel orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name VARCHAR(150) NOT NULL,
  customer_email VARCHAR(254) NOT NULL,
  customer_phone VARCHAR(30),
  delivery_address TEXT NOT NULL,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  shipping_cost NUMERIC NOT NULL DEFAULT 0,
  tax NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  status order_status NOT NULL DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_proof_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabel order_items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID,
  product_name VARCHAR(200) NOT NULL,
  product_sku VARCHAR(100),
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indeks
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Pengguna hanya melihat pesanan miliknya
CREATE POLICY "Pengguna melihat pesanan miliknya" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Pengguna membuat pesanan miliknya" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin dapat semua
CREATE POLICY "Admin mengelola semua pesanan" ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND raw_auth_meta_data->>'role' = 'admin'
    )
  );

-- Order items mengikuti akses order induk
CREATE POLICY "Akses order_items mengikuti order induk" ON order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND (
          auth.uid() = orders.user_id
          OR EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
              AND raw_auth_meta_data->>'role' = 'admin'
          )
        )
    )
  );

-- Fungsi pembangkit nomor pesanan aman
CREATE OR REPLACE FUNCTION generate_order_number() RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  seq INTEGER;
  yr INTEGER;
  prefix TEXT := 'KWU-ORD';
BEGIN
  SELECT EXTRACT(YEAR FROM now())::int INTO yr;
  EXECUTE format('CREATE SEQUENCE IF NOT EXISTS order_seq_%s START 1', yr) INTO seq;
  EXECUTE format('SELECT nextval(%L)', 'order_seq_' || yr) INTO seq;
  RETURN prefix || '-' || yr || '-' || lpad(seq::text, 5, '0');
END;
$$;

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();
