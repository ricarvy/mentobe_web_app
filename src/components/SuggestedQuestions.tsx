'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Lightbulb, Sparkles } from 'lucide-react';
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
      {/* 自定义动画样式 */}
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.3), 0 0 40px rgba(236, 72, 153, 0.2);
          }
          50% {
            box-shadow: 0 0 30px rgba(168, 85, 247, 0.5), 0 0 60px rgba(236, 72, 153, 0.3);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 0.2;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        @keyframes icon-pulse {
          0%, 100% {
            transform: rotate(0deg) scale(1);
          }
          25% {
            transform: rotate(-10deg) scale(1.1);
          }
          75% {
            transform: rotate(10deg) scale(1.1);
          }
        }

        .card-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }

        .float-animation {
          animation: float 3s ease-in-out infinite;
        }

        .shimmer-border {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(168, 85, 247, 0.6),
            rgba(236, 72, 153, 0.6),
            rgba(168, 85, 247, 0.6),
            transparent
          );
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .icon-pulse {
          animation: icon-pulse 4s ease-in-out infinite;
        }

        .question-button:hover .question-icon {
          opacity: 1;
          transform: translateX(0) scale(1);
        }

        .question-button .question-icon {
          opacity: 0;
          transform: translateX(-10px) scale(0.8);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      <Card className="relative border-purple-500/40 bg-gradient-to-br from-purple-950/70 via-purple-900/60 to-pink-950/70 backdrop-blur-xl p-6 overflow-hidden card-glow group">
        {/* 流光边框 */}
        <div className="shimmer-border"></div>

        {/* 顶部光晕线条 */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-purple-500/80 via-pink-500/80 to-transparent"></div>

        {/* 多层光晕效果 */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -top-24 -left-24 w-56 h-56 bg-pink-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-16 w-48 h-48 bg-blue-600/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-32 w-56 h-56 bg-violet-600/15 rounded-full blur-3xl"></div>

        {/* 星星粒子 */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}

        <div className="relative z-10">
          {/* 标题部分 */}
          <div className="flex items-center gap-3 mb-5 float-animation">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-md opacity-50"></div>
              <div className="relative p-2.5 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 icon-pulse">
                <Lightbulb className="h-5 w-5 text-white drop-shadow-lg" />
              </div>
              {/* 装饰性星星 */}
              <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 bg-clip-text text-transparent">
                {t.home.suggestedQuestions}
              </h3>
              <p className="text-xs text-purple-300/70 mt-0.5">
                ✨ Tap to select your question ✨
              </p>
            </div>
          </div>

          {/* 问题按钮网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {questions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                className="question-button h-auto py-3 px-4 text-left justify-start text-sm text-purple-100/90 bg-black/40/60 border-purple-500/30 hover:bg-purple-600/30 hover:border-purple-400/60 hover:text-white hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-0.5 transition-all duration-300 break-words word-wrap-normal whitespace-normal relative overflow-hidden group/btn"
                onClick={() => onSelectQuestion(question)}
              >
                {/* 按钮背景光晕 */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>

                {/* 装饰性图标 */}
                <div className="question-icon absolute right-2 top-1/2 -translate-y-1/2">
                  <Sparkles className="h-3 w-3 text-yellow-300/70" />
                </div>

                {/* 问题文本 */}
                <span className="relative leading-relaxed">{question}</span>
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
