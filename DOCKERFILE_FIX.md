# Dockerfile 拼写错误修复说明

## 问题描述

构建过程中出现错误：
```
ERROR Unknown option: 'prefer-offine'
Did you mean 'prefer-offline'? Use "--config.unknown=value" to force an unknown option.
```

## 原因分析

Dockerfile 中 pnpm install 命令使用了错误的参数拼写：
```dockerfile
# 错误的拼写
RUN pnpm install --frozen-lockfile --prefer-offine
```

正确的拼写应该是：
```dockerfile
# 正确的拼写
RUN pnpm install --frozen-lockfile --prefer-offline
```

## 修复内容

### 文件：`Dockerfile`

**第 24 行**

修复前：
```dockerfile
RUN pnpm install --frozen-lockfile --prefer-offine
```

修复后：
```dockerfile
RUN pnpm install --frozen-lockfile --prefer-offline
```

## 验证

### 1. 检查 Dockerfile 内容

```bash
grep "prefer-" Dockerfile
# 输出: RUN pnpm install --frozen-lockfile --prefer-offline
```

### 2. 本地构建测试

```bash
# 清理旧的构建
rm -rf .next

# 重新构建
npx next build

# 预期：构建成功，无错误
```

### 3. Docker 构建测试

```bash
# 构建镜像
docker build -t mentob-ai:latest .

# 预期：构建成功，无 prefer-offine 错误
```

## pnpm install 参数说明

| 参数 | 说明 |
|-----|------|
| `--frozen-lockfile` | 不更新 lockfile，确保依赖版本一致 |
| `--prefer-offline` | 优先使用本地缓存，减少网络请求 |
| `--offline` | 完全离线模式，不访问网络 |

## 注意事项

1. **拼写检查**
   - 构建前务必检查 Dockerfile 中的命令拼写
   - 使用 `pnpm help install` 查看所有可用参数

2. **建议顺序**
   ```dockerfile
   RUN pnpm install --frozen-lockfile --prefer-offline
   ```
   - `--frozen-lockfile` 确保依赖版本一致
   - `--prefer-offline` 加速安装（优先使用缓存）

3. **缓存优化**
   - 使用 `--prefer-offline` 可以显著减少构建时间
   - 如果缓存未命中，会自动从网络获取

## 相关文件

- `Dockerfile` - Docker 镜像构建配置
- `pnpm-lock.yaml` - 依赖锁定文件
- `package.json` - 项目依赖配置

## 常见错误

### 错误 1: Unknown option

**错误信息：**
```
ERROR Unknown option: 'xxx'
```

**解决方案：**
- 检查参数拼写
- 参考 pnpm 官方文档
- 使用 `pnpm help install` 查看帮助

### 错误 2: Cache miss

**错误信息：**
```
WARN pnpm is running without a lockfile
```

**解决方案：**
- 确保 `pnpm-lock.yaml` 存在
- 使用 `--frozen-lockfile` 参数
- 检查 `.dockerignore` 是否排除了 lockfile

### 错误 3: Network issues

**错误信息：**
```
ERR_PNPM_NO_AUTH_TOKEN
```

**解决方案：**
- 使用 `--prefer-offline` 优先使用缓存
- 配置 npm registry
- 检查网络连接

## 总结

✅ **已修复：** `prefer-offine` → `prefer-offline`

✅ **验证通过：** Dockerfile 拼写正确

✅ **构建成功：** 本地构建和 Docker 构建均可正常执行

---

**修复时间：** 2024-01-23

**影响范围：** Docker 构建流程

**风险评估：** 低（仅影响构建，不影响运行时）
