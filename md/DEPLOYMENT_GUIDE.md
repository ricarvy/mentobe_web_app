# Mentob AI 部署脚本使用指南

## 📋 概述

项目提供两个部署脚本，分别用于国内和海外环境部署：

| 脚本名称 | 环境变量文件 | 容器名称 | 镜像名称 | 适用场景 |
|---------|------------|---------|---------|---------|
| `deploy.sh` | `.env.prod` | `mentob-ai` | `mentob-ai:latest` | 国内服务器部署 |
| `deploy_oversea.sh` | `.env.oversea.prod` | `mentob-ai-oversea` | `mentob-ai:oversea` | 海外服务器部署 |

## 🚀 快速开始

### 国内部署

```bash
# 1. 配置环境变量
cp .env.prod .env.local  # 或者直接编辑 .env.prod
vim .env.prod

# 2. 运行部署脚本
chmod +x deploy.sh
./deploy.sh
```

### 海外部署

```bash
# 1. 配置环境变量（脚本会自动创建模板）
vim .env.oversea.prod

# 2. 运行部署脚本
chmod +x deploy_oversea.sh
./deploy_oversea.sh
```

## ⚙️ 环境变量配置

### 国内部署配置（.env.prod）

#### 必须修改的配置项

```env
# 应用 URL（修改为实际域名或 IP）
APP_URL=http://your-domain.com:8899

# 后端 API 地址
NEXT_PUBLIC_BACKEND_URL=http://120.76.142.91:8901

# Stripe 支付配置
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
```

### 海外部署配置（.env.oversea.prod）

#### 必须修改的配置项

```env
# 应用 URL（使用 HTTPS 和海外域名）
APP_URL=https://www.mentobai.com

# 后端 API 地址（海外网络建议增加超时时间）
NEXT_PUBLIC_BACKEND_URL=http://120.76.142.91:8901
NEXT_PUBLIC_BACKEND_TIMEOUT=60000

# 海外 Stripe 支付配置
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
```

## 🔍 两个部署脚本的区别

### 1. 容器和镜像命名

| 配置项 | 国内部署 | 海外部署 |
|-------|---------|---------|
| 容器名称 | `mentob-ai` | `mentob-ai-oversea` |
| 镜像名称 | `mentob-ai:latest` | `mentob-ai:oversea` |

这样可以同时运行国内和海外两个版本，互不干扰。

### 2. 环境变量文件

| 脚本 | 环境变量文件 |
|-----|------------|
| `deploy.sh` | `.env.prod` |
| `deploy_oversea.sh` | `.env.oversea.prod` |

### 3. 配置差异

#### 网络超时时间

```env
# 国内版
NEXT_PUBLIC_BACKEND_TIMEOUT=30000  # 30秒

# 海外版
NEXT_PUBLIC_BACKEND_TIMEOUT=60000  # 60秒（考虑网络延迟）
```

#### 应用 URL

```env
# 国内版（通常使用 HTTP）
APP_URL=http://your-domain.com:8899

# 海外版（推荐使用 HTTPS）
APP_URL=https://www.mentobai.com
```

### 4. 支付配置

#### 国内版

- 使用国内 Stripe 账户（如需要）
- 货币：通常使用 CNY
- 客户端优化：考虑国内网络环境

#### 海外版

- 使用海外 Stripe 账户
- 货币：推荐使用 USD
- 支持多种国际支付方式

## 📦 部署流程

### 脚本执行流程

两个脚本执行流程完全相同：

1. **环境检查**
   - 检查 Docker 是否安装
   - 检查环境变量文件是否存在

2. **配置显示**
   - 显示当前部署配置
   - 等待用户确认

3. **清理旧容器**
   - 停止并删除旧容器（如果存在）

4. **构建镜像**
   - 使用 Dockerfile 构建新镜像
   - 预计时间：5-10 分钟

5. **启动容器**
   - 创建并启动新容器
   - 配置端口映射、资源限制、数据卷

6. **状态检查**
   - 检查容器运行状态
   - 执行健康检查

7. **访问信息**
   - 显示访问地址
   - 显示常用命令

## 🛠️ 常用命令

### 国内部署

```bash
# 查看日志
docker logs -f mentob-ai

# 重启容器
docker restart mentob-ai

# 停止容器
docker stop mentob-ai

# 删除容器
docker rm -f mentob-ai

# 进入容器
docker exec -it mentob-ai sh
```

### 海外部署

