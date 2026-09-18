CREATE TYPE service_delivery_mode AS ENUM ('human', 'agent', 'hybrid');

CREATE TABLE service_offerings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  delivery_mode service_delivery_mode NOT NULL,
  provider_name TEXT NOT NULL,
  price_amount NUMERIC(12,2) NOT NULL,
  price_unit TEXT NOT NULL DEFAULT 'project',
  delivery_days INTEGER,
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  order_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE intent_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  need TEXT NOT NULL,
  budget_amount NUMERIC(12,2),
  budget_currency TEXT NOT NULL DEFAULT 'USD',
  email TEXT,
  status TEXT NOT NULL DEFAULT 'matching',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX service_offerings_category_idx ON service_offerings(category, is_active);
CREATE INDEX service_offerings_mode_idx ON service_offerings(delivery_mode, rating DESC);
CREATE INDEX intent_requests_created_idx ON intent_requests(created_at DESC);

INSERT INTO service_offerings
  (slug, title, description, category, delivery_mode, provider_name, price_amount, price_unit, delivery_days, rating, order_count)
VALUES
  ('ai-customer-support-setup', 'Triển khai AI chatbot CSKH', 'Thiết lập chatbot đa kênh, kho kiến thức và quy trình bàn giao cho nhân viên.', 'Automation & AI', 'hybrid', 'Growth Studio', 300, 'project', 5, 5.0, 126),
  ('seo-audit-agent', 'SEO Audit tự động', 'Quét technical SEO, content gap và xuất danh sách việc ưu tiên trong 24 giờ.', 'Growth', 'agent', 'SearchLens AI', 29, 'project', 1, 4.8, 342),
  ('saas-landing-page', 'Thiết kế landing page SaaS', 'Thiết kế responsive tập trung chuyển đổi, gồm bản desktop và mobile.', 'Design', 'human', 'Linh Product Designer', 220, 'project', 4, 4.9, 87),
  ('sales-lead-research', 'Danh sách lead đúng ICP', 'Tìm và làm giàu 100 lead B2B, kèm vai trò, email và tín hiệu mua hàng.', 'Sales', 'agent', 'LeadMiner', 49, 'project', 2, 4.8, 540),
  ('workflow-automation-sprint', 'Automation sprint cho vận hành', 'Chuyên gia phân tích quy trình và agent triển khai workflow trong một tuần.', 'Automation & AI', 'hybrid', 'Hoàng Nguyễn + Agent', 480, 'project', 7, 4.9, 64),
  ('brand-starter-kit', 'Brand starter kit', 'Logo, bảng màu, typography và social templates cho thương hiệu mới.', 'Design', 'human', 'Mây Studio', 180, 'project', 5, 4.9, 114)
ON CONFLICT (slug) DO NOTHING;
