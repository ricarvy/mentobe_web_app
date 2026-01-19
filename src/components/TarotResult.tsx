'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { type TarotCard, type SpreadPosition } from '@/lib/tarot';
import { useI18n } from '@/lib/i18n';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TarotResultProps {
  question: string;
  cards: TarotCard[];
  positions: SpreadPosition[];
  interpretation: string;
  isGenerating: boolean;
  onReset: () => void;
}

export function TarotResult({
  question,
  cards,
  positions,
  interpretation,
  isGenerating,
  onReset,
}: TarotResultProps) {
  const { t } = useI18n();
  const [expandedCardIndex, setExpandedCardIndex] = useState<number | null>(null);

  return (
    <div className="mt-8 space-y-6">
      {/* 牌的详细信息 */}
      <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white">{t.home.tarotCards}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {cards.map((card, index) => (
            <div key={index} className="border border-purple-500/20 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedCardIndex(expandedCardIndex === index ? null : index)}
                className="w-full p-3 flex items-center justify-between bg-purple-900/20 hover:bg-purple-900/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {card.imageUrl && (
                    <img
                      src={card.imageUrl}
                      alt={card.nameEn}
                      className="w-12 h-16 object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">{card.name}</p>
                    <p className="text-xs text-purple-200">{card.nameEn}</p>
                    {card.isReversed && (
                      <p className="text-xs text-pink-300 mt-0.5">{t.tarotCard.reversed}</p>
                    )}
                  </div>
                </div>
                {expandedCardIndex === index ? (
                  <ChevronUp className="text-purple-400 w-5 h-5" />
                ) : (
                  <ChevronDown className="text-purple-400 w-5 h-5" />
                )}
              </button>

              {expandedCardIndex === index && (
                <div className="p-4 bg-black/30 space-y-3">
                  {card.imageUrl && (
                    <div className="flex justify-center">
                      <img
                        src={card.imageUrl}
                        alt={card.nameEn}
                        className="max-w-[200px] max-h-[300px] object-contain rounded-lg border border-purple-500/30"
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-purple-300 mb-1">
                      {t.tarotCard.meaning}
                    </p>
                    <p className="text-xs text-purple-100">{card.meaning}</p>
                  </div>
                  {card.isReversed && (
                    <div>
                      <p className="text-sm font-semibold text-pink-300 mb-1">
                        {t.tarotCard.reversedMeaning}
                      </p>
                      <p className="text-xs text-pink-100">{card.reversedMeaning}</p>
                    </div>
                  )}
                  {positions[index] && (
                    <div>
                      <p className="text-sm font-semibold text-purple-200 mb-1">
                        {positions[index].name}
                      </p>
                      <p className="text-xs text-purple-300">{positions[index].description}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {interpretation && (
        <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">{t.home.interpretation}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black/30 rounded-lg p-4 min-h-[200px] text-purple-100 prose prose-invert prose-purple max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {interpretation}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI解读加载状态 */}
      {!interpretation && isGenerating && (
        <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">{t.home.interpretation}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black/30 rounded-lg p-8 min-h-[200px] flex flex-col items-center justify-center">
              {/* 加载动画 */}
              <div className="relative w-20 h-20 mb-4">
                <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-4 border-transparent border-t-pink-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              <p className="text-purple-200 text-sm animate-pulse">
                {t.home.generating}...
              </p>
              <p className="text-purple-300/70 text-xs mt-2">
                AI正在为您解读塔罗牌的奥秘
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4 pt-4">
        <Button
          onClick={onReset}
          variant="outline"
          className="flex-1 border-purple-500/30 text-purple-200 hover:bg-purple-500/10"
        >
          {t.header.home}
        </Button>
      </div>
    </div>
  );
}
