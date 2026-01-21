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
  {
    id: 'single',
    name: '单张牌',
    description: '针对单一问题的快速解读',
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


