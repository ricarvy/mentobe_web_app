# Docker 部署故障排除指南

## 常见问题及解决方案

### 问题 1: `process "/bin/sh -c pnpm run build" did not complete successfully: exit code: 1`

#### 原因分析

这个错误通常由以下原因引起：

1. **pnpm 版本不匹配**
2. **依赖安装失败**
3. **构建脚本路径问题**
4. **环境变量缺失**
5. **磁盘空间不足**

#### 解决方案

##### 方案 1: 检查 pnpm 版本

```bash
# 检查当前 pnpm 版本
pnpm --version

# 应该显示: 9.0.0 或更高版本
```

如果版本不匹配，修改 Dockerfile：

```dockerfile
# 安装特定版本的 pnpm
RUN npm install -g pnpm@9.0.0
```

##### 方案 2: 使用 npx 而不是 pnpm run

修改 Dockerfile 中的构建命令：

```dockerfile
# 旧的（可能失败）
RUN pnpm run build

# 新的（推荐）
RUN npx next build
```

##### 方案 3: 增加构建超时时间

```dockerfile
# 在构建阶段添加
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=4096"
```

##### 方案 4: 清理 Docker 缓存重新构建

```bash
# 停止并删除旧容器
docker stop mentob-ai 2>/dev/null || true
docker rm mentob-ai 2>/dev/null || true

# 清理构建缓存
docker builder prune -a

# 不使用缓存重新构建
docker build --no-cache -t mentob-ai:latest .
```

##### 方案 5: 检查磁盘空间

```bash
# 检查磁盘空间
df -h

# 清理 Docker 资源
docker system prune -a --volumes
```

### 问题 2: 构建成功但容器无法启动

#### 症状

```bash
docker logs mentob-ai
# 显示错误信息，如 "module not found"
```

#### 原因分析

1. **standalone 输出路径不正确**
2. **缺少必要的依赖文件**
3. **环境变量配置错误**

#### 解决方案

##### 方案 1: 检查 standalone 输出

```bash
# 在本地构建检查
npx next build

# 检查输出
ls -la .next/standalone/
```

正确的输出应该包含：
- `server.js`
- `node_modules/`
- `package.json`
- `.next/`

##### 方案 2: 验证 Dockerfile 路径

确保 Dockerfile 中的复制路径正确：

```dockerfile
# 如果 outputFileTracingRoot 使用了 '../../'
# standalone 输出会在 .next/standalone/workspace/projects/
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/workspace/projects/ ./
```

##### 方案 3: 检查 next.config.ts

确保配置正确：

```typescript
import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(__dirname, '../../'),
  output: 'standalone',  // 必须启用
  // 其他配置...
};

export default nextConfig;
```

### 问题 3: 容器启动后无法访问

#### 症状

```bash
curl http://localhost:8899
# 无法连接或超时
```

#### 解决方案

##### 方案 1: 检查容器状态

```bash
# 查看容器是否运行
docker ps | grep mentob-ai

# 查看容器日志
docker logs mentob-ai

# 检查端口映射
docker port mentob-ai
```

##### 方案 2: 检查防火墙

```bash
# 检查端口是否开放
sudo firewall-cmd --list-ports

# 开放端口
sudo firewall-cmd --add-port=8899/tcp --permanent
sudo firewall-cmd --reload

# 或使用 iptables
sudo iptables -A INPUT -p tcp --dport 8899 -j ACCEPT
```

##### 方案 3: 检查云服务器安全组

确保云服务器的安全组已开放 8899 端口。

##### 方案 4: 验证应用健康

```bash
# 进入容器
docker exec -it mentob-ai sh

# 在容器内测试
node -e "require('http').get('http://localhost:8899', (r) => {console.log(r.statusCode)})"

# 检查进程
ps aux | grep node
```

### 问题 4: 内存不足导致容器被杀死

#### 症状

```bash
docker logs mentob-ai
# 显示 "Killed" 或 "Out of memory"
```

#### 解决方案

##### 方案 1: 增加 Docker 内存限制

```bash
docker run -d \
  --name mentob-ai \
  -p 8899:8899 \
  --memory="4g" \
  --memory-swap="4g" \
  mentob-ai:latest
```

##### 方案 2: 优化 Node.js 内存

在 Dockerfile 中添加：

```dockerfile
ENV NODE_OPTIONS="--max-old-space-size=2048"
```

##### 方案 3: 检查系统内存

```bash
# 检查系统内存
free -h

# 检查 Docker 资源使用
docker stats mentob-ai
```

### 问题 5: 环境变量未生效

#### 症状

应用读取不到环境变量配置。

#### 解决方案

