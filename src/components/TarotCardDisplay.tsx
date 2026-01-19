'use client';

import { useState, useEffect } from 'react';
import { type TarotCard, type SpreadPosition } from '@/lib/tarot';

interface TarotCardDisplayProps {
  cards: TarotCard[];
  positions: SpreadPosition[];
  isDrawing: boolean;
}

export function TarotCardDisplay({ cards, positions, isDrawing }: TarotCardDisplayProps) {
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [showAll, setShowAll] = useState(false);

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
        }, index * 800);
      });

      setTimeout(() => {
        setShowAll(true);
      }, cards.length * 800 + 500);
    }
  }, [cards.length, isDrawing]);

  if (isDrawing) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex gap-4 flex-wrap justify-center">
          {Array.from({ length: positions.length }).map((_, i) => (
            <div
              key={i}
              className="w-24 h-36 bg-gradient-to-br from-purple-900 to-pink-900 rounded-lg border-2 border-purple-500/50 animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-center mb-8 text-white">你的牌面</h2>
      <div
        className={`flex justify-center items-center gap-4 flex-wrap ${
          showAll ? 'scale-90 transition-transform duration-500' : ''
        }`}
        style={{ perspective: '1000px' }}
      >
        {cards.map((card, index) => (
          <div
            key={index}
            className={`relative w-32 h-48 cursor-pointer ${showAll ? 'transition-transform duration-300 hover:scale-105' : ''}`}
            style={{ perspective: '1000px' }}
          >
            <div
              className={`w-full h-full relative transition-transform duration-1000 ${
                flippedCards.has(index) ? 'rotate-y-180' : ''
              }`}
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              {/* 牌背面 */}
              <div
                className="absolute inset-0 bg-gradient-to-br from-purple-900 to-pink-900 rounded-lg border-2 border-purple-500/50 flex items-center justify-center backface-hidden"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(0deg)',
                }}
              >
                <div className="text-purple-300">
                  <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <circle cx={12} cy={12} r={10} />
                    <path d="M12 6v12M6 12h12" />
                  </svg>
                </div>
              </div>

              {/* 牌正面 */}
              <div
                className="absolute inset-0 bg-gradient-to-br from-purple-800 to-pink-800 rounded-lg border-2 border-purple-400/50 p-2 flex flex-col items-center justify-center backface-hidden"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <div className={`text-3xl mb-2 ${card.isReversed ? 'rotate-180' : ''}`}>
                  🌟
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-white mb-1">{card.name}</p>
                  <p className="text-xs text-purple-200">{card.nameEn}</p>
                  {card.isReversed && (
                    <p className="text-xs text-pink-300 mt-1">（逆位）</p>
                  )}
                </div>
              </div>
            </div>

            {showAll && (
              <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center w-48">
                <p className="text-xs font-semibold text-purple-200">{positions[index]?.name}</p>
                <p className="text-xs text-purple-300/70 mt-1">{positions[index]?.description}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
