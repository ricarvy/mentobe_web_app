# 📦 Mentob AI 部署文件说明

本目录包含 Mentob AI 项目的所有 Docker 部署相关文件。

## 📂 文件结构

```
.
├── Dockerfile                      # Docker 镜像构建配置
├── docker-compose.yml              # Docker Compose 配置
├── .dockerignore                   # Docker 构建忽略文件
├── .env.example                    # 环境变量示例（本地开发）
├── .env.prod                       # 国内部署环境变量（实际配置）
├── .env.prod.example               # 国内部署环境变量示例
├── .env.oversea.prod               # 海外部署环境变量（实际配置）
├── .env.oversea.prod.example       # 海外部署环境变量示例
├── deploy.sh                       # 国内部署脚本
├── deploy_oversea.sh               # 海外部署脚本
├── DOCKER_DEPLOYMENT.md            # 详细 Docker 部署文档
├── DOCKER_README.md                # 快速部署指南
└── DEPLOYMENT_GUIDE.md             # 部署脚本使用指南
```

## 🚀 快速开始

### 国内部署

```bash
# 1. 配置环境变量
vim .env.prod

# 2. 运行部署脚本
chmod +x deploy.sh
./deploy.sh
```

### 海外部署

```bash
# 1. 配置环境变量
vim .env.oversea.prod

# 2. 运行部署脚本
chmod +x deploy_oversea.sh
./deploy_oversea.sh
```

## 📋 文件说明

### Docker 相关

| 文件 | 说明 |
|-----|------|
| `Dockerfile` | Docker 镜像构建配置，使用多阶段构建优化镜像大小 |
| `docker-compose.yml` | Docker Compose 配置，包含资源限制和健康检查 |
| `.dockerignore` | Docker 构建时忽略的文件和目录 |

### 环境变量

| 文件 | 说明 | 是否提交到 Git |
|-----|------|--------------|
| `.env.example` | 本地开发环境变量示例 | ✅ 是 |
| `.env.prod` | 国内部署环境变量（实际配置） | ❌ 否（.gitignore） |
| `.env.prod.example` | 国内部署环境变量示例 | ✅ 是 |
| `.env.oversea.prod` | 海外部署环境变量（实际配置） | ❌ 否（.gitignore） |
| `.env.oversea.prod.example` | 海外部署环境变量示例 | ✅ 是 |

**注意：**
- `.env.prod` 和 `.env.oversea.prod` 包含真实配置，已在 `.gitignore` 中
- `.env.prod.example` 和 `.env.oversea.prod.example` 是模板，可以提交到 Git
- 首次部署时，复制 `.example` 文件并修改为实际配置

### 部署脚本

| 脚本 | 环境变量 | 容器名称 | 镜像名称 | 适用场景 |
|-----|---------|---------|---------|---------|
| `deploy.sh` | `.env.prod` | `mentob-ai` | `mentob-ai:latest` | 国内部署 |
| `deploy_oversea.sh` | `.env.oversea.prod` | `mentob-ai-oversea` | `mentob-ai:oversea` | 海外部署 |

### 文档

| 文档 | 说明 |
|-----|------|
| `DOCKER_DEPLOYMENT.md` | 详细的 Docker 部署文档（10,000+ 字） |
| `DOCKER_README.md` | 快速部署指南（简化版） |
| `DEPLOYMENT_GUIDE.md` | 部署脚本使用指南（对比国内和海外部署） |

## 🔧 首次部署步骤

### 1. 克隆项目

```bash
git clone https://your-repo-url.git
cd mentob-ai
```

### 2. 配置环境变量

#### 国内部署

```bash
# 从示例文件创建配置文件
cp .env.prod.example .env.prod

# 编辑配置
vim .env.prod
```

#### 海外部署

```bash
# 从示例文件创建配置文件
cp .env.oversea.prod.example .env.oversea.prod

# 编辑配置
vim .env.oversea.prod
```

### 3. 运行部署脚本

```bash
# 国内部署
chmod +x deploy.sh
./deploy.sh

# 或海外部署
chmod +x deploy_oversea.sh
./deploy_oversea.sh
```

