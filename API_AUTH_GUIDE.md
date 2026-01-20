# API 认证指南

## 概述

所有需要用户认证的后端 API 请求都必须包含 `Authorization` header，使用 Basic Auth 方式。

## 认证方式

### Basic Auth

所有需要认证的请求都需要在 header 中包含：

```
Authorization: Basic <base64(email:password)>
```

其中 `<base64(email:password)>` 是 `email:password` 的 Base64 编码。

**示例：**

```
Authorization: Basic ZGVtb0BtZW50b2JhaS5jb206RGVtbzEyMyE=
```

解码后：`demo@mentobai.com:Demo123!`

## API 接口清单

### 1. 认证接口

#### POST /api/auth/login
用户登录接口

**请求头：**
```
Content-Type: application/json
Authorization: Basic <base64(email:password)>
```

**请求体：**
```json
{
  "email": "demo@mentobai.com",
  "password": "Demo123!"
}
```

**响应：**
```json
{
  "id": "demo-user-id",
  "username": "Demo User",
  "email": "demo@mentobai.com",
  "isActive": true,
  "isDemo": true,
  "unlimitedQuota": true
}
```

#### POST /api/auth/register
用户注册接口（可选）

**请求头：**
```
Content-Type: application/json
```

**请求体：**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### 2. 用户限额接口

#### GET /api/auth/quota
获取用户每日解读限额

**请求头：**
```
Content-Type: application/json
Authorization: Basic <base64(email:password)>
```

**查询参数：**
```
userId=demo-user-id
```

**响应：**
```json
{
  "remaining": 999999,
  "used": 0,
  "total": "Unlimited",
  "isDemo": true
}
```

### 3. 塔罗牌解读接口

#### POST /api/tarot/interpret
获取 AI 塔罗牌解读（流式响应）

**请求头：**
```
Content-Type: application/json
Authorization: Basic <base64(email:password)>
```

**请求体：**
```json
{
  "userId": "demo-user-id",
  "question": "我的未来事业如何发展？",
  "spread": {
    "id": "three",
    "name": "Three Card Spread",
    "positions": [...]
  },
  "cards": [
    {
      "id": 0,
      "name": "The Fool",
      "isReversed": false
    }
  ]
}
```

**响应：**
```
Content-Type: text/event-stream
Transfer-Encoding: chunked
```

流式返回 AI 解读内容。

### 4. 历史记录接口

#### GET /api/tarot/history
获取用户解读历史记录

**请求头：**
```
Content-Type: application/json
Authorization: Basic <base64(email:password)>
```

**查询参数：**
```
userId=demo-user-id
```

**响应：**
```json
{
  "interpretations": [
    {
      "id": "uuid",
      "userId": "demo-user-id",
      "question": "问题",
      "spreadType": "three",
      "cards": "[...]",
      "interpretation": "解读内容...",
      "createdAt": "2026-01-20T00:00:00.000Z"
    }
  ]
}
```

### 5. 调试接口（不需要认证）

#### GET /api/debug/config
查看系统配置信息

**请求头：**
```
Content-Type: application/json
```

#### POST /api/debug/interpret-test
测试各个组件功能

**请求头：**
```
Content-Type: application/json
```

**请求体：**
```json
{
  "userId": "demo-user-id",
  "skipLLM": false
}
```

## 前端使用

### 辅助函数

项目提供了辅助函数来简化认证头的添加：

```typescript
import { addAuthHeader, saveAuthCredentials, clearAuthCredentials } from '@/lib/auth';

// 添加认证头
const headers = addAuthHeader({ 'Content-Type': 'application/json' });

// 保存认证凭证（登录成功后）
saveAuthCredentials(userData, email, password);

// 清除认证凭证（登出时）
clearAuthCredentials();
```

### 使用示例

```typescript
// 登录
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: addAuthHeader({ 'Content-Type': 'application/json' }),
  body: JSON.stringify({ email, password }),
});

const userData = await response.json();
saveAuthCredentials(userData, email, password);

// 查询限额
const headers = addAuthHeader({ 'Content-Type': 'application/json' });
const quotaResponse = await fetch(`/api/auth/quota?userId=${userId}`, {
  method: 'GET',
  headers,
});

// 获取解读
const headers = addAuthHeader({ 'Content-Type': 'application/json' });
const interpretResponse = await fetch('/api/tarot/interpret', {
  method: 'POST',
  headers,
  body: JSON.stringify({ userId, question, spread, cards }),
});

// 获取历史
const headers = addAuthHeader({ 'Content-Type': 'application/json' });
const historyResponse = await fetch(`/api/tarot/history?userId=${userId}`, {
  method: 'GET',
  headers,
});
```

## 演示账号

系统提供了一个预设的演示账号：

```json
{
  "email": "demo@mentobai.com",
  "password": "Demo123!"
}
```

演示账号特点：
- 无限解读限额
- 自动填充到登录表单
- 适用于所有需要认证的接口

## 安全注意事项

1. **演示环境警告**：当前实现在 localStorage 中存储密码，仅适用于演示环境。生产环境应使用：
   - JWT Token
   - Session Cookie
   - OAuth 2.0

2. **HTTPS**：生产环境必须使用 HTTPS 传输 Basic Auth 凭证。

3. **凭证管理**：定期更换演示账号密码，避免泄露。

4. **日志安全**：避免在日志中输出明文密码。

## 错误处理

### 401 Unauthorized
- 凭证错误或未提供 Authorization header
- 演示账号未启用

### 400 Bad Request
- 缺少必填参数
- 参数格式错误

### 429 Too Many Requests
- 超出每日解读限额（非演示账号）

### 500 Internal Server Error
- 服务器内部错误
- 查看 `/api/debug/config` 和 `/api/debug/interpret-test` 排查

## 测试命令

```bash
# 登录
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic ZGVtb0BtZW50b2JhaS5jb206RGVtbzEyMyE=" \
  -d '{"email":"demo@mentobai.com","password":"Demo123!"}' \
  http://localhost:5000/api/auth/login

# 查询限额
curl "http://localhost:5000/api/auth/quota?userId=demo-user-id" \
  -H "Authorization: Basic ZGVtb0BtZW50b2JhaS5jb206RGVtbzEyMyE="

# 获取解读
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic ZGVtb0BtZW50b2JhaS5jb206RGVtbzEyMyE=" \
  -d '{"userId":"demo-user-id","question":"test","spread":{"id":"single","name":"Single Card","positions":[{"name":"Position 1","description":"Description"}]},"cards":[{"id":0,"name":"The Fool","isReversed":false}]}' \
  http://localhost:5000/api/tarot/interpret

# 获取历史
curl "http://localhost:5000/api/tarot/history?userId=demo-user-id" \
  -H "Authorization: Basic ZGVtb0BtZW50b2JhaS5jb206RGVtbzEyMyE="
```
