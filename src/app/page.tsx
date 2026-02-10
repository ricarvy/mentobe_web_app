'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, BookOpen, Hand, Star, Crown, ArrowRight, Zap, Eye, Heart } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useAnalytics } from '@/components/GA4Tracker';

export default function Home() {
  const { t } = useI18n();
  const { trackEvent } = useAnalytics();
  const { stars, shooting } = useMemo(() => {
    const seedFromString = (str: string) => {
      let acc = 0;
      for (let i = 0; i < str.length; i++) acc = (acc * 31 + str.charCodeAt(i)) >>> 0;
      return acc >>> 0;
    };
    const createRng = (seedInit: number) => {
      let s = seedInit >>> 0;
      return () => {
        s = (s * 1664525 + 1013904223) >>> 0;
        return s / 0xffffffff;
      };
    };
    const rng = createRng(seedFromString('mentob-home-background'));
    const s = Array.from({ length: 200 }, () => ({
      w: rng() * 4 + 1,
      h: rng() * 4 + 1,
      left: rng() * 100,
      top: rng() * 100,
      delay: rng() * 5,
      dur: rng() * 4 + 2,
      opacity: rng() * 0.8 + 0.2,
    }));
    const sh = Array.from({ length: 8 }, (_, i) => ({
      w: rng() * 120 + 60,
      left: rng() * 100,
      top: rng() * 60,
      delay: i * 4 + rng() * 3,
      dur: rng() * 2 + 1,
    }));
    return { stars: s, shooting: sh };
  }, []);

  return (
    <>
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Dynamic Starry Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Base Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-black to-pink-950" />

          {/* Twinkling Stars */}
          {stars.map((s, i) => (
            <div
              key={`star-${i}`}
              className="absolute rounded-full bg-white animate-twinkle"
              style={{
                width: s.w,
                height: s.h,
                left: `${s.left}%`,
                top: `${s.top}%`,
                animationDelay: `${s.delay}s`,
                animationDuration: `${s.dur}s`,
                opacity: s.opacity,
              }}
            />
          ))}

          {/* Shooting Stars */}
          {shooting.map((s, i) => (
            <div
              key={`shooting-${i}`}
              className="absolute bg-gradient-to-r from-purple-400 to-transparent h-0.5 animate-shooting-star"
              style={{
                width: s.w,
                left: `${s.left}%`,
                top: `${s.top}%`,
                animationDelay: `${s.delay}s`,
                animationDuration: `${s.dur}s`,
              }}
            />
          ))}

          {/* Aurora Effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/8 via-transparent to-pink-500/8 animate-aurora" />

          {/* Shimmer Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent animate-shimmer" />
        </div>

        <style jsx global>{`
          @keyframes twinkle {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.3); }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          @keyframes shooting-star {
            0% { transform: translateX(-100px) translateY(0); opacity: 0; }
            10% { opacity: 1; }
            100% { transform: translateX(350px) translateY(120px); opacity: 0; }
          }
          @keyframes aurora {
            0%, 100% { transform: translateY(0) scaleY(1); opacity: 0.4; }
            50% { transform: translateY(-25px) scaleY(1.3); opacity: 0.6; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
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
            from { opacity: 0; transform: scale(0.85); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes pulse-border {
            0%, 100% { border-color: rgba(168, 85, 247, 0.4); }
            50% { border-color: rgba(236, 72, 153, 0.7); }
          }
          @keyframes gradient-rotate {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes rotate-glow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .animate-twinkle { animation: twinkle ease-in-out infinite; }
          .animate-shimmer { animation: shimmer 4s ease-in-out infinite; }
          .animate-shooting-star { animation: shooting-star 3s ease-out infinite; }
          .animate-aurora { animation: aurora 8s ease-in-out infinite; }
          .animate-float { animation: float 6s ease-in-out infinite; }
          .animate-glow { animation: glow 4s ease-in-out infinite; }
          .animate-text-glow { animation: text-glow 3s ease-in-out infinite; }
          .animate-fade-in-up { animation: fadeInUp 1s ease-out forwards; }
          .animate-fade-in-scale { animation: fadeInScale 0.8s ease-out forwards; }
          .animate-pulse-border { animation: pulse-border 3s ease-in-out infinite; }
          .gradient-animate {
            background-size: 200% 200%;
            animation: gradient-rotate 6s ease infinite;
          }
          .rotate-glow { animation: rotate-glow 8s linear infinite; }
        `}</style>

        <div className="relative z-10 container mx-auto px-4 py-6 max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-16 animate-fade-in-up">
            {/* Decorative Badge */}
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-purple-900/40 border border-purple-500/30 rounded-full mb-8 backdrop-blur-sm animate-glow">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-semibold text-purple-200 tracking-wide">{t.landingPage.badge}</span>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-text-glow">
              {t.landingPage.heroTitle}
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-purple-100 max-w-4xl mx-auto mb-10 leading-relaxed">
              {t.landingPage.heroSubtitle}
            </p>

            {/* Feature Highlights */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/40 rounded-lg backdrop-blur-sm hover:border-purple-500/60 transition-all">
                <Sparkles className="w-4 h-4 text-purple-300" />
                <span className="text-xs font-medium text-purple-100">{t.landingPage.features.aiTarot}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/40 rounded-lg backdrop-blur-sm hover:border-purple-500/60 transition-all">
                <BookOpen className="w-4 h-4 text-pink-300" />
                <span className="text-xs font-medium text-purple-100">{t.landingPage.features.answerBook}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/40 rounded-lg backdrop-blur-sm hover:border-purple-500/60 transition-all">
                <Hand className="w-4 h-4 text-purple-300" />
                <span className="text-xs font-medium text-purple-100">{t.landingPage.features.palmReading}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-6 text-xs text-purple-200 mb-10">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="font-medium">{t.landingPage.stats.readings}</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-400" />
                <span className="font-medium">{t.landingPage.stats.rating}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-400" />
                <span className="font-medium">{t.landingPage.stats.seekers}</span>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* AI Tarot Card */}
            <Link 
              href="/ai-tarot" 
              className="group animate-fade-in-scale animate-float animate-glow" 
              style={{ animationDelay: '0.2s', animationDuration: '6s' }}
              onClick={() => trackEvent('feature_start', { feature_name: 'ai_tarot' })}
            >
              <Card className="relative h-full bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-md border-2 border-purple-500/50 rounded-3xl overflow-hidden hover:border-purple-400/70 transition-all duration-500 group-hover:scale-105">
                {/* Animated Border */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-500/30 rounded-3xl transition-all duration-500" />

                {/* Glowing Ring */}
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <CardContent className="relative pt-8 pb-8 px-5">
                  {/* Icon */}
                  <div className="w-16 h-16 mx-auto mb-5 relative">
                    {/* Rotating Glow Ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-purple-500/30 rotate-glow" />
                    {/* Inner Gradient */}
                    <div className="absolute inset-2 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center animate-pulse">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-white text-center mb-3 group-hover:text-purple-300 transition-colors">
                    {t.landingPage.aiTarotCard.title}
                  </h2>

                  {/* Description */}
                  <p className="text-purple-100 text-center mb-5 text-sm leading-relaxed">
                    {t.landingPage.aiTarotCard.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-xs text-purple-200">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span>{t.landingPage.aiTarotCard.features.cards}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-purple-200">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span>{t.landingPage.aiTarotCard.features.spreads}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-purple-200">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span>{t.landingPage.aiTarotCard.features.ai}</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gradient-animate transition-all group-hover:scale-105"
                  >
                    {t.landingPage.aiTarotCard.cta}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Answer Book Card */}
            <Link 
              href="/answer-book" 
              className="group animate-fade-in-scale animate-float animate-glow" 
              style={{ animationDelay: '0.4s', animationDuration: '6.5s' }}
              onClick={() => trackEvent('feature_start', { feature_name: 'answer_book' })}
            >
              <Card className="relative h-full bg-gradient-to-br from-pink-900/40 to-purple-900/40 backdrop-blur-md border-2 border-pink-500/50 rounded-3xl overflow-hidden hover:border-pink-400/70 transition-all duration-500 group-hover:scale-105">
                {/* Animated Border */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-pink-500/30 rounded-3xl transition-all duration-500" />

                {/* Glowing Ring */}
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-600/20 to-purple-600/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <CardContent className="relative pt-8 pb-8 px-5">
                  {/* Icon */}
                  <div className="w-16 h-16 mx-auto mb-5 relative">
                    {/* Rotating Glow Ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-pink-500/30 rotate-glow" />
                    {/* Inner Gradient */}
                    <div className="absolute inset-2 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center animate-pulse">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-white text-center mb-3 group-hover:text-pink-300 transition-colors">
                    {t.landingPage.answerBookCard.title}
                  </h2>

                  {/* Description */}
                  <p className="text-purple-100 text-center mb-5 text-sm leading-relaxed">
                    {t.landingPage.answerBookCard.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-xs text-purple-200">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span>{t.landingPage.answerBookCard.features.instant}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-purple-200">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span>{t.landingPage.answerBookCard.features.wisdom}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-purple-200">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span>{t.landingPage.answerBookCard.features.insights}</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 gradient-animate transition-all group-hover:scale-105"
                  >
                    {t.landingPage.answerBookCard.cta}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* AI Palm Reading Card */}
            <Link 
              href="/palm-reading" 
              className="group animate-fade-in-scale animate-float animate-glow" 
              style={{ animationDelay: '0.6s', animationDuration: '7s' }}
              onClick={() => trackEvent('feature_start', { feature_name: 'palm_reading' })}
            >
              <Card className="relative h-full bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-md border-2 border-purple-500/50 rounded-3xl overflow-hidden hover:border-pink-400/70 transition-all duration-500 group-hover:scale-105">
                {/* Animated Border */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-500/30 rounded-3xl transition-all duration-500" />

                {/* Glowing Ring */}
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <CardContent className="relative pt-8 pb-8 px-5">
                  {/* Icon */}
                  <div className="w-16 h-16 mx-auto mb-5 relative">
                    {/* Rotating Glow Ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-purple-500/30 rotate-glow" />
                    {/* Inner Gradient */}
                    <div className="absolute inset-2 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center animate-pulse">
                      <Hand className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-white text-center mb-3 group-hover:text-purple-300 transition-colors">
                    {t.landingPage.palmReadingCard.title}
                  </h2>

                  {/* Description */}
                  <p className="text-purple-100 text-center mb-5 text-sm leading-relaxed">
                    {t.landingPage.palmReadingCard.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-xs text-purple-200">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span>{t.landingPage.palmReadingCard.features.analysis}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-purple-200">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span>{t.landingPage.palmReadingCard.features.lines}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-purple-200">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span>{t.landingPage.palmReadingCard.features.destiny}</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gradient-animate transition-all group-hover:scale-105"
                  >
                    {t.landingPage.palmReadingCard.cta}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Bottom CTA Section */}
          <Card className="bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-purple-900/40 backdrop-blur-md border-2 border-purple-500/30 mb-8 animate-fade-in-up animate-glow" style={{ animationDelay: '1s' }}>
            <CardContent className="pt-10 pb-10">
              <div className="text-center">
                {/* Icon */}
                <div className="relative w-16 h-16 mx-auto mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-purple-500/20 rounded-full animate-pulse" />
                  <Crown className="absolute inset-0 flex items-center justify-center h-8 w-8 text-yellow-400" />
                </div>

                {/* Heading */}
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  {t.landingPage.cta.title}
                </h2>

                {/* Description */}
                <p className="text-base text-purple-200/80 mb-8 max-w-2xl mx-auto leading-relaxed">
                  {t.landingPage.cta.description}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap justify-center gap-4">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-10 py-4 text-lg font-semibold gradient-animate transition-all hover:scale-105"
                  >
                    <Zap className="mr-2 w-5 h-5" />
                    {t.landingPage.cta.startFree}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Link href="/pricing">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-purple-500/40 text-purple-200 hover:bg-purple-500/10 px-10 py-4 text-lg transition-all hover:scale-105"
                    >
                      <Star className="mr-2 w-5 h-5 text-yellow-400" />
                      {t.landingPage.cta.viewPlans}
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-12 text-purple-300/50 text-sm">
            <p className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              {t.footer.description}
              <Sparkles className="w-4 h-4" />
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
