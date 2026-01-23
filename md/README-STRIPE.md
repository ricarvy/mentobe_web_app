# FastAPI Stripe 支付集成 - 完整部署指南

## 📋 概述

本项目为塔罗牌应用集成了 Stripe 支付功能，使用 FastAPI 后端实现。

## ✅ 已完成的工作

### 1. 后端 API 实现

- **文件**: `backend-fastapi-stripe.py`
- **功能**:
  - 创建 Stripe Checkout Session
  - 支持 POST `/api/stripe/create-checkout-session` 接口
  - 完整的错误处理和日志记录
  - 可选的 Webhook 支持

### 2. 前端代码恢复

- **文件**: `src/app/api/stripe/create-checkout-session/route.ts`
- **状态**: 已恢复调用后端 API（不再直接调用 Stripe）

### 3. 配置文件更新

- **文件**: `.env.local`
- **状态**: 已移除临时配置，使用正确的后端 URL

### 4. 文档创建

- `docs/fastapi-stripe-integration.md` - 完整集成指南
- `docs/stripe-troubleshooting.md` - 故障排除指南
- `docs/stripe-setup-guide.md` - Stripe 配置指南

### 5. 辅助工具

- `deploy-stripe.sh` - 自动部署脚本
- `test-stripe-api.py` - API 测试脚本

---

## 🚀 快速部署（5分钟）

### 前提条件

- ✅ 后端服务运行在 `http://120.76.142.91:8901`
- ✅ FastAPI 项目已搭建
- ✅ 已从 Stripe Dashboard 获取 Secret Key

### 步骤 1: 获取 Stripe Secret Key

