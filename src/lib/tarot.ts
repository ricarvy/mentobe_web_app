// 塔罗牌定义
export interface TarotCard {
  id: number;
  name: string;
  nameEn: string;
  meaning: string;
  reversedMeaning: string;
  image: string;
  isReversed: boolean;
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

// 大阿卡纳 22 张牌
export const majorArcanaCards: Omit<TarotCard, 'isReversed'>[] = [
  {
    id: 0,
    name: '愚者',
    nameEn: 'The Fool',
    meaning: '新的开始、冒险、天真、自发性、自由精神',
    reversedMeaning: '鲁莽、冒险、愚蠢、不负责任',
    image: '/tarot/00-fool.jpg',
  },
  {
    id: 1,
    name: '魔术师',
    nameEn: 'The Magician',
    meaning: '创造力、意志力、技能、专注、行动力',
    reversedMeaning: '欺骗、意志薄弱、能力滥用',
    image: '/tarot/01-magician.jpg',
  },
  {
    id: 2,
    name: '女祭司',
    nameEn: 'The High Priestess',
    meaning: '直觉、神秘、潜意识、智慧、内在知识',
    reversedMeaning: '压抑情感、缺乏内在指引、秘密被揭露',
    image: '/tarot/02-high-priestess.jpg',
  },
  {
    id: 3,
    name: '皇后',
    nameEn: 'The Empress',
    meaning: '丰饶、创造力、自然、养育、美丽',
    reversedMeaning: '创造力受阻、依赖他人、空虚',
    image: '/tarot/03-empress.jpg',
  },
  {
    id: 4,
    name: '皇帝',
    nameEn: 'The Emperor',
    meaning: '权威、结构、控制、领导力、稳定性',
    reversedMeaning: '控制欲过强、缺乏纪律、软弱',
    image: '/tarot/04-emperor.jpg',
  },
  {
    id: 5,
    name: '教皇',
    nameEn: 'The Hierophant',
    meaning: '传统、精神指引、信仰、学习、从众',
    reversedMeaning: '反叛、新方法、限制自由、虚假信念',
    image: '/tarot/05-hierophant.jpg',
  },
  {
    id: 6,
    name: '恋人',
    nameEn: 'The Lovers',
    meaning: '爱情、和谐、关系、价值观选择、结合',
    reversedMeaning: '不和谐、不平衡、错误选择、分离',
    image: '/tarot/06-lovers.jpg',
  },
  {
    id: 7,
    name: '战车',
    nameEn: 'The Chariot',
    meaning: '胜利、意志力、自律、决心、成功',
    reversedMeaning: '失去方向、攻击性、缺乏控制',
    image: '/tarot/07-chariot.jpg',
  },
  {
    id: 8,
    name: '力量',
    nameEn: 'Strength',
    meaning: '勇气、耐心、内在力量、慈悲、同情心',
    reversedMeaning: '软弱、自我怀疑、缺乏纪律',
    image: '/tarot/08-strength.jpg',
  },
  {
    id: 9,
    name: '隐士',
    nameEn: 'The Hermit',
    meaning: '内省、寻求真理、内在指引、孤独、智慧',
    reversedMeaning: '孤独、孤立、退缩、拒绝建议',
    image: '/tarot/09-hermit.jpg',
  },
  {
    id: 10,
    name: '命运之轮',
    nameEn: 'Wheel of Fortune',
    meaning: '改变、周期、命运、转折点、好运',
    reversedMeaning: '坏运气、抵抗变化、中断、破坏',
    image: '/tarot/10-wheel-of-fortune.jpg',
  },
  {
    id: 11,
    name: '正义',
    nameEn: 'Justice',
    meaning: '正义、公平、真理、因果、法律',
    reversedMeaning: '不公正、缺乏责任感、不诚实',
    image: '/tarot/11-justice.jpg',
  },
  {
    id: 12,
    name: '倒吊人',
    nameEn: 'The Hanged Man',
    meaning: '牺牲、新视角、等待、放下、放手',
    reversedMeaning: '停滞、无谓牺牲、延迟',
    image: '/tarot/12-hanged-man.jpg',
  },
  {
    id: 13,
    name: '死神',
    nameEn: 'Death',
    meaning: '结束、转变、重生、新的开始、放手',
    reversedMeaning: '抗拒变化、无法放手、停滞',
    image: '/tarot/13-death.jpg',
  },
  {
    id: 14,
    name: '节制',
    nameEn: 'Temperance',
    meaning: '平衡、适度、耐心、目的、和谐',
    reversedMeaning: '不平衡、过度、缺乏耐心',
    image: '/tarot/14-temperance.jpg',
  },
  {
    id: 15,
    name: '恶魔',
    nameEn: 'The Devil',
    meaning: '束缚、物质主义、成瘾、无知、沉迷',
    reversedMeaning: '解放、打破束缚、重获力量',
    image: '/tarot/15-devil.jpg',
  },
  {
    id: 16,
    name: '高塔',
    nameEn: 'The Tower',
    meaning: '突变、混乱、启示、觉醒、释放',
    reversedMeaning: '避免灾难、推迟改变、恐惧',
    image: '/tarot/16-tower.jpg',
  },
  {
    id: 17,
    name: '星星',
    nameEn: 'The Star',
    meaning: '希望、灵感、平静、更新、精神力量',
    reversedMeaning: '绝望、缺乏信心、消极',
    image: '/tarot/17-star.jpg',
  },
  {
    id: 18,
    name: '月亮',
    nameEn: 'The Moon',
    meaning: '幻觉、恐惧、焦虑、潜意识、直觉',
    reversedMeaning: '释放恐惧、压抑情绪、混乱',
    image: '/tarot/18-moon.jpg',
  },
  {
    id: 19,
    name: '太阳',
    nameEn: 'The Sun',
    meaning: '快乐、成功、活力、积极性、乐观',
    reversedMeaning: '暂时的挫折、缺乏成功、悲观',
    image: '/tarot/19-sun.jpg',
  },
  {
    id: 20,
    name: '审判',
    nameEn: 'Judgement',
    meaning: '审判、重生、内在召唤、宽恕、觉醒',
    reversedMeaning: '自我怀疑、拒绝召唤、忽视教训',
    image: '/tarot/20-judgement.jpg',
  },
  {
    id: 21,
    name: '世界',
    nameEn: 'The World',
    meaning: '完成、整合、成就、旅行、圆满',
    reversedMeaning: '未完成、缺乏封闭、拖延',
    image: '/tarot/21-world.jpg',
  },
];

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

// 抽牌函数
export function drawCards(count: number): TarotCard[] {
  const deck = [...majorArcanaCards];
  const shuffled = deck.sort(() => Math.random() - 0.5);
  const drawn = shuffled.slice(0, count);

  return drawn.map((card) => ({
    ...card,
    isReversed: Math.random() > 0.5,
  }));
}
