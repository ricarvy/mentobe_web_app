/**
 * 数据库配置
 * 使用 PostgreSQL + Drizzle ORM
 * 通过 coze-coding-dev-sdk 集成
 */

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DatabaseConfig {
  // 使用 coze-coding-dev-sdk 的内置数据库
  // 不需要额外配置，SDK 会自动处理连接
}

/**
 * 数据库配置
 *
 * 说明：
 * - 项目使用 coze-coding-dev-sdk 提供的数据库服务
 * - 数据库类型: PostgreSQL
 * - ORM: Drizzle ORM
 * - 连接管理: SDK 自动处理
 * 
 * Schema 定义位置: src/storage/database/shared/schema.ts
 * Manager 实现: src/storage/database/*.ts
 *
 * 环境变量：
 * - SDK 会自动从环境读取数据库配置，无需手动配置
 */
export const databaseConfig: DatabaseConfig = {};

/**
 * 数据库配置验证
 * 由于使用 SDK 自动管理，始终返回 true
 */
export function validateDatabaseConfig(): boolean {
  return true;
}
