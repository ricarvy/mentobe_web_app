# 后端服务迁移文档

## 概述

本文档记录了将前端应用从内嵌 Next.js API Routes 迁移到独立后端服务的完整过程。

**新后端服务地址**: `http://120.76.142.91:8901/`

**后端API文档**: `http://120.76.142.91:8901/docs#/`

---

## 迁移内容

### 1. 新增配置文件

#### `src/config/backend.ts` - 后端服务配置
- 定义后端API的基础URL和相关配置
- 提供 `getApiUrl()` 函数用于构建完整的API端点URL
- 支持通过环境变量 `NEXT_PUBLIC_BACKEND_URL` 配置后端地址

**关键配置**:
```typescript
export const backendConfig: BackendConfig = {
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://120.76.142.91:8901',
  timeout: Number(process.env.NEXT_PUBLIC_BACKEND_TIMEOUT) || 30000,
};
```

### 2. 更新文件

#### `src/config/index.ts`
- 导出新的后端配置：`backendConfig`, `getApiUrl`, `validateBackendConfig`

#### `src/lib/api-client.ts`
- 导入 `getApiUrl` 函数
- 在 `apiRequest()` 函数中使用 `getApiUrl()` 构建完整URL
- 在 `streamApiRequest()` 函数中使用 `getApiUrl()` 构建完整URL

**变更示例**:
```typescript
// 之前
const response = await fetch(url, {...});

// 现在
const fullUrl = getApiUrl(url);
const response = await fetch(fullUrl, {...});
```

#### `.env.example`
- 添加后端API配置变量：
  - `NEXT_PUBLIC_BACKEND_URL` - 后端服务地址
  - `NEXT_PUBLIC_BACKEND_TIMEOUT` - 请求超时时间

#### `.env.local`
- 配置实际的后端服务地址：
  ```bash
  NEXT_PUBLIC_BACKEND_URL=http://120.76.142.91:8901
  NEXT_PUBLIC_BACKEND_TIMEOUT=30000
  ```

---

## API 接口映射

所有前端API调用路径已与后端服务对齐，无需修改前端代码：

| 前端调用路径 | HTTP 方法 | 后端接口 | 说明 |
|------------|----------|---------|------|
| `/api/auth/login` | POST | POST /api/auth/login | 用户登录 |
| `/api/auth/register` | POST | POST /api/auth/register | 用户注册 |
| `/api/auth/quota?userId={id}` | GET | GET /api/auth/quota | 查询配额 |
| `/api/tarot/interpret` | POST | POST /api/tarot/interpret | AI塔罗解读（流式） |
| `/api/tarot/history?userId={id}` | GET | GET /api/tarot/history | 解读历史记录 |

---

## 受影响的页面

以下页面的API调用已自动迁移到新后端服务：

1. **登录/注册页面** (`src/app/login/page.tsx`)
   - 登录接口
   - 注册接口

2. **首页** (`src/app/page.tsx`)
   - 配额查询接口
   - AI解读接口（流式）

3. **历史页面** (`src/app/history/page.tsx`)
   - 历史记录查询接口

4. **个人中心** (`src/app/profile/page.tsx`)
   - 配额查询接口

---

## 测试步骤

### 1. 环境变量配置

确保 `.env.local` 文件包含正确的后端配置：
```bash
NEXT_PUBLIC_BACKEND_URL=http://120.76.142.91:8901
NEXT_PUBLIC_BACKEND_TIMEOUT=30000
```

### 2. 启动开发服务器

```bash
coze dev
```

### 3. 测试API接口

#### 测试登录接口
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

#### 测试配额查询
```bash
curl -X GET "http://localhost:5000/api/auth/quota?userId=xxx"
```

#### 测试历史记录查询
```bash
curl -X GET "http://localhost:5000/api/tarot/history?userId=xxx"
```

### 4. 浏览器测试

