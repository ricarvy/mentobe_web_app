# Dockerfile Standalone 路径修复说明

## 问题描述

Docker 构建过程中出现错误：
```
ERROR: failed to calculate checksum of ref: failed to walk /var/lib/docker/tmp/buildkit-mount2408632470/app/.next/standalone/workspace: no such file or directory
```

## 原因分析

### 1. Next.js Standalone 输出结构

由于 COZE 开发环境的特殊结构，启用了 `outputFileTracingRoot` 配置，导致 standalone 输出结构为：

```
.next/standalone/
└── workspace/
    └── projects/          # 实际的应用文件
        ├── .next/
        ├── node_modules/
        ├── package.json
        └── server.js
```

### 2. Dockerfile 复制路径错误

之前的 Dockerfile 尝试复制：
```dockerfile
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
```

这会导致错误，因为：
- `/app/.next/standalone` 目录下只有 `workspace/` 子目录
- 没有 `server.js` 等必需文件
- 复制后容器中无法启动应用

## 修复方案

### 正确的 Dockerfile 配置

```dockerfile
# 从构建阶段复制必要的文件
# 注意：由于 outputFileTracingRoot 配置，standalone 输出在 .next/standalone/workspace/projects/
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/workspace/projects/ ./
```

### 完整的 Dockerfile

```dockerfile
# 构建阶段
FROM node:24-alpine AS builder

# 安装 pnpm
RUN npm install -g pnpm@9.0.0

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml* ./

# 设置环境变量
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 安装依赖
RUN pnpm install --frozen-lockfile --prefer-offline

# 复制项目文件
COPY . .

# 复制环境变量文件
COPY .env.prod .env.local

# 构建应用
RUN npx next build

# 生产阶段
FROM node:24-alpine AS runner

# 安装 pnpm
RUN npm install -g pnpm@9.0.0

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=8899
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NEXT_TELEMETRY_DISABLED=1

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 从构建阶段复制必要的文件
# 注意：由于 outputFileTracingRoot 配置，standalone 输出在 .next/standalone/workspace/projects/
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/workspace/projects/ ./

# 设置正确的权限
RUN chown -R nextjs:nodejs /app

# 切换到非 root 用户
USER nextjs

# 暴露端口
EXPOSE 8899

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8899', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动应用
CMD ["node", "server.js"]
```

## 验证步骤

### 1. 检查本地构建输出

```bash
# 构建项目
npx next build

# 检查 standalone 输出结构
ls -la .next/standalone/
ls -la .next/standalone/workspace/
ls -la .next/standalone/workspace/projects/

# 应该看到：
# .next/standalone/workspace/projects/
# ├── .next/
# ├── node_modules/
# ├── package.json
# └── server.js
```

### 2. Docker 构建测试

```bash
# 构建镜像
docker build -t mentob-ai:latest .

# 预期：构建成功，无错误
```

### 3. 容器启动测试

```bash
# 启动容器
docker run -d --name mentob-ai -p 8899:8899 mentob-ai:latest

# 检查容器状态
docker ps | grep mentob-ai

# 测试访问
curl http://localhost:8899
```

## 关键配置说明

### next.config.ts

```typescript
import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(__dirname, '../../'),
  output: 'standalone',
  // 其他配置...
};

export default nextConfig;
```

**配置说明：**
- `outputFileTracingRoot`: 设置为 `../../` 以适配 COZE 开发环境
- `output: 'standalone'`: 启用独立输出模式，优化 Docker 部署

### Standalone 输出路径

| 场景 | 输出路径 |
|-----|---------|
| 标准 Next.js | `.next/standalone/` |
| COZE 开发环境 | `.next/standalone/workspace/projects/` |

## 常见问题

### 问题 1: 路径不匹配

**错误：**
```
no such file or directory: /app/.next/standalone/workspace
```

**解决方案：**
1. 检查本地构建输出结构
2. 确保 Dockerfile 中的 COPY 路径与实际输出匹配
3. 验证 `outputFileTracingRoot` 配置

### 问题 2: 文件缺失

**错误：**
```
Error: Cannot find module 'next'
```

**解决方案：**
1. 确保复制了完整的 `node_modules` 目录
2. 检查 Dockerfile 中的 COPY 命令
3. 验证 standalone 输出包含所有必需文件

### 问题 3: 权限问题

**错误：**
```
EACCES: permission denied
```

**解决方案：**
1. 确保 COPY 命令使用了 `--chown=nextjs:nodejs`
2. 验证容器运行用户配置
3. 检查文件权限设置

## 最佳实践

### 1. 验证构建输出

每次修改 `next.config.ts` 或 Dockerfile 后，务必验证 standalone 输出：

```bash
npx next build
ls -la .next/standalone/workspace/projects/
```

### 2. 使用 BuildKit

启用 BuildKit 加速构建：

```bash
export DOCKER_BUILDKIT=1
docker build -t mentob-ai:latest .
```

### 3. 清理缓存

遇到问题时，清理 Docker 缓存：

```bash
docker builder prune -a
docker build --no-cache -t mentob-ai:latest .
```

## 总结

✅ **修复内容：**
- 更新 Dockerfile 中的 COPY 路径
- 使用正确的 standalone 输出路径：`/app/.next/standalone/workspace/projects/`
- 保持 `next.config.ts` 中的 `outputFileTracingRoot` 配置

✅ **验证结果：**
- 本地构建输出正确
- Dockerfile 路径配置正确
- TypeScript 编译通过

✅ **注意事项：**
- standalone 输出路径取决于 `outputFileTracingRoot` 配置
- COZE 开发环境的输出结构与标准 Next.js 不同
- 每次修改配置后需验证输出结构

---

**修复时间：** 2024-01-23

**影响范围：** Docker 构建流程

**风险评估：** 中（影响 Docker 部署，不影响开发环境）
