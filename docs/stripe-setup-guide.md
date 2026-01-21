# Stripe 支付配置指南

本文档将指导您如何配置Stripe支付系统，包括创建产品和价格、获取必要的ID以及配置环境变量。

## 前提条件

1. 已注册Stripe账户：https://dashboard.stripe.com/register
2. 已有Stripe账户的访问权限

## 步骤1: 获取 API 密钥

1. 登录 [Stripe Dashboard](https://dashboard.stripe.com)
2. 进入 **Developers** > **API keys**
3. 复制 **Publishable key** (格式：`pk_test_xxx` 或 `pk_live_xxx`)
   - 测试环境：`pk_test_...`
   - 生产环境：`pk_live_...`
4. 复制 **Secret key** (格式：`sk_test_xxx` 或 `sk_live_xxx`)
   - **⚠️ 重要**：Secret key 仅用于后端服务器，不要暴露在前端代码中

## 步骤2: 创建产品和价格

### 创建产品

1. 进入 **Products** > **Add product**
2. 填写产品信息：

#### Product 1: Pro Plan (Pro计划)
- **Name**: `Pro Plan`
- **Description**: `Unlock unlimited tarot readings with AI-powered insights`
- **Image**: (可选，上传产品图片)

#### Product 2: Premium Plan (Premium计划)
- **Name**: `Premium Plan`
- **Description**: `Ultimate tarot experience with advanced features`
- **Image**: (可选，上传产品图片)

### 创建价格 (Price)

#### Pro Plan 价格

**价格 1: Pro Monthly**
1. 在产品页面点击 **Add pricing**
2. 配置：
   - **Pricing model**: `Standard`
   - **Price**: `9.90` (美元)
   - **Currency**: `USD`
   - **Interval**: `Monthly`
   - **Trial days**: 留空
3. 点击 **Add price**
4. **复制生成的 Price ID** (格式：`price_xxx`)

**价格 2: Pro Yearly**
1. 再次点击 **Add pricing**
2. 配置：
   - **Pricing model**: `Standard`
   - **Price**: `79.00` (美元)
   - **Currency**: `USD`
   - **Interval**: `Yearly`
   - **Trial days**: 留空
3. 点击 **Add price**
4. **复制生成的 Price ID** (格式：`price_xxx`)

#### Premium Plan 价格

**价格 3: Premium Monthly**
1. 进入 Premium 产品页面
2. 点击 **Add pricing**
3. 配置：
   - **Pricing model**: `Standard`
   - **Price**: `19.90` (美元)
   - **Currency**: `USD`
   - **Interval**: `Monthly`
   - **Trial days**: 留空
4. 点击 **Add price**
5. **复制生成的 Price ID** (格式：`price_xxx`)

**价格 4: Premium Yearly**
1. 再次点击 **Add pricing**
2. 配置：
   - **Pricing model**: `Standard`
   - **Price**: `169.00` (美元)
   - **Currency**: `USD`
   - **Interval**: `Yearly`
   - **Trial days**: 留空
3. 点击 **Add price**
4. **复制生成的 Price ID** (格式：`price_xxx`)

## 步骤3: 配置 Webhook (可选但推荐)

如果需要在支付成功后自动更新用户配额，需要配置Webhook：

1. 进入 **Developers** > **Webhooks**
2. 点击 **Add endpoint**
3. **Endpoint URL**: `http://120.76.142.91:8901/api/stripe/webhook`
4. 选择事件：
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
5. 点击 **Add endpoint**
6. 复制 **Webhook Secret** (格式：`whsec_xxx`)

## 步骤4: 更新环境变量

编辑 `.env.local` 文件，将占位符替换为真实值：

```env
# Stripe 支付配置
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SreWwGVP93aj81TJkYvK7toYtWtCmGxz58QC1NvFfkB9rKXTwIFBhuZoL1keepUcsMfDxh8b73fB86tZYGSFIic00HKMxDpJW
NEXT_PUBLIC_STRIPE_ENVIRONMENT=test

# 替换为真实的价格ID (从Stripe Dashboard复制)
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=price_1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY=price_1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY=price_1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY=price_1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Webhook Secret (如果配置了Webhook)
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 后端环境变量 (如果后端独立部署)

在后端服务器的环境变量或配置文件中添加：

```env
# Stripe Secret Key (仅后端使用)
STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## 步骤5: 测试支付流程

### 使用测试卡号

Stripe提供测试卡号用于测试：

| 卡号类型 | 卡号 | CVC | 过期日期 | 描述 |
|---------|------|-----|---------|------|
| 成功支付 | 4242 4242 4242 4242 | 任意3位 | 任意未来日期 | 支付成功 |
| 余额不足 | 4000 0000 0000 9995 | 任意3位 | 任意未来日期 | 余额不足 |
| 银行卡过期 | 4000 0000 0000 0069 | 任意3位 | 任意未来日期 | 卡片过期 |

### 测试步骤

1. 确保已完成以上所有配置
2. 重启开发服务器：`coze dev`
3. 登录应用
4. 进入定价页面
5. 选择一个计划
6. 点击订阅按钮
7. 使用测试卡号 `4242 4242 4242 4242` 完成支付
8. 验证支付成功后的回调

## 常见问题

### Q1: 为什么出现 "Failed to create checkout session" 错误？

**A**: 通常是因为：
1. 价格ID未配置或配置错误（检查是否还有 `price_xxx` 占位符）
2. Stripe Secret Key 未配置或无效
3. 网络连接问题（后端服务无法访问Stripe API）

### Q2: 如何切换到生产环境？

**A**:
1. 获取生产环境的 Publishable Key 和 Secret Key
2. 使用生产环境的 Stripe Dashboard 创建产品和价格
3. 更新 `NEXT_PUBLIC_STRIPE_ENVIRONMENT=production`
4. 更新所有价格ID为生产环境的ID
5. 配置真实的 Webhook URL

### Q3: 为什么价格显示美元而不是本地货币？

**A**: 当前实现是基于美元创建的价格。如需支持多货币，需要在Stripe为每个价格创建多货币版本，或使用Stripe的动态定价功能。

### Q4: 如何验证配置是否正确？

**A**:
1. 检查环境变量中没有 `price_xxx` 占位符
2. 使用 Stripe CLI 测试：`stripe products list`
3. 查看浏览器控制台是否有错误信息
4. 检查后端日志中的错误信息

### Q5: 支付成功后用户配额未更新？

**A**:
1. 检查 Webhook 是否正确配置
2. 检查 Webhook Secret 是否正确
3. 检查后端服务是否正常接收 Webhook 请求
4. 查看后端日志中的 Webhook 处理信息

## 价格建议

根据市场需求和竞品分析，建议价格如下：

| 计划 | 月付 (USD) | 年付 (USD) | 年付折扣 | 每月实际 |
|------|-----------|-----------|---------|---------|
| Free | $0 | - | - | - |
| Pro | $9.90 | $79.00 | 33% | $6.58 |
| Premium | $19.90 | $169.00 | 29% | $14.08 |

## 支持与文档

- [Stripe 官方文档](https://docs.stripe.com/)
- [Stripe Checkout 文档](https://docs.stripe.com/payments/checkout)
- [Stripe 测试模式](https://docs.stripe.com/testing)
- [Stripe Pricing](https://stripe.com/pricing)

## 安全建议

1. **永远不要在前端代码中使用 Secret Key**
2. **定期轮换 API 密钥**
3. **使用环境变量管理敏感信息**
4. **启用 Stripe Dashboard 的双重认证**
5. **监控支付活动，设置异常告警**
6. **定期审查产品和价格配置**

---

**更新日期**: 2025-01-20
**版本**: 1.0
