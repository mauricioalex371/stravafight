-- ==============================================================================
-- STRAVA FIGHT — Migration 00005: MARKETPLACE & E-COMMERCE COMPLETO
-- Marketplace Multivendedor, Carrinho, Checkout, Pedidos, Pagamentos
-- ==============================================================================

-- 1. LOJAS DO MARKETPLACE (SELLERS/STORES)
CREATE TABLE IF NOT EXISTS public.marketplace_stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    commercial_profile_id UUID REFERENCES public.commercial_profiles(id) ON DELETE SET NULL,
    store_name TEXT NOT NULL UNIQUE,
    store_slug TEXT NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    legal_name TEXT,
    tax_id TEXT, -- CNPJ/CPF
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    bank_account_info JSONB, -- encrypted fields
    commission_rate NUMERIC(5,2) DEFAULT 10.00, -- percentage
    status TEXT DEFAULT 'PENDING_APPROVAL' CHECK (status IN (
        'PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED', 'INACTIVE'
    )),
    verification_documents JSONB DEFAULT '[]'::jsonb,
    is_verified BOOLEAN DEFAULT FALSE,
    total_sales NUMERIC(12,2) DEFAULT 0.00,
    total_products INTEGER DEFAULT 0,
    rating_average NUMERIC(3,2) DEFAULT 0.00,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIAS DE PRODUTOS (HIERÁRQUICA)
CREATE TABLE IF NOT EXISTS public.marketplace_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES public.marketplace_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUTOS DO MARKETPLACE
CREATE TABLE IF NOT EXISTS public.marketplace_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.marketplace_stores(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.marketplace_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT NOT NULL,
    brand TEXT,
    sku TEXT,
    base_price NUMERIC(10,2) NOT NULL,
    sale_price NUMERIC(10,2),
    currency TEXT DEFAULT 'BRL',
    weight_grams INTEGER, -- for shipping
    dimensions_cm JSONB, -- {length, width, height}
    modality TEXT, -- Jiu-Jitsu, Muay Thai, etc
    main_image_url TEXT NOT NULL,
    gallery_images JSONB DEFAULT '[]'::jsonb,
    video_url TEXT,
    has_variants BOOLEAN DEFAULT FALSE,
    stock_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED'
    )),
    views_count INTEGER DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    rating_average NUMERIC(3,2) DEFAULT 0.00,
    rating_count INTEGER DEFAULT 0,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(store_id, slug)
);

-- 4. VARIAÇÕES DE PRODUTOS (TAMANHO, COR, etc)
CREATE TABLE IF NOT EXISTS public.marketplace_product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- ex: "G Preto", "M Azul"
    sku TEXT,
    attributes JSONB NOT NULL, -- {size: "G", color: "Preto"}
    price_adjustment NUMERIC(10,2) DEFAULT 0.00, -- +/- do base_price
    stock_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ENDEREÇOS DE ENTREGA
CREATE TABLE IF NOT EXISTS public.marketplace_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    label TEXT NOT NULL, -- Casa, Trabalho, Academia
    recipient_name TEXT NOT NULL,
    street TEXT NOT NULL,
    number TEXT NOT NULL,
    complement TEXT,
    neighborhood TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    phone TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CARRINHOS DE COMPRA
CREATE TABLE IF NOT EXISTS public.marketplace_carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CONVERTED', 'ABANDONED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, status) WHERE status = 'ACTIVE'
);

-- 7. ITENS DO CARRINHO
CREATE TABLE IF NOT EXISTS public.marketplace_cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES public.marketplace_carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.marketplace_product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(cart_id, product_id, variant_id)
);

-- 8. CUPONS DE DESCONTO
CREATE TABLE IF NOT EXISTS public.marketplace_coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.marketplace_stores(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('PERCENTAGE', 'FIXED_AMOUNT')),
    discount_value NUMERIC(10,2) NOT NULL,
    min_purchase_amount NUMERIC(10,2) DEFAULT 0.00,
    max_uses INTEGER,
    uses_count INTEGER DEFAULT 0,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PEDIDOS (ORDERS)
