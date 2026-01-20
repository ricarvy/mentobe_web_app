# 解读历史接口接入说明

## 概述
将历史页面接入后端真实的history接口，实现用户解读历史记录的查询和展示。

## 后端API接口

### 接口信息
- **URL**: `/api/tarot/history`
- **方法**: GET
- **认证**: Basic Auth

### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| userId | string | 是 | 用户ID |

### 请求示例
```bash
curl "http://120.76.142.91:8901/api/tarot/history?userId=demo-user-id" \
  -H "Authorization: Basic $(echo -n 'demo@mentobai.com:Demo123!' | base64)"
```

### 响应格式
```json
{
  "success": true,
  "message": null,
  "data": {
    "interpretations": [
      {
        "id": "c40247d5-3f77-43dd-a6e2-d04598474fbd",
        "userId": "demo-user-id",
        "question": "What is my career outlook?",
        "spreadType": "single",
        "cards": "[{\"id\": 0, \"name\": \"The Fool\", \"isReversed\": false}]",
        "interpretation": "解读文本...",
        "createdAt": "2026-01-20T18:09:25.002458Z"
      }
    ]
  }
}
```

## 前端实现

### 1. 代理路由修复

**问题**: 原始代理没有正确转发查询参数，导致API调用失败。

**解决方案**: 修改 `src/app/api/proxy/[...path]/route.ts`，添加查询参数转发。

```typescript
// 修改前
const backendUrl = `${BACKEND_URL}/${path}`;

// 修改后
const queryString = request.nextUrl.search;
const backendUrl = `${BACKEND_URL}/${path}${queryString}`;
```

### 2. 历史页面实现

**文件**: `src/app/history/page.tsx`

#### 数据结构
```typescript
interface HistoryItem {
  id: string;
  question: string;
  interpretation: string;
  spreadType: string;
  createdAt: string;
  cards: string; // JSON字符串
}

interface TarotCard {
  id: string;
  name: string;
  nameEn: string;
  meaning: string;
  reversedMeaning: string;
  isReversed: boolean;
  imageUrl?: string;
}
```

#### 核心功能

1. **获取历史记录**
```typescript
const fetchHistory = async () => {
  if (!user) return;

  try {
    setLoading(true);
    setRefreshing(true);

    const data = await apiRequest<{ interpretations: HistoryItem[] }>(
      `/api/tarot/history?userId=${user.id}`,
      {
        method: 'GET',
      }
    );

    setHistory(data.interpretations || []);
  } catch (error) {
    console.error('Error fetching history:', error);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};
```

2. **解析卡牌数据**
```typescript
const parseCards = (cardsJson: string): TarotCard[] => {
  try {
    return JSON.parse(cardsJson);
  } catch (error) {
    console.error('Error parsing cards JSON:', error);
    return [];
  }
};
```

3. **展示历史记录**
- 使用卡片式布局展示每条历史记录
- 默认只显示问题、时间、牌阵类型等基本信息
- 点击可展开查看详细内容和AI解读
- 使用Markdown渲染AI解读文本

## 测试验证

### 1. API接口测试

#### 演示账号历史记录
```bash
curl -s "http://localhost:5000/api/proxy/api/tarot/history?userId=demo-user-id" \
  -H "Authorization: Basic $(echo -n 'demo@mentobai.com:Demo123!' | base64)" \
  | python3 -c "import sys, json; data=json.load(sys.stdin); print(f'Success: {data[\"success\"]}'); print(f'Total: {len(data[\"data\"][\"interpretations\"])} interpretations')"
```

**结果**:
```
Success: True
Total: 12 interpretations
```

### 2. 前端页面测试

#### 测试步骤
1. 使用演示账号登录
2. 访问历史页面（`/history`）
3. 检查历史记录是否正常加载
4. 点击历史记录查看详细内容

#### 预期结果
- ✅ 历史记录列表正确加载
- ✅ 显示问题、时间、牌阵类型等信息
- ✅ 点击可展开查看详细内容
- ✅ 卡牌图片正确显示
- ✅ AI解读使用Markdown正确渲染
- ✅ 逆位卡牌显示正确标识

## 功能特性

### 1. 数据展示
- **基本信息**: 问题、时间、牌阵类型
- **卡牌展示**: 卡牌图片、名称、逆位标识
- **AI解读**: 使用Markdown渲染的详细解读文本

### 2. 交互功能
- **展开/收起**: 点击历史记录可展开查看详情
- **刷新按钮**: 手动刷新历史记录列表
- **加载状态**: 显示加载动画

### 3. 空状态处理
- 未登录时提示用户登录
- 无历史记录时显示引导提示

### 4. 错误处理
- API调用失败时的错误提示
- JSON解析错误的容错处理

## 技术细节

### 1. 认证机制
- 使用Basic Auth进行认证
- 从localStorage读取用户凭证
- 通过API客户端自动添加Authorization header

### 2. 数据格式
- 卡牌数据以JSON字符串格式存储
- 前端解析JSON字符串获取卡牌信息
- 支持正位和逆位卡牌显示

### 3. Markdown渲染
- 使用`react-markdown`和`remark-gfm`渲染AI解读
- 支持GFM（GitHub Flavored Markdown）
- 自定义样式匹配主题

## 后续优化建议

1. **分页加载**
   - 当历史记录较多时实现分页
   - 添加"加载更多"功能

2. **筛选和搜索**
   - 按时间范围筛选
   - 按问题关键词搜索
   - 按牌阵类型筛选

3. **导出功能**
   - 导出为PDF
   - 分享历史记录
   - 生成分享链接

4. **性能优化**
   - 虚拟滚动（大量历史记录）
   - 图片懒加载
   - 缓存机制

## 相关文件

- `src/app/history/page.tsx` - 历史页面
- `src/app/api/proxy/[...path]/route.ts` - API代理
- `src/lib/api-client.ts` - API客户端
- `src/lib/auth.ts` - 认证工具
- `src/lib/userContext.tsx` - 用户上下文
