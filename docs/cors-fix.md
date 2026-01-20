# CORS 修复说明

## 问题
前端直接请求后端服务时遇到 CORS 跨域限制，导致网络错误。

## 解决方案
创建 Next.js API Route 作为代理，绕过浏览器的跨域限制。

## 修改文件

### 1. 新增代理路由
**文件**: `src/app/api/proxy/[...path]/route.ts`

将前端请求转发到后端服务，支持所有 HTTP 方法（GET, POST, PUT, DELETE）。

### 2. 更新后端配置
**文件**: `src/config/backend.ts`

将 `baseURL` 从直接的后端地址改为本地代理路径：
```typescript
export const backendConfig: BackendConfig = {
  baseURL: '/api/proxy',  // 使用本地代理绕过 CORS 限制
  timeout: 30000,
};
```

### 3. 添加调试日志
**文件**: `src/lib/api-client.ts`

在请求前后添加详细的控制台日志，便于调试网络问题。

## 验证

### 登录测试
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"email":"demo@mentobai.com","password":"Demo123!"}' \
  http://localhost:5000/api/proxy/api/auth/login
```

### 配额查询测试
```bash
curl http://localhost:5000/api/proxy/api/auth/quota \
  -H "Authorization: Basic $(echo -n 'demo@mentobai.com:Demo123!' | base64)"
```

## 后续优化
- 考虑在生产环境中配置后端服务的 CORS，移除代理层
- 添加代理请求的缓存机制
- 添加代理请求的错误重试逻辑