##### 方案 1: 确认环境变量文件存在

```bash
# 检查环境变量文件
ls -la .env.prod

# 检查文件内容
cat .env.prod
```

##### 方案 2: 在 Dockerfile 中复制

```dockerfile
# 在构建阶段
COPY .env.prod .env.local
```

##### 方案 3: 在运行时传递

```bash
docker run -d \
  --name mentob-ai \
  -p 8899:8899 \
  --env-file .env.prod \
  mentob-ai:latest
```

##### 方案 4: 验证容器内环境变量

```bash
# 进入容器
docker exec -it mentob-ai sh

# 查看环境变量
env | grep NEXT_PUBLIC
```

### 问题 6: 镜像构建时间过长

#### 症状

构建时间超过 30 分钟。

#### 解决方案

##### 方案 1: 使用 BuildKit

```bash
export DOCKER_BUILDKIT=1
docker build -t mentob-ai:latest .
```

##### 方案 2: 优化 Dockerfile 层缓存

```dockerfile
# 分离依赖安装和代码复制
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

COPY . .
```

##### 方案 3: 使用 .dockerignore

确保 `.dockerignore` 正确配置，排除不必要的文件：

```
node_modules
.next
git
.vscode
*.log
```

### 问题 7: 权限问题

#### 症状

```
Error: EACCES: permission denied
```

#### 解决方案

##### 方案 1: 确保使用非 root 用户

```dockerfile
# 创建用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制文件时设置权限
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/workspace/projects/ ./

# 切换用户
USER nextjs
```

##### 方案 2: 检查文件权限

```bash
# 进入容器
docker exec -it mentob-ai sh

# 检查权限
ls -la

# 修复权限
docker exec mentob-ai chown -R nextjs:nodejs /app
```

### 问题 8: 健康检查失败

#### 症状

容器显示 "unhealthy" 状态。

#### 解决方案

##### 方案 1: 增加启动延迟时间

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8899', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
```

##### 方案 2: 检查应用端口

确保应用监听正确的端口：

```dockerfile
ENV PORT=8899
EXPOSE 8899
```

##### 方案 3: 查看健康检查日志

```bash
# 检查健康检查状态
docker inspect --format='{{.State.Health.Status}}' mentob-ai

# 查看健康检查日志
docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' mentob-ai
```

## 调试技巧

### 1. 交互式调试

```bash
# 启动交互式容器
docker run -it --rm \
  -p 8899:8899 \
  --entrypoint sh \
  mentob-ai:latest

# 在容器内手动启动
node server.js
```

### 2. 查看构建详情

```bash
# 显示构建过程
docker build --progress=plain -t mentob-ai:latest .

# 保存构建日志
docker build --progress=plain -t mentob-ai:latest . 2>&1 | tee build.log
```

### 3. 实时监控

```bash
# 监控容器资源
docker stats mentob-ai

# 实时查看日志
docker logs -f mentob-ai

# 查看容器事件
docker events --filter 'container=mentob-ai'
```

### 4. 进入运行中的容器

```bash
# 进入容器
docker exec -it mentob-ai sh

# 在容器内执行命令
node --version
npm --version
ls -la
```

## 获取帮助

如果以上方法都无法解决问题，请提供以下信息：

1. **Docker 版本**：
   ```bash
   docker --version
   docker info
   ```

2. **系统信息**：
   ```bash
   uname -a
   free -h
   df -h
   ```

3. **构建日志**：
   ```bash
   docker build --progress=plain -t mentob-ai:latest . 2>&1 | tee build.log
   ```

4. **容器日志**：
   ```bash
   docker logs mentob-ai
   ```

5. **容器状态**：
   ```bash
   docker ps -a | grep mentob-ai
   docker inspect mentob-ai
   ```

6. **环境变量**（隐藏敏感信息）：
   ```bash
   docker exec mentob-ai env | grep -E "NEXT_PUBLIC|NODE_ENV"
   ```

7. **错误截图**

---

**常见问题索引**：
- [问题 1](#问题-1-process-binsh--c-pnpm-run-build-did-not-complete-successfully-exit-code-1) - 构建失败
- [问题 2](#问题-2-构建成功但容器无法启动) - 容器启动失败
- [问题 3](#问题-3-容器启动后无法访问) - 无法访问服务
- [问题 4](#问题-4-内存不足导致容器被杀死) - 内存不足
- [问题 5](#问题-5-环境变量未生效) - 环境变量问题
- [问题 6](#问题-6-镜像构建时间过长) - 构建时间过长
- [问题 7](#问题-7-权限问题) - 权限问题
- [问题 8](#问题-8-健康检查失败) - 健康检查失败
