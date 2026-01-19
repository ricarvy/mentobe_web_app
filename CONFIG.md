# 配置说明

本项目采用集中式配置管理，所有环境变量和外部ID都存储在统一的配置文件中。

## 配置文件结构

```
src/config/
├── index.ts          # 主入口，导出所有配置
├── app.ts            # 应用配置（限额、功能开关等）
├── paddle.ts         # Paddle 支付配置
├── llm.ts            # LLM 模型配置
└── database.ts       # 数据库配置
```

## 环境变量配置

### 1. 复制配置模板

```bash
cp .env.example .env.local
```

### 2. 填写环境变量

编辑 `.env.local` 文件，填写实际的配置值。

## 配置说明

### 应用配置 (app.ts)

| 环境变量 | 说明 | 默认值 |
|---------|------|--------|
| `APP_NAME` | 应用名称 | Mentob AI |
| `APP_DESCRIPTION` | 应用描述 | AI-Powered Tarot Readings |
| `APP_URL` | 应用URL | http://localhost:5000 |
| `APP_VERSION` | 应用版本 | 1.0.0 |
| `DAILY_QUOTA_FREE` | 免费用户每日限额 | 3 |
| `DAILY_QUOTA_PAID` | 付费用户每日限额 | 999 |
| `MAX_QUESTION_LENGTH` | 问题最大长度 | 500 |
| `MAX_CARDS_PER_READING` | 单次解读最大卡牌数 | 10 |
| `HISTORY_LIMIT` | 历史记录显示数量 | 50 |

### LLM 配置 (llm.ts)

| 环境变量 | 说明 | 默认值 | 可选值 |
|---------|------|--------|--------|
| `LLM_MODEL` | AI模型名称 | doubao-seed-1-6-thinking-250715 | 见下方列表 |
| `LLM_TEMPERATURE` | 温度参数 (0-2) | 0.8 | 0-2 |
| `LLM_MAX_TOKENS` | 最大token数 | undefined | 可选 |
| `LLM_THINKING` | 思考模式 | enabled | enabled/disabled |

**可用模型列表：**
- `doubao-seed-1-6-thinking-250715` - 豆包思考模型（推荐）
- `doubao-seed-1-6-pro-250715` - 豆包专业版
- `doubao-seed-1-6-lite-250715` - 豆包轻量版
- `deepseek-chat` - DeepSeek 聊天模型
- `kimi-chat` - Kimi 聊天模型

### Paddle 配置 (paddle.ts)

| 环境变量 | 说明 | 必填 | 获取方式 |
|---------|------|------|----------|
| `NEXT_PUBLIC_PADDLE_TOKEN` | Paddle API Token | 是 | https://www.paddle.com/ |
| `NEXT_PUBLIC_PADDLE_ENVIRONMENT` | 环境类型 | 否 | sandbox/production |
| `NEXT_PUBLIC_PADDLE_PRICE_MONTHLY` | 月付价格ID | 是 | Paddle后台 |
| `NEXT_PUBLIC_PADDLE_PRICE_YEARLY` | 年付价格ID | 是 | Paddle后台 |

**获取 Paddle 配置步骤：**

1. 注册 Paddle 账户: https://www.paddle.com/
2. 在 Paddle 后台创建产品
3. 为产品创建价格（月付和年付）
4. 复制 Price IDs 和 API Token
5. 填写到 `.env.local` 文件

### 数据库配置 (database.ts)

项目使用 `coze-coding-dev-sdk` 内置的 PostgreSQL 数据库，无需额外配置。

SDK 会自动处理数据库连接和管理。

## 使用配置

### 在代码中引用配置

```typescript
// 导入配置
import { paddleConfig, llmConfig, appConfig } from '@/config';

// 使用配置
const token = paddleConfig.token;
const model = llmConfig.model;
const quota = appConfig.features.dailyQuota.free;
```

### 验证配置

```typescript
import { validatePaddleConfig, validateLLMConfig } from '@/config';

if (!validatePaddleConfig()) {
  console.error('Paddle 配置无效');
}

if (!validateLLMConfig()) {
  console.error('LLM 配置无效');
}
```

## 安全注意事项

1. **永远不要提交 `.env.local` 到 git**
2. `.env.example` 只包含示例配置，可以安全提交
3. 敏感信息（如 API Token）必须存储在环境变量中
4. 生产环境使用独立的环境变量配置

## 开发 vs 生产环境

### 开发环境
```bash
# 使用 .env.local
npm run dev
```

### 生产环境
```bash
# 通过 CI/CD 或服务器环境变量配置
npm run build
npm start
```

## 故障排查

### 1. Paddle 支付无法工作
检查配置：
- `NEXT_PUBLIC_PADDLE_TOKEN` 是否正确
- Price IDs 是否有效
- 环境是否设置为正确的值

### 2. AI 解读失败
检查配置：
- `LLM_MODEL` 是否是有效的模型名称
- `LLM_TEMPERATURE` 是否在 0-2 范围内

### 3. 每日限额不正确
检查配置：
- `DAILY_QUOTA_FREE` 和 `DAILY_QUOTA_PAID` 是否设置正确
- 用户类型识别是否正确

## 相关文档

- [Paddle 官方文档](https://developer.paddle.com/)
- [Drizzle ORM 文档](https://orm.drizzle.team/)
- [coze-coding-dev-sdk 文档](https://github.com/coze-dev/coze-coding-dev-sdk)
