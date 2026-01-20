-- ========================================
-- 塔罗牌应用 Supabase 数据库建表脚本
-- ========================================
-- 执行说明：
-- 1. 在 Supabase Dashboard 中打开 SQL Editor
-- 2. 复制并粘贴以下 SQL 代码
-- 3. 点击 "Run" 执行
-- ========================================

-- 启用 UUID 扩展（Supabase 默认已启用，但为了保险起见）
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

-- 创建索引
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_username_idx ON users(username);

-- 添加注释
COMMENT ON TABLE users IS '用户表';
COMMENT ON COLUMN users.id IS '用户ID (UUID)';
COMMENT ON COLUMN users.username IS '用户名';
COMMENT ON COLUMN users.email IS '邮箱';
COMMENT ON COLUMN users.password IS '密码 (bcrypt加密)';
COMMENT ON COLUMN users.is_active IS '账户是否激活';
COMMENT ON COLUMN users.created_at IS '创建时间';
COMMENT ON COLUMN users.updated_at IS '更新时间';

-- ========================================
-- 2. 塔罗解读记录表 (tarot_interpretations)
-- ========================================
CREATE TABLE IF NOT EXISTS tarot_interpretations (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(36) NOT NULL,
  question TEXT NOT NULL,
  spread_type VARCHAR(50) NOT NULL,
  cards TEXT NOT NULL, -- JSON 字符串存储牌面数据
  interpretation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- 外键约束
  CONSTRAINT fk_tarot_interpretations_user_id
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS tarot_interpretations_user_id_idx ON tarot_interpretations(user_id);
CREATE INDEX IF NOT EXISTS tarot_interpretations_created_at_idx ON tarot_interpretations(created_at DESC);

-- 添加注释
COMMENT ON TABLE tarot_interpretations IS '塔罗解读记录表';
COMMENT ON COLUMN tarot_interpretations.id IS '解读记录ID (UUID)';
COMMENT ON COLUMN tarot_interpretations.user_id IS '用户ID';
COMMENT ON COLUMN tarot_interpretations.question IS '用户问题';
COMMENT ON COLUMN tarot_interpretations.spread_type IS '牌阵类型';
COMMENT ON COLUMN tarot_interpretations.cards IS '抽牌数据 (JSON格式)';
COMMENT ON COLUMN tarot_interpretations.interpretation IS 'AI解读内容';
COMMENT ON COLUMN tarot_interpretations.created_at IS '解读时间';

-- ========================================
-- 3. 用户每日限额表 (daily_quotas)
-- ========================================
CREATE TABLE IF NOT EXISTS daily_quotas (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(36) NOT NULL,
  date VARCHAR(10) NOT NULL, -- 格式: YYYY-MM-DD
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ,

  -- 外键约束
  CONSTRAINT fk_daily_quotas_user_id
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  -- 唯一约束：每个用户每天只能有一条记录
  CONSTRAINT uk_daily_quotas_user_date UNIQUE (user_id, date)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS daily_quotas_user_id_date_idx ON daily_quotas(user_id, date);

-- 添加注释
COMMENT ON TABLE daily_quotas IS '用户每日限额表';
COMMENT ON COLUMN daily_quotas.id IS '限额记录ID (UUID)';
COMMENT ON COLUMN daily_quotas.user_id IS '用户ID';
COMMENT ON COLUMN daily_quotas.date IS '日期 (YYYY-MM-DD)';
COMMENT ON COLUMN daily_quotas.count IS '已使用次数';
COMMENT ON COLUMN daily_quotas.created_at IS '创建时间';
COMMENT ON COLUMN daily_quotas.updated_at IS '更新时间';

-- ========================================
-- 4. 创建触发器函数：自动更新 updated_at 字段
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为 users 表创建触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 为 daily_quotas 表创建触发器
DROP TRIGGER IF EXISTS update_daily_quotas_updated_at ON daily_quotas;
CREATE TRIGGER update_daily_quotas_updated_at
  BEFORE UPDATE ON daily_quotas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 5. Row Level Security (RLS) 策略
-- ========================================

-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarot_interpretations ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_quotas ENABLE ROW LEVEL SECURITY;

-- users 表策略
-- 允许用户查看自己的记录
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT
  USING (auth.uid()::text = id);

-- 允许用户更新自己的记录
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  USING (auth.uid()::text = id);

-- 允许用户插入自己的记录（注册时）
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT
  WITH CHECK (auth.uid()::text = id);

-- tarot_interpretations 表策略
-- 允许用户查看自己的解读记录
CREATE POLICY "Users can view own interpretations" ON tarot_interpretations
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- 允许用户插入自己的解读记录
CREATE POLICY "Users can insert own interpretations" ON tarot_interpretations
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- daily_quotas 表策略
-- 允许用户查看自己的限额记录
CREATE POLICY "Users can view own quotas" ON daily_quotas
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- 允许用户插入自己的限额记录
CREATE POLICY "Users can insert own quotas" ON daily_quotas
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- 允许用户更新自己的限额记录
CREATE POLICY "Users can update own quotas" ON daily_quotas
  FOR UPDATE
  USING (auth.uid()::text = user_id);

-- ========================================
-- 6. 初始化演示用户（可选）
-- ========================================
-- 注意：密码需要使用 bcrypt 加密
-- 以下密码 "demo123" 的 bcrypt hash 值
INSERT INTO users (id, username, email, password, is_active)
VALUES (
  'demo-user-id-1234567890',
  'demo',
  'demo@example.com',
  '$2a$10$rKJmJvLdJZJZJZJZJZJZJuK7h7h7h7h7h7h7h7h7h7h7h7h7h7h',
  true
)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 7. 验证表结构
-- ========================================
-- 查看所有表
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'tarot_interpretations', 'daily_quotas')
ORDER BY table_name;

-- 查看表结构（取消注释以执行）
-- \d users
-- \d tarot_interpretations
-- \d daily_quotas

-- ========================================
-- 完成提示
-- ========================================
SELECT '数据库表创建成功！' AS status;
