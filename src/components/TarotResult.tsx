'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { type TarotCard, type SpreadPosition } from '@/lib/tarot';
import { useI18n } from '@/lib/i18n';

interface TarotResultProps {
  question: string;
  cards: TarotCard[];
  positions: SpreadPosition[];
  interpretation: string;
  suggestion: string;
  isGenerating: boolean;
  onGetSuggestion: () => void;
  onReset: () => void;
}

export function TarotResult({
  question,
  cards,
  positions,
  interpretation,
  suggestion,
  isGenerating,
  onGetSuggestion,
  onReset,
}: TarotResultProps) {
  const { t } = useI18n();

  return (
    <div className="mt-8 space-y-6">
      {interpretation && (
        <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">{t.home.interpretation}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black/30 rounded-lg p-4 min-h-[200px] text-purple-100 whitespace-pre-wrap">
              {interpretation}
            </div>
          </CardContent>
        </Card>
      )}

      {interpretation && !suggestion && (
        <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">{t.home.suggestion}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-purple-200">
              {t.home.questionPlaceholder}
            </p>
            <Button
              onClick={onGetSuggestion}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isGenerating ? t.home.generating : t.home.suggestion}
            </Button>
          </CardContent>
        </Card>
      )}

      {suggestion && (
        <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">{t.home.suggestion}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black/30 rounded-lg p-4 min-h-[150px] text-purple-100 whitespace-pre-wrap">
              {suggestion}
            </div>
          </CardContent>
        </Card>
      )}

      {suggestion && (
        <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">{t.home.chooseQuestion}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-purple-200 mb-4">
              {t.home.questionPlaceholder}
            </p>
            <div className="flex gap-4">
              <Textarea
                placeholder={t.home.questionPlaceholder}
                className="flex-1 bg-black/30 border-purple-500/30 text-white placeholder:text-purple-300/50 min-h-[80px]"
                readOnly
              />
              <Button
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {t.home.drawCards}
              </Button>
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
