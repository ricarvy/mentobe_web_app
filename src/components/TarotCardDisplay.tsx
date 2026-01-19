'use client';

import { useState, useEffect } from 'react';
import { type TarotCard, type SpreadPosition, type Spread } from '@/lib/tarot';
import { useI18n } from '@/lib/i18n';
import { useSpreadTranslations } from '@/lib/spreadTranslations';

interface TarotCardDisplayProps {
  cards: TarotCard[];
  positions: SpreadPosition[];
  isDrawing: boolean;
  spread: Spread;
}

export function TarotCardDisplay({ cards, positions, isDrawing, spread }: TarotCardDisplayProps) {
  const { t } = useI18n();
  const { getTranslatedSpread } = useSpreadTranslations();
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const translatedSpread = getTranslatedSpread(spread);

  useEffect(() => {
    if (isDrawing) {
      setFlippedCards(new Set());
      setShowAll(false);
    }
  }, [isDrawing]);

  useEffect(() => {
    if (cards.length > 0 && !isDrawing) {
      cards.forEach((_, index) => {
        setTimeout(() => {
          setFlippedCards((prev) => new Set([...prev, index]));
        }, index * 1500);
      });

      setTimeout(() => {
        setShowAll(true);
      }, cards.length * 1500 + 800);
    }
  }, [cards.length, isDrawing]);

  if (isDrawing) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex gap-4 flex-wrap justify-center">
          {Array.from({ length: positions.length }).map((_, i) => (
            <div
              key={i}
              className="w-24 h-36 sm:w-32 sm:h-48 bg-gradient-to-br from-purple-900 to-pink-900 rounded-lg border-2 border-purple-500/50 animate-pulse shadow-lg shadow-purple-500/30"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-center mb-8 text-white">{t.home.interpretation}</h2>
      <div
        className={`flex justify-center items-center gap-4 flex-wrap px-4 ${
          showAll ? 'scale-95 transition-transform duration-700' : ''
        }`}
        style={{ perspective: '1500px' }}
      >
        {cards.map((card, index) => {
          const isFlipped = flippedCards.has(index);
          const shouldFloat = !showAll && isFlipped;

          return (
            <div
              key={index}
              className={`relative w-28 h-40 sm:w-32 sm:h-48 md:w-36 md:h-54 cursor-pointer ${
                showAll ? 'transition-transform duration-300 hover:scale-105' : ''
              } ${shouldFloat ? 'animate-float' : ''}`}
              style={{
                perspective: '1500px',
                animationDelay: `${index * 0.2}s`,
              }}
            >
              <div
                className={`w-full h-full relative transition-transform duration-[1500ms] ease-in-out ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
                style={{
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* 牌背面 */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 rounded-lg border-2 border-purple-500/50 flex items-center justify-center backface-hidden shadow-xl shadow-purple-500/40"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(0deg)',
                  }}
                >
                  <div className="text-purple-300 animate-pulse">
                    <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <circle cx={12} cy={12} r={10} />
                      <path d="M12 6v12M6 12h12" />
                    </svg>
                  </div>
                  {/* 光晕效果 */}
                  <div className="absolute inset-0 rounded-lg overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-400/20 via-transparent to-pink-400/20 animate-shimmer" />
                  </div>
                </div>

                {/* 牌正面 */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-purple-800 via-pink-800 to-purple-900 rounded-lg border-2 border-purple-400/50 overflow-hidden backface-hidden shadow-xl shadow-purple-400/30"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  {/* 牌面图片 */}
                  {card.imageUrl ? (
                    <img
                      src={card.imageUrl}
                      alt={card.nameEn}
                      className={`w-full h-full object-cover ${card.isReversed ? 'rotate-180' : ''}`}
                      onError={(e) => {
                        // 图片加载失败时显示占位符
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : (
                    <div className={`flex-1 flex items-center justify-center ${card.isReversed ? 'rotate-180' : ''}`}>
                      <div className="text-3xl">🌟</div>
                    </div>
                  )}

                  {/* 占位符 - 当图片加载失败时显示 */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-800 to-pink-800 hidden">
                    <div className="text-center">
                      <div className={`text-4xl mb-2 ${card.isReversed ? 'rotate-180' : ''}`}>🌟</div>
                    </div>
                  </div>

                  {/* 牌信息覆盖层 */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/80 to-transparent p-3">
                    <div className="text-center">
                      <p className="text-sm font-bold text-white mb-0.5">{card.name}</p>
                      <p className="text-xs text-purple-200">{card.nameEn}</p>
                      {card.isReversed && (
                        <p className="text-xs text-pink-300 mt-1">{t.tarotCard.reversed}</p>
                      )}
                    </div>
                  </div>

                  {/* 光晕效果 */}
                  <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-400/10 via-transparent to-pink-400/10 animate-glow" />
                  </div>
                </div>
              </div>

              {showAll && positions[index] && (
                <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 text-center w-48 sm:w-56">
                  <p className="text-xs font-semibold text-purple-200">
                    {translatedSpread.positions[index]?.name || positions[index].name}
                  </p>
                  <p className="text-xs text-purple-300/70 mt-1">
                    {translatedSpread.positions[index]?.description || positions[index].description}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
