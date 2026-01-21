# 后端 Stripe API 部署指南

## 问题诊断

当前错误：`405 Method Not Allowed`

**原因**：后端服务 `http://120.76.142.91:8901` 没有实现 Stripe Checkout Session API 接口。

## 解决方案

需要在后端服务中添加 Stripe API 接口。以下是两种部署方式：

---

## 方式 1: 部署到现有后端服务（推荐）

### 步骤 1: 安装 Stripe SDK（可选）

如果后端使用 Node.js，可以安装 Stripe SDK：

```bash
cd /path/to/backend
pnpm add stripe
```

### 步骤 2: 创建 Stripe API 路由

在后端项目中创建文件：`src/api/stripe/create-checkout-session/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { priceId, userId, userEmail, successUrl, cancelUrl } = body;

    // 调用 Stripe API
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        mode: 'payment',
        payment_method_types: 'card',
        line_items: JSON.stringify([{ price: priceId, quantity: 1 }]),
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: userEmail,
        client_reference_id: userId,
        metadata: { userId, userEmail },
      }),
    });

    const stripeData = await stripeResponse.json();

    if (!stripeResponse.ok) {
      return NextResponse.json({
        success: false,
        error: {
          code: stripeData.error?.code,
          message: stripeData.error?.message,
        },
      }, { status: stripeResponse.status });
    }

    return NextResponse.json({
      success: true,
      data: { sessionId: stripeData.id, url: stripeData.url },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { message: '服务器错误' },
    }, { status: 500 });
  }
}
```

### 步骤 3: 配置环境变量

在后端服务的环境变量中添加：

```env
# Stripe Secret Key（仅后端使用）
STRIPE_SECRET_KEY=sk_test_51SreWwGVP93aj81Tr4d18z2S...
```

**⚠️ 重要**：
- 获取 Secret Key 的位置：Stripe Dashboard > Developers > API keys
- 格式：`sk_test_xxx` 或 `sk_live_xxx`
- 不要与 Publishable Key 混淆（pk_test_xxx）

### 步骤 4: 重启后端服务

```bash
# 停止后端服务
pkill -f "node.*server"  # 或使用你的服务管理命令

# 重新启动后端服务
npm run dev  # 或你的启动命令
```

### 步骤 5: 验证接口

使用 curl 测试：

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

---

## 方式 2: 独立部署 Stripe 服务（临时方案）

如果暂时无法修改后端服务，可以独立部署一个 Stripe API 服务。

### 步骤 1: 创建独立服务

```bash
mkdir stripe-service
cd stripe-service
pnpm init
pnpm add @types/node typescript ts-node
```

### 步骤 2: 创建服务代码

创建 `server.ts`：

```typescript
import express from 'express';
import cors from 'cors';
import { NextRequest, NextResponse } from 'next/server';

const app = express();
app.use(cors());
app.use(express.json());

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';

app.post('/api/stripe/create-checkout-session', async (req, res) => {
  try {
    const { priceId, userId, userEmail, successUrl, cancelUrl } = req.body;

    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        mode: 'payment',
        payment_method_types: 'card',
        line_items: JSON.stringify([{ price: priceId, quantity: 1 }]),
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: userEmail,
        client_reference_id: userId,
        metadata: { userId, userEmail },
      }),
    });

    const stripeData = await stripeResponse.json();

    if (!stripeResponse.ok) {
      return res.status(stripeResponse.status).json({
        success: false,
        error: { message: stripeData.error?.message },
      });
    }

    res.json({
      success: true,
      data: { sessionId: stripeData.id, url: stripeData.url },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: '服务器错误' },
    });
  }
});

app.listen(8902, () => {
  console.log('Stripe service running on port 8902');
});
```

### 步骤 3: 启动服务

```bash
STRIPE_SECRET_KEY=sk_test_xxx ts-node server.ts
```

### 步骤 4: 更新前端配置

修改 `.env.local`：

```env
NEXT_PUBLIC_BACKEND_URL=http://120.76.142.91:8902
```

---

## 方式 3: 使用 Stripe CLI（测试环境）

### 安装 Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Linux
curl -s https://packages.stripe.dev/api/security/gpg/public/signing.gpg | sudo gpg --dearmor -o /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt update
sudo apt install stripe

# Windows
# 下载 https://stripe.com/docs/stripe-cli#install
```

### 登录 Stripe

```bash
stripe login
```

### 转发 Stripe Webhook

```bash
stripe listen --forward-to http://120.76.142.91:8901/api/stripe/webhook
```

---

## 快速诊断命令

### 检查后端是否实现接口

```bash
curl -X POST http://120.76.142.91:8901/api/stripe/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

- **405**: 接口未实现
- **200/201**: 接口已实现
- **404**: 路由不存在
- **500**: 服务器错误

### 检查环境变量

```bash
# SSH 登录到后端服务器
ssh user@120.76.142.91

# 检查环境变量
echo $STRIPE_SECRET_KEY

# 或查看配置文件
cat /etc/environment
cat ~/.env
cat ~/backend/.env
```

---

## 常见错误

### 错误 1: 405 Method Not Allowed

**原因**：后端没有实现该接口

**解决**：按照方式1添加 Stripe API 路由

### 错误 2: 401 Unauthorized

**原因**：Stripe Secret Key 无效或未配置

**解决**：
1. 检查 `STRIPE_SECRET_KEY` 环境变量
2. 确认 Key 格式正确（`sk_test_xxx`）
3. 去除 `sk_xxx` 占位符

### 错误 3: 400 Bad Request - Price not found

**原因**：价格ID无效或已删除

**解决**：
1. 检查 Stripe Dashboard 中的价格
2. 确认价格ID正确
3. 检查价格是否已激活

### 错误 4: Connection timeout

**原因**：无法访问 Stripe API

**解决**：
1. 检查网络连接
2. 检查防火墙设置
3. 确认 Stripe API 可访问：`curl https://api.stripe.com`

---

## 生产环境部署清单

- [ ] 使用生产环境的 Secret Key (`sk_live_xxx`)
- [ ] 配置真实的域名和 HTTPS
- [ ] 设置 Webhook 端点
- [ ] 配置 Webhook Secret
- [ ] 实现支付成功回调处理
- [ ] 添加日志记录和监控
- [ ] 设置支付告警
- [ ] 定期审查支付数据

---

## 联系后端开发团队

将此文档发送给后端开发团队，要求：

1. 在后端服务中实现 `/api/stripe/create-checkout-session` 接口
2. 配置 `STRIPE_SECRET_KEY` 环境变量
3. 重启后端服务
4. 验证接口可用性

**参考代码**：`backend-stripe-api.ts`
