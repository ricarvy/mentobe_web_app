#!/bin/bash

# ============================================
# Mentob AI - 国内 Docker 快速部署脚本
# ============================================
# 使用环境变量: .env.prod
# 部署端口: 8899

set -e

# 拉取最新代码
echo "正在拉取最新代码..."
git pull

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

# 错误处理
error_handler() {
    print_error "部署失败！"
    print_info "请查看详细日志或运行以下命令获取更多信息："
    echo "  docker logs $CONTAINER_NAME"
    echo "  或参考故障排除文档: DOCKER_TROUBLESHOOTING.md"
    exit 1
}

trap error_handler ERR

# 检查 Docker 是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装，请先安装 Docker"
        print_info "安装指南: https://docs.docker.com/get-docker/"
        exit 1
    fi
    print_success "Docker 已安装: $(docker --version)"

    # 检查 Docker 是否运行
    if ! docker info &> /dev/null; then
        print_error "Docker 未运行，请启动 Docker 服务"
        exit 1
    fi
    print_success "Docker 服务运行正常"
}

# 检查环境变量文件
check_env_file() {
    if [ ! -f "$ENV_FILE" ]; then
        print_error "环境变量文件 $ENV_FILE 不存在"
        print_info "正在创建环境变量文件..."

        if [ -f ".env.example" ]; then
            cp .env.example "$ENV_FILE"
        elif [ -f ".env.prod.example" ]; then
            cp .env.prod.example "$ENV_FILE"
        else
            print_error "找不到环境变量模板文件"
            exit 1
        fi

        print_warning "已创建 $ENV_FILE 文件"
        print_warning "请编辑该文件并配置必要的环境变量"
        print_info "必须配置的变量:"
        echo "  - APP_URL: 应用访问地址"
        echo "  - NEXT_PUBLIC_BACKEND_URL: 后端 API 地址"
        echo "  - Stripe 支付配置（如需要）"
        echo ""
        print_info "编辑完成后重新运行此脚本"
        exit 1
    fi
    print_success "环境变量文件存在: $ENV_FILE"
}

# 检查磁盘空间
check_disk_space() {
    local required_space=5  # 需要至少 5GB
    local available_space=$(df -BG . | tail -1 | awk '{print $4}' | sed 's/G//')

    if [ "$available_space" -lt "$required_space" ]; then
        print_warning "磁盘空间不足（可用: ${available_space}GB，需要: ${required_space}GB）"
        print_info "建议清理磁盘空间后再部署"
        read -p "$(echo -e ${YELLOW}是否继续部署？[y/N]: ${NC})" -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 0
        fi
    fi
    print_success "磁盘空间充足（可用: ${available_space}GB）"
}

# 显示配置信息
show_config() {
    echo ""
    echo "=================================="
    print_info "部署配置"
    echo "=================================="
    echo "容器名称: $CONTAINER_NAME"
    echo "镜像名称: $IMAGE_NAME"
    echo "部署端口: $PORT"
    echo "环境变量文件: $ENV_FILE"
    echo "部署类型: 国内部署"
    echo "=================================="
    echo ""
}

# 确认部署
confirm_deploy() {
    read -p "$(echo -e ${YELLOW}确认开始部署？[y/N]: ${NC})" -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "部署已取消"
        exit 0
    fi
}

# 停止并删除旧容器
stop_old_container() {
    print_info "检查端口占用..."
    if [ "$(docker ps -q --filter "publish=$PORT")" ]; then
        print_info "端口 $PORT 被占用，正在清理..."
        docker rm -f $(docker ps -q --filter "publish=$PORT")
    fi

    print_info "检查旧容器..."
    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        print_info "停止旧容器..."
        docker rm -f "$CONTAINER_NAME" 2>/dev/null || true
        print_success "旧容器已删除"
    else
        print_info "未找到旧容器，跳过"
    fi
}

# 构建镜像
build_image() {
    print_info "开始构建 Docker 镜像..."
    print_info "这可能需要 5-10 分钟，请耐心等待..."

    # 使用 BuildKit 加速构建
    export DOCKER_BUILDKIT=1

    docker build -t "$IMAGE_NAME:latest" . 2>&1 | tee build.log | while IFS= read -r line; do
        if [[ "$line" == *"ERROR"* ]]; then
            print_error "$line"
        elif [[ "$line" == *"Step"* ]]; then
            print_info "$line"
        fi
    done

    if [ ${PIPESTATUS[0]} -eq 0 ]; then
        print_success "镜像构建成功"
    else
        print_error "镜像构建失败"
        print_info "构建日志已保存到 build.log"
        print_info "尝试清理缓存后重新构建:"
        echo "  docker builder prune -a"
        echo "  docker build --no-cache -t $IMAGE_NAME:latest ."
        print_info "或参考故障排除文档: DOCKER_TROUBLESHOOTING.md"
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
        docker logs --tail 50 "$CONTAINER_NAME"
        exit 1
    fi
}

# 健康检查
health_check() {
    print_info "执行健康检查..."
    sleep 15

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
    local max_attempts=5
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -f -s -o /dev/null "http://localhost:$PORT" 2>/dev/null; then
            print_success "HTTP 服务响应正常"
            return 0
        fi

        print_info "尝试连接... ($attempt/$max_attempts)"
        sleep 5
        attempt=$((attempt + 1))
    done

    print_warning "HTTP 服务暂未响应，请稍后检查"
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
    echo "  - 局域网: http://$(hostname -I 2>/dev/null | awk '{print $1}'):$PORT"
    echo ""
    print_info "常用命令:"
    echo "  - 查看日志: docker logs -f $CONTAINER_NAME"
    echo "  - 停止容器: docker stop $CONTAINER_NAME"
    echo "  - 重启容器: docker restart $CONTAINER_NAME"
    echo "  - 删除容器: docker rm -f $CONTAINER_NAME"
    echo ""
    print_info "更新应用:"
    echo "  1. git pull origin main"
    echo "  2. docker stop $CONTAINER_NAME && docker rm $CONTAINER_NAME"
    echo "  3. docker build -t $IMAGE_NAME:latest ."
    echo "  4. ./deploy.sh"
    echo ""
    print_info "详细文档:"
    echo "  - 部署指南: DOCKER_DEPLOYMENT.md"
    echo "  - 快速指南: DOCKER_README.md"
    echo "  - 故障排除: DOCKER_TROUBLESHOOTING.md"
    echo ""
    print_warning "如果遇到问题，请查看:"
    echo "  - 构建日志: build.log"
    echo "  - 容器日志: docker logs $CONTAINER_NAME"
    echo "  - 故障排除文档: DOCKER_TROUBLESHOOTING.md"
    echo ""
}

# 主流程
main() {
    echo "=================================="
    echo "Mentob AI - 国内部署脚本"
    echo "=================================="
    echo ""

    check_docker
    check_env_file
    check_disk_space
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
