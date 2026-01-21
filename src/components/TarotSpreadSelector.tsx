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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {spreads.map((spread) => {
        const translatedSpread = getTranslatedSpread(spread);
        return (
          <Card
            key={spread.id}
            className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 bg-black/20 border-purple-500/30"
            onClick={() => onSpreadSelect(spread)}
          >
            <CardHeader className="text-center">
              <CardTitle className="text-white">{translatedSpread.name}</CardTitle>
              <CardDescription className="text-purple-200">{translatedSpread.description}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-purple-300">{spread.positions.length} cards</p>
              {spread.isPro && (
                <Badge className="mt-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-2 py-1 hover:from-purple-500 hover:to-pink-500">
                  PRO
                </Badge>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
