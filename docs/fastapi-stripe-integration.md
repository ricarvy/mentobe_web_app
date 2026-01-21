# FastAPI 后端 Stripe 集成指南

本指南将帮助你在现有的 FastAPI 后端服务中集成 Stripe 支付功能。

## 快速开始（5分钟）

### 步骤 1: 获取 Stripe Secret Key

1. 登录 [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. 找到 **Secret key** 部分
3. 点击 **Reveal** 查看完整密钥
4. 复制密钥（格式：`sk_test_...`）

### 步骤 2: 在后端添加 Stripe API 代码

将 `backend-fastapi-stripe.py` 文件复制到你的后端项目目录：

```bash
# 方式 1: 直接复制到项目
cp backend-fastapi-stripe.py /path/to/your/backend/app/api/stripe.py

# 方式 2: 创建 routes 目录
mkdir -p /path/to/your/backend/routes
cp backend-fastapi-stripe.py /path/to/your/backend/routes/stripe.py
```

### 步骤 3: 在主应用中注册路由

编辑你的 FastAPI 主应用文件（通常是 `main.py` 或 `app.py`）：

```python
from fastapi import FastAPI
from app.api.stripe import router as stripe_router  # 或 from routes.stripe import get_stripe_router

# 创建 FastAPI 应用
app = FastAPI()

# 注册 Stripe 路由
app.include_router(stripe_router)

# 其他路由...
# app.include_router(other_router)
```

### 步骤 4: 配置环境变量

在你的后端服务器配置文件中添加：

```bash
# 编辑环境变量
vi ~/.env  # 或 /etc/environment

# 添加 Stripe Secret Key
export STRIPE_SECRET_KEY=sk_test_你复制的完整密钥

# 可选：配置 Webhook Secret
export STRIPE_WEBHOOK_SECRET=whsec_xxx
```

或者使用 `.env` 文件：

```env
# .env
STRIPE_SECRET_KEY=sk_test_你复制的完整密钥
STRIPE_WEBHOOK_SECRET=whsec_xxx  # 可选
```

### 步骤 5: 安装依赖（如果需要）

```bash
cd /path/to/your/backend
pip install httpx  # 如果还没有安装

# 或者使用 requirements.txt
echo "httpx>=0.25.0" >> requirements.txt
pip install -r requirements.txt
```

### 步骤 6: 重启后端服务

```bash
# 如果使用 systemd
sudo systemctl restart your-backend-service

# 如果使用 PM2
pm2 restart your-app

# 如果直接运行
pkill -f "uvicorn.*main:app"  # 停止
python main.py  # 重新启动
```

### 步骤 7: 验证接口

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
    "url": "https://checkout.stripe.com/c/pay/xxx"
  }
}
```

### 步骤 8: 更新前端配置

编辑 `.env.local`，恢复正确的后端URL：

```env
# 后端API配置
NEXT_PUBLIC_BACKEND_URL=http://120.76.142.91:8901

