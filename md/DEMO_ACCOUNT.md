# 演示账号使用说明

## 概述
为了方便快速体验所有功能，本项目提供了一个预配置的演示账号，无需注册即可使用。

## 演示账号凭据

- **邮箱**: `demo@mentobai.com`
- **密码**: `Demo123!`
- **用户名**: Demo User

## 演示账号特性

1. **无限配额**: 演示账号没有每日解读次数限制
2. **无需数据库**: 使用配置文件验证，不依赖数据库
3. **快速体验**: 可以立即体验所有塔罗解读功能

## 如何使用

1. 访问登录页面：`http://localhost:5000/login`
2. 在登录页面底部可以看到演示账号的凭据信息
3. 输入演示账号的邮箱和密码
4. 点击登录即可开始体验

## 配置文件位置

演示账号配置位于 `src/config/demo-account.ts` 文件中：

```typescript
export const DEMO_ACCOUNT = {
  email: 'demo@mentobai.com',
  password: 'Demo123!',
  username: 'Demo User',
  id: 'demo-user-id',
  isActive: true,
  unlimitedQuota: true, // 无限限额
} as const;
```

## 修改演示账号

如需修改演示账号的凭据，请编辑 `src/config/demo-account.ts` 文件：

1. 修改 `email` 和 `password` 字段
2. 修改 `username` 字段
3. 保存文件后刷新页面即可生效

## 注意事项

- 演示账号仅用于开发和演示环境
- 生产环境部署前请移除或禁用演示账号
- 演示账号的数据不会被持久化到数据库

## 技术实现

演示账号通过以下方式实现：

1. **配置文件**: `src/config/demo-account.ts` 存储演示账号信息
2. **登录API**: `src/app/api/auth/login/route.ts` 优先检查演示账号
3. **配额管理**: `src/storage/database/dailyQuotaManager.ts` 为演示账号提供无限配额
4. **登录页面**: `src/app/login/page.tsx` 显示演示账号凭据提示
5. **多语言支持**: 在 `src/lib/translations/` 中的三个翻译文件添加了演示账号相关文案

## 普通用户注册

如果需要测试普通用户功能，可以：

1. 在登录页面点击"创建账户"切换到注册模式
2. 填写用户名、邮箱和密码进行注册
3. 普通用户有每日3次解读限额
4. 普通用户数据会存储在数据库中

## 数据库管理员账号

数据库中还预留了一个管理员账号（用于未来扩展）：

- **邮箱**: `admin@mentobai.com`
- **密码**: `Admin123!`
- **初始化脚本**: `src/scripts/init-db.ts`

注意：管理员账号存储在数据库中，需要先运行初始化脚本创建。