CREATE TABLE IF NOT EXISTS public.marketplace_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE, -- SF-2026-123456
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    shipping_address_id UUID NOT NULL REFERENCES public.marketplace_addresses(id),
    subtotal NUMERIC(10,2) NOT NULL,
    shipping_cost NUMERIC(10,2) DEFAULT 0.00,
    discount_amount NUMERIC(10,2) DEFAULT 0.00,
    coupon_code TEXT,
    total_amount NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'BRL',
    status TEXT DEFAULT 'PENDING_PAYMENT' CHECK (status IN (
        'PENDING_PAYMENT', 'PAYMENT_PROCESSING', 'PAID', 'PREPARING',
        'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'
    )),
    payment_method TEXT, -- PIX, CREDIT_CARD, BOLETO
    payment_status TEXT DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ITENS DO PEDIDO
CREATE TABLE IF NOT EXISTS public.marketplace_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.marketplace_orders(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES public.marketplace_stores(id) ON DELETE RESTRICT,
    product_id UUID NOT NULL REFERENCES public.marketplace_products(id) ON DELETE RESTRICT,
    variant_id UUID REFERENCES public.marketplace_product_variants(id),
    product_name TEXT NOT NULL,
    variant_name TEXT,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    commission_rate NUMERIC(5,2) NOT NULL,
    commission_amount NUMERIC(10,2) NOT NULL,
    seller_amount NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. PAGAMENTOS (TRANSACTIONS)
CREATE TABLE IF NOT EXISTS public.marketplace_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.marketplace_orders(id) ON DELETE CASCADE,
    payment_provider TEXT NOT NULL, -- MERCADO_PAGO, STRIPE
    provider_payment_id TEXT UNIQUE, -- external ID from gateway
    payment_method TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'BRL',
    status TEXT DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'PROCESSING', 'APPROVED', 'REJECTED', 'CANCELLED', 'REFUNDED'
    )),
    pix_qr_code TEXT,
    pix_qr_code_base64 TEXT,
    boleto_url TEXT,
    installments INTEGER DEFAULT 1,
    failure_reason TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. WEBHOOKS DE PAGAMENTO (AUDIT LOG)
CREATE TABLE IF NOT EXISTS public.marketplace_payment_webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID REFERENCES public.marketplace_payments(id) ON DELETE SET NULL,
    provider TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    signature TEXT,
    is_processed BOOLEAN DEFAULT FALSE,
    processing_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. ENVIOS (SHIPMENTS)
CREATE TABLE IF NOT EXISTS public.marketplace_shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.marketplace_orders(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES public.marketplace_stores(id) ON DELETE RESTRICT,
    carrier TEXT NOT NULL, -- CORREIOS, JADLOG, etc
    service_name TEXT, -- SEDEX, PAC
    tracking_code TEXT,
    tracking_url TEXT,
    estimated_delivery_date DATE,
    actual_delivery_date DATE,
    shipping_cost NUMERIC(10,2) NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'POSTED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED'
    )),
    events JSONB DEFAULT '[]'::jsonb, -- tracking events
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. AVALIAÇÕES DE PRODUTOS
CREATE TABLE IF NOT EXISTS public.marketplace_product_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
    order_item_id UUID NOT NULL REFERENCES public.marketplace_order_items(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title TEXT,
    comment TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    is_verified_purchase BOOLEAN DEFAULT TRUE,
    helpful_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(order_item_id, reviewer_id)
);

-- 15. PERGUNTAS SOBRE PRODUTOS
CREATE TABLE IF NOT EXISTS public.marketplace_product_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
    asker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT,
    answered_by UUID REFERENCES public.profiles(id),
    answered_at TIMESTAMPTZ,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. COMISSÕES E REPASSES
CREATE TABLE IF NOT EXISTS public.marketplace_commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_item_id UUID NOT NULL REFERENCES public.marketplace_order_items(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES public.marketplace_stores(id) ON DELETE RESTRICT,
    commission_amount NUMERIC(10,2) NOT NULL,
    seller_amount NUMERIC(10,2) NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'AVAILABLE', 'WITHDRAWN', 'REFUNDED'
    )),
    available_at DATE,
    withdrawn_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. SAQUES DE VENDEDORES