# 删除临时配置（如果之前添加了）
# STRIPE_SECRET_KEY=...
```

编辑 `src/app/api/stripe/create-checkout-session/route.ts`，恢复使用后端：

```typescript
export async function POST(request: NextRequest) {
  try {
    const body: CreateCheckoutSessionRequest = await request.json();
    const { priceId, userId, userEmail } = body;

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://120.76.142.91:8901';
    const response = await fetch(`${backendUrl}/api/stripe/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId,
        userId,
        userEmail,
        successUrl: stripeConfig.successUrl,
        cancelUrl: stripeConfig.cancelUrl,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      return NextResponse.json({
        success: false,
        error: data.error,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        sessionId: data.data.sessionId,
        publishableKey: stripeConfig.publishableKey,
      },
    });
  } catch (error) {
    // ...
  }
}
```

### 步骤 9: 测试完整流程

1. 刷新前端页面
2. 登录应用
3. 进入定价页面
4. 点击订阅按钮
5. 使用测试卡号：`4242 4242 4242 4242`

---

## 完整集成示例

### 项目结构示例

```
your-backend/
├── main.py              # FastAPI 主应用
├── .env                 # 环境变量
├── requirements.txt     # 依赖
└── app/
    ├── __init__.py
    └── api/
        ├── __init__.py
        └── stripe.py    # Stripe API 代码
```

### main.py 完整示例

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.stripe import router as stripe_router
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 创建 FastAPI 应用
app = FastAPI(
    title="Tarot Backend API",
    version="1.0.0",
    description="塔罗牌应用后端 API"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应限制为具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(stripe_router, prefix="/api")  # stripe_router 已包含 /api/stripe 前缀

# 健康检查
@app.get("/")
async def root():
    return {
        "message": "Tarot Backend API",
        "status": "running",
        "stripe": "configured" if os.getenv("STRIPE_SECRET_KEY") else "not configured"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8901)
```

---

## 高级功能

### 1. 订阅模式（订阅制收费）

将 `backend-fastapi-stripe.py` 中的 `mode` 改为 `"subscription"`：

```python
data={
    "mode": "subscription",  # 改为订阅模式
    "payment_method_types": "card",
    "line_items[0][price]": request.price_id,
    # ...
}
```

**注意**：订阅模式需要在 Stripe Dashboard 中创建循环价格。

### 2. 优惠券功能

添加优惠券参数：

```python
data={
    # ... 其他参数
    "discounts[0][coupon]": "promo_code_xxx",  # 优惠券代码
}
```

### 3. 客户信息收集

添加更多字段：

```python
data={
    # ... 其他参数
    "customer_creation": "always",  # 总是创建客户
    "billing_address_collection": "required",  # 必须填写账单地址
    "shipping_address_collection[allowed_countries][0]": "US",  # 允许的国家
}
```

### 4. 多次支付

创建多个价格项：

```python
data={
    "mode": "payment",
    "line_items[0][price]": "price_xxx_1",
    "line_items[0][quantity]": 1,
    "line_items[1][price]": "price_xxx_2",
    "line_items[1][quantity]": 2,
    # ...
}
```

---

## Webhook 配置

### 步骤 1: 在 Stripe Dashboard 创建 Webhook

1. 进入 **Developers** > **Webhooks**
2. 点击 **Add endpoint**
3. **Endpoint URL**: `http://120.76.142.91:8901/api/stripe/webhook`
4. 选择事件：
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. 点击 **Add endpoint**
6. 复制 **Signing secret**（格式：`whsec_xxx`）

### 步骤 2: 配置环境变量

```bash
export STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### 步骤 3: 安装 Stripe SDK（推荐）

生产环境建议使用 Stripe 官方 SDK 验证 Webhook：

```bash
pip install stripe
```

修改 Webhook 代码：

```python
import stripe

@router.post("/webhook")
async def stripe_webhook(request: Request):
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # 处理事件
    # ...
```

---

## 故障排除

### 问题 1: "STRIPE_SECRET_KEY 未配置或无效"

**原因**：环境变量未设置或格式错误

**解决**：
```bash
# 检查环境变量
echo $STRIPE_SECRET_KEY

# 设置环境变量
export STRIPE_SECRET_KEY=sk_test_xxx

# 验证格式（应以 sk_test_ 或 sk_live_ 开头）
```

### 问题 2: 404 Not Found

**原因**：路由未正确注册

**解决**：
```python
# 确保在 main.py 中注册了路由
from app.api.stripe import router as stripe_router
app.include_router(stripe_router)
```

### 问题 3: "No such price: price_xxx"

**原因**：价格ID无效或不存在

**解决**：
1. 检查 Stripe Dashboard 中的价格
2. 确认价格ID格式：`price_1Sren7GVP93aj81Tr4d18z2S`
3. 确认价格是活跃状态

### 问题 4: CORS 错误

**原因**：后端未配置 CORS

**解决**：
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应限制为具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 问题 5: 超时错误

**原因**：Stripe API 响应慢或网络问题

**解决**：
```python
# 增加超时时间
async with httpx.AsyncClient(timeout=60.0) as client:
    # ...
```

---

## 测试

### 使用 FastAPI 自动文档

启动服务后访问：

- Swagger UI: http://120.76.142.91:8901/docs
- ReDoc: http://120.76.142.91:8901/redoc

### 使用 Python 测试脚本

```python
import requests

url = "http://120.76.142.91:8901/api/stripe/create-checkout-session"
payload = {
    "priceId": "price_1Sren7GVP93aj81Tr4d18z2S",
    "userId": "test-user-123",
    "userEmail": "test@example.com",
    "successUrl": "http://localhost:5000/?payment=success",
    "cancelUrl": "http://localhost:5000/pricing",
}

response = requests.post(url, json=payload)
print(response.json())
```

---

## 生产环境部署清单

- [ ] 使用生产环境的 Secret Key (`sk_live_xxx`)
- [ ] 配置 HTTPS 和真实域名
- [ ] 限制 CORS 允许的来源域名
- [ ] 配置 Webhook 端点
- [ ] 实现支付成功回调处理
- [ ] 添加日志记录和监控
- [ ] 设置支付异常告警
- [ ] 定期审查支付数据
- [ ] 备份交易记录

---

## 相关文档

- [Stripe API 文档](https://docs.stripe.com/api)
- [FastAPI 文档](https://fastapi.tiangolo.com/)
- [Stripe 测试卡号](https://docs.stripe.com/testing)

---

**最后更新**: 2025-01-21
**版本**: 1.0
