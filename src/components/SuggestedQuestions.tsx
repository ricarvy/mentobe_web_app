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
      <Card className="border-purple-500/20 bg-black/40 backdrop-blur-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-purple-200">
            {t.home.suggestedQuestions}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {questions.map((question, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto py-3 px-4 text-left justify-start text-sm text-purple-200/80 border-purple-500/20 hover:bg-purple-500/10 hover:border-purple-500/40 transition-all"
              onClick={() => onSelectQuestion(question)}
            >
              {question}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}