## ⚙️ 必须修改的配置项

### 国内部署（.env.prod）

```env
# 应用 URL
APP_URL=http://your-domain.com:8899

# 后端 API 地址
NEXT_PUBLIC_BACKEND_URL=http://120.76.142.91:8901

# Stripe 支付配置
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
```

### 海外部署（.env.oversea.prod）

```env
# 应用 URL（建议使用 HTTPS）
APP_URL=https://www.mentobai.com

# 后端 API 地址
NEXT_PUBLIC_BACKEND_URL=http://120.76.142.91:8901
NEXT_PUBLIC_BACKEND_TIMEOUT=60000  # 海外网络建议增加超时

# Stripe 支付配置
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
```

## 🔄 更新部署

### 国内部署更新

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 重新部署
./deploy.sh
```

### 海外部署更新

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 重新部署
./deploy_oversea.sh
```

## 📊 两个部署版本的区别

| 特性 | 国内部署 | 海外部署 |
|-----|---------|---------|
| 环境变量文件 | `.env.prod` | `.env.oversea.prod` |
| 容器名称 | `mentob-ai` | `mentob-ai-oversea` |
| 镜像名称 | `mentob-ai:latest` | `mentob-ai:oversea` |
| 部署端口 | 8899 | 8899 |
| API 超时时间 | 30秒 | 60秒 |
| 应用 URL | HTTP（可选 HTTPS） | HTTPS（推荐） |
| 支付配置 | 国内 Stripe | 海外 Stripe |

## 🌐 同时部署国内和海外

如需同时运行两个版本：

### 方法一：不同端口

```bash
# 国内部署（8899 端口）
./deploy.sh

# 海外部署（修改端口为 8898）
# 编辑 deploy_oversea.sh，将 PORT=8899 改为 PORT=8898
vim deploy_oversea.sh
./deploy_oversea.sh
```

### 方法二：Docker Compose

```bash
# 启动两个服务
docker-compose up -d
```

## 📚 详细文档

### 详细部署文档
- [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) - 完整的 Docker 部署文档，包含：
  - 环境要求和安装步骤
  - 详细部署流程
  - 配置说明
  - 验证和测试
  - 常见问题解决
  - 维护操作
  - Nginx 配置
  - 性能优化
  - 安全建议

### 快速部署指南
- [DOCKER_README.md](DOCKER_README.md) - 快速部署指南，包含：
  - 快速开始步骤
  - 常用命令
  - 更新方法
  - 故障排除

### 部署脚本指南
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - 部署脚本使用指南，包含：
  - 两个部署脚本的详细对比
  - 环境变量配置说明
  - 部署流程详解
  - 同时部署方法
  - 注意事项
  - 安全建议

## ⚠️ 安全注意事项

1. **环境变量安全**
   - 不要将 `.env.prod` 或 `.env.oversea.prod` 提交到 Git
   - 定期更新 Stripe 密钥
   - 使用强密码配置演示账号

2. **容器安全**
   - 使用非 root 用户运行（已配置）
   - 定期更新基础镜像
   - 限制容器资源使用

3. **网络安全**
   - 配置防火墙规则
   - 海外部署建议使用 HTTPS
   - 定期检查日志和监控

## 🆘 故障排除

### 问题1：脚本无法执行

```bash
# 添加执行权限
chmod +x deploy.sh deploy_oversea.sh
```

### 问题2：环境变量文件不存在

```bash
# 国内部署
cp .env.prod.example .env.prod

# 海外部署
cp .env.oversea.prod.example .env.oversea.prod
```

### 问题3：容器无法启动

```bash
# 查看日志
docker logs mentob-ai  # 或 mentob-ai-oversea
```

详细故障排除请参考 [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)

## 📞 技术支持

如遇到问题，请提供：

1. Docker 版本：`docker --version`
2. 容器日志：`docker logs <container-name>`
3. 环境变量文件（隐藏敏感信息）
4. 错误截图或信息

---

**部署完成！** 🎉

选择适合的部署脚本，开始部署 Mentob AI 应用。
