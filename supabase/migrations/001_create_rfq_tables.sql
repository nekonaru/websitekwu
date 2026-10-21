-- Migrasi: tabel B2B RFQ (Request for Quotation) KWU
-- Dibuat sesuai spesifikasi bab 6 master prompt KWU.
-- Semua data di sini adalah skema kosong; tidak ada data operasional nyata.

-- Tipe status RFQ
CREATE TYPE rfq_status AS ENUM (
  'submitted',
  'under_review',
  'needs_information',
  'quoted',
  'negotiation',
  'accepted',
  'rejected',
  'expired',
  'converted_to_order'
);

-- Tabel rfqs
CREATE TABLE rfqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_number TEXT UNIQUE NOT NULL,
  organization_name VARCHAR(150) NOT NULL,
  contact_name VARCHAR(100) NOT NULL,
  business_email VARCHAR(254) NOT NULL,
  delivery_location TEXT NOT NULL,
  required_date DATE NOT NULL,
  status rfq_status NOT NULL DEFAULT 'submitted',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabel rfq_items
CREATE TABLE rfq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  product_id UUID,
  product_name VARCHAR(200) NOT NULL,
  product_details TEXT NOT NULL,
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  unit VARCHAR(30) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabel rfq_status_history (audit trail)
CREATE TABLE rfq_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  old_status rfq_status,
  new_status rfq_status NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabel quotations
CREATE TYPE quotation_status AS ENUM (
  'draft',
  'issued',
  'accepted',
  'rejected',
  'expired',
  'superseded'
);

CREATE TABLE quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  quotation_number TEXT UNIQUE NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  valid_until DATE NOT NULL,
  status quotation_status NOT NULL DEFAULT 'draft',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  shipping_cost NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  terms TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabel quotation_items
CREATE TABLE quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  rfq_item_id UUID REFERENCES rfq_items(id) ON DELETE SET NULL,
  product_name VARCHAR(200) NOT NULL,
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  unit VARCHAR(30) NOT NULL,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indeks untuk query umum
CREATE INDEX idx_rfqs_status ON rfqs(status);
CREATE INDEX idx_rfqs_created_at ON rfqs(created_at);
CREATE INDEX idx_rfqs_assigned_to ON rfqs(assigned_to);
CREATE INDEX idx_rfqs_created_by ON rfqs(created_by);
CREATE INDEX idx_rfq_items_rfq_id ON rfq_items(rfq_id);
CREATE INDEX idx_rfq_status_history_rfq_id ON rfq_status_history(rfq_id);
CREATE INDEX idx_quotations_rfq_id ON quotations(rfq_id);
CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_quotation_items_quotation_id ON quotation_items(quotation_id);

-- RLS: aktifkan pada semua tabel
ALTER TABLE rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfq_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;

-- RLS rfqs: pemilik (created_by) dapat membaca sendiri; admin (role admin) dapat semua
CREATE POLICY "Pemilik dapat melihat RFQ miliknya" ON rfqs
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Admin dapat mengelola semua RFQ" ON rfqs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND raw_auth_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Pengguna terautentikasi dapat membuat RFQ" ON rfqs
  FOR INSERT WITH CHECK (auth.uid() = created_by OR created_by IS NULL);

-- RLS rfq_items: ikuti akses rfq induk
CREATE POLICY "Akses rfq_items mengikuti rfq induk" ON rfq_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM rfqs WHERE rfqs.id = rfq_items.rfq_id
        AND (auth.uid() = rfqs.created_by
          OR EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
              AND raw_auth_meta_data->>'role' = 'admin'
          )
        )
  );

-- RLS rfq_status_history: sama seperti rfq_items
CREATE POLICY "Akses riwayat status mengikuti rfq induk" ON rfq_status_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM rfqs WHERE rfqs.id = rfq_status_history.rfq_id
        AND (auth.uid() = rfqs.created_by
          OR EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
              AND raw_auth_meta_data->>'role' = 'admin'
          )
        )
  );

-- RLS quotations: admin semua; pemilik rfq dapat melihat quotation milik rfqnya
CREATE POLICY "Admin dapat mengelola quotation" ON quotations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND raw_auth_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Pemilik RFQ dapat melihat quotation miliknya" ON quotations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rfqs WHERE rfqs.id = quotations.rfq_id
        AND auth.uid() = rfqs.created_by
    )
  );

-- RLS quotation_items: ikuti quotation
CREATE POLICY "Akses quotation_items mengikuti quotation" ON quotation_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM quotations
      WHERE quotations.id = quotation_items.quotation_id
        AND (
          EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
              AND raw_auth_meta_data->>'role' = 'admin'
          )
          OR EXISTS (
            SELECT 1 FROM rfqs WHERE rfqs.id = quotations.rfq_id
              AND auth.uid() = rfqs.created_by
          )
        )
    )
  );

-- Fungsi pembangkit nomor RFQ aman terhadap request bersamaan.
-- Sequence dibuat di level migrasi (bukan di dalam fungsi) agar hak aksesnya
-- dapat diberikan secara eksplisit.
CREATE SEQUENCE IF NOT EXISTS rfq_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS quotation_number_seq START 1;

GRANT USAGE, SELECT ON SEQUENCE rfq_number_seq TO authenticated, anon, service_role;
GRANT USAGE, SELECT ON SEQUENCE quotation_number_seq TO authenticated, anon, service_role;

CREATE OR REPLACE FUNCTION generate_rfq_number() RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  seq INTEGER;
  yr INTEGER;
  prefix TEXT := 'KWU-RFQ';
BEGIN
  SELECT EXTRACT(YEAR FROM now())::int INTO yr;
  SELECT nextval('rfq_number_seq') INTO seq;
  RETURN prefix || '-' || yr || '-' || lpad(seq::text, 5, '0');
END;
$$;

CREATE OR REPLACE FUNCTION generate_quotation_number() RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  seq INTEGER;
  yr INTEGER;
  prefix TEXT := 'KWU-Q';
BEGIN
  SELECT EXTRACT(YEAR FROM now())::int INTO yr;
  SELECT nextval('quotation_number_seq') INTO seq;
  RETURN prefix || '-' || yr || '-' || lpad(seq::text, 5, '0');
END;
$$;

-- Trigger updated_at pada rfqs dan quotations
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_rfqs_updated_at
  BEFORE UPDATE ON rfqs FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER update_quotations_updated_at
  BEFORE UPDATE ON quotations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
