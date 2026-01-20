-- ========================================
-- 塔罗牌应用 Supabase 数据库建表脚本
-- 简化版：无 RLS（适合自定义认证）
-- ========================================
-- 执行说明：
-- 1. 在 Supabase Dashboard 中打开 SQL Editor
-- 2. 复制并粘贴以下 SQL 代码
-- 3. 点击 "Run" 执行
-- ========================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- 1. 用户表 (users)
-- ========================================
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_username_idx ON users(username);

-- ========================================
-- 2. 塔罗解读记录表 (tarot_interpretations)
-- ========================================
CREATE TABLE IF NOT EXISTS tarot_interpretations (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(36) NOT NULL,
  question TEXT NOT NULL,
  spread_type VARCHAR(50) NOT NULL,
  cards TEXT NOT NULL,
  interpretation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT fk_tarot_interpretations_user_id
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS tarot_interpretations_user_id_idx ON tarot_interpretations(user_id);
CREATE INDEX IF NOT EXISTS tarot_interpretations_created_at_idx ON tarot_interpretations(created_at DESC);

-- ========================================
-- 3. 用户每日限额表 (daily_quotas)
-- ========================================
CREATE TABLE IF NOT EXISTS daily_quotas (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(36) NOT NULL,
  date VARCHAR(10) NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ,
  CONSTRAINT fk_daily_quotas_user_id
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT uk_daily_quotas_user_date UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS daily_quotas_user_id_date_idx ON daily_quotas(user_id, date);

-- ========================================
-- 4. 自动更新 updated_at 触发器
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_daily_quotas_updated_at ON daily_quotas;
CREATE TRIGGER update_daily_quotas_updated_at
  BEFORE UPDATE ON daily_quotas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 5. 插入演示用户（可选）
-- ========================================
-- 密码: demo123
INSERT INTO users (id, username, email, password)
VALUES (
  'demo-user-id',
  'demo',
  'demo@example.com',
  '$2a$10$rKJmJvLdJZJZJZJZJZJZJuK7h7h7h7h7h7h7h7h7h7h7h7h7h7h'
)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 完成提示
-- ========================================
SELECT '数据库表创建成功！' AS status;
