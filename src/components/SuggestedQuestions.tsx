'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
}

export function SuggestedQuestions({ onSelectQuestion }: SuggestedQuestionsProps) {
  const { t } = useI18n();

  const questions = [
    t.home.suggestedQuestion1,
    t.home.suggestedQuestion2,
    t.home.suggestedQuestion3,
    t.home.suggestedQuestion4,
    t.home.suggestedQuestion5,
    t.home.suggestedQuestion6,
  ];

  return (
    <div className="w-full max-w-3xl mx-auto mb-6">
      <Card className="relative border-purple-500/30 bg-gradient-to-br from-purple-900/50 via-purple-800/40 to-pink-900/50 backdrop-blur-sm p-6 shadow-lg shadow-purple-500/10 overflow-hidden">
        {/* 光晕效果 */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30">
              <Lightbulb className="h-4 w-4 text-purple-300" />
            </div>
            <h3 className="text-base font-semibold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
              {t.home.suggestedQuestions}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {questions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto py-2.5 px-3.5 text-left justify-start text-xs text-purple-200/90 bg-black/20 border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-400/50 hover:text-white hover:shadow-md hover:shadow-purple-500/10 transition-all duration-200 break-words word-wrap-normal whitespace-normal group"
                onClick={() => onSelectQuestion(question)}
              >
                <span className="leading-relaxed group-hover:text-white transition-colors">{question}</span>
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
