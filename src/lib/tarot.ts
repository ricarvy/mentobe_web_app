// 塔罗牌定义
import { allTarotCards, type TarotCardData } from './tarot-cards';

export interface TarotCard {
  id: number | string;
  name: string;
  nameEn: string;
  meaning: string;
  reversedMeaning: string;
  image: string;
  isReversed: boolean;
  imageUrl?: string;
  nameJa?: string;
  keywords?: string[];
  suit?: 'Wands' | 'Cups' | 'Swords' | 'Pentacles';
  number?: number;
}

// 牌阵定义
export interface Spread {
  id: string;
  name: string;
  description: string;
  positions: SpreadPosition[];
  category: 'recommended' | 'basic' | 'love' | 'decision' | 'career' | 'self' | 'advanced';
  isPro?: boolean;
  isPremium?: boolean;
}

export interface SpreadPosition {
  id: string;
  name: string;
  description: string;
}

// 大阿卡纳 22 张牌（使用新数据源）
export const majorArcanaCards: Omit<TarotCard, 'isReversed'>[] = allTarotCards.filter(card => card.id < 22).map(card => ({
  id: card.id,
  name: card.name,
  nameEn: card.nameEn,
  meaning: card.meaning,
  reversedMeaning: card.reversedMeaning,
  image: card.imageUrl || '',
  imageUrl: card.imageUrl,
  nameJa: card.nameJa,
  keywords: card.keywords,
}));

