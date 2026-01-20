# 塔罗牌应用后端服务完整文档

## 📋 目录

- [概述](#概述)
- [技术栈](#技术栈)
- [核心架构](#核心架构)
- [数据库Schema](#数据库schema)
- [API接口文档](#api接口文档)
- [业务逻辑](#业务逻辑)
- [配置管理](#配置管理)
- [错误处理](#错误处理)
- [认证与授权](#认证与授权)

---

## 概述

本文档详细描述塔罗牌应用后端服务的所有逻辑、参数和实现细节，用于指导后端服务的重写和迁移。

### 核心功能

1. **用户认证** - 基于邮箱/密码的登录和注册
2. **塔罗牌解读** - AI流式解读生成
3. **历史记录** - 解读记录查询
4. **每日限额** - 用户配额管理
5. **演示账号** - 开发和演示环境支持

### 关键特性

- ✅ 流式AI响应（SSE协议）
- ✅ 统一的API响应格式
- ✅ 演示账号无限配额
- ✅ 每日限额管理
- ✅ 基于Drizzle ORM的数据库操作
- ✅ 完整的错误处理机制

---

## 技术栈

### 核心框架
- **Next.js 16** - App Router
- **TypeScript** - 类型安全
- **Node.js 24+** - 运行环境

### 数据库
- **PostgreSQL** - 主数据库
- **Drizzle ORM** - ORM框架
- **coze-coding-dev-sdk** - 数据库集成

### AI服务
- **coze-coding-dev-sdk** - LLM集成
- **豆包大模型** - AI解读生成
- **流式响应** - SSE协议

### 认证与安全
- **bcryptjs** - 密码加密
- **Basic Auth** - API认证
- **演示账号系统** - 环境隔离

---

## 核心架构

### 目录结构

```
src/
├── app/
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts         # 登录接口
│       │   ├── register/route.ts      # 注册接口
│       │   └── quota/route.ts         # 配额查询接口
│       ├── tarot/
│       │   ├── interpret/route.ts     # AI解读接口（流式）
│       │   ├── history/route.ts       # 历史记录接口
│       │   └── suggest/route.ts       # 相关问题建议
│       ├── debug/
│       │   ├── config/route.ts        # 配置调试接口
│       │   ├── demo-account/route.ts  # 演示账号调试
│       │   └── interpret-test/route.ts # 解读功能测试
│       └── init/route.ts              # 系统初始化
├── config/
│   ├── index.ts                       # 配置总入口
│   ├── llm.ts                         # LLM配置
│   ├── database.ts                    # 数据库配置
│   ├── app.ts                         # 应用配置
│   └── demo-account.ts                # 演示账号配置
├── storage/
│   └── database/
│       ├── shared/
│       │   ├── schema.ts              # 数据库Schema定义
│       │   └── db.ts                  # 数据库连接
│       ├── userManager.ts             # 用户管理
│       ├── dailyQuotaManager.ts       # 配额管理
│       └── tarotInterpretationManager.ts # 解读记录管理
└── lib/
    ├── api-response.ts                # 统一响应格式
    ├── tarot.ts                       # 塔罗牌数据与逻辑
    └── tarot-cards.ts                 # 78张塔罗牌数据
```

### 数据流程

```
用户请求 → API Route → 业务逻辑层 → 数据库/AI → 统一响应
                ↓
         错误处理中间件
                ↓
         200状态码 + JSON响应
```

---

## 数据库Schema

### 表结构

#### 1. users（用户表）

```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,  -- bcrypt加密
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ
);

-- 索引
CREATE INDEX users_email_idx ON users(email);
CREATE INDEX users_username_idx ON users(username);
```

**字段说明**:
- `id`: UUID主键
- `username`: 用户名（自动从邮箱@前生成）
- `email`: 邮箱（唯一）
- `password`: bcrypt加密后的密码（10 rounds）
- `is_active`: 账户激活状态
- `created_at`: 创建时间
- `updated_at`: 更新时间（触发器自动更新）

**业务规则**:
- 用户名从邮箱@前的部分自动生成
- 注册时邮箱必须唯一
- 密码使用bcrypt哈希（salt rounds: 10）

---

#### 2. tarot_interpretations（塔罗解读记录表）

```sql
CREATE TABLE tarot_interpretations (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(36) NOT NULL,
  question TEXT NOT NULL,
  spread_type VARCHAR(50) NOT NULL,
  cards TEXT NOT NULL,           -- JSON字符串存储牌面数据
  interpretation TEXT NOT NULL,  -- AI解读内容（Markdown格式）
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT fk_tarot_interpretations_user_id
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 索引
CREATE INDEX tarot_interpretations_user_id_idx ON tarot_interpretations(user_id);
CREATE INDEX tarot_interpretations_created_at_idx ON tarot_interpretations(created_at DESC);
```

**字段说明**:
- `id`: UUID主键
- `user_id`: 关联用户ID（外键）
- `question`: 用户问题
- `spread_type`: 牌阵类型（single/three/cross）
- `cards`: JSON字符串，存储抽牌数据
- `interpretation`: AI解读内容（支持Markdown格式）
- `created_at`: 解读时间

**业务规则**:
- 用户删除时，解读记录级联删除
- 按时间降序索引，优化查询性能

---

#### 3. daily_quotas（用户每日限额表）

```sql
CREATE TABLE daily_quotas (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(36) NOT NULL,
  date VARCHAR(10) NOT NULL,       -- 格式: YYYY-MM-DD
  count INTEGER NOT NULL DEFAULT 0, -- 已使用次数
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ,

  CONSTRAINT fk_daily_quotas_user_id
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT uk_daily_quotas_user_date UNIQUE (user_id, date)
);

-- 索引
CREATE INDEX daily_quotas_user_id_date_idx ON daily_quotas(user_id, date);
```

**字段说明**:
- `id`: UUID主键
- `user_id`: 关联用户ID（外键）
- `date`: 日期（YYYY-MM-DD格式）
- `count`: 当日已使用次数
- `created_at`: 创建时间
- `updated_at`: 更新时间（触发器自动更新）

**业务规则**:
- 每个用户每天只有一条记录（唯一约束）
- 用户删除时，限额记录级联删除
- 演示账号不受限制

---

## API接口文档

### 统一响应格式

所有接口均返回HTTP 200状态码，错误信息包含在响应体中。

#### 成功响应
```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
```

#### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": "详细错误信息"
  }
}
```

---

### 认证接口

#### 1. 登录 - POST /api/auth/login

**功能描述**：
验证用户身份并返回用户信息。当前仅支持演示账号。

**请求头**：
```
Authorization: Basic <base64(email:password)>
```

**请求体**：
```json
{
  "email": "demo@mentobai.com",
  "password": "Demo123!"
}
```

**业务逻辑**：
1. 解析请求体，提取email和password
2. 解析Authorization header中的Basic Auth凭证（可选）
3. 验证header中的凭证与请求体中的凭证是否一致
4. 调用`isDemoAccount(email, password)`验证演示账号
5. 如果邮箱匹配演示账号但密码错误，返回`INVALID_CREDENTIALS`
6. 验证成功返回用户信息

**成功响应**：
```json
{
  "success": true,
  "data": {
    "id": "demo-user-id",
    "username": "Demo User",
    "email": "demo@mentobai.com",
    "isActive": true,
    "isDemo": true,
    "unlimitedQuota": true
  },
  "message": "Login successful"
}
```

**错误响应**：
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

---

#### 2. 注册 - POST /api/auth/register

**功能描述**：
创建新用户账号。

**请求体**：
```json
{
  "email": "user@example.com",
  "password": "UserPass123!"
}
```

**业务逻辑**：
1. 验证必填字段（email、password）
2. 从邮箱@前的部分提取username
3. 检查邮箱是否已存在（调用`userManager.getUserByEmail`）
4. 如果邮箱已存在，返回`USER_EXISTS`
5. 对密码进行bcrypt哈希（10 rounds）
6. 创建用户记录（调用`userManager.createUser`）
7. 返回用户信息（不含密码）

**成功响应**：
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "username": "user",
    "email": "user@example.com",
    "isActive": true
  },
  "message": "Registration successful"
}
```

---

#### 3. 查询配额 - GET /api/auth/quota

**功能描述**：
查询用户的每日配额使用情况。

**请求参数**：
```
GET /api/auth/quota?userId=xxx
```

**业务逻辑**：
1. 验证userId参数
2. 调用`dailyQuotaManager.getRemainingQuota(userId)`
3. 调用`dailyQuotaManager.getTodayQuota(userId)`
4. 如果是演示账号，返回无限配额
5. 返回配额信息

**成功响应（普通用户）**：
```json
{
  "success": true,
  "data": {
    "remaining": 3,
    "used": 0,
    "total": 3,
    "isDemo": false
  }
}
```

**成功响应（演示账号）**：
```json
{
  "success": true,
  "data": {
    "remaining": 999999,
    "used": 0,
    "total": "Unlimited",
    "isDemo": true
  }
}
```

---

### 塔罗牌接口

#### 4. AI解读 - POST /api/tarot/interpret

**功能描述**：
生成AI塔罗牌解读，支持流式响应。

**请求体**：
```json
{
  "userId": "demo-user-id",
  "question": "我的未来会怎样？",
  "spread": {
    "id": "three",
    "name": "三张牌阵",
    "description": "过去-现在-未来，了解事情的演变",
    "positions": [
      {
        "id": "position1",
        "name": "过去",
        "description": "影响过去的情况"
      }
    ]
  },
  "cards": [
    {
      "id": 0,
      "name": "愚者",
      "nameEn": "The Fool",
      "meaning": "新的开始、冒险、天真、自发性、自由精神",
      "reversedMeaning": "鲁莽、冒险、愚蠢、不负责任",
      "isReversed": false,
      "imageUrl": "/tarot-cards/result/Major/The_Fool_New_beginnings.png"
    }
  ]
}
```

**业务逻辑**：
1. **解析请求体** - 提取userId、question、spread、cards
2. **检查每日限额** - 演示账号直接通过，普通用户检查配额
3. **构建LLM提示词** - 系统提示词（固定）+ 用户提示词（动态）
4. **调用LLM流式接口** - 使用coze-coding-dev-sdk
5. **流式响应处理** - 创建ReadableStream，实时推送内容
6. **保存解读记录** - 流式完成后保存到数据库
7. **更新每日限额** - 增加使用计数

**响应格式**：
- **Content-Type**: `text/event-stream`
- **Transfer-Encoding**: `chunked`
- **Body**: 流式文本数据

**LLM配置**：
- **model**: `doubao-seed-1-6-thinking-250715`
- **temperature**: 0.8
- **thinking**: enabled
- **systemPrompt**: 专业的塔罗牌解读师提示词模板

**流式响应实现**：
```typescript
const readableStream = new ReadableStream({
  async start(controller) {
    const encoder = new TextEncoder();
    let fullInterpretation = '';

    for await (const chunk of stream) {
      if (chunk.content) {
        const text = chunk.content.toString();
        fullInterpretation += text;
        controller.enqueue(encoder.encode(text));
      }
    }

    // 流式完成后保存数据
    await tarotInterpretationManager.createInterpretation({...});
    await dailyQuotaManager.useQuota(userId);
    controller.close();
  },
});
```

---

#### 5. 历史记录 - GET /api/tarot/history

**功能描述**：
查询用户的解读历史记录。

**请求参数**：
```
GET /api/tarot/history?userId=xxx
```

**业务逻辑**：
1. 验证userId参数
2. 调用`tarotInterpretationManager.getInterpretationsByUserId(userId, 20)`
3. 返回最多20条记录，按创建时间降序排列

**成功响应**：
```json
{
  "success": true,
  "data": {
    "interpretations": [
      {
        "id": "uuid-here",
        "userId": "demo-user-id",
        "question": "我的未来会怎样？",
        "spreadType": "three",
        "cards": "[{\"id\":0,\"name\":\"愚者\",\"isReversed\":false}]",
        "interpretation": "# 解读内容\n\n根据你抽出的牌...",
        "createdAt": "2024-01-20T10:30:00Z"
      }
    ]
  }
}
```

---

#### 6. 相关问题建议 - POST /api/tarot/suggest

**功能描述**：
基于当前解读结果，推荐相关的探索问题。

**请求体**：
```json
{
  "question": "我的未来会怎样？",
  "cards": [
    {
      "id": 0,
      "name": "愚者",
      "isReversed": false
    }
  ],
  "interpretation": "根据你抽出的愚者牌..."
}
```

**业务逻辑**：
1. 验证必填字段（question、cards、interpretation）
2. 构建系统提示词（塔罗师和人生导师角色）
3. 构建用户提示词（包含问题、牌面、解读）
4. 调用`LLMClient.invoke()`（非流式）
5. 返回建议内容

**成功响应**：
```json
{
  "success": true,
  "data": {
    "suggestion": "基于你关于未来发展的解读，我建议你还可以探索以下方向..."
  }
}
```

---

### 系统接口

#### 7. 初始化 - POST /api/init

**功能描述**：
创建默认管理员账号。

**默认管理员配置**：
```typescript
const DEFAULT_ADMIN = {
  username: 'admin',
  email: 'admin@mentobai.com',
  password: 'Admin123!',
};
```

---

#### 8. 配置调试 - GET /api/debug/config

**功能描述**：
返回系统配置信息，用于调试。

**用途**：
- 验证配置是否正确加载
- 检查环境变量设置
- 确认SDK集成状态

---

#### 9. 演示账号调试 - GET /api/debug/demo-account

**功能描述**：
返回演示账号配置信息，用于调试登录问题。

**用途**：
- 调试演示账号登录问题
- 检查密码配置
- 验证环境变量设置

---

#### 10. 解读功能测试 - POST /api/debug/interpret-test

**功能描述**：
测试解读功能的所有组件。

**测试项目**：
1. 配额检查测试
2. LLM客户端测试
3. 数据库写入测试
4. 数据库读取测试

**请求体**：
```json
{
  "userId": "demo-user-id",
  "skipLLM": false
}
```

---

**文档版本**: 1.0.0
**最后更新**: 2024-01-20
