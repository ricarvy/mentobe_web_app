// ========================================
// Drizzle ORM 数据库连接配置
// 使用 Supabase PostgreSQL 数据库
// ========================================

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/**
 * 获取数据库连接字符串
 * 优先级：环境变量 > 配置文件
 */
const getDatabaseUrl = (): string => {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Please set it in your environment variables.\n' +
      'Format: postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres'
    );
  }

  return url;
};

/**
 * 创建 PostgreSQL 客户端
 * 配置连接池参数以适应 Supabase
 */
const createClient = () => {
  const connectionString = getDatabaseUrl();

  return postgres(connectionString, {
    max: parseInt(process.env.DB_POOL_MAX || '10', 10),
    idle_timeout: 20,
    connect_timeout: 10,
    // Supabase 推荐的 SSL 配置
    ssl: 'require',
  });
};

// 创建全局单例客户端
let client: ReturnType<typeof postgres> | null = null;

export const getDb = async () => {
  if (!client) {
    client = createClient();
  }
  return client;
};

/**
 * 导出 Drizzle 实例
 * 用于执行数据库查询
 */
export const db = drizzle(await getDb(), { schema });

/**
 * 数据库健康检查
 */
export const healthCheck = async (): Promise<boolean> => {
  try {
    const client = await getDb();
    await client`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

/**
 * 优雅关闭数据库连接
 */
export const closeDb = async (): Promise<void> => {
  if (client) {
    await client.end();
    client = null;
  }
};

// 开发环境：打印连接信息（不含密码）
if (process.env.NODE_ENV === 'development') {
  const dbUrl = process.env.DATABASE_URL || '';
  const maskedUrl = dbUrl.replace(/:[^:]*@/, ':****@');
  console.log('[Database] Connecting to:', maskedUrl);
}
