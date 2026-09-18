CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE listing_kind AS ENUM ('human', 'agent', 'hybrid');
CREATE TYPE job_status AS ENUM ('draft', 'open', 'matched', 'closed');

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind listing_kind NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  headline TEXT NOT NULL,
  description TEXT NOT NULL,
  avatar_url TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}',
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  completed_count INTEGER NOT NULL DEFAULT 0,
  price_amount NUMERIC(12,2) NOT NULL,
  price_unit TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  budget_min NUMERIC(12,2),
  budget_max NUMERIC(12,2),
  budget_unit TEXT NOT NULL DEFAULT 'project',
  location TEXT NOT NULL DEFAULT 'Remote',
  status job_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX profiles_kind_idx ON profiles(kind);
CREATE INDEX profiles_rating_idx ON profiles(rating DESC);
CREATE INDEX jobs_status_created_idx ON jobs(status, created_at DESC);

INSERT INTO profiles (kind, slug, name, headline, description, skills, rating, review_count, completed_count, price_amount, price_unit, is_verified) VALUES
('agent','inboxpilot-ai','InboxPilot AI','Customer Support Agent','Tự động trả lời khách hàng trên website, Facebook, Zalo và Telegram.',ARRAY['Support','Zalo','Facebook'],4.9,382,4800,19,'month',true),
('human','hoang-nguyen','Hoàng Nguyễn','AI Automation Developer','Xây hệ thống tự động hóa bằng n8n, OpenAI, Cloudflare và PostgreSQL.',ARRAY['n8n','OpenAI','Cloudflare'],4.9,76,83,25,'hour',true),
('hybrid','growth-studio','Growth Studio','Human + AI Ads Team','AI tối ưu chiến dịch liên tục, chuyên gia review chiến lược hàng tuần.',ARRAY['Meta Ads','Creative','Analytics'],5.0,98,126,199,'month',true),
('agent','leadminer','LeadMiner','Sales Research Agent','Tìm, làm giàu dữ liệu và chấm điểm khách hàng tiềm năng theo ICP.',ARRAY['Sales','Research','CRM'],4.8,540,12000,0.10,'run',true);

INSERT INTO jobs (title, description, category, budget_min, budget_max, budget_unit, location) VALUES
('Xây chatbot CSKH cho chuỗi mỹ phẩm','Cần chatbot kết nối website, Facebook và Zalo, có bàn giao cho nhân viên.','Automation & AI',300,500,'project','Remote'),
('Thiết kế landing page cho SaaS B2B','Thiết kế landing page hiện đại, ưu tiên chuyển đổi và responsive.','Design',200,350,'project','Remote'),
('Tối ưu chiến dịch Meta Ads tháng 10','Audit và tối ưu chiến dịch hiện tại cho thị trường Việt Nam.','Growth',20,30,'hour','Việt Nam');
