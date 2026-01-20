# Supabase 数据库部署指南

## 📋 概述

本文档提供将塔罗牌应用数据库部署到 Supabase 的完整步骤。

## 🚀 快速开始

### 方式一：使用 SQL Editor（推荐）

1. **登录 Supabase Dashboard**
   - 访问 https://supabase.com
   - 登录你的账号
   - 选择或创建你的项目

2. **打开 SQL Editor**
   - 在左侧菜单中找到 "SQL Editor"
   - 点击 "New Query"

3. **执行建表脚本**
   - 打开文件：`/tmp/supabase-schema.sql`
   - 复制全部 SQL 代码
   - 粘贴到 SQL Editor 中
   - 点击 "Run" 按钮执行

4. **验证表创建**
   - 执行成功后，你应该看到：
     - ✅ 三个表已创建：`users`、`tarot_interpretations`、`daily_quotas`
     - ✅ 所有索引已创建
     - ✅ 外键约束已设置
     - ✅ RLS 策略已启用

### 方式二：使用 Supabase CLI

如果你已安装 Supabase CLI：

```bash
# 1. 链接到你的项目
supabase link --project-ref YOUR_PROJECT_REF

# 2. 执行迁移
supabase db push --schema public
```

## 📊 数据库表结构

### 1. users（用户表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(36) | 用户ID (UUID，主键) |
| username | VARCHAR(100) | 用户名（唯一） |
| email | VARCHAR(255) | 邮箱（唯一） |
| password | VARCHAR(255) | 密码（bcrypt加密） |
| is_active | BOOLEAN | 账户是否激活 |
| created_at | TIMESTAMPTZ | 创建时间 |
| updated_at | TIMESTAMPTZ | 更新时间 |

**索引**：
- `users_email_idx`
- `users_username_idx`

### 2. tarot_interpretations（塔罗解读记录表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(36) | 解读记录ID (UUID，主键) |
| user_id | VARCHAR(36) | 用户ID（外键） |
| question | TEXT | 用户问题 |
| spread_type | VARCHAR(50) | 牌阵类型 |
| cards | TEXT | 抽牌数据（JSON格式） |
| interpretation | TEXT | AI解读内容 |
| created_at | TIMESTAMPTZ | 解读时间 |

**索引**：
- `tarot_interpretations_user_id_idx`
- `tarot_interpretations_created_at_idx`（降序）

**外键**：
- `user_id → users.id`（级联删除）

### 3. daily_quotas（用户每日限额表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(36) | 限额记录ID (UUID，主键) |
| user_id | VARCHAR(36) | 用户ID（外键） |
| date | VARCHAR(10) | 日期（YYYY-MM-DD） |
| count | INTEGER | 已使用次数 |
| created_at | TIMESTAMPTZ | 创建时间 |
| updated_at | TIMESTAMPTZ | 更新时间 |

**索引**：
- `daily_quotas_user_id_date_idx`（复合索引）

**外键**：
- `user_id → users.id`（级联删除）

**唯一约束**：
- `(user_id, date)` 组合唯一

## 🔐 安全特性

### Row Level Security (RLS)

所有表都启用了行级安全策略：

- ✅ 用户只能查看自己的数据
- ✅ 用户只能更新自己的数据
- ✅ 用户只能插入自己的数据
- ✅ 删除用户时，相关数据自动级联删除

### 数据完整性

- ✅ 外键约束确保数据关联正确
- ✅ 唯一约束防止重复数据
- ✅ NOT NULL 约束确保必填字段
- ✅ 自动时间戳记录

## 🔄 自动触发器

### update_updated_at_column

自动更新 `updated_at` 字段的触发器函数，应用于：
- `users` 表
- `daily_quotas` 表

## 📝 配置应用连接

### 1. 获取数据库连接信息

在 Supabase Dashboard 中：

- **Project URL**: Settings → API → Project URL
- **Database URL**: Settings → Database → Connection String → URI
- **Anon Key**: Settings → API → anon/public key
- **Service Role Key**: Settings → API → service_role key（服务器端使用）

### 2. 更新环境变量

在你的应用配置中添加以下环境变量：

```env
# Supabase 配置
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 数据库连接字符串（用于 Drizzle ORM）
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

### 3. 更新 Drizzle 配置

更新 `src/storage/database/shared/db.ts`：

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const client = postgres(connectionString);
export const db = drizzle(client, { schema });
```

## 🧪 测试连接

执行以下 SQL 测试连接：

```sql
-- 测试表是否存在
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'tarot_interpretations', 'daily_quotas');

-- 测试插入数据
INSERT INTO users (username, email, password)
VALUES ('test', 'test@example.com', '$2a$10$test');

-- 测试查询数据
SELECT * FROM users WHERE username = 'test';

-- 清理测试数据
DELETE FROM users WHERE username = 'test';
```

## 🛠️ 常用 SQL 操作

### 查看表结构
```sql
\d users
\d tarot_interpretations
\d daily_quotas
```

### 查看索引
```sql
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public';
```

### 查看外键约束
```sql
SELECT
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema='public';
```

### 重置数据库（谨慎使用）
```sql
-- 删除所有表（会丢失数据）
DROP TABLE IF EXISTS daily_quotas CASCADE;
DROP TABLE IF EXISTS tarot_interpretations CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 然后重新执行建表脚本
```

## ⚠️ 注意事项

1. **演示用户密码**
   - SQL 脚本中的演示用户密码是示例
   - 实际部署时应该使用真实的 bcrypt hash
   - 使用工具生成：`bcrypt.hash("your-password", 10)`

2. **RLS 策略**
   - 脚本中的 RLS 策略基于 `auth.uid()`
   - 如果你使用自定义认证，需要调整策略
   - 对于 API Key 认证，可能需要禁用 RLS 或修改策略

3. **数据迁移**
   - 如果从旧数据库迁移，需要导出数据后再导入
   - Supabase 提供数据导入工具：Database → Import

4. **备份**
   - 定期备份数据库：Database → Backups
   - Supabase 每天自动备份，保留 7 天

## 📚 相关资源

- [Supabase 官方文档](https://supabase.com/docs)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)
- [Drizzle ORM 文档](https://orm.drizzle.team/)

## 🆘 故障排除

### 问题：表已存在
**解决方案**：SQL 使用了 `IF NOT EXISTS`，会自动跳过已存在的表

### 问题：外键约束失败
**解决方案**：确保 users 表先创建，再创建引用它的表

### 问题：RLS 策略阻止操作
**解决方案**：
```sql
-- 临时禁用 RLS（仅用于开发环境）
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

### 问题：密码验证失败
**解决方案**：
- 确保使用 bcrypt 加密
- 使用相同的 salt rounds（默认 10）

---

**祝你部署顺利！** 🎉