CREATE TABLE IF NOT EXISTS public.marketplace_withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.marketplace_stores(id) ON DELETE RESTRICT,
    amount NUMERIC(10,2) NOT NULL,
    bank_account_info JSONB NOT NULL,
    status TEXT DEFAULT 'REQUESTED' CHECK (status IN (
        'REQUESTED', 'PROCESSING', 'COMPLETED', 'FAILED'
    )),
    failure_reason TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ==============================================================================

CREATE INDEX idx_products_store ON public.marketplace_products(store_id);
CREATE INDEX idx_products_category ON public.marketplace_products(category_id);
CREATE INDEX idx_products_status ON public.marketplace_products(status);
CREATE INDEX idx_products_featured ON public.marketplace_products(is_featured);
CREATE INDEX idx_orders_buyer ON public.marketplace_orders(buyer_id);
CREATE INDEX idx_orders_status ON public.marketplace_orders(status);
CREATE INDEX idx_order_items_store ON public.marketplace_order_items(store_id);
CREATE INDEX idx_payments_provider_id ON public.marketplace_payments(provider_payment_id);
CREATE INDEX idx_shipments_tracking ON public.marketplace_shipments(tracking_code);
CREATE INDEX idx_reviews_product ON public.marketplace_product_reviews(product_id);

-- ==============================================================================
-- RLS POLICIES
-- ==============================================================================

ALTER TABLE public.marketplace_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_product_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_withdrawals ENABLE ROW LEVEL SECURITY;

-- STORES
CREATE POLICY "Lojas ativas são públicas"
    ON public.marketplace_stores FOR SELECT
    USING (status = 'ACTIVE');

CREATE POLICY "Donos gerenciam suas lojas"
    ON public.marketplace_stores FOR ALL
    USING (auth.uid() = owner_id);

-- PRODUCTS
CREATE POLICY "Produtos ativos são públicos"
    ON public.marketplace_products FOR SELECT
    USING (is_active = true AND status = 'ACTIVE');

CREATE POLICY "Vendedores gerenciam seus produtos"
    ON public.marketplace_products FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.marketplace_stores ms
            WHERE ms.id = marketplace_products.store_id AND ms.owner_id = auth.uid()
        )
    );

-- ADDRESSES
CREATE POLICY "Usuários gerenciam seus endereços"
    ON public.marketplace_addresses FOR ALL
    USING (auth.uid() = user_id);

-- CARTS
CREATE POLICY "Usuários gerenciam seus carrinhos"
    ON public.marketplace_carts FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários gerenciam itens do carrinho"
    ON public.marketplace_cart_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.marketplace_carts mc
            WHERE mc.id = marketplace_cart_items.cart_id AND mc.user_id = auth.uid()
        )
    );

-- ORDERS
CREATE POLICY "Compradores veem seus pedidos"
    ON public.marketplace_orders FOR SELECT
    USING (auth.uid() = buyer_id);

CREATE POLICY "Vendedores veem pedidos de seus produtos"
    ON public.marketplace_order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.marketplace_stores ms
            WHERE ms.id = marketplace_order_items.store_id AND ms.owner_id = auth.uid()
        )
    );

-- PAYMENTS
CREATE POLICY "Compradores veem seus pagamentos"
    ON public.marketplace_payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.marketplace_orders mo
            WHERE mo.id = marketplace_payments.order_id AND mo.buyer_id = auth.uid()
        )
    );

-- REVIEWS
CREATE POLICY "Reviews publicados são públicos"
    ON public.marketplace_product_reviews FOR SELECT
    USING (is_published = true);

CREATE POLICY "Compradores criam reviews"
    ON public.marketplace_product_reviews FOR INSERT
    WITH CHECK (auth.uid() = reviewer_id);

-- QUESTIONS
CREATE POLICY "Perguntas são públicas"
    ON public.marketplace_product_questions FOR SELECT
    USING (is_published = true);

CREATE POLICY "Usuários fazem perguntas"
    ON public.marketplace_product_questions FOR INSERT
    WITH CHECK (auth.uid() = asker_id);
