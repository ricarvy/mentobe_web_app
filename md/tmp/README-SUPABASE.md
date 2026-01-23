# 📦 Supabase 部署文件清单

## 📄 文件列表

### 1. SQL 脚本

#### supabase-schema.sql（完整版）
- **路径**: `/tmp/supabase-schema.sql`
- **包含**:
  - ✅ 完整的表结构
  - ✅ 所有索引
  - ✅ 外键约束
  - ✅ 触发器
  - ✅ Row Level Security (RLS) 策略
  - ✅ 演示用户
- **适用场景**: 使用 Supabase Auth 认证

#### supabase-schema-simple.sql（简化版）⭐推荐
- **路径**: `/tmp/supabase-schema-simple.sql`
- **包含**:
  - ✅ 完整的表结构
  - ✅ 所有索引
  - ✅ 外键约束
  - ✅ 触发器
  - ✅ 演示用户
  - ❌ 无 RLS 策略
- **适用场景**: 使用自定义认证（如当前项目的 email/password）

### 2. 文档

#### supabase-deployment-guide.md
- **路径**: `/tmp/supabase-deployment-guide.md`
- **内容**:
  - 📖 完整的部署指南
  - 📊 数据库表结构说明
  - 🔐 安全特性介绍
  - 🛠️ 常用 SQL 操作
  - 🆘 故障排除
  - 📚 相关资源链接

### 3. 配置文件

#### .env.example
- **路径**: `/tmp/.env.example`
- **内容**: 环境变量配置模板
- **用途**: 复制为 `.env.local` 并填入你的 Supabase 配置

#### db-config-example.ts
- **路径**: `/tmp/db-config-example.ts`
- **内容**: Drizzle ORM 数据库连接配置
- **用途**: 更新 `src/storage/database/shared/db.ts`

---

## 🚀 快速部署步骤（5分钟）

### Step 1: 创建 Supabase 项目（2分钟）
1. 访问 https://supabase.com
2. 点击 "New Project"
3. 填写项目信息：
   - Name: `tarot-app`（或其他名称）
   - Database Password: 记住这个密码！
   - Region: 选择离你最近的区域
4. 等待项目创建完成（约 1-2 分钟）

### Step 2: 执行建表脚本（1分钟）
1. 在 Supabase Dashboard 中：
   - 左侧菜单 → SQL Editor
   - 点击 "New Query"
2. 打开文件：`/tmp/supabase-schema-simple.sql` ⭐
3. 复制全部内容，粘贴到 SQL Editor
4. 点击 "Run"
5. 等待执行完成，看到 "数据库表创建成功！" 提示

### Step 3: 获取连接信息（1分钟）
在 Supabase Dashboard 中：

1. **Project URL**:
   - Settings → API → Project URL
   - 复制，例如：`https://xyzabc.supabase.co`

2. **Service Role Key**:
   - Settings → API → service_role key
   - 复制（用于服务端 API 调用）

3. **Database URL**:
   - Settings → Database → Connection string
   - 选择 "URI"
   - 复制，例如：`postgresql://postgres:[YOUR-PASSWORD]@db.xyzabc.supabase.co:5432/postgres`
   - 替换 `[YOUR-PASSWORD]` 为你的数据库密码

### Step 4: 配置应用（1分钟）

#### 方法 A: 更新环境变量
在你的项目根目录创建 `.env.local`：

```bash
# 复制配置文件
cp /tmp/.env.example .env.local

# 编辑并填入你的 Supabase 配置
nano .env.local  # 或使用你喜欢的编辑器
```

#### 方法 B: 更新 Drizzle 配置（如果需要）
1. 打开 `src/storage/database/shared/db.ts`
2. 参考 `/tmp/db-config-example.ts` 更新配置
3. 确保环境变量 `DATABASE_URL` 已设置

---

## 📋 数据库表概览

| 表名 | 用途 | 记录数估计 |
|------|------|-----------|
| users | 用户信息 | 1,000 - 10,000 |
| tarot_interpretations | 解读记录 | 10,000 - 100,000 |
| daily_quotas | 每日限额 | 每用户每天 1 条 |

---

## 🧪 验证部署

### 测试连接
在 SQL Editor 中执行：

```sql
-- 查看所有表
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 应该看到 3 个表：
-- - users
-- - tarot_interpretations
-- - daily_quotas
```

### 测试插入数据
```sql
-- 插入测试用户
INSERT INTO users (username, email, password)
VALUES (
  'test_user',
  'test@example.com',
  '$2a$10$test_password_hash_here'
);

-- 查询测试用户
SELECT * FROM users WHERE username = 'test_user';

-- 清理测试数据
DELETE FROM users WHERE username = 'test_user';
```

---

## 🔄 从本地数据库迁移（可选）

如果你有现有的本地数据：

### 导出本地数据
```bash
# 使用 pg_dump（需要 PostgreSQL 安装）
pg_dump $DATABASE_URL > local_backup.sql
```

### 导入到 Supabase
1. 在 Supabase Dashboard → Database
2. 点击 "Import"
3. 上传你的 SQL 文件
4. 等待导入完成

---

## ⚠️ 重要提示

### 密码安全
- ✅ Supabase 会自动生成数据库密码
- ✅ 在 Database Settings 中可以查看或重置
- ❌ 不要在代码中硬编码密码
- ❌ 不要将密码提交到 Git

### API 密钥
- ✅ Service Role Key 仅用于服务端
- ❌ 不要在客户端代码中使用 Service Role Key
- ✅ Anon Key 可以安全暴露给客户端

### 备份
- ✅ Supabase 每天自动备份，保留 7 天
- ✅ 可以在 Database → Backups 查看和恢复
- ✅ 建议定期导出重要数据

### 性能优化
- ✅ 已创建所有必要的索引
- ✅ 外键约束已启用（ON DELETE CASCADE）
- ✅ 连接池已配置（默认 2-10 个连接）

---

## 🆘 常见问题

### Q1: 执行 SQL 脚本报错 "table already exists"
**A**: 脚本使用了 `IF NOT EXISTS`，会自动跳过已存在的表。如果你想要清空重建，需要手动删除：

```sql
DROP TABLE IF EXISTS daily_quotas CASCADE;
DROP TABLE IF EXISTS tarot_interpretations CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

### Q2: 应用无法连接数据库
**A**: 检查以下几点：
1. `DATABASE_URL` 是否正确
2. 数据库密码是否正确
3. Supabase 项目是否处于 "Active" 状态
4. 防火墙是否允许连接（Supabase 允许所有 IP）

### Q3: 如何查看数据库日志？
**A**: 在 Supabase Dashboard → Database → Logs

### Q4: 如何重置数据库密码？
**A**: 在 Supabase Dashboard → Database → Database Passwording → Reset password

### Q5: 如何查看数据库大小？
**A**: 在 Supabase Dashboard → Database → Usage

---

## 📞 获取帮助

- **Supabase 文档**: https://supabase.com/docs
- **Drizzle 文档**: https://orm.drizzle.team/
- **PostgreSQL 文档**: https://www.postgresql.org/docs/

---

**部署成功标志**：你能看到三个表，并且应用能正常连接数据库！🎉
