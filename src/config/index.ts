/**
 * 统一配置文件
 * 集中管理所有环境变量、外部ID和第三方服务配置
 */

export { paddleConfig } from './paddle';
export { llmConfig } from './llm';
export { databaseConfig } from './database';
export { appConfig } from './app';
export { backendConfig, getApiUrl, validateBackendConfig } from './backend';
