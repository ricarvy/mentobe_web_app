'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { allTarotCards, type TarotCardData } from '@/lib/tarot-cards';
import { useI18n } from '@/lib/i18n';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

export default function TarotCardsPage() {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'major' | 'minor'>('all');
  const [filterSuit, setFilterSuit] = useState<'all' | 'Wands' | 'Cups' | 'Swords' | 'Pentacles'>('all');

  // 过滤和搜索卡片
  const filteredCards = useMemo(() => {
    let cards = allTarotCards;

    // 按类型过滤
    if (filterType === 'major') {
      cards = cards.filter(card => card.id < 22);
    } else if (filterType === 'minor') {
      cards = cards.filter(card => card.id >= 22);
    }

    // 按花色过滤（仅针对小阿卡纳）
    if (filterSuit !== 'all') {
      cards = cards.filter(card => card.suit === filterSuit);
    }

    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      cards = cards.filter(card =>
        card.name.toLowerCase().includes(query) ||
        card.nameEn.toLowerCase().includes(query) ||
        card.nameJa.toLowerCase().includes(query) ||
        card.keywords.some(keyword => keyword.toLowerCase().includes(query))
      );
    }

    return cards;
  }, [searchQuery, filterType, filterSuit]);

  // 获取花色名称翻译
  const getSuitName = (suit?: string) => {
    switch (suit) {
      case 'Wands': return t.tarotCards?.suitWands || '权杖';
      case 'Cups': return t.tarotCards?.suitCups || '圣杯';
      case 'Swords': return t.tarotCards?.suitSwords || '宝剑';
      case 'Pentacles': return t.tarotCards?.suitPentacles || '星币';
      default: return '';
    }
  };

  // 获取花色颜色
  const getSuitColor = (suit?: string) => {
    switch (suit) {
      case 'Wands': return 'from-red-600 to-orange-600';
      case 'Cups': return 'from-blue-600 to-cyan-600';
      case 'Swords': return 'from-gray-600 to-slate-600';
      case 'Pentacles': return 'from-green-600 to-emerald-600';
      default: return 'from-purple-600 to-pink-600';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            {t.tarotCards?.title || '塔罗牌大全'}
          </h1>
          <p className="text-lg text-purple-200">
            {t.tarotCards?.subtitle || '探索78张塔罗牌的神秘意义'}
          </p>
        </div>

        {/* 搜索和筛选 */}
        <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30 mb-8">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* 搜索框 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                <Input
                  placeholder={t.tarotCards?.searchPlaceholder || '搜索塔罗牌...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black/30 border-purple-500/30 text-white placeholder:text-purple-300/50 pl-10"
                />
              </div>

              {/* 过滤器 */}
              <div className="flex flex-wrap gap-3">
                {/* 类型过滤 */}
                <div className="flex gap-2">
                  <Button
                    variant={filterType === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('all')}
                    className={filterType === 'all' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'border-purple-500/30 text-purple-200'}
                  >
                    {t.tarotCards?.filterAll || '全部'}
                  </Button>
                  <Button
                    variant={filterType === 'major' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('major')}
                    className={filterType === 'major' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'border-purple-500/30 text-purple-200'}
                  >
                    {t.tarotCards?.filterMajor || '大阿卡纳 (22)'}
                  </Button>
                  <Button
                    variant={filterType === 'minor' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('minor')}
                    className={filterType === 'minor' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'border-purple-500/30 text-purple-200'}
                  >
                    {t.tarotCards?.filterMinor || '小阿卡纳 (56)'}
                  </Button>
                </div>

                {/* 花色过滤（仅在小阿卡纳时显示） */}
                {filterType === 'minor' && (
                  <div className="flex gap-2 ml-auto">
                    <Button
                      variant={filterSuit === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterSuit('all')}
                      className={filterSuit === 'all' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'border-purple-500/30 text-purple-200'}
                    >
                      {t.tarotCards?.filterAll || '全部'}
                    </Button>
                    <Button
                      variant={filterSuit === 'Wands' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterSuit('Wands')}
                      className={filterSuit === 'Wands' ? 'bg-gradient-to-r from-red-600 to-orange-600' : 'border-red-500/30 text-red-200'}
                    >
                      {t.tarotCards?.suitWands || '权杖'}
                    </Button>
                    <Button
                      variant={filterSuit === 'Cups' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterSuit('Cups')}
                      className={filterSuit === 'Cups' ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : 'border-blue-500/30 text-blue-200'}
                    >
                      {t.tarotCards?.suitCups || '圣杯'}
                    </Button>
                    <Button
                      variant={filterSuit === 'Swords' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterSuit('Swords')}
                      className={filterSuit === 'Swords' ? 'bg-gradient-to-r from-gray-600 to-slate-600' : 'border-gray-500/30 text-gray-200'}
                    >
                      {t.tarotCards?.suitSwords || '宝剑'}
                    </Button>
                    <Button
                      variant={filterSuit === 'Pentacles' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterSuit('Pentacles')}
                      className={filterSuit === 'Pentacles' ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'border-green-500/30 text-green-200'}
                    >
                      {t.tarotCards?.suitPentacles || '星币'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 结果统计 */}
        <div className="mb-4 text-center text-purple-200 text-sm">
          {t.tarotCards?.showing || '显示'} {filteredCards.length} {t.tarotCards?.cards || '张牌'}
        </div>

        {/* 塔罗牌卡片网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCards.map((card) => (
            <Card
              key={card.id}
              className={`bg-black/40 backdrop-blur-sm border-purple-500/30 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 ${
                expandedCardId === card.id ? 'ring-2 ring-purple-500' : ''
              }`}
            >
              {/* 卡片图片 */}
              <div
                className={`relative aspect-[3/4] overflow-hidden cursor-pointer ${expandedCardId === card.id ? 'rounded-none' : 'rounded-t-lg'}`}
                onClick={() => setExpandedCardId(expandedCardId === card.id ? null : card.id)}
              >
                {card.imageUrl ? (
                  <img
                    src={card.imageUrl}
                    alt={card.nameEn}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center">
                    <div className="text-6xl">🌟</div>
                  </div>
                )}

                {/* 图片加载失败时的占位符 */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-pink-900 hidden flex items-center justify-center">
                  <div className="text-6xl">🌟</div>
                </div>

                {/* 牌类型标签 */}
                <div className="absolute top-2 left-2">
                  {card.id < 22 ? (
                    <span className="px-2 py-1 text-xs font-bold bg-purple-600/90 text-white rounded-full">
                      {t.tarotCards?.major || '大阿卡纳'}
                    </span>
                  ) : (
                    <span
                      className={`px-2 py-1 text-xs font-bold bg-gradient-to-r ${getSuitColor(card.suit)} text-white rounded-full`}
                    >
                      {getSuitName(card.suit)}
                    </span>
                  )}
                </div>

                {/* 展开指示器 */}
                <div className="absolute bottom-2 right-2 bg-black/60 rounded-full p-1">
                  {expandedCardId === card.id ? (
                    <ChevronUp className="w-5 h-5 text-white" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-white" />
                  )}
                </div>
              </div>

              {/* 卡片基本信息 */}
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg">{card.name}</CardTitle>
                <CardDescription className="text-purple-200">
                  {card.nameEn}
                  {card.number && <span className="ml-2 text-purple-300">#{card.number}</span>}
                </CardDescription>
              </CardHeader>

              {/* 关键词标签 */}
              <CardContent className="pt-0 pb-4">
                <div className="flex flex-wrap gap-1 mb-3">
                  {card.keywords.slice(0, 3).map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-xs bg-purple-900/50 text-purple-200 rounded"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>

                {/* 展开的详细信息 */}
                {expandedCardId === card.id && (
                  <div className="space-y-4 mt-4 pt-4 border-t border-purple-500/30">
                    {/* 正位含义 */}
                    <div>
                      <p className="text-sm font-semibold text-purple-200 mb-1">
                        {t.tarotCards?.upright || '正位'}:
                      </p>
                      <p className="text-xs text-purple-100 leading-relaxed">{card.meaning}</p>
                    </div>

                    {/* 逆位含义 */}
                    <div>
                      <p className="text-sm font-semibold text-pink-300 mb-1">
                        {t.tarotCards?.reversed || '逆位'}:
                      </p>
                      <p className="text-xs text-pink-100 leading-relaxed">{card.reversedMeaning}</p>
                    </div>

                    {/* 所有关键词 */}
                    {card.keywords.length > 3 && (
                      <div>
                        <p className="text-sm font-semibold text-purple-200 mb-1">
                          {t.tarotCards?.keywords || '关键词'}:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {card.keywords.map((keyword, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 text-xs bg-purple-900/50 text-purple-200 rounded"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 无结果提示 */}
        {filteredCards.length === 0 && (
          <div className="text-center py-12">
            <p className="text-purple-200 text-lg">
              {t.tarotCards?.noResults || '未找到匹配的塔罗牌'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
