-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Customers table
CREATE TABLE customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    company_name VARCHAR(255),
    company_tax_id VARCHAR(50),
    company_website VARCHAR(255),
    is_guest BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    last_login TIMESTAMP,
    preferences JSONB DEFAULT '{"newsletter": true, "promotions": true}',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Addresses table
CREATE TABLE addresses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    address TEXT NOT NULL,
    city VARCHAR(255) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(255) DEFAULT 'Portugal',
    phone VARCHAR(50),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    images TEXT[] NOT NULL,
    specifications JSONB,
    customization_options JSONB,
    supplier_info JSONB,
    stock_available BOOLEAN DEFAULT true,
    stock_quantity INTEGER DEFAULT 999,
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT[],
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    items JSONB NOT NULL,
    shipping_address JSONB NOT NULL,
    billing_address JSONB NOT NULL,
    totals JSONB NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_transaction_id VARCHAR(255),
    payment_paid_at TIMESTAMP,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'supplier_ordered', 'manufacturing', 'shipped', 'delivered', 'cancelled')),
    supplier_order_reference VARCHAR(255),
    supplier_tracking_number VARCHAR(255),
    supplier_estimated_delivery DATE,
    supplier_actual_delivery DATE,
    supplier_notes TEXT,
    tracking JSONB DEFAULT '[]',
    notes TEXT,
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_active ON customers(is_active);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_subcategory ON products(subcategory);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_addresses_customer ON addresses(customer_id);

-- Create search index for products
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('portuguese', name || ' ' || description));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number := 'LF' || LPAD(EXTRACT(DAY FROM NEW.created_at)::text, 2, '0') || LPAD(EXTRACT(MONTH FROM NEW.created_at)::text, 2, '0') || LPAD(EXTRACT(YEAR FROM NEW.created_at)::text, 4, '0') || LPAD(ROW_NUMBER() OVER (ORDER BY NEW.created_at)::text, 4, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_order_number_trigger BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policies for customers
CREATE POLICY "Users can view own profile" ON customers FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own profile" ON customers FOR UPDATE USING (auth.uid()::text = id::text);

-- Policies for addresses
CREATE POLICY "Users can view own addresses" ON addresses FOR SELECT USING (auth.uid()::text = customer_id::text);
CREATE POLICY "Users can manage own addresses" ON addresses FOR ALL USING (auth.uid()::text = customer_id::text);

-- Policies for orders
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid()::text = customer_id::text);
CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid()::text = customer_id::text);

-- Public read access for products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON products FOR SELECT USING (status = 'active');

-- Storage for images and designs
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('designs', 'designs', false);

-- Policies for storage
CREATE POLICY "Anyone can view product images" ON storage.objects FOR SELECT USING (bucket_id = 'products');
CREATE POLICY "Authenticated users can upload designs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'designs' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view own designs" ON storage.objects FOR SELECT USING (bucket_id = 'designs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Sample data (you can remove this in production)
INSERT INTO products (name, slug, description, category, subcategory, base_price, images, specifications, customization_options, featured) VALUES
('Bandeira Horizontal Personalizada', 'bandeira-horizontal-personalizada', 'Bandeira horizontal em poliéster de alta qualidade com impressão digital full color. Ideal para empresas, eventos e promoções.', 'flags', 'horizontal', 29.90, ARRAY['https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Bandeira+Horizontal'], '{"width": 150, "height": 100, "material": "Poliéster 110g", "printing": "Digital Full Color", "finishing": "Reforço lateral e ilhoses"}', '{"allowsCustomDesign": true, "maxFileSize": 10485760, "acceptedFormats": ["jpg", "jpeg", "png", "pdf", "ai", "eps"], "sizeOptions": [{"name": "Pequeno", "width": 100, "height": 70, "price": 19.90}, {"name": "Médio", "width": 150, "height": 100, "price": 29.90}, {"name": "Grande", "width": 200, "height": 150, "price": 49.90}]}', true),
('Fly Banner Feather', 'fly-banner-feather', 'Fly banner estilo feather com design moderno e alta visibilidade. Perfeito para eventos exteriores e promoções.', 'fly-banners', 'feather', 89.90, ARRAY['https://via.placeholder.com/400x300/10B981/FFFFFF?text=Fly+Banner+Feather'], '{"width": 70, "height": 280, "material": "Poliéster 115g", "printing": "Digital Full Color", "finishing": "Bolsa superior e mastro incluído"}', '{"allowsCustomDesign": true, "maxFileSize": 10485760, "acceptedFormats": ["jpg", "jpeg", "png", "pdf", "ai", "eps"], "colorOptions": [{"name": "Amarelo", "code": "#FDE047", "price": 0}, {"name": "Vermelho", "code": "#EF4444", "price": 5}, {"name": "Azul", "code": "#3B82F6", "price": 0}]}', true),
('Banner com Ilhoses', 'banner-com-ilhoses', 'Banner publicitário com acabamento em ilhoses metálicos. Resistente e durável para uso interior e exterior.', 'banners', 'eyelets', 39.90, ARRAY['https://via.placeholder.com/400x300/F59E0B/FFFFFF?text=Banner+Ilhoses'], '{"width": 200, "height": 100, "material": "Vinil Adesivo", "printing": "Digital Eco-Solvent", "finishing": "Ilhoses metálicos a cada 50cm"}', '{"allowsCustomDesign": true, "maxFileSize": 10485760, "acceptedFormats": ["jpg", "jpeg", "png", "pdf", "ai", "eps"], "sizeOptions": [{"name": "2x1m", "width": 200, "height": 100, "price": 39.90}, {"name": "3x2m", "width": 300, "height": 200, "price": 79.90}, {"name": "4x3m", "width": 400, "height": 300, "price": 119.90}]}', false);