// 常用牌阵
export const spreads: Spread[] = [
  // 推荐牌阵
  {
    id: 'single',
    name: '单张牌',
    description: '针对单一问题的快速解读',
    category: 'recommended',
    positions: [
      {
        id: 'position1',
        name: '现状',
        description: '当前情况的象征',
      },
    ],
  },
  {
    id: 'three',
    name: '三张牌阵',
    description: '过去-现在-未来，了解事情的演变',
    category: 'recommended',
    positions: [
      {
        id: 'position1',
        name: '过去',
        description: '影响过去的情况',
      },
      {
        id: 'position2',
        name: '现在',
        description: '当前的状况',
      },
      {
        id: 'position3',
        name: '未来',
        description: '可能的未来结果',
      },
    ],
  },
  {
    id: 'cross',
    name: '凯尔特十字',
    description: '全面分析问题的牌阵',
    category: 'recommended',
    positions: [
      {
        id: 'position1',
        name: '现状',
        description: '当前情况的核心',
      },
      {
        id: 'position2',
        name: '挑战',
        description: '面临的障碍或挑战',
      },
      {
        id: 'position3',
        name: '过去',
        description: '过去的影响因素',
      },
      {
        id: 'position4',
        name: '未来',
        description: '短期未来的可能性',
      },
      {
        id: 'position5',
        name: ' Above',
        description: '潜意识或更高层级的指引',
      },
      {
        id: 'position6',
        name: 'Below',
        description: '显意识或基础情况',
      },
      {
        id: 'position7',
        name: '建议',
        description: '如何应对当前情况',
      },
      {
        id: 'position8',
        name: '外部影响',
        description: '环境和他人的影响',
      },
      {
        id: 'position9',
        name: '希望与恐惧',
        description: '内心深处的愿望和担忧',
      },
      {
        id: 'position10',
        name: '结果',
        description: '最终可能的结果',
      },
    ],
  },

  // 基础通用牌阵
  {
    id: 'timeFlow',
    name: '时间流牌阵',
    description: '预测未来 & 窥探未知，有时间指向的占卜',
    category: 'basic',
    positions: [
      {
        id: 'position1',
        name: '过去',
        description: '已经发生的事情',
      },
      {
        id: 'position2',
        name: '现在',
        description: '当前的状况',
      },
      {
        id: 'position3',
        name: '未来',
        description: '未来的发展',
      },
    ],
  },
  {
    id: 'holyTriangle',
    name: '圣三角牌阵',
    description: '判断情势 & 寻找成因，理清事情原委',
    category: 'basic',
    positions: [
      {
        id: 'position1',
        name: '问题核心',
        description: '事情的核心问题',
      },
      {
        id: 'position2',
        name: '影响因素',
        description: '影响事情的因素',
      },
      {
        id: 'position3',
        name: '解决方案',
        description: '可能的解决方案',
      },
    ],
  },
  {
    id: 'coreFocus',
    name: '直指核心牌阵',
    description: '问题探索 & 切中要害，快速找到问题症结',
    category: 'basic',
    positions: [
      {
        id: 'position1',
        name: '现状',
        description: '当前情况',
      },
      {
        id: 'position2',
        name: '障碍',
        description: '面临的障碍',
      },
      {
        id: 'position3',
        name: '解决',
        description: '解决方法',
      },
    ],
  },

  // 爱情感情专题
  {
    id: 'loverPyramid',
    name: '恋人金字塔',
    description: '恋人关系 & 互动解析，简洁直接',
    category: 'love',
    isPro: true,
    positions: [
      {
        id: 'position1',
        name: '你的想法',
        description: '你内心的想法',
      },
      {
        id: 'position2',
        name: '对方的想法',
        description: '对方内心的想法',
      },
      {
        id: 'position3',
        name: '关系现状',
        description: '你们关系的现状',
      },
    ],
  },
  {
    id: 'loveCross',
    name: '爱情大十字',
    description: '两性关系 & 爱情状况，注重内心情感',
    category: 'love',
    isPro: true,
    positions: [
      {
        id: 'position1',
        name: '你的位置',
        description: '你在关系中的位置',
      },
      {
        id: 'position2',
        name: '对方的位置',
        description: '对方在关系中的位置',
      },
      {
        id: 'position3',
        name: '关系问题',
        description: '关系中存在的问题',
      },
      {
        id: 'position4',
        name: '未来走向',
        description: '关系的未来走向',
      },
    ],
  },
  {
    id: 'findPartner',
    name: '寻找对象牌阵',
    description: '寻找意中人 & 有缘人',
    category: 'love',
    isPro: true,
    positions: [
      {
        id: 'position1',
        name: '你的状态',
        description: '你当前的状态',
      },
      {
        id: 'position2',
        name: '意中人特征',
        description: '意中人的特征',
      },
      {
        id: 'position3',
        name: '相遇机会',
        description: '相遇的机会',
      },
    ],
  },
  {
    id: 'loveTree',
    name: '爱情树牌阵',
    description: '溯本求源 & 寻找症结，回溯爱情过往',
    category: 'love',
    isPro: true,
    positions: [
      {
        id: 'position1',
        name: '根源',
        description: '感情的根源',
      },
      {
        id: 'position2',
        name: '现状',
        description: '感情的现状',
      },
      {
        id: 'position3',
        name: '结果',
        description: '感情的走向',
      },
    ],
  },

  // 选择决策牌阵
  {
    id: 'chooseTwo',
    name: '二选一牌阵',
    description: '抉择 & 判断，两种情况选择',
    category: 'decision',
    positions: [
      {
        id: 'position1',
        name: '选项A',
        description: '第一个选项的情况',
      },
      {
        id: 'position2',
        name: '选项B',
        description: '第二个选项的情况',
      },
    ],
  },
  {
    id: 'chooseThree',
    name: '三选一牌阵',
    description: '事情抉择 & 选择占卜，三个选项分析',
    category: 'decision',
    positions: [
      {
        id: 'position1',
        name: '选项A',
        description: '第一个选项的情况',
      },
      {
        id: 'position2',
        name: '选项B',
        description: '第二个选项的情况',
      },
      {
        id: 'position3',
        name: '选项C',
        description: '第三个选项的情况',
      },
    ],
  },

  // 事业财富牌阵
  {
    id: 'wealthTree',
    name: '财富之树',
    description: '事业发展 & 财运状况',
    category: 'career',
    isPremium: true,
    positions: [
      {
        id: 'position1',
        name: '当前状况',
        description: '当前的财务状况',
      },
      {
        id: 'position2',
        name: '发展机会',
        description: '发展的机会',
      },
      {
        id: 'position3',
        name: '未来趋势',
        description: '未来的趋势',
      },
    ],
  },
  {
    id: 'problemSolve',
    name: '问题解决牌阵',
    description: '问题剖析 & 答疑解惑',
    category: 'career',
    isPremium: true,
    positions: [
      {
        id: 'position1',
        name: '问题核心',
        description: '问题的核心',
      },
      {
        id: 'position2',
        name: '解决方案',
        description: '可能的解决方案',
      },
      {
        id: 'position3',
        name: '结果',
        description: '解决后的结果',
      },
    ],
  },

  // 自我探索牌阵
  {
    id: 'bodyMindSpirit',
    name: '身心灵牌阵',
    description: '自我探索 & 了解自己',
    category: 'self',
    isPremium: true,
    positions: [
      {
        id: 'position1',
        name: '身体层面',
        description: '身体层面的状态',
      },
      {
        id: 'position2',
        name: '心智层面',
        description: '心智层面的状态',
      },
      {
        id: 'position3',
        name: '灵性层面',
        description: '灵性层面的状态',
      },
    ],
  },
  {
    id: 'fourElements',
    name: '四元素牌阵',
    description: '问题探索 & 多方解析',
    category: 'self',
    isPremium: true,
    positions: [
      {
        id: 'position1',
        name: '火元素',
        description: '行动和激情',
      },
      {
        id: 'position2',
        name: '水元素',
        description: '情感和直觉',
      },
      {
        id: 'position3',
        name: '风元素',
        description: '思想和沟通',
      },
      {
        id: 'position4',
        name: '土元素',
        description: '物质和现实',
      },
    ],
  },

  // 高级预测牌阵
  {
    id: 'weeklyFortune',
    name: '周运势牌阵',
    description: '周运分析 & 单周占卜',
    category: 'advanced',
    isPremium: true,
    positions: [
      {
        id: 'position1',
        name: '周一',
        description: '周一的运势',
      },
      {
        id: 'position2',
        name: '周二',
        description: '周二的运势',
      },
      {
        id: 'position3',
        name: '周三',
        description: '周三的运势',
      },
      {
        id: 'position4',
        name: '周四',
        description: '周四的运势',
      },
      {
        id: 'position5',
        name: '周五',
        description: '周五的运势',
      },
      {
        id: 'position6',
        name: '周末',
        description: '周末的运势',
      },
      {
        id: 'position7',
        name: '总结',
        description: '整周总结',
      },
    ],
  },
  {
    id: 'hexagram',
    name: '六芒星牌阵',
    description: '事物发展 & 预测未来',
    category: 'advanced',
    isPremium: true,
    positions: [
      {
        id: 'position1',
        name: '现状',
        description: '当前情况',
      },
      {
        id: 'position2',
        name: '障碍',
        description: '面临的障碍',
      },
      {
        id: 'position3',
        name: '目标',
        description: '你的目标',
      },
      {
        id: 'position4',
        name: '过去',
        description: '过去的影响',
      },
      {
        id: 'position5',
        name: '未来',
        description: '未来的可能',
      },
      {
        id: 'position6',
        name: '结果',
        description: '最终的结果',
      },
    ],
  },
];

// 抽牌函数（使用完整78张牌，包含大阿卡纳和小阿卡纳）
export function drawCards(count: number): TarotCard[] {
  const deck = allTarotCards.map(card => ({
    id: card.id,
    name: card.name,
    nameEn: card.nameEn,
    meaning: card.meaning,
    reversedMeaning: card.reversedMeaning,
    image: card.imageUrl || '',
    imageUrl: card.imageUrl,
    nameJa: card.nameJa,
    keywords: card.keywords,
    suit: card.suit,
    number: card.number,
    isReversed: false,
  }));
  const shuffled = deck.sort(() => Math.random() - 0.5);
  const drawn = shuffled.slice(0, count);

  return drawn.map((card) => ({
    ...card,
    isReversed: Math.random() > 0.5,
  }));
}


