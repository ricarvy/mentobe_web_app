'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { type TarotCard, type SpreadPosition } from '@/lib/tarot';

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
  return (
    <div className="mt-8 space-y-6">
      {interpretation && (
        <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">AI解读</CardTitle>
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
            <CardTitle className="text-white">获取更多指引</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-purple-200">
              想了解更多关于其他相关问题吗？让AI为你提供个性化建议。
            </p>
            <Button
              onClick={onGetSuggestion}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isGenerating ? '生成中...' : '获取AI建议'}
            </Button>
          </CardContent>
        </Card>
      )}

      {suggestion && (
        <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">AI建议</CardTitle>
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
            <CardTitle className="text-white">测试其他问题</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-purple-200 mb-4">
              如果你想探索其他相关问题，可以在这里输入新问题，AI将为你提供针对性的解读。
            </p>
            <div className="flex gap-4">
              <Textarea
                placeholder="输入你想了解的其他问题..."
                className="flex-1 bg-black/30 border-purple-500/30 text-white placeholder:text-purple-300/50 min-h-[80px]"
                readOnly
              />
              <Button
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                提交
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
          重新开始
        </Button>
      </div>
    </div>
  );
}