1. 打开 `http://localhost:5000`
2. 使用演示账号登录（demo@mentobai.com / Demo123!）
3. 测试以下功能：
   - ✅ 登录/注册
   - ✅ 查看配额
   - ✅ 进行塔罗解读
   - ✅ 查看解读历史

---

## 验证清单

在部署到生产环境之前，请验证以下内容：

- [ ] 所有API调用都成功连接到新后端服务
- [ ] 登录和注册功能正常
- [ ] AI解读功能正常，流式输出无问题
- [ ] 配额查询和更新正常
- [ ] 历史记录查询正常
- [ ] 错误处理和提示信息正确
- [ ] 演示账号无限配额功能正常

---

## 故障排查

### 问题1: 无法连接到后端服务

**症状**: 浏览器控制台显示 "网络错误，请检查连接"

**解决方案**:
1. 检查后端服务是否正常运行：`curl http://120.76.142.91:8901/docs`
2. 检查 `.env.local` 中的 `NEXT_PUBLIC_BACKEND_URL` 是否正确
3. 检查防火墙设置，确保允许访问后端服务

### 问题2: API返回 404 错误

**症状**: 特定的API端点返回 404

**解决方案**:
1. 确认后端API路径是否与前端调用路径一致
2. 参考 `http://120.76.142.91:8901/docs#/` 确认正确的API路径

### 问题3: 认证失败

**症状**: API返回 "Unauthorized" 错误

**解决方案**:
1. 检查 `Authorization` header 是否正确设置
2. 确认后端的认证机制（Basic Auth）是否正确配置
3. 查看后端日志确认认证错误的具体原因

### 问题4: 流式响应中断

**症状**: AI解读过程中突然中断

**解决方案**:
1. 检查后端服务的日志，确认是否有错误
2. 增加超时时间：`NEXT_PUBLIC_BACKEND_TIMEOUT=60000`
3. 检查网络连接是否稳定

---

## 回滚方案

如果新后端服务出现问题，可以快速回滚到原有的 Next.js API Routes：

### 步骤1: 恢复配置

注释掉 `.env.local` 中的后端配置：
```bash
# NEXT_PUBLIC_BACKEND_URL=http://120.76.142.91:8901
# NEXT_PUBLIC_BACKEND_TIMEOUT=30000
```

### 步骤2: 恢复 api-client.ts

将 `src/lib/api-client.ts` 恢复到迁移前的版本，移除 `getApiUrl()` 调用。

### 步骤3: 重启服务

```bash
coze dev
```

---

## 生产环境配置

在生产环境中，建议通过环境变量配置后端地址：

```bash
# 在部署平台（Vercel, Netlify, Docker等）中设置环境变量
NEXT_PUBLIC_BACKEND_URL=https://your-backend-production.com
NEXT_PUBLIC_BACKEND_TIMEOUT=30000
```

---

## 注意事项

1. **环境变量前缀**: `NEXT_PUBLIC_` 前缀的环境变量会被暴露到浏览器端，请确保不包含敏感信息。

2. **HTTPS**: 生产环境建议使用 HTTPS 协议连接后端服务。

3. **CORS**: 如果前端和后端不在同一个域名，需要确保后端服务已配置 CORS 允许前端域名的跨域请求。

4. **超时时间**: 根据实际情况调整超时时间，AI解读接口可能需要更长的超时时间。

5. **监控**: 建议添加API调用监控和日志记录，便于排查问题。

---

## 后续优化

1. **API重试机制**: 对于网络错误，可以添加自动重试逻辑。
2. **缓存策略**: 对于不常变化的数据（如牌阵列表），可以添加缓存机制。
3. **错误边界**: 在React组件中添加错误边界，提升用户体验。
4. **性能监控**: 集成性能监控工具，跟踪API响应时间和错误率。

---

## 更新日志

- **2025-01-XX**: 完成后端服务迁移，所有API调用已切换到新后端服务。
