# ============================================
# Mentob AI - Docker 部署配置
# ============================================

ARG BASE_IMAGE=node:24-alpine

# 构建阶段
FROM ${BASE_IMAGE} AS builder

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY .npmrc* package.json pnpm-lock.yaml* ./

ARG NPM_REGISTRY=https://registry.npmjs.org/

# 安装 pnpm
RUN npm install -g pnpm@9.0.0 --registry=${NPM_REGISTRY}

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
# 如果存在 .env.oversea.prod，则复制为 .env.production 以供构建使用
# 注意：Next.js 在构建时会将 NEXT_PUBLIC_ 变量打包到静态文件中
COPY .env.oversea.prod .env.production

# 构建应用
RUN npx next build

# 生产阶段
FROM ${BASE_IMAGE} AS runner

ARG NPM_REGISTRY=https://registry.npmjs.org/

# 安装 pnpm
RUN npm install -g pnpm@9.0.0 --registry=${NPM_REGISTRY}

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
# 复制 standalone 构建产物
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

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
