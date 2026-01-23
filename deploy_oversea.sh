#!/bin/bash

# ============================================
# Mentob AI - 海外 Docker 快速部署脚本
# ============================================
# 使用环境变量: .env.oversea.prod
# 部署端口: 8899
# 适用于海外服务器部署

set -e

# 拉取最新代码
echo "正在拉取最新代码..."
git pull

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

# 错误处理
error_handler() {
    print_error "海外部署失败！"
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
        print_info "正在创建海外版环境变量文件..."

        if [ -f ".env.oversea.prod.example" ]; then
            cp .env.oversea.prod.example "$ENV_FILE"
        else
            print_error "找不到海外版环境变量模板文件"
            exit 1
        fi

        print_warning "已创建 $ENV_FILE 文件"
        print_warning "请编辑该文件并配置必要的海外环境变量"
        print_info "必须配置的变量:"
        echo "  - APP_URL: 海外域名（建议使用 HTTPS）"
        echo "  - NEXT_PUBLIC_BACKEND_URL: 后端 API 地址"
        echo "  - NEXT_PUBLIC_BACKEND_TIMEOUT: 建议设置为 60000（60秒）"
        echo "  - Stripe 海外支付配置"
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
    # 自动确认模式（如果不需要交互）
    if [ "$1" == "--yes" ]; then
        return
    fi
    
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
    print_oversea "开始构建海外版 Docker 镜像..."
    print_info "这可能需要 5-10 分钟，请耐心等待..."

    # 使用 BuildKit 加速构建
    export DOCKER_BUILDKIT=1

    # 注意：.env.oversea.prod 将在 Dockerfile 中被复制为 .env.production
    docker build -t "$IMAGE_NAME" . 2>&1 | tee build-oversea.log | while IFS= read -r line; do
        if [[ "$line" == *"ERROR"* ]]; then
            print_error "$line"
        elif [[ "$line" == *"Step"* ]]; then
            print_info "$line"
        fi
    done

    if [ ${PIPESTATUS[0]} -eq 0 ]; then
        print_success "海外版镜像构建成功"
    else
        print_error "镜像构建失败"
        print_info "构建日志已保存到 build-oversea.log"
        print_info "尝试清理缓存后重新构建:"
        echo "  docker builder prune -a"
        echo "  docker build --no-cache -t $IMAGE_NAME ."
        print_info "或参考故障排除文档: DOCKER_TROUBLESHOOTING.md"
        exit 1
    fi
}

# 运行容器
run_container() {
    print_oversea "启动海外版容器..."

    docker run -d \
        --name "$CONTAINER_NAME" \
        -p "$PORT:$PORT" \
        --restart unless-stopped \
        -e NODE_ENV=production \
        --env-file "$ENV_FILE" \
        -v "$(pwd)/logs:/app/logs" \
        -v "$(pwd)/data:/app/data" \
        --memory="2g" \
        --cpus="2.0" \
        "$IMAGE_NAME"

    print_success "容器启动成功！"
    print_info "访问地址: http://localhost:$PORT"
    print_info "日志查看: docker logs -f $CONTAINER_NAME"
}

# 主流程
main() {
    print_oversea "Mentob AI 海外部署工具 v1.0"
    
    check_docker
    check_env_file
    check_disk_space
    show_config
    confirm_deploy "$@"
    
    stop_old_container
    build_image
    run_container
}

main "$@"