1. 访问 [Stripe Dashboard > API Keys](https://dashboard.stripe.com/test/apikeys)
2. 复制 **Secret key**（格式：`sk_test_...`）
3. 保存密钥

### 步骤 2: 复制代码到后端项目

```bash
# 假设后端项目在 /path/to/backend
cp backend-fastapi-stripe.py /path/to/backend/app/api/stripe.py
```

### 步骤 3: 注册路由

编辑后端的 `main.py`：

```python
from fastapi import FastAPI
from app.api.stripe import router as stripe_router

app = FastAPI()

# 注册 Stripe 路由
app.include_router(stripe_router)
```

### 步骤 4: 配置环境变量

在后端服务器设置环境变量：

```bash
export STRIPE_SECRET_KEY=sk_test_你复制的完整密钥
```

或在 `.env` 文件中：

```env
STRIPE_SECRET_KEY=sk_test_你复制的完整密钥
```

### 步骤 5: 安装依赖

```bash
cd /path/to/backend
pip install httpx
```

### 步骤 6: 重启后端服务

```bash
pm2 restart your-app
# 或
sudo systemctl restart your-backend
```

### 步骤 7: 测试 API

```bash
python test-stripe-api.py
```

预期输出：

```
✓ 后端服务正常运行
✓ Stripe API 测试成功！
✓ Session ID: cs_test_xxx
✓ Checkout URL: https://checkout.stripe.com/...
```

### 步骤 8: 测试前端

1. 刷新浏览器
2. 登录应用
3. 进入定价页面
4. 点击订阅按钮
5. 使用测试卡号：`4242 4242 4242 4242`

---

## 📁 文件结构

```
project/
├── backend-fastapi-stripe.py          # FastAPI Stripe API 代码
├── deploy-stripe.sh                   # 自动部署脚本
├── test-stripe-api.py                 # API 测试脚本
├── docs/
│   ├── fastapi-stripe-integration.md  # 完整集成指南
│   ├── stripe-troubleshooting.md      # 故障排除指南
│   └── stripe-setup-guide.md          # Stripe 配置指南
└── src/
    └── app/
        └── api/
            └── stripe/
                └── create-checkout-session/
                    └── route.ts       # Next.js API 路由（已恢复）
```

---

## 🔍 故障排除

### 问题 1: 405 Method Not Allowed

**原因**: 后端未实现 Stripe API

**解决**: 按照"快速部署"步骤操作

### 问题 2: "STRIPE_SECRET_KEY 未配置"

**原因**: 环境变量未设置

**解决**:
```bash
export STRIPE_SECRET_KEY=sk_test_xxx
```

### 问题 3: "No such price: price_xxx"

**原因**: 价格ID无效

**解决**:
1. 检查 Stripe Dashboard
2. 确认价格ID格式正确
3. 检查价格是否已激活

### 问题 4: "连接超时"

**原因**: 网络问题或 Stripe API 慢

**解决**:
1. 检查网络连接
2. 增加超时时间
3. 检查防火墙设置

---

## 📝 API 文档

### 创建支付会话

**URL**: `POST /api/stripe/create-checkout-session`

**请求头**:
```
Content-Type: application/json
```

**请求体**:
```json
{
  "priceId": "price_1Sren7GVP93aj81Tr4d18z2S",
  "userId": "user-123",
  "userEmail": "user@example.com",
  "successUrl": "https://yourdomain.com/?payment=success",
  "cancelUrl": "https://yourdomain.com/pricing"
}
```

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "sessionId": "cs_test_xxx",
    "url": "https://checkout.stripe.com/c/pay/xxx"
  }
}
```

**错误响应** (400/500):
```json
{
  "success": false,
  "error": {
    "code": "STRIPE_API_ERROR",
    "message": "No such price: price_xxx",
    "details": {...}
  }
}
```

---

## 🧪 测试卡号

| 场景 | 卡号 | CVC | 过期日期 |
|-----|------|-----|---------|
| 成功支付 | 4242 4242 4242 4242 | 任意3位 | 任意未来日期 |
| 余额不足 | 4000 0000 0000 9995 | 任意3位 | 任意未来日期 |
| 卡片过期 | 4000 0000 0000 0069 | 任意3位 | 任意未来日期 |

---

## 🔐 安全提示

### ⚠️ 重要安全警告

1. **不要在前端使用 Secret Key**
   - Secret Key (sk_test_xxx) 仅用于后端
   - Publishable Key (pk_test_xxx) 用于前端

2. **不要提交密钥到 Git**
   - 使用 `.gitignore` 忽略 `.env` 文件
   - 使用环境变量管理密钥

3. **生产环境**
   - 使用 `sk_live_xxx` 而非 `sk_test_xxx`
   - 配置 HTTPS
   - 限制 CORS 允许的域名
   - 启用 Webhook 验证

---

## 📚 相关文档

- [Stripe API 文档](https://docs.stripe.com/api)
- [FastAPI 文档](https://fastapi.tiangolo.com/)
- [Stripe 测试卡号](https://docs.stripe.com/testing)
- [Stripe Dashboard](https://dashboard.stripe.com)

---

## 🎯 下一步

### 立即执行

1. ✅ 获取 Stripe Secret Key
2. ✅ 复制后端代码
3. ✅ 注册路由
4. ✅ 配置环境变量
5. ✅ 重启服务
6. ✅ 测试 API
7. ✅ 测试前端

### 后续优化（可选）

1. **实现 Webhook**
   - 支付成功回调
   - 自动更新用户配额
   - 发送确认邮件

2. **订阅模式**
   - 改为 `mode: "subscription"`
   - 支持月付/年付
   - 自动续费

3. **优惠券系统**
   - 创建优惠券
   - 支持折扣码

4. **高级功能**
   - 客户信息收集
   - 多次支付
   - 定期报告

---

## 🆘 获取帮助

如果遇到问题：

1. 查看 `docs/stripe-troubleshooting.md`
2. 查看 `docs/fastapi-stripe-integration.md`
3. 运行 `python test-stripe-api.py` 诊断
4. 检查后端日志

---

## ✨ 总结

你现在拥有：

- ✅ 完整的 FastAPI Stripe API 实现
- ✅ 自动化部署脚本
- ✅ API 测试工具
- ✅ 详细的文档和指南

只需完成 8 个步骤，即可在 5 分钟内部署完整的支付功能！

---

**最后更新**: 2025-01-21
**版本**: 2.0 (FastAPI Edition)
