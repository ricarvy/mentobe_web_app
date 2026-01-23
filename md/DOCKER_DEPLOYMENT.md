# Mentob AI Docker 部署指南

本指南提供详细的 Docker 部署步骤，帮助你在服务器上快速部署 Mentob AI 应用。

## 📋 目录

- [环境要求](#环境要求)
- [部署前准备](#部署前准备)
- [快速部署](#快速部署)
- [详细部署步骤](#详细部署步骤)
- [配置说明](#配置说明)
- [验证部署](#验证部署)
- [常见问题](#常见问题)
- [维护操作](#维护操作)

## 📦 环境要求

### 服务器要求

- **操作系统**: Linux (推荐 Ubuntu 20.04+ / CentOS 7+ / Debian 10+)
- **CPU**: 2 核心以上
- **内存**: 4GB 以上
- **磁盘**: 10GB 以上可用空间
- **网络**: 公网 IP 或内网可访问

### 软件要求

- **Docker**: 20.10+
- **Docker Compose**: 2.0+ (可选)
- **Git**: 用于拉取代码

### 端口要求

- **应用端口**: 8899 (HTTP)
- **如需 HTTPS**: 443 (需额外配置 Nginx)

## 🚀 部署前准备

### 1. 安装 Docker

#### Ubuntu/Debian
```bash
# 更新包索引
sudo apt-get update

# 安装依赖
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# 添加 Docker 官方 GPG 密钥
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 设置 Docker 仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装 Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker

# 验证安装
sudo docker --version
```

#### CentOS/RHEL
```bash
# 安装依赖
sudo yum install -y yum-utils

# 添加 Docker 仓库
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# 安装 Docker
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker

# 验证安装
sudo docker --version
```

### 2. 配置 Docker 用户（可选）

避免每次使用 sudo：

```bash
# 创建 docker 组（如果不存在）
sudo groupadd docker

# 将当前用户添加到 docker 组
sudo usermod -aG docker $USER

# 重新登录或执行
newgrp docker

# 验证
docker ps
```

### 3. 拉取项目代码

```bash
# 克隆项目（根据实际情况修改仓库地址）
git clone https://your-repo-url.git
cd mentob-ai

# 或者上传已有项目代码到服务器
# 使用 scp, rsync 或其他方式上传
```

### 4. 配置环境变量

```bash
# 复制环境变量模板
cp .env.prod .env.local

# 编辑环境变量文件
vim .env.local
```

**必须修改的配置项：**

```env
# 应用 URL（修改为实际域名或 IP）
APP_URL=http://your-server-ip:8899

# 后端 API 地址（修改为实际的后端服务地址）
NEXT_PUBLIC_BACKEND_URL=http://120.76.142.91:8901

# Stripe 支付配置（如启用支付功能）
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
STRIPE_SECRET_KEY=sk_live_your_key
```

## ⚡ 快速部署

如果你已经完成上述准备，可以直接执行以下命令：

```bash
# 构建镜像
docker build -t mentob-ai:latest .

# 运行容器
docker run -d \
  --name mentob-ai \
  -p 8899:8899 \
  --restart unless-stopped \
  mentob-ai:latest

# 查看日志
docker logs -f mentob-ai
```

## 📝 详细部署步骤

### 步骤 1: 构建 Docker 镜像

```bash
# 进入项目目录
cd /path/to/mentob-ai

# 构建镜像（添加 --no-cache 可以避免缓存问题）
docker build --no-cache -t mentob-ai:latest .
```

**构建过程说明：**

1. **构建阶段 (Builder)**:
   - 使用 Node.js 24 Alpine 镜像
   - 安装 pnpm 9.0.0
   - 复制项目文件
   - 安装依赖
   - 运行 `pnpm run build` 构建生产版本

2. **运行阶段 (Runner)**:
   - 使用轻量级 Node.js 24 Alpine 镜像
   - 复制构建产物
   - 配置非 root 用户运行
   - 设置端口 8899
   - 启动应用

**构建时间：** 约 5-10 分钟（取决于服务器性能）

### 步骤 2: 验证镜像

```bash
# 查看镜像列表
docker images | grep mentob-ai

# 预期输出
# mentob-ai   latest   xxxxx   x minutes ago   xxxMB
```

### 步骤 3: 运行容器

#### 基础运行

```bash
docker run -d \
  --name mentob-ai \
  -p 8899:8899 \
  --restart unless-stopped \
  mentob-ai:latest
```

#### 完整运行（推荐）

```bash
docker run -d \
  --name mentob-ai \
  -p 8899:8899 \
  --restart unless-stopped \
  -e NODE_ENV=production \
  -v /app/logs:/app/logs \
  -v /app/data:/app/data \
  --memory="2g" \
  --memory-swap="2g" \
  --cpus="2.0" \
  mentob-ai:latest
```

**参数说明：**

| 参数 | 说明 |
|------|------|
| `-d` | 后台运行 |
| `--name` | 容器名称 |
| `-p 8899:8899` | 端口映射（宿主机:容器） |
| `--restart unless-stopped` | 重启策略（除非手动停止） |
| `-e NODE_ENV` | 环境变量 |
| `-v` | 挂载卷（日志、数据） |
| `--memory` | 内存限制 |
| `--cpus` | CPU 限制 |

### 步骤 4: 查看容器状态

```bash
# 查看运行状态
docker ps | grep mentob-ai

# 查看详细信息
docker inspect mentob-ai

# 查看日志
docker logs -f mentob-ai
```

**预期输出：**

```
CONTAINER ID   IMAGE              COMMAND          CREATED         STATUS         PORTS                    NAMES
xxxxxxxxxx     mentob-ai:latest   "node server.js" x minutes ago   Up x minutes   0.0.0.0:8899->8899/tcp   mentob-ai
```

### 步骤 5: 验证服务

```bash
# 本地测试
curl -I http://localhost:8899

# 或使用 wget
wget -O- http://localhost:8899

# 预期输出
# HTTP/1.1 200 OK
```

## ⚙️ 配置说明

### 环境变量配置

主要配置项位于 `.env.prod` 文件：

#### 必须修改的配置

```env
# 应用 URL
APP_URL=http://your-domain.com:8899

# 后端 API 地址
NEXT_PUBLIC_BACKEND_URL=http://your-backend-url:8901

# Stripe 支付配置
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
```

#### 可选配置

```env
# 演示账号
DEMO_ACCOUNT_ENABLED=true
DEMO_ACCOUNT_EMAIL=demo@mentobai.com
DEMO_ACCOUNT_PASSWORD=Demo123!

# 限额配置
DAILY_QUOTA_FREE=3
DAILY_QUOTA_PAID=999

# LLM 配置
LLM_MODEL=doubao-seed-1-6-thinking-250715
LLM_TEMPERATURE=0.8
```

### 使用自定义环境变量

如果需要覆盖 `.env.prod` 中的配置，可以在运行容器时传入：

```bash
docker run -d \
  --name mentob-ai \
  -p 8899:8899 \
  -e APP_URL=http://new-domain.com:8899 \
  -e NEXT_PUBLIC_BACKEND_URL=http://new-backend:8901 \
  mentob-ai:latest
```

### 挂载卷配置

如果需要持久化数据：

```bash
docker run -d \
  --name mentob-ai \
  -p 8899:8899 \
  -v /opt/mentob-ai/logs:/app/logs \
  -v /opt/mentob-ai/data:/app/data \
  mentob-ai:latest
```

## ✅ 验证部署

### 1. 健康检查

```bash
# 查看容器健康状态
docker inspect --format='{{.State.Health.Status}}' mentob-ai

# 预期输出: healthy
```

### 2. 访问测试

**本地访问：**
```bash
curl http://localhost:8899
```

**远程访问：**
```
http://your-server-ip:8899
http://your-domain.com:8899
```

### 3. 功能测试

- [ ] 首页正常加载
- [ ] 塔罗牌抽牌功能正常
- [ ] 答案之书功能正常
- [ ] AI识掌纹功能正常
- [ ] 多语言切换正常
- [ ] 登录功能正常
- [ ] 支付功能正常（如配置）

### 4. 性能测试

```bash
# 使用 Apache Bench 进行压力测试
ab -n 1000 -c 10 http://localhost:8899/

# 预期结果: 无错误，响应时间合理
```

## 🔧 常见问题

### 1. 构建失败

**问题：** `pnpm install` 失败

**解决方案：**
```bash
# 清理 Docker 缓存
docker builder prune -a

# 重新构建（不使用缓存）
docker build --no-cache -t mentob-ai:latest .
```

### 2. 容器启动失败

**问题：** 容器启动后立即退出

**解决方案：**
```bash
# 查看日志
docker logs mentob-ai

# 检查端口占用
netstat -tlnp | grep 8899

# 检查环境变量
docker exec mentob-ai env
```

### 3. 无法访问服务

**问题：** 无法通过浏览器访问

**解决方案：**
```bash
# 检查容器状态
docker ps | grep mentob-ai

# 检查端口映射
docker port mentob-ai

# 检查防火墙
sudo firewall-cmd --list-ports
sudo firewall-cmd --add-port=8899/tcp --permanent
sudo firewall-cmd --reload

# 如果使用云服务器，检查安全组规则
```

### 4. 内存不足

**问题：** 容器因内存不足被杀死

**解决方案：**
```bash
# 增加 Docker 内存限制
docker run -d \
  --name mentob-ai \
  -p 8899:8899 \
  --memory="4g" \
  --memory-swap="4g" \
  mentob-ai:latest
```

### 5. 构建时间过长

**问题：** 构建时间超过 30 分钟

**解决方案：**
```bash
# 使用多阶段构建缓存
docker build --build-arg BUILDKIT_INLINE_CACHE=1 -t mentob-ai:latest .

# 或使用 BuildKit
DOCKER_BUILDKIT=1 docker build -t mentob-ai:latest .
```

### 6. 环境变量未生效

**问题：** 环境变量修改后容器未更新

**解决方案：**
```bash
# 停止并删除旧容器
docker stop mentob-ai
docker rm mentob-ai

# 重新构建并运行
docker build -t mentob-ai:latest .
docker run -d --name mentob-ai -p 8899:8899 mentob-ai:latest
```

## 🛠️ 维护操作

### 更新应用

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 停止旧容器
docker stop mentob-ai
docker rm mentob-ai

# 3. 重新构建镜像
docker build -t mentob-ai:latest .

# 4. 启动新容器
docker run -d --name mentob-ai -p 8899:8899 --restart unless-stopped mentob-ai:latest

# 5. 清理旧镜像
docker image prune -f
```

### 查看日志

```bash
# 实时查看日志
docker logs -f mentob-ai

# 查看最近 100 行
docker logs --tail 100 mentob-ai

# 查看最近 1 小时的日志
docker logs --since 1h mentob-ai
```

### 进入容器

```bash
# 进入容器终端
docker exec -it mentob-ai sh

# 在容器内执行命令
docker exec mentob-ai ls -la
```

### 备份数据

```bash
# 备份挂载的数据卷
docker run --rm \
  --volumes-from mentob-ai \
  -v $(pwd):/backup \
  alpine tar czf /backup/mentob-ai-backup-$(date +%Y%m%d).tar.gz /app/data

# 备份环境变量
docker exec mentob-ai cat .env.local > env-backup-$(date +%Y%m%d).env
```

### 监控资源使用

```bash
# 查看容器资源使用情况
docker stats mentob-ai

# 查看详细信息
docker inspect mentob-ai | grep -A 10 "Stats"
```

### 重启容器

```bash
# 重启容器
docker restart mentob-ai

# 平滑重启（先等待当前请求完成）
docker kill -s SIGTERM mentob-ai && docker start mentob-ai
```

## 🌐 配置 Nginx 反向代理（可选）

如果需要使用域名和 HTTPS，可以配置 Nginx：

```nginx
# /etc/nginx/conf.d/mentob-ai.conf
server {
    listen 80;
    server_name your-domain.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL 证书配置
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # SSL 优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 代理配置
    location / {
        proxy_pass http://localhost:8899;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 静态文件缓存
    location /_next/static {
        proxy_pass http://localhost:8899;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

重启 Nginx：
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 📊 性能优化

### 1. 启用 Docker BuildKit

```bash
export DOCKER_BUILDKIT=1
docker build -t mentob-ai:latest .
```

### 2. 使用多阶段构建

Dockerfile 已配置多阶段构建，自动优化镜像大小。

### 3. 配置资源限制

```bash
docker run -d \
  --name mentob-ai \
  -p 8899:8899 \
  --memory="2g" \
  --memory-swap="2g" \
  --cpus="2.0" \
  --pids-limit 512 \
  mentob-ai:latest
```

### 4. 使用 Docker Compose

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  mentob-ai:
    build: .
    container_name: mentob-ai
    ports:
      - "8899:8899"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    volumes:
      - ./logs:/app/logs
      - ./data:/app/data
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:8899', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

使用 Docker Compose：

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 更新服务
docker-compose pull
docker-compose up -d
```

## 🔐 安全建议

### 1. 使用非 root 用户运行

Dockerfile 已配置使用 `nextjs` 用户运行。

### 2. 限制容器权限

```bash
docker run -d \
  --name mentob-ai \
  -p 8899:8899 \
  --read-only \
  --tmpfs /tmp \
  --security-opt no-new-privileges \
  mentob-ai:latest
```

### 3. 定期更新镜像

```bash
# 更新基础镜像
docker pull node:24-alpine

# 重新构建
docker build -t mentob-ai:latest .
```

### 4. 使用私有镜像仓库

```bash
# 登录 Docker Hub
docker login

# 推送镜像
docker tag mentob-ai:latest your-username/mentob-ai:latest
docker push your-username/mentob-ai:latest

# 在服务器拉取
docker pull your-username/mentob-ai:latest
```

## 📞 技术支持

如遇到问题，请提供以下信息：

1. Docker 版本：`docker --version`
2. 容器日志：`docker logs mentob-ai`
3. 系统信息：`uname -a`
4. 错误截图或错误信息

---

**部署完成！** 🎉

访问 http://your-server-ip:8899 开始使用 Mentob AI。
