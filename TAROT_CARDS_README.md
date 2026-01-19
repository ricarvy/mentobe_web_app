# 塔罗牌数据集成说明

## 概述

本项目已经集成了完整的78张塔罗牌数据，包括22张大阿卡纳（Major Arcana）和56张小阿卡纳（Minor Arcana）。

## 数据结构

### TarotCardData 接口

```typescript
export interface TarotCardData {
  id: number;                    // 牌的唯一ID
  name: string;                  // 中文名称
  nameEn: string;                // 英文名称
  nameJa: string;                // 日文名称
  meaning: string;               // 正位含义
  reversedMeaning: string;       // 逆位含义
  keywords: string[];            // 关键词（英文）
  imageUrl?: string;             // 图片URL
  suit?: 'Wands' | 'Cups' | 'Swords' | 'Pentacles'; // 花色（仅小阿卡纳）
  number?: number;               // 牌面数字（仅小阿卡纳）
}
```

## 数据文件

### 1. `src/lib/tarot-cards.ts`

完整的78张塔罗牌数据文件，包含：

- **大阿卡纳** (22张): id 0-21
  - 愚者、魔术师、女祭司、皇帝等

- **小阿卡纳** (56张):
  - 权杖: 14张 (id 22-35)
  - 圣杯: 14张 (id 36-49)
  - 宝剑: 14张 (id 50-63)
  - 星币: 14张 (id 64-77)

### 2. `src/lib/tarot.ts`

塔罗牌相关工具函数和类型定义：

- `TarotCard` 接口：带翻转状态和图片的牌数据
- `drawCards()`: 从大阿卡纳抽牌
- `drawCardsFromFullDeck()`: 从完整78张牌抽牌
- 牌阵定义（单张、三张牌、凯尔特十字）

## 图片来源

当前使用的图片URL格式：
```
https://www.fatemaster.ai/tarot-cards-images/{card-name}.jpg
```

示例：
- `https://www.fatemaster.ai/tarot-cards-images/00-fool.jpg`
- `https://www.fatemaster.ai/tarot-cards-images/wands-ace.jpg`

**注意**：这些URL可能需要实际下载并存储到对象存储中。

## 下载塔罗牌图片

项目提供了下载脚本，可以将塔罗牌图片从fatemaster.ai下载并上传到对象存储：

```bash
npx tsx src/scripts/download-tarot-images.ts
```

这个脚本会：
1. 遍历所有78张牌
2. 从imageUrl下载图片
3. 上传到对象存储
4. 输出映射配置

## 组件更新

### 1. TarotCardDisplay 组件

更新后的功能：
- 显示牌的正面图片（使用imageUrl）
- 如果图片加载失败，显示占位符
- 牌面底部显示牌的中英文名称
- 逆位时显示"逆位"标记

### 2. TarotResult 组件

新增功能：
- 可展开/折叠的牌详细信息卡片
- 每张牌显示缩略图
- 点击展开显示：
  - 大尺寸图片
  - 正位含义
  - 逆位含义（如果是逆位）
  - 牌阵位置信息

## 多语言支持

塔罗牌数据包含三种语言的名称：
- 中文 (`name`)
- 英文 (`nameEn`)
- 日文 (`nameJa`)

翻译文件更新：
- `src/lib/translations/en.ts`
- `src/lib/translations/zh.ts`
- `src/lib/translations/ja.ts`

新增翻译键：
- `tarotCard.back`: 牌背面
- `tarotCard.reversed`: 逆位
- `tarotCard.upright`: 正位
- `tarotCard.meaning`: 含义
- `tarotCard.reversedMeaning`: 逆位含义

- `home.tarotCards`: 塔罗牌

## 使用示例

### 抽牌并显示

```typescript
import { drawCards, drawCardsFromFullDeck } from '@/lib/tarot';

// 从大阿卡纳抽3张牌
const cards = drawCards(3);

// 从完整78张牌抽10张牌
const fullDeckCards = drawCardsFromFullDeck(10);

// cards.forEach(card => {
//   console.log(card.name, card.nameEn, card.isReversed);
//   console.log(card.imageUrl); // 图片URL
// });
```

### 获取特定牌

```typescript
import { getCardById, getCardsBySuit, getMajorArcana, getMinorArcana } from '@/lib/tarot-cards';

// 根据ID获取牌
const fool = getCardById(0);

// 获取权杖花色的所有牌
const wands = getCardsBySuit('Wands');

// 获取所有大阿卡纳
const majorArcana = getMajorArcana();

// 获取所有小阿卡纳
const minorArcana = getMinorArcana();
```

## 翻牌动效

翻牌效果通过CSS 3D transform实现：

1. **初始状态**: 显示牌背面
2. **翻转动画**: 逐步翻转每张牌（间隔800ms）
3. **翻转完成**: 显示牌正面图片和信息
4. **展示状态**: 所有牌缩小显示，添加位置信息

## 图片加载策略

1. **优先加载imageUrl**: 使用牌的imageUrl属性
2. **错误处理**: 图片加载失败时隐藏图片，显示占位符
3. **占位符**: 使用🌟emoji作为后备显示

## 未来改进

1. **图片本地化**: 将图片下载到本地或对象存储
2. **图片优化**: 压缩图片大小，优化加载速度
3. **自定义图片**: 允许用户上传自己的塔罗牌图片
4. **动画增强**: 添加更丰富的翻牌和展示动画

## 技术栈

- React 19
- TypeScript 5
- Next.js 16 (App Router)
- Tailwind CSS 4
- 对象存储集成

## 相关文件

- `src/lib/tarot-cards.ts`: 完整的塔罗牌数据
- `src/lib/tarot.ts`: 工具函数和牌阵定义
- `src/components/TarotCardDisplay.tsx`: 牌面显示组件
- `src/components/TarotResult.tsx`: 结果展示组件
- `src/scripts/download-tarot-images.ts`: 图片下载脚本
- `src/lib/translations/*.ts`: 多语言翻译文件

## 许可

塔罗牌数据和图片来源：fatemaster.ai
