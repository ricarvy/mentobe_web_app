// 掌纹分析数据 - 支持多语言

export interface PalmInsight {
  icon: string;
  description: string;
  detail: string;
}

export interface PalmistryInsights {
  lifeLine: PalmInsight;
  headLine: PalmInsight;
  heartLine: PalmInsight;
  fateLine: PalmInsight;
}

export const PALMISTRY_INSIGHTS: Record<string, PalmistryInsights> = {
  zh: {
    lifeLine: {
      icon: "❤️",
      description: "生命线揭示你的活力和人生旅程",
      detail: "一条强壮、完整的生命线表示健康和韧性。任何断裂或分叉可能标志着重大的人生变化或挑战，但最终会让你变得更强大。"
    },
    headLine: {
      icon: "🧠",
      description: "智慧线反映你的智慧和思维方式",
      detail: "一条深而直的智慧线表明实用的思维和逻辑推理。弯曲的线表示创造力和直觉思维。"
    },
    heartLine: {
      icon: "💕",
      description: "感情线揭示你的情感本质和人际关系",
      detail: "突出的感情线显示情感深度和爱的能力。其长度和形状表明你如何表达和接受感情。"
    },
    fateLine: {
      icon: "⭐",
      description: "命运线揭示命运和职业道路",
      detail: "清晰的命运线表明明确的人生目标。其强度表明外部事件与个人选择相比，在多大程度上塑造你的命运。"
    }
  },
  en: {
    lifeLine: {
      icon: "❤️",
      description: "Your life line reveals your vitality and life journey",
      detail: "A strong, unbroken life line indicates robust health and resilience. Any breaks or forks may signal significant life changes or challenges that will ultimately strengthen you."
    },
    headLine: {
      icon: "🧠",
      description: "Your head line reflects your intellect and mental approach",
      detail: "A deep, straight head line suggests practical thinking and logical reasoning. A curved line indicates creativity and intuitive thinking."
    },
    heartLine: {
      icon: "💕",
      description: "Your heart line reveals your emotional nature and relationships",
      detail: "A prominent heart line shows emotional depth and capacity for love. The length and shape indicate how you express and receive affection."
    },
    fateLine: {
      icon: "⭐",
      description: "Your fate line reveals destiny and career path",
      detail: "A clear fate line suggests a well-defined life purpose. Its strength indicates how much external events versus personal choices shape your destiny."
    }
  },
  ja: {
    lifeLine: {
      icon: "❤️",
      description: "生命線はあなたの活力と人生の旅を明らかにします",
      detail: "強くて途切れていない生命線は、強健な健康と回復力を示しています。途切れや分岐は、最終的にはあなたを強くする重要な人生の変化や課題を示す可能性があります。"
    },
    headLine: {
      icon: "🧠",
      description: "頭脳線はあなたの知性と精神的アプローチを反映しています",
      detail: "深くまっすぐな頭脳線は、実用的な思考と論理的推論を示唆しています。曲がった線は、創造性と直感的思考を示しています。"
    },
    heartLine: {
      icon: "💕",
      description: "感情線はあなたの感情的本質と人間関係を明らかにします",
      detail: "目立つ感情線は、感情的な深さと愛する能力を示しています。その長さと形状は、どのように愛情を表現し受け取るかを示しています。"
    },
    fateLine: {
      icon: "⭐",
      description: "運命線は運命とキャリアの道を明らかにします",
      detail: "明確な運命線は、明確な人生の目的を示唆しています。その強さは、外部の出来事と個人的な選択が、あなたの運命をどの程度形作るかを示しています。"
    }
  }
};

// 根据语言获取掌纹分析数据
export const getPalmistryInsights = (lang: string = 'en'): PalmistryInsights => {
  const langMap: Record<string, keyof typeof PALMISTRY_INSIGHTS> = {
    'zh': 'zh',
    'en': 'en',
    'ja': 'ja',
    'cn': 'zh', // 兼容后端使用的 cn
    'jp': 'ja', // 兼容后端使用的 jp
  };

  const mappedLang = langMap[lang] || 'en';
  return PALMISTRY_INSIGHTS[mappedLang] || PALMISTRY_INSIGHTS.en;
};
