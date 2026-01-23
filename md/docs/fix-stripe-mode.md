# Stripe API Mode 修复指南

## 问题说明

错误信息：
```
You specified `payment` mode but passed a recurring price. Either switch to `subscription` mode or use only one-time prices.
```

**原因**：后端代码使用了 `payment` 模式，但传入的是 recurring（订阅）价格。

## 解决方案

将 Stripe Checkout Session 的 mode 从 `payment` 改为 `subscription`。

## 修复步骤

### 1. 在后端服务器上修改代码

找到后端项目的 Stripe API 路由文件（通常是 `routes/stripe.py` 或 `app/api/stripe.py`），找到创建 Checkout Session 的代码：

**修改前：**
```python
data={
    "mode": "payment",  # 一次性支付模式
    "payment_method_types": "card",
    ...
}
```

**修改后：**
```python
data={
    "mode": "subscription",  # 订阅支付模式
    "payment_method_types": "card",
    ...
}
```

### 2. 使用修复后的代码

已修复的代码在 `backend-fastapi-stripe.py` 文件中，关键修改如下：

```python
async with httpx.AsyncClient() as client:
    stripe_response = await client.post(
        f"{STRIPE_API_BASE}/v1/checkout/sessions",
        headers={
            "Authorization": f"Bearer {STRIPE_SECRET_KEY}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        data={
            "mode": "subscription",  # 订阅支付模式（修复点）
            "payment_method_types": "card",
            "line_items[0][price]": request.price_id,
            "line_items[0][quantity]": 1,
            "success_url": request.success_url,
            "cancel_url": request.cancel_url,
            "customer_email": request.user_email,
            "client_reference_id": request.user_id,
            "metadata[userId]": request.user_id,
            "metadata[userEmail]": request.user_email,
        },
        timeout=30.0,
    )
```

### 3. 重启后端服务

修改代码后，需要重启后端服务使更改生效：

```bash
# 在后端服务器上
cd /path/to/backend
# 重启 FastAPI 服务
```

### 4. 测试支付流程

1. 访问前端 Pricing 页面
2. 选择一个订阅计划（Pro 或 Premium）
3. 点击"Subscribe Now"按钮
4. 应该能正常跳转到 Stripe Checkout 页面

## Stripe 模式说明

### Payment 模式
- 用于一次性支付
- 适用于：单次购买、一次性服务
- 价格类型：一次性价格（`recurring=None`）

### Subscription 模式
- 用于周期性订阅
- 适用于：月度/年度订阅
- 价格类型：重复价格（`recurring=interval`）

## 当前项目使用的价格

当前项目使用的是 **Subscription 模式**：
- Pro Monthly: `$9.9/month`
- Pro Yearly: `$79/year`
- Premium Monthly: `$19.9/month`
- Premium Yearly: `$169/year`

因此 **必须使用 `subscription` 模式**。

## 验证修复

修复后，支付流程应该正常工作：
1. 用户点击订阅按钮
2. 后端创建 Stripe Checkout Session（mode=subscription）
3. 用户跳转到 Stripe Checkout 页面完成支付
4. 支付成功后跳转到 `/success` 页面
5. 支付取消后跳转到 `/cancel` 页面

## 相关文件

- `backend-fastapi-stripe.py` - 修复后的后端代码
- `src/app/pricing/page.tsx` - 前端定价页面
- `src/app/success/page.tsx` - 支付成功页面
- `src/app/cancel/page.tsx` - 支付取消页面
