#!/bin/bash

# ============================================
# Mentob AI - 海外 Docker 快速部署脚本
# ============================================
# 使用环境变量: .env.oversea.prod
# 部署端口: 8899
# 适用于海外服务器部署

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 配置
CONTAINER_NAME="mentob-ai-oversea"
IMAGE_NAME="mentob-ai:oversea"
PORT=8899
ENV_FILE=".env.oversea.prod"

# 打印信息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_oversea() {
    echo -e "${CYAN}[OVERSEA]${NC} $1"
}

# 检查 Docker 是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    print_success "Docker 已安装: $(docker --version)"
}

# 检查环境变量文件
check_env_file() {
    if [ ! -f "$ENV_FILE" ]; then
        print_error "环境变量文件 $ENV_FILE 不存在"
        print_info "正在创建海外版环境变量文件..."
        cat > "$ENV_FILE" << 'EOF'
# ============================================
# Mentob AI 海外生产环境配置
# ============================================
APP_NAME=Mentob AI
APP_DESCRIPTION=AI-Powered Tarot Readings
APP_URL=https://www.mentobai.com
APP_VERSION=1.0.0

# 后端API配置
NEXT_PUBLIC_BACKEND_URL=http://120.76.142.91:8901
NEXT_PUBLIC_BACKEND_TIMEOUT=60000

# 功能开关
AI_INTERPRETATION_ENABLED=true
SOCIAL_LOGIN_GOOGLE=true
SOCIAL_LOGIN_APPLE=true

# 演示账号配置
DEMO_ACCOUNT_ENABLED=true
DEMO_ACCOUNT_EMAIL=demo@mentobai.com
DEMO_ACCOUNT_PASSWORD=Demo123!

# 限额配置
DAILY_QUOTA_FREE=3
DAILY_QUOTA_PAID=999
MAX_QUESTION_LENGTH=500
MAX_CARDS_PER_READING=10
HISTORY_LIMIT=50

# LLM 配置
LLM_MODEL=doubao-seed-1-6-thinking-250715
LLM_TEMPERATURE=0.8
LLM_MAX_TOKENS=
LLM_THINKING=enabled

# Stripe 支付配置（海外版）
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=price_xxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY=price_xxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY=price_xxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY=price_xxxxxxxxxxxxxx
EOF
        print_warning "已创建 $ENV_FILE 文件"
        print_warning "请编辑该文件并配置必要的海外环境变量"
        print_info "完成后重新运行此脚本"
        exit 1
    fi
    print_success "环境变量文件存在: $ENV_FILE"
}

# 显示配置信息
show_config() {
    echo ""
    echo "=================================="
    print_oversea "海外部署配置"
    echo "=================================="
    echo "容器名称: $CONTAINER_NAME"
    echo "镜像名称: $IMAGE_NAME"
    echo "部署端口: $PORT"
    echo "环境变量文件: $ENV_FILE"
    echo "部署类型: 海外版"
    echo "=================================="
    echo ""
}

# 确认部署
confirm_deploy() {
    read -p "$(echo -e ${YELLOW}确认开始海外部署？[y/N]: ${NC})" -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "部署已取消"
        exit 0
    fi
}

# 停止并删除旧容器
stop_old_container() {
    print_info "检查旧容器..."
    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        print_info "停止旧容器..."
        docker stop "$CONTAINER_NAME" 2>/dev/null || true
        docker rm "$CONTAINER_NAME" 2>/dev/null || true
        print_success "旧容器已删除"
    else
        print_info "未找到旧容器，跳过"
    fi
}

# 构建镜像
build_image() {
    print_info "开始构建海外版 Docker 镜像..."
    print_info "这可能需要 5-10 分钟，请耐心等待..."

    docker build -t "$IMAGE_NAME" .

    if [ $? -eq 0 ]; then
        print_success "海外版镜像构建成功"
    else
        print_error "镜像构建失败"
        print_info "尝试清理缓存后重新构建..."
        docker builder prune -f
        print_info "请重新运行此脚本"
        exit 1
    fi
}

# 运行容器
run_container() {
    print_info "启动海外版容器..."

    docker run -d \
        --name "$CONTAINER_NAME" \
        -p "$PORT:$PORT" \
        --restart unless-stopped \
        -e NODE_ENV=production \
        -v "$(pwd)/logs:/app/logs" \
        -v "$(pwd)/data:/app/data" \
        --memory="2g" \
        --cpus="2.0" \
        "$IMAGE_NAME"

    if [ $? -eq 0 ]; then
        print_success "海外版容器启动成功"
    else
        print_error "容器启动失败"
        print_info "查看日志: docker logs $CONTAINER_NAME"
        exit 1
    fi
}

# 检查容器状态
check_container_status() {
    print_info "等待容器启动..."
    sleep 5

    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        print_success "容器正在运行"
        print_info "容器状态:"
        docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    else
        print_error "容器未运行"
        print_info "查看日志:"
        docker logs "$CONTAINER_NAME"
        exit 1
    fi
}

# 健康检查
health_check() {
    print_info "执行健康检查..."
    sleep 10

    # 检查容器健康状态
    health_status=$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER_NAME" 2>/dev/null || echo "none")

    if [ "$health_status" = "healthy" ]; then
        print_success "容器健康检查通过"
    elif [ "$health_status" = "starting" ]; then
        print_warning "容器正在启动中，请稍后访问"
    else
        print_warning "健康检查状态: $health_status"
    fi

    # 测试 HTTP 连接
    if curl -f -s -o /dev/null "http://localhost:$PORT" 2>/dev/null; then
        print_success "HTTP 服务响应正常"
    else
        print_warning "HTTP 服务暂未响应，请稍后检查"
    fi
}

# 显示访问信息
show_access_info() {
    echo ""
    echo "=================================="
    print_success "海外部署完成！"
    echo "=================================="
    echo ""
    print_oversea "访问信息:"
    echo "  - 本地: http://localhost:$PORT"
    echo "  - 局域网: http://$(hostname -I 2>/dev/null | awk '{print $1}'):$PORT"
    echo "  - 域名: 请在 $ENV_FILE 中配置您的海外域名"
    echo ""
    print_oversea "常用命令:"
    echo "  - 查看日志: docker logs -f $CONTAINER_NAME"
    echo "  - 停止容器: docker stop $CONTAINER_NAME"
    echo "  - 重启容器: docker restart $CONTAINER_NAME"
    echo "  - 删除容器: docker rm -f $CONTAINER_NAME"
    echo ""
    print_oversea "更新应用:"
    echo "  1. git pull origin main"
    echo "  2. docker stop $CONTAINER_NAME && docker rm $CONTAINER_NAME"
    echo "  3. docker build -t $IMAGE_NAME ."
    echo "  4. ./deploy_oversea.sh"
    echo ""
    print_info "如需查看详细文档，请参考: DOCKER_DEPLOYMENT.md"
    echo ""
    print_warning "注意事项:"
    echo "  - 请确保已配置海外 Stripe 支付密钥"
    echo "  - 请确保后端 API 地址可访问"
    echo "  - 建议配置 HTTPS 证书"
    echo ""
}

# 主流程
main() {
    echo "=================================="
    print_oversea "Mentob AI - 海外部署脚本"
    echo "=================================="
    echo ""

    check_docker
    check_env_file
    show_config
    confirm_deploy
    stop_old_container
    build_image
    run_container
    check_container_status
    health_check
    show_access_info
}

# 执行主流程
main
