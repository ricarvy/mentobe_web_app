#!/bin/bash

# FastAPI Stripe API 快速部署脚本
# 使用方法: bash deploy-stripe.sh

set -e

echo "=========================================="
echo "FastAPI Stripe API 部署脚本"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查参数
if [ -z "$STRIPE_SECRET_KEY" ]; then
    echo -e "${YELLOW}提示: 请先设置 STRIPE_SECRET_KEY 环境变量${NC}"
    echo ""
    echo "示例:"
    echo "  export STRIPE_SECRET_KEY=sk_test_xxx"
    echo "  bash deploy-stripe.sh"
    echo ""
    exit 1
fi

echo "✓ Stripe Secret Key 已配置"
echo ""

# 检查后端项目目录
BACKEND_DIR=${BACKEND_DIR:-"/path/to/your/backend"}

if [ "$BACKEND_DIR" = "/path/to/your/backend" ]; then
    echo -e "${YELLOW}提示: 请设置后端项目目录${NC}"
    echo ""
    echo "示例:"
    echo "  export BACKEND_DIR=/home/user/tarot-backend"
    echo "  bash deploy-stripe.sh"
    echo ""
    exit 1
fi

echo "✓ 后端目录: $BACKEND_DIR"
echo ""

# 复制 Stripe API 代码
echo "步骤 1: 复制 Stripe API 代码..."
if [ -f "backend-fastapi-stripe.py" ]; then
    cp backend-fastapi-stripe.py "$BACKEND_DIR/app/api/stripe.py"
    echo -e "${GREEN}✓ 代码已复制${NC}"
else
    echo -e "${RED}✗ 错误: 找不到 backend-fastapi-stripe.py${NC}"
    exit 1
fi
echo ""

# 检查是否已安装 httpx
echo "步骤 2: 检查依赖..."
cd "$BACKEND_DIR"
if ! python -c "import httpx" 2>/dev/null; then
    echo "安装 httpx..."
    pip install httpx
    echo -e "${GREEN}✓ httpx 已安装${NC}"
else
    echo -e "${GREEN}✓ httpx 已安装${NC}"
fi
echo ""

# 创建 .env 文件（如果不存在）
echo "步骤 3: 配置环境变量..."
if [ ! -f "$BACKEND_DIR/.env" ]; then
    touch "$BACKEND_DIR/.env"
fi

# 检查 .env 中是否有 STRIPE_SECRET_KEY
if ! grep -q "STRIPE_SECRET_KEY" "$BACKEND_DIR/.env"; then
    echo "STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY" >> "$BACKEND_DIR/.env"
    echo -e "${GREEN}✓ STRIPE_SECRET_KEY 已添加到 .env${NC}"
else
    echo -e "${GREEN}✓ STRIPE_SECRET_KEY 已存在于 .env${NC}"
fi
echo ""

# 检查主应用文件
echo "步骤 4: 检查主应用配置..."
MAIN_FILE="$BACKEND_DIR/main.py"
if [ -f "$MAIN_FILE" ]; then
    # 检查是否已注册 Stripe 路由
    if ! grep -q "from app.api.stripe import" "$MAIN_FILE"; then
        echo -e "${YELLOW}提示: 需要在 main.py 中注册 Stripe 路由${NC}"
        echo ""
        echo "请在 $MAIN_FILE 中添加以下代码:"
        echo ""
        echo "from app.api.stripe import router as stripe_router"
        echo ""
        echo "# 在创建应用后注册路由"
        echo "app.include_router(stripe_router)"
        echo ""
        read -p "按回车键继续..."
    else
        echo -e "${GREEN}✓ Stripe 路由已注册${NC}"
    fi
else
    echo -e "${RED}✗ 错误: 找不到 main.py${NC}"
    echo "请确认后端目录正确"
    exit 1
fi
echo ""

# 重启后端服务
echo "步骤 5: 重启后端服务..."
echo "请手动重启后端服务:"
echo ""
echo "  pm2 restart your-app-name"
echo "  或"
echo "  sudo systemctl restart your-backend-service"
echo ""
read -p "重启完成后按回车键继续..."
echo ""

# 测试接口
echo "步骤 6: 测试 Stripe API..."
echo "发送测试请求..."

TEST_RESPONSE=$(curl -s -X POST http://120.76.142.91:8901/api/stripe/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "priceId": "price_1Sren7GVP93aj81Tr4d18z2S",
    "userId": "test-user-123",
    "userEmail": "test@example.com",
    "successUrl": "http://localhost:5000/?payment=success",
    "cancelUrl": "http://localhost:5000/pricing"
  }')

if echo "$TEST_RESPONSE" | grep -q "success.*true"; then
    echo -e "${GREEN}✓ 接口测试成功！${NC}"
    echo ""
    echo "响应:"
    echo "$TEST_RESPONSE" | python -m json.tool
else
    echo -e "${RED}✗ 接口测试失败${NC}"
    echo ""
    echo "响应:"
    echo "$TEST_RESPONSE"
    echo ""
    echo "请检查:"
    echo "  1. 后端服务是否正常运行"
    echo "  2. STRIPE_SECRET_KEY 是否正确"
    echo "  3. 价格ID是否有效"
    exit 1
fi
echo ""

echo "=========================================="
echo -e "${GREEN}部署完成！${NC}"
echo "=========================================="
echo ""
echo "下一步:"
echo "  1. 刷新前端页面"
echo "  2. 进入定价页面"
echo "  3. 点击订阅按钮"
echo "  4. 使用测试卡号: 4242 4242 4242 4242"
echo ""
