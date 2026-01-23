# 构建错误修复说明

## 问题描述

部署时出现 TypeScript 编译错误：

```
Type error: Cannot find module 'postgres' or its corresponding type declarations.
./docs/supabase/db-config-example.ts:7:22
```

## 原因分析

`docs/supabase/db-config-example.ts` 是一个示例配置文件，包含了使用 Supabase 数据库的示例代码。该文件导入了 `postgres` 模块，但项目中并没有安装这个依赖。

在生产环境构建时，TypeScript 会检查所有 `.ts` 文件，包括文档目录中的文件。由于缺少 `postgres` 依赖，导致编译失败。

## 解决方案

### 1. 移除临时和示例文件

删除了以下文件：
- `docs/supabase/db-config-example.ts` - Supabase 数据库配置示例
- `tmp/db-config-example.ts` - 临时数据库配置文件
- `tmp/get-tarot-images.ts` - 临时图片获取脚本
- `workspace/scripts/get-tarot-images.ts` - 临时图片获取脚本

### 2. 为什么这些文件不应该存在

- **示例代码**：`docs/supabase/db-config-example.ts` 是示例代码，应该使用 `.md` 文档说明，而不是 `.ts` 文件
- **临时文件**：`tmp/` 目录中的文件是临时的，不应该提交到版本控制
- **脚本文件**：`workspace/scripts/` 目录不在源代码路径中，不应该包含构建目标

### 3. 最佳实践建议

#### 文档目录（docs/）
- 仅使用 Markdown 文档（`.md`）和 SQL 脚本（`.sql`）
- 示例代码应该使用代码块嵌入在 Markdown 文档中
- 不要包含需要额外依赖的 TypeScript 文件

#### 临时目录（tmp/）
- 使用 `.gitignore` 排除临时文件
- 在构建前清理临时文件
- 不要在临时目录中存放需要编译的代码

#### 脚本目录
- 将工具脚本放在 `src/scripts/` 目录下
- 如果脚本不需要在构建时编译，使用 `.js` 扩展名
- 或者使用 `scripts/` 目录（在项目根目录下）

## 验证

### 1. 本地构建测试

```bash
# 检查 TypeScript 类型
npx tsc --noEmit

# 运行生产构建
pnpm run build
```

### 2. 部署验证

- ✅ TypeScript 编译通过
- ✅ 生产构建成功
- ✅ 静态文件生成正确

## 后续优化

1. **添加 pre-commit 钩子**
   - 防止将临时文件和示例代码提交到仓库
   - 使用 husky 和 lint-staged

2. **改进文档结构**
   - 将示例代码迁移到 Markdown 文档的代码块中
   - 添加清晰的代码示例说明

3. **清理脚本**
   - 在 `package.json` 中添加清理脚本
   - 在构建前自动清理临时文件

## 相关文件

- `.gitignore` - 添加需要排除的文件和目录
- `tsconfig.json` - 可以配置 `exclude` 排除特定目录
- `docs/` - 文档目录规范
