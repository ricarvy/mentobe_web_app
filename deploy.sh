#!/bin/bash

# ============================================
# Mentob AI - Docker 快速部署脚本
# ============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
CONTAINER_NAME="mentob-ai"
IMAGE_NAME="mentob-ai"
PORT=8899
ENV_FILE=".env.prod"

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
        print_info "正在创建环境变量文件..."
        cp .env.example .env.prod
        print_warning "请编辑 .env.prod 文件并配置必要的环境变量"
        print_info "完成后重新运行此脚本"
        exit 1
    fi
    print_success "环境变量文件存在"
}

# 停止并删除旧容器
stop_old_container() {
    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        print_info "停止旧容器..."
        docker stop "$CONTAINER_NAME" 2>/dev/null || true
        docker rm "$CONTAINER_NAME" 2>/dev/null || true
        print_success "旧容器已删除"
    fi
}

# 构建镜像
build_image() {
    print_info "开始构建 Docker 镜像..."
    docker build -t "$IMAGE_NAME:latest" .

    if [ $? -eq 0 ]; then
        print_success "镜像构建成功"
    else
        print_error "镜像构建失败"
        exit 1
    fi
}

# 运行容器
run_container() {
    print_info "启动容器..."

    docker run -d \
        --name "$CONTAINER_NAME" \
        -p "$PORT:$PORT" \
        --restart unless-stopped \
        -e NODE_ENV=production \
        -v "$(pwd)/logs:/app/logs" \
        -v "$(pwd)/data:/app/data" \
        --memory="2g" \
        --cpus="2.0" \
        "$IMAGE_NAME:latest"

    if [ $? -eq 0 ]; then
        print_success "容器启动成功"
    else
        print_error "容器启动失败"
        exit 1
    fi
}

# 检查容器状态
check_container_status() {
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

# 显示访问信息
show_access_info() {
    echo ""
    echo "=================================="
    print_success "部署完成！"
    echo "=================================="
    echo ""
    print_info "访问地址:"
    echo "  - 本地: http://localhost:$PORT"
    echo "  - 远程: http://$(hostname -I | awk '{print $1}'):$PORT"
    echo ""
    print_info "常用命令:"
    echo "  - 查看日志: docker logs -f $CONTAINER_NAME"
    echo "  - 停止容器: docker stop $CONTAINER_NAME"
    echo "  - 重启容器: docker restart $CONTAINER_NAME"
    echo "  - 删除容器: docker rm -f $CONTAINER_NAME"
    echo ""
    print_info "如需查看详细文档，请参考: DOCKER_DEPLOYMENT.md"
    echo ""
}

# 主流程
main() {
    echo "=================================="
    echo "Mentob AI - Docker 部署脚本"
    echo "=================================="
    echo ""

    check_docker
    check_env_file
    stop_old_container
    build_image
    run_container
    check_container_status
    show_access_info
}

# 执行主流程
main