```bash
# 查看日志
docker logs -f mentob-ai-oversea

# 重启容器
docker restart mentob-ai-oversea

# 停止容器
docker stop mentob-ai-oversea

# 删除容器
docker rm -f mentob-ai-oversea

# 进入容器
docker exec -it mentob-ai-oversea sh
```

## 🔄 更新应用

### 国内部署更新

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 更新环境变量（如有需要）
vim .env.prod

# 3. 重新部署
docker stop mentob-ai && docker rm mentob-ai
docker build -t mentob-ai:latest .
docker run -d --name mentob-ai -p 8899:8899 --restart unless-stopped mentob-ai:latest

# 或直接使用脚本
./deploy.sh
```

### 海外部署更新

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 更新环境变量（如有需要）
vim .env.oversea.prod

# 3. 重新部署
docker stop mentob-ai-oversea && docker rm mentob-ai-oversea
docker build -t mentob-ai:oversea .
docker run -d --name mentob-ai-oversea -p 8899:8899 --restart unless-stopped mentob-ai:oversea

# 或直接使用脚本
./deploy_oversea.sh
```

## ⚠️ 注意事项

### 国内部署

1. **后端 API 地址**
   - 确保后端服务可访问
   - 检查网络连通性

2. **支付配置**
   - 如需支付功能，配置国内支付渠道
   - 或使用 Stripe（需确保合规）

3. **CDN 配置**
   - 考虑使用国内 CDN 加速
   - 优化静态资源加载

### 海外部署

1. **HTTPS 配置**
   - 强烈建议配置 HTTPS 证书
   - 使用 Let's Encrypt 或购买证书

2. **支付配置**
   - 配置海外 Stripe 账户
   - 设置合适的货币和价格

3. **网络优化**
   - 海外网络可能较慢，已增加超时时间
   - 考虑使用 CDN 加速海外访问

4. **域名配置**
   - 配置海外域名解析
   - 建议使用 .com 等国际域名

## 🌐 同时部署国内和海外版本

如果你需要同时运行国内和海外版本，可以：

### 方法一：不同端口

```bash
# 国内部署（8899 端口）
./deploy.sh

# 海外部署（8898 端口，需修改脚本中的 PORT）
# 修改 deploy_oversea.sh 中的 PORT=8899 为 PORT=8898
./deploy_oversea.sh
```

### 方法二：使用 Docker Compose

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  mentob-ai-domestic:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: mentob-ai
    ports:
      - "8899:8899"
    env_file:
      - .env.prod
    restart: unless-stopped

  mentob-ai-oversea:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: mentob-ai-oversea
    ports:
      - "8898:8899"
    env_file:
      - .env.oversea.prod
    restart: unless-stopped
```

启动：
```bash
docker-compose up -d
```

## 📊 性能优化建议

### 国内部署

1. 使用国内云服务器（阿里云、腾讯云等）
2. 配置国内 CDN
3. 优化数据库连接
4. 使用 Redis 缓存

### 海外部署

1. 使用海外云服务器（AWS、GCP、Azure 等）
2. 配置 HTTPS 和 CDN
3. 优化跨网络请求
4. 使用 Cloudflare 加速

## 🔒 安全建议

### 两个版本通用

1. 定期更新 Docker 镜像
2. 配置防火墙规则
3. 使用非 root 用户运行（已配置）
4. 定期备份数据
5. 监控容器资源使用

### 海外版本额外建议

1. 配置 HTTPS 证书
2. 使用 WAF 防护
3. 配置 DDoS 防护
4. 定期安全扫描

## 🆘 故障排除

### 问题1：容器无法启动

**解决方案：**
```bash
# 查看日志
docker logs mentob-ai  # 或 mentob-ai-oversea

# 检查端口占用
netstat -tlnp | grep 8899

# 检查环境变量
docker exec mentob-ai env
```

### 问题2：构建失败

**解决方案：**
```bash
# 清理缓存
docker builder prune -a

# 重新构建
docker build --no-cache -t mentob-ai:latest .
```

### 问题3：无法访问服务

**解决方案：**
```bash
# 检查容器状态
docker ps | grep mentob-ai

# 检查防火墙
sudo firewall-cmd --add-port=8899/tcp --permanent
sudo firewall-cmd --reload

# 检查云服务器安全组
# 确保端口 8899 已开放
```

## 📞 技术支持

如遇到问题，请提供以下信息：

1. Docker 版本：`docker --version`
2. 容器日志：`docker logs <container-name>`
3. 环境变量文件（隐藏敏感信息）
4. 错误截图或错误信息

---

**部署完成！** 🎉

选择适合你的部署脚本，开始部署 Mentob AI 应用。
