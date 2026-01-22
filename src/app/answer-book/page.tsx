'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Sparkles, Star, Crown, RefreshCw, ArrowLeft, Heart, Lightbulb } from 'lucide-react';
import { getAnswers } from '@/data/answers';
import { useI18n } from '@/lib/i18n';

type Stage = 'prompt' | 'revealing' | 'answer';

export default function AnswerBookPage() {
  const { t, language } = useI18n();
  const [stage, setStage] = useState<Stage>('prompt');
  const [answer, setAnswer] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  const handleReveal = async () => {
    setIsAnimating(true);
    setStage('revealing');

    // 模拟神秘的延迟，让用户感受到神圣的氛围
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 从答案池中随机获取一个答案
    const answers = getAnswers(language);
    const finalAnswer = answers[Math.floor(Math.random() * answers.length)];
    setAnswer(finalAnswer);
    setStage('answer');
    setIsAnimating(false);
  };

  const handleAskAgain = () => {
    setStage('prompt');
    setAnswer('');
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Enhanced Dynamic Starry Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-black to-pink-950" />

        {/* Twinkling Stars */}
        {[...Array(300)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 4 + 2}s`,
              opacity: Math.random() * 0.8 + 0.2,
            }}
          />
        ))}

        {/* Floating Mystic Particles */}
        {[...Array(30)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute animate-float opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${8 + i * 0.5}s`,
            }}
          >
            {i % 3 === 0 && <BookOpen className="w-6 h-6 text-purple-400" />}
            {i % 3 === 1 && <Sparkles className="w-6 h-6 text-pink-400" />}
            {i % 3 === 2 && <Star className="w-6 h-6 text-yellow-400" />}
          </div>
        ))}

        {/* Shooting Stars */}
        {[...Array(5)].map((_, i) => (
          <div
            key={`shooting-${i}`}
            className="absolute bg-gradient-to-r from-purple-400 to-transparent h-0.5 animate-shooting-star opacity-60"
            style={{
              width: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 50}%`,
              animationDelay: `${i * 8 + Math.random() * 4}s`,
              animationDuration: `${Math.random() * 2 + 1}s`,
            }}
          />
        ))}

        {/* Shimmer Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent animate-shimmer" />

        {/* Aurora Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-pink-500/5 animate-aurora" />
      </div>

      <style jsx global>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes shooting-star {
          0% { transform: translateX(-100px) translateY(0); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateX(300px) translateY(100px); opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(10deg); }
        }
        @keyframes aurora {
          0%, 100% { transform: translateY(0) scaleY(1); opacity: 0.3; }
          50% { transform: translateY(-20px) scaleY(1.2); opacity: 0.5; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.5), 0 0 80px rgba(236, 72, 153, 0.3); }
          50% { box-shadow: 0 0 60px rgba(168, 85, 247, 0.8), 0 0 100px rgba(236, 72, 153, 0.5); }
        }
        @keyframes text-glow {
          0%, 100% { text-shadow: 0 0 20px rgba(236, 72, 153, 0.5), 0 0 40px rgba(168, 85, 247, 0.3); }
          50% { text-shadow: 0 0 30px rgba(236, 72, 153, 0.8), 0 0 60px rgba(168, 85, 247, 0.5); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 30px rgba(236, 72, 153, 0.4); }
          50% { box-shadow: 0 0 60px rgba(236, 72, 153, 0.8); }
        }
        @keyframes mystic-reveal {
          0% { opacity: 0; transform: scale(0.8) translateY(30px); filter: blur(10px); }
          50% { opacity: 0.5; filter: blur(5px); }
          100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
        }
        @keyframes breathe {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        .animate-twinkle { animation: twinkle ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 4s ease-in-out infinite; }
        .animate-shooting-star { animation: shooting-star 3s ease-out infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-aurora { animation: aurora 8s ease-in-out infinite; }
        .animate-glow { animation: glow 4s ease-in-out infinite; }
        .animate-text-glow { animation: text-glow 3s ease-in-out infinite; }
        .animate-fade-in-up { animation: fadeInUp 1s ease-out forwards; }
        .animate-fade-in-scale { animation: fadeInScale 0.8s ease-out forwards; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .animate-mystic-reveal { animation: mystic-reveal 2s ease-out forwards; }
        .animate-breathe { animation: breathe 3s ease-in-out infinite; }
        .gradient-animate {
          background-size: 200% 200%;
          animation: gradient-rotate 6s ease infinite;
        }
      `}</style>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-purple-300/80 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">{t.answerBook.backToHome}</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-16">
          {/* Decorative Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-purple-900/40 border border-purple-500/30 rounded-full mb-8 backdrop-blur-sm animate-glow">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-semibold text-purple-200 tracking-wide">{t.answerBook.badge}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-text-glow">
            {t.answerBook.title}
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-purple-200/70 max-w-2xl mx-auto leading-relaxed">
            {t.answerBook.subtitle}
          </p>
        </div>

        {/* Main Content Area */}
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-3xl bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-xl border-2 border-purple-500/40 rounded-3xl overflow-hidden animate-fade-in-scale">
            {/* Mystical Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-pink-600/10 animate-aurora" />

            <CardContent className="relative pt-16 pb-16 px-8">
              {stage === 'prompt' && (
                <div className="text-center space-y-10">
                  {/* Main Prompt */}
                  <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <div className="relative inline-block">
                      {/* Glowing Halo */}
                      <div className="absolute -inset-4 bg-purple-500/20 blur-3xl rounded-full animate-pulse-glow" />
                      <h2 className="relative text-3xl md:text-4xl font-bold text-white animate-text-glow leading-relaxed animate-breathe">
                        {t.answerBook.promptTitle}
                      </h2>
                    </div>
                  </div>

                  {/* Sub Prompt */}
                  <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                    <p className="text-lg text-purple-200/80 mb-8">
                      {t.answerBook.promptSubtitle}
                    </p>
                  </div>

                  {/* Reveal Button */}
                  <div className="animate-fade-in-up" style={{ animationDelay: '1s' }}>
                    <Button
                      size="lg"
                      onClick={handleReveal}
                      disabled={isAnimating}
                      className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 px-12 py-6 text-xl font-semibold gradient-animate animate-pulse-glow transition-all hover:scale-105"
                    >
                      <Sparkles className="mr-3 w-6 h-6" />
                      {t.answerBook.revealButton}
                      <Sparkles className="ml-3 w-6 h-6" />
                    </Button>
                  </div>

                  {/* Mystic Decorations */}
                  <div className="flex justify-center gap-8 mt-12 animate-fade-in-up opacity-60" style={{ animationDelay: '1.4s' }}>
                    <Star className="w-6 h-6 text-purple-400 animate-twinkle" style={{ animationDelay: '0s' }} />
                    <Crown className="w-6 h-6 text-yellow-400 animate-float" style={{ animationDelay: '0.5s' }} />
                    <Lightbulb className="w-6 h-6 text-pink-400 animate-twinkle" style={{ animationDelay: '1s' }} />
                  </div>
                </div>
              )}

              {stage === 'revealing' && (
                <div className="text-center py-16">
                  {/* Loading Animation */}
                  <div className="relative inline-block mb-8">
                    {/* Rotating Glow Rings */}
                    <div className="absolute -inset-8 border-2 border-purple-500/30 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
                    <div className="absolute -inset-12 border-2 border-pink-500/20 rounded-full animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }} />

                    {/* Central Icon */}
                    <div className="relative w-24 h-24 mx-auto">
                      <BookOpen className="w-full h-full text-purple-400 animate-pulse" />
                    </div>
                  </div>

                  {/* Loading Text */}
                  <div className="animate-fade-in-up">
                    <p className="text-xl text-purple-200/90 animate-text-glow">
                      {t.answerBook.revealingTitle}
                    </p>
                    <div className="mt-4 flex justify-center gap-2">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {stage === 'answer' && (
                <div className="text-center py-8">
                  {/* Mystic Decorative Header */}
                  <div className="flex justify-center gap-4 mb-8 animate-fade-in-up">
                    <Star className="w-8 h-8 text-yellow-400 animate-twinkle" />
                    <Crown className="w-8 h-8 text-purple-400 animate-float" />
                    <Star className="w-8 h-8 text-yellow-400 animate-twinkle" style={{ animationDelay: '0.5s' }} />
                  </div>

                  {/* Answer Container */}
                  <div className="relative inline-block max-w-2xl animate-mystic-reveal">
                    {/* Glowing Background */}
                    <div className="absolute -inset-6 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 blur-3xl rounded-3xl animate-pulse-glow" />

                    {/* Answer Text */}
                    <div className="relative bg-black/40 backdrop-blur-xl border-2 border-purple-500/50 rounded-2xl p-10">
                      <p className="text-2xl md:text-3xl font-bold text-white leading-relaxed animate-text-glow">
                        {answer}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-center gap-4 mt-12 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                    <Button
                      size="lg"
                      onClick={handleAskAgain}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-3 gradient-animate animate-pulse-glow transition-all hover:scale-105"
                    >
                      <RefreshCw className="mr-2 w-5 h-5" />
                      {t.answerBook.askAgainButton}
                    </Button>
                  </div>

                  {/* Mystic Footer */}
                  <div className="mt-12 animate-fade-in-up" style={{ animationDelay: '1s' }}>
                    <p className="text-sm text-purple-300/60 flex items-center justify-center gap-2">
                      <Heart className="w-4 h-4 text-pink-400" />
                      {t.answerBook.footerText}
                      <Heart className="w-4 h-4 text-pink-400" />
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer Tips */}
        <div className="text-center mt-16 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <p className="text-sm text-purple-300/50 max-w-2xl mx-auto leading-relaxed">
            {t.answerBook.tips}
          </p>
        </div>
      </div>
    </div>
  );
}
