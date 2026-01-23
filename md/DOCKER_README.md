# Mentob AI - Docker 快速部署指南

## 📦 快速开始

### 前置要求

- Docker 20.10+
- Git

### 一键部署

```bash
# 1. 克隆项目
git clone https://your-repo-url.git
cd mentob-ai

# 2. 配置环境变量
cp .env.prod .env.local
vim .env.local  # 修改必要配置

# 3. 运行部署脚本
chmod +x deploy.sh
./deploy.sh
```

### 手动部署

```bash
# 1. 构建镜像
docker build -t mentob-ai:latest .

# 2. 运行容器
docker run -d \
  --name mentob-ai \
  -p 8899:8899 \
  --restart unless-stopped \
  mentob-ai:latest

# 3. 查看日志
docker logs -f mentob-ai
```

### 使用 Docker Compose

```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 🌐 访问服务

部署成功后，访问以下地址：

- **本地访问**: http://localhost:8899
- **远程访问**: http://your-server-ip:8899

## 📝 配置说明

### 环境变量

编辑 `.env.prod` 文件，配置以下关键参数：

```env
# 应用 URL（修改为实际域名或 IP）
APP_URL=http://your-domain.com:8899

# 后端 API 地址
NEXT_PUBLIC_BACKEND_URL=http://120.76.142.91:8901

# Stripe 支付配置（如启用支付功能）
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
```

### 端口配置

默认端口：**8899**

如需修改端口，修改 docker-compose.yml 或运行命令：

```bash
docker run -d -p 8080:8899 mentob-ai:latest
```

## 🔧 常用命令

### 容器管理

```bash
# 查看容器状态
docker ps | grep mentob-ai

# 查看日志
docker logs -f mentob-ai

# 停止容器
docker stop mentob-ai

# 启动容器
docker start mentob-ai

# 重启容器
docker restart mentob-ai

# 删除容器
docker rm -f mentob-ai
```

### 更新应用

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 停止旧容器
docker stop mentob-ai
docker rm mentob-ai

# 3. 重新构建
docker build -t mentob-ai:latest .

# 4. 启动新容器
docker run -d --name mentob-ai -p 8899:8899 mentob-ai:latest
```

### 查看资源使用

```bash
# 查看容器资源使用情况
docker stats mentob-ai
```

## 🔍 验证部署

### 健康检查

```bash
# 检查容器健康状态
docker inspect --format='{{.State.Health.Status}}' mentob-ai

# 访问服务
curl -I http://localhost:8899
```

### 功能测试

- [ ] 首页正常加载
- [ ] 塔罗牌抽牌功能正常
- [ ] 答案之书功能正常
- [ ] AI识掌纹功能正常
- [ ] 多语言切换正常

## 🛠️ 故障排除

### 容器无法启动

```bash
# 查看日志
docker logs mentob-ai

# 检查端口占用
netstat -tlnp | grep 8899
```

### 构建失败

```bash
# 清理缓存重新构建
docker builder prune -a
docker build --no-cache -t mentob-ai:latest .
```

### 无法访问服务

```bash
# 检查容器状态
docker ps | grep mentob-ai

# 检查防火墙
sudo firewall-cmd --add-port=8899/tcp --permanent
sudo firewall-cmd --reload
```

## 📚 详细文档

完整的部署文档请参考：[DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)

## 🌐 配置 Nginx（可选）

如需使用域名和 HTTPS，可配置 Nginx 反向代理：

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:8899;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

## 📞 技术支持

如遇到问题，请提供：

1. Docker 版本：`docker --version`
2. 容器日志：`docker logs mentob-ai`
3. 错误截图或信息

---

**部署完成！** 🎉 访问 http://your-server-ip:8899 开始使用
