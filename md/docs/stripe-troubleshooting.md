# Stripe 支付故障排除指南

## 当前问题

点击订阅按钮后出现错误：`Failed to create checkout session. Please try again.`

## 根本原因

从服务器日志发现：
```
[Backend Proxy Response] { status: 405, ok: false, contentType: 'application/json' }
POST /api/proxy/api/stripe/create-checkout-session?lang=en 405
```

**405 Method Not Allowed** 表示：
- 后端服务 `http://120.76.142.91:8901` 没有实现 Stripe Checkout Session API 接口
- 前端发送的请求被后端服务器拒绝

## 已配置的项

✅ Stripe Publishable Key (pk_test_xxx) - 已配置
✅ Stripe Price IDs (4个价格ID) - 已配置
❌ Stripe Secret Key (sk_test_xxx) - 需要配置
❌ 后端 Stripe API - 需要实现

## 解决方案（3选1）

---

### 方案 A：临时测试（最快，5分钟）

适用于快速测试前端逻辑，绕过后端服务。

#### 步骤 1: 获取 Stripe Secret Key

1. 登录 [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. 找到 **Secret key** 部分
3. 点击 **Reveal** 查看完整密钥
4. 复制密钥（格式：`sk_test_...`）

**⚠️ 重要**：
- Secret Key 和 Publishable Key 是不同的
- Publishable Key 以 `pk_test_` 开头
- Secret Key 以 `sk_test_` 开头

#### 步骤 2: 更新环境变量

编辑 `.env.local` 文件：

```env
STRIPE_SECRET_KEY=sk_test_你复制的完整密钥
```

例如：
```env
STRIPE_SECRET_KEY=sk_test_51SreWwGVP93aj81Tr4d18z2S...
```

#### 步骤 3: 重启开发服务器

```bash
# 按 Ctrl+C 停止服务器
coze dev
```

#### 步骤 4: 测试

1. 刷新浏览器页面
2. 登录应用
3. 进入定价页面
4. 点击订阅按钮
5. 使用测试卡号：`4242 4242 4242 4242`
6. 任意CVC（3位）
7. 任意未来日期（如：12/30）

**预期结果**：跳转到 Stripe Checkout 页面

#### ⚠️ 安全警告

此方案仅用于测试环境！在生产环境中：
- **不要**在前端代码中使用 Secret Key
- **不要**将 Secret Key 提交到 Git 仓库
- **必须**在后端服务器调用 Stripe API

---

### 方案 B：修复后端服务（推荐，生产环境）

适用于生产环境部署，正确的架构设计。

#### 步骤 1: SSH 登录后端服务器

```bash
ssh user@120.76.142.91
```

#### 步骤 2: 配置 Stripe Secret Key

在后端服务器的环境变量中添加：

```bash
# 编辑环境变量文件
vi ~/.env  # 或 /etc/environment

# 添加以下内容
STRIPE_SECRET_KEY=sk_test_你复制的完整密钥
```

#### 步骤 3: 创建 Stripe API 路由

在后端项目中创建文件：`src/api/stripe/create-checkout-session/route.ts`

参考代码：`backend-stripe-api.ts`

#### 步骤 4: 重启后端服务

```bash
# 停止服务
pm2 stop your-app-name  # 或 pkill -f "node.*server"

# 启动服务
pm2 start your-app-name  # 或 npm run dev
```

#### 步骤 5: 验证接口

```bash
curl -X POST http://120.76.142.91:8901/api/stripe/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "priceId": "price_1Sren7GVP93aj81Tr4d18z2S",
    "userId": "test-user-123",
    "userEmail": "test@example.com",
    "successUrl": "http://localhost:5000/?payment=success",
    "cancelUrl": "http://localhost:5000/pricing"
  }'
```

预期响应：
```json
{
  "success": true,
  "data": {
    "sessionId": "cs_test_xxx",
    "url": "https://checkout.stripe.com/..."
  }
}
```

#### 步骤 6: 恢复前端配置

编辑 `.env.local`，移除临时配置：

```env
# 删除或注释掉这一行
# STRIPE_SECRET_KEY=sk_test_xxx
```

#### 详细文档

参考：`docs/backend-stripe-deployment.md`

---

### 方案 C：联系后端团队（如果无法访问后端）

将以下信息发送给后端开发团队：

#### 问题描述

```
前端需要调用后端 Stripe API 接口：
URL: http://120.76.142.91:8901/api/stripe/create-checkout-session
方法: POST
当前状态: 405 Method Not Allowed

需要实现该接口以支持 Stripe 支付功能。
```

#### 技术要求

1. **接口地址**：`/api/stripe/create-checkout-session`
2. **请求方法**：`POST`
3. **请求头**：`Content-Type: application/json`
4. **请求体**：
   ```json
   {
     "priceId": "price_xxx",
     "userId": "user_xxx",
     "userEmail": "user@example.com",
     "successUrl": "https://yourdomain.com/?payment=success",
     "cancelUrl": "https://yourdomain.com/pricing"
   }
   ```
5. **响应格式**：
   ```json
   {
     "success": true,
     "data": {
       "sessionId": "cs_test_xxx",
       "url": "https://checkout.stripe.com/..."
     }
   }
   ```

#### 需要配置

- 环境变量：`STRIPE_SECRET_KEY`
- 从 Stripe Dashboard 获取：https://dashboard.stripe.com/test/apikeys

#### 参考代码

文件：`backend-stripe-api.ts`

---

## 快速诊断命令

### 检查 Stripe Secret Key 是否正确配置

```bash
# 在项目根目录执行
grep STRIPE_SECRET_KEY .env.local
```

预期输出：
```env
STRIPE_SECRET_KEY=sk_test_xxx  # 不是 sk_test_PLACEHOLDER
```

### 检查后端接口是否存在

```bash
curl -X POST http://120.76.142.91:8901/api/stripe/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}'
```

- **405**: 接口未实现 → 使用方案 A 或方案 B
- **200/201**: 接口已实现 → 检查前端配置
- **404**: 路由不存在 → 检查后端路由配置

### 检查 Stripe API 是否可访问

```bash
curl https://api.stripe.com/v1/charges/ch_test_xxx \
  -H "Authorization: Bearer sk_test_PLACEHOLDER"
```

---

## 测试卡号

| 场景 | 卡号 | CVC | 过期日期 |
|-----|------|-----|---------|
| 成功支付 | 4242 4242 4242 4242 | 任意3位 | 任意未来日期 |
| 余额不足 | 4000 0000 0000 9995 | 任意3位 | 任意未来日期 |
| 卡片过期 | 4000 0000 0000 0069 | 任意3位 | 任意未来日期 |

---

## 常见错误

### 错误 1: "STRIPE_SECRET_KEY 未配置或无效"

**原因**：环境变量未配置或使用占位符

**解决**：
```env
# 错误
STRIPE_SECRET_KEY=sk_test_PLACEHOLDER

# 正确
STRIPE_SECRET_KEY=sk_test_51SreWwGVP93aj81Tr4d18z2S...
```

### 错误 2: "No such price: price_xxx"

**原因**：价格ID无效

**解决**：
1. 检查 Stripe Dashboard 中的价格
2. 确认价格ID格式：`price_1Sren7GVP93aj81Tr4d18z2S`
3. 检查价格是否已激活

### 错误 3: "Failed to create checkout session"

**原因**：多种可能（见服务器日志）

**诊断**：
```bash
# 查看日志
tail -n 50 /app/work/logs/bypass/app.log

# 查找错误
grep -i "stripe" /app/work/logs/bypass/app.log | tail -n 20
```

---

## 推荐流程

1. **快速测试**（5分钟）：使用方案 A，验证前端逻辑
2. **问题确认**：确认是后端问题还是配置问题
3. **生产部署**：使用方案 B，修复后端服务
4. **验证完成**：使用测试卡号完整测试支付流程

---

## 支持资源

- [Stripe 测试卡号](https://docs.stripe.com/testing)
- [Stripe API 文档](https://docs.stripe.com/api)
- [Stripe Dashboard](https://dashboard.stripe.com)
- 详细配置指南：`docs/stripe-setup-guide.md`
- 后端部署指南：`docs/backend-stripe-deployment.md`

---

**最后更新**: 2025-01-21
**状态**: ✅ 已创建解决方案
