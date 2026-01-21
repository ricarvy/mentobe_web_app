'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type Spread } from '@/lib/tarot';
import { useSpreadTranslations } from '@/lib/spreadTranslations';

interface TarotSpreadSelectorProps {
  spreads: Spread[];
  onSpreadSelect: (spread: Spread) => void;
}

export function TarotSpreadSelector({ spreads, onSpreadSelect }: TarotSpreadSelectorProps) {
  const { getTranslatedSpread } = useSpreadTranslations();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {spreads.map((spread) => {
          const translatedSpread = getTranslatedSpread(spread);
          return (
            <Card
              key={spread.id}
              className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 bg-black/20 border-purple-500/30 relative overflow-hidden"
              onClick={() => onSpreadSelect(spread)}
            >
              {spread.isPremium && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-purple-500/5 to-amber-500/5 animate-premium-shimmer"></div>
                  <div className="absolute top-0 left-0 w-full h-full">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 bg-amber-400 rounded-full animate-premium-star"
                        style={{
                          left: `${20 + (i * 15)}%`,
                          top: `${20 + (i * 12)}%`,
                          animationDelay: `${i * 0.3}s`,
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              )}
              <CardHeader className="text-center relative z-10">
                <CardTitle className="text-white">{translatedSpread.name}</CardTitle>
                <CardDescription className="text-purple-200">{translatedSpread.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-center relative z-10">
                <p className="text-sm text-purple-300">{spread.positions.length} cards</p>
                {spread.isPro && (
                  <Badge className="mt-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-2 py-1 hover:from-purple-500 hover:to-pink-500">
                    PRO
                  </Badge>
                )}
                {spread.isPremium && (
                  <Badge className="mt-3 relative bg-gradient-to-r from-purple-600 via-purple-500 to-amber-500 text-white text-xs font-bold px-3 py-1 animate-premium-border" style={{
                    boxShadow: '0 0 20px rgba(245, 158, 11, 0.5), 0 0 40px rgba(168, 85, 247, 0.3)',
                    textShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
                  }}>
                    <span className="relative z-10">PREMIUM</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-purple-500 to-amber-400 opacity-50 animate-premium-glow"></div>
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes premium-shimmer {
          0%, 100% {
            opacity: 0.3;
            transform: translateX(-100%) rotate(0deg);
          }
          50% {
            opacity: 0.6;
            transform: translateX(100%) rotate(5deg);
          }
        }

        @keyframes premium-star {
          0%, 100% {
            opacity: 0;
            transform: scale(0) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1) rotate(180deg);
          }
        }

        @keyframes premium-border {
          0%, 100% {
            box-shadow: 0 0 20px rgba(245, 158, 11, 0.5), 0 0 40px rgba(168, 85, 247, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(245, 158, 11, 0.8), 0 0 60px rgba(168, 85, 247, 0.5);
          }
        }

        @keyframes premium-glow {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </>
  );
}
