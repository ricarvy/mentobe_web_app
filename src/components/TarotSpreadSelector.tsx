'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type Spread } from '@/lib/tarot';

interface TarotSpreadSelectorProps {
  spreads: Spread[];
  onSpreadSelect: (spread: Spread) => void;
}

export function TarotSpreadSelector({ spreads, onSpreadSelect }: TarotSpreadSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {spreads.map((spread) => (
        <Card
          key={spread.id}
          className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 bg-black/20 border-purple-500/30"
          onClick={() => onSpreadSelect(spread)}
        >
          <CardHeader>
            <CardTitle className="text-white">{spread.name}</CardTitle>
            <CardDescription className="text-purple-200">{spread.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-purple-300">{spread.positions.length} 张牌</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
