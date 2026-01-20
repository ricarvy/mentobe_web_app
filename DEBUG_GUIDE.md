# 塔罗牌应用调试指南

## 问题排查

线上环境访问 `/api/tarot/interpret` 时出现 500 错误。

## 调试步骤

### 1. 检查配置信息

访问调试接口查看配置：
```bash
curl https://5t2jjdkkmt.coze.site/api/debug/config
```

检查以下关键信息：
- `llm.isValid`: 应该是 `true`
- `llm.config.model`: 应该设置有效的模型名称
- `database.isValid`: 应该是 `true`
- `app.isValid`: 应该是 `true`

### 2. 运行组件测试

访问调试接口测试各个组件：
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"userId":"demo-user-id","skipLLM":false}' \
  https://5t2jjdkkmt.coze.site/api/debug/interpret-test
```

检查测试结果：
- 所有测试的 `status` 应该是 `success`
- 如果 `LLM Client` 测试失败，说明 LLM 配置有问题

### 3. 常见问题

#### 问题 1: LLM 模型配置错误

**错误信息：**
```
Unsupported thinking type for the current model: disabled
```

**原因：**
`doubao-seed-1-6-thinking-250715` 模型必须启用思考模式（`thinking: 'enabled'`）

**解决方案：**
确保环境变量 `LLM_THINKING` 设置为 `enabled`，或者不设置（默认启用）

#### 问题 2: 环境变量缺失

**检查方法：**
查看 `/api/debug/config` 的 `envVars` 字段，确认必要的环境变量已设置

**必要的环境变量：**
- `LLM_MODEL`: 模型名称（默认: doubao-seed-1-6-thinking-250715）
- `LLM_TEMPERATURE`: 温度参数（默认: 0.8）
- `LLM_THINKING`: 思考模式（默认: enabled）
- `DEMO_ACCOUNT_ENABLED`: 演示账号开关（默认: true）
- `DEMO_ACCOUNT_EMAIL`: 演示账号邮箱（默认: demo@mentobai.com）
- `DEMO_ACCOUNT_PASSWORD`: 演示账号密码（默认: Demo123!）

#### 问题 3: 数据库连接问题

**检查方法：**
运行 `/api/debug/interpret-test`，检查 `Database Write` 和 `Database Read` 测试

**解决方案：**
数据库由 `coze-coding-dev-sdk` 自动管理，如果连接失败，检查 SDK 配置

### 4. 查看日志

在本地环境中，详细的日志会输出到控制台：
- 请求处理流程：`[1]` 到 `[10]`
- 错误详情：`=== /api/tarot/interpret 发生错误 ===`
- 错误类型、消息、堆栈

在线上环境中，需要配置日志收集系统。

## 修复记录

### 修复 1: 增强 LLM 日志输出
- 添加请求处理流程的详细日志
- 记录 LLM 配置和调用参数
- 记录数据块接收情况

### 修复 2: 创建调试接口
- `/api/debug/config`: 查看所有配置信息
- `/api/debug/interpret-test`: 测试各个组件

### 修复 3: 修复 thinking 参数问题
- 确保测试接口使用正确的 thinking 配置
- 避免在支持思考的模型上禁用思考模式

## 当前状态

本地环境测试通过：
- ✅ 配置检查通过
- ✅ 配额检查通过
- ✅ LLM 调用通过
- ✅ 数据库写入通过
- ✅ 数据库读取通过
- ✅ interpret 接口正常返回流式响应

## 下一步操作

1. 在线上环境访问 `/api/debug/config` 查看配置
2. 在线上环境访问 `/api/debug/interpret-test` 运行测试
3. 根据测试结果定位问题
4. 修复配置问题后重启服务
