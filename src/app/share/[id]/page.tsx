'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Calendar,
  Star,
  Wand2,
  Crown,
  ArrowRight,
  Copy,
  Check,
  Clock,
  User,
  Eye,
  Share2,
  Heart,
  Flame,
  Zap
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { allTarotCards } from '@/lib/tarot-cards';
import { apiRequest, ApiRequestError } from '@/lib/api-client';

interface TarotCard {
  id: string;
  name: string;
  nameEn: string;
  meaning: string;
  reversedMeaning: string;
  isReversed: boolean;
  imageUrl?: string;
}

interface SharedInterpretation {
  id: string;
  userId: string;
  question: string;
  interpretation: string;
  spreadType: string;
  createdAt: string;
  cards: string;
  username?: string;
}

export default function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const [sharedData, setSharedData] = useState<SharedInterpretation | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { id } = await params;
      fetchSharedData(id);
    };
    init();
  }, []);

  useEffect(() => {
    if (sharedData?.interpretation && !streamingText) {
      startStreamingText(sharedData.interpretation);
    }
  }, [sharedData]);

  useEffect(() => {
    if (sharedData && showContent) {
      // 逐个显示卡牌
      const cards = parseCards(sharedData.cards);
      cards.forEach((_, index) => {
        setTimeout(() => {
          setVisibleCards(prev => new Set([...prev, index]));
        }, index * 300);
      });
    }
  }, [sharedData, showContent]);

  const startStreamingText = (text: string) => {
    let index = 0;
    const speed = 20;

    const interval = setInterval(() => {
      if (index >= text.length) {
        clearInterval(interval);
        return;
      }

      const nextIndex = Math.min(index + speed, text.length);
      setStreamingText(text.substring(0, nextIndex));
      index = nextIndex;
    }, 15);
  };

  const fetchSharedData = async (id: string) => {
    try {
      setLoading(true);
      const data = await apiRequest<SharedInterpretation>(
        `/api/tarot/shared/${id}`,
        { method: 'GET', requireAuth: false }
      );
      setSharedData(data);
      setTimeout(() => setShowContent(true), 500);
    } catch (error) {
      console.error('Error fetching shared data:', error);
      if (error instanceof ApiRequestError) {
        console.error('[Share Error]', error.message, error.code, error.details);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const parseCards = (cardsJson: string): TarotCard[] => {
    try {
      const parsedCards = JSON.parse(cardsJson);
      return parsedCards.map((card: Partial<TarotCard> & { id: string | number }) => {
        const localCard = allTarotCards.find(c => String(c.id) === String(card.id));
        return {
          ...card,
          nameEn: localCard?.nameEn || card.nameEn || '',
          meaning: localCard?.meaning || card.meaning || '',
          reversedMeaning: localCard?.reversedMeaning || card.reversedMeaning || '',
          imageUrl: localCard?.imageUrl || card.imageUrl || '',
        };
      });
    } catch (error) {
      console.error('Error parsing cards JSON:', error);
      return [];
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      fullDate: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        {/* Loading Animation */}
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            {/* Outer Ring */}
            <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full animate-pulse" />
            <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" />
            {/* Middle Ring */}
            <div className="absolute inset-4 border-3 border-pink-500/20 rounded-full animate-pulse" />
            <div className="absolute inset-4 border-3 border-transparent border-t-pink-500 rounded-full animate-spin" style={{ animationDirection: 'reverse' }} />
            {/* Inner Ring */}
            <div className="absolute inset-8 border-2 border-yellow-500/20 rounded-full animate-pulse" />
            <div className="absolute inset-8 border-2 border-transparent border-t-yellow-500 rounded-full animate-spin" />
            {/* Center Icon */}
            <Sparkles className="absolute inset-0 flex items-center justify-center h-8 w-8 text-purple-400" />
          </div>
          <p className="text-purple-300 animate-pulse text-lg font-medium">Unveiling the mysteries...</p>
          <p className="text-purple-500/60 mt-2 text-sm">Connecting to the cards</p>
        </div>

        <style jsx global>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.05); }
          }
        `}</style>
      </div>
    );
  }

  if (!sharedData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30 max-w-md animate-fade-in-up">
          <CardContent className="pt-6 text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-red-500/20 rounded-full animate-pulse" />
              <Sparkles className="absolute inset-0 flex items-center justify-center h-10 w-10 text-red-400/50" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Reading Not Found</h3>
            <p className="text-purple-200 mb-6">This interpretation may have expired or been removed</p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8">
                Start Your Reading
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <style jsx global>{`
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up { animation: fade-in-up 0.6s ease-out; }
        `}</style>
      </div>
    );
  }

  const cards = parseCards(sharedData.cards);
  const dateInfo = formatDate(sharedData.createdAt);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Dynamic Starry Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-black to-pink-950" />

        {/* Twinkling Stars */}
        {[...Array(200)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              width: Math.random() * 4 + 1,
              height: Math.random() * 4 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 4 + 2}s`,
              opacity: Math.random() * 0.8 + 0.2,
            }}
          />
        ))}

        {/* Shooting Stars */}
        {[...Array(5)].map((_, i) => (
          <div
            key={`shooting-${i}`}
            className="absolute bg-gradient-to-r from-purple-400 to-transparent h-0.5 animate-shooting-star"
            style={{
              width: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 50}%`,
              animationDelay: `${i * 3 + Math.random() * 2}s`,
              animationDuration: `${Math.random() * 2 + 1}s`,
            }}
          />
        ))}

        {/* Aurora Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-pink-500/5 animate-aurora" />

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
          100% { transform: translateX(300px) translateY(100px); opacity: 0; }
        }
        @keyframes aurora {
          0%, 100% { transform: translateY(0) scaleY(1); opacity: 0.3; }
          50% { transform: translateY(-20px) scaleY(1.2); opacity: 0.5; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 30px rgba(168, 85, 247, 0.4), 0 0 60px rgba(236, 72, 153, 0.2); }
          50% { box-shadow: 0 0 50px rgba(168, 85, 247, 0.7), 0 0 80px rgba(236, 72, 153, 0.4); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse-border {
          0%, 100% { border-color: rgba(168, 85, 247, 0.3); }
          50% { border-color: rgba(236, 72, 153, 0.6); }
        }
        @keyframes gradient-rotate {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-twinkle { animation: twinkle ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 4s ease-in-out infinite; }
        .animate-shooting-star { animation: shooting-star 3s ease-out infinite; }
        .animate-aurora { animation: aurora 8s ease-in-out infinite; }
        .animate-float { animation: float 5s ease-in-out infinite; }
        .animate-glow { animation: glow 4s ease-in-out infinite; }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-fade-in-scale { animation: fadeInScale 0.6s ease-out forwards; }
        .animate-pulse-border { animation: pulse-border 3s ease-in-out infinite; }
        .gradient-animate {
          background-size: 200% 200%;
          animation: gradient-rotate 5s ease infinite;
        }
      `}</style>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section - Eye-catching Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          {/* Decorative Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-purple-900/40 border border-purple-500/30 rounded-full mb-6 backdrop-blur-sm animate-glow">
            <Crown className="w-5 h-5 text-yellow-400" />
            <span className="text-sm font-semibold text-purple-200 tracking-wide">AI-POWERED TAROT INSIGHTS</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-glow">
            Unlock Your Destiny
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-purple-200/80 max-w-3xl mx-auto mb-10 leading-relaxed">
            Discover profound insights and guidance from the ancient wisdom of tarot,
            amplified by cutting-edge artificial intelligence
          </p>

          {/* Feature Highlights */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/20 rounded-lg backdrop-blur-sm hover:border-purple-500/40 transition-all">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-medium text-purple-200">Unlimited AI Readings</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/20 rounded-lg backdrop-blur-sm hover:border-purple-500/40 transition-all">
              <Sparkles className="w-5 h-5 text-pink-400" />
              <span className="text-sm font-medium text-purple-200">78 Sacred Tarot Cards</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/20 rounded-lg backdrop-blur-sm hover:border-purple-500/40 transition-all">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-medium text-purple-200">Premium Wisdom</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/">
              <Button
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-10 py-4 text-lg font-semibold gradient-animate transition-all hover:scale-105"
              >
                <Zap className="mr-2 w-5 h-5" />
                Get Your Free Reading
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="border-purple-500/40 text-purple-200 hover:bg-purple-500/10 px-8 py-4 text-lg transition-all hover:scale-105"
            >
              {copied ? (
                <>
                  <Check className="mr-2 w-5 h-5 text-green-400" />
                  Link Copied!
                </>
              ) : (
                <>
                  <Share2 className="mr-2 w-5 h-5" />
                  Share This Reading
                </>
              )}
            </Button>
          </div>
        </div>

        {/* User Info Card */}
        {showContent && (
          <Card className="bg-black/40 backdrop-blur-md border-purple-500/30 mb-6 animate-fade-in-up animate-pulse-border" style={{ animationDelay: '0.3s' }}>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* User Avatar */}
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center animate-glow">
                    <User className="w-7 h-7 text-white" />
                  </div>

                  {/* User Info */}
                  <div>
                    <p className="text-sm text-purple-400 mb-1">Reading by</p>
                    <p className="text-xl font-bold text-white">
                      {sharedData.username || 'Anonymous Seeker'}
                    </p>
                  </div>
                </div>

                {/* Time Info */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    <div className="text-right">
                      <p className="text-xs text-purple-400">Date</p>
                      <p className="text-sm font-semibold text-white">{dateInfo.fullDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <div className="text-right">
                      <p className="text-xs text-purple-400">Time</p>
                      <p className="text-sm font-semibold text-white">{dateInfo.time}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question Section */}
        {showContent && (
          <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-md border-purple-500/30 mb-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-6">
                  <Eye className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-purple-300">The Question</span>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-white leading-relaxed max-w-4xl mx-auto">
                  "{sharedData.question}"
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Spread Info */}
        {showContent && (
          <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-lg">
                <Wand2 className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-200">Spread:</span>
                <span className="text-sm font-bold text-white">{sharedData.spreadType}</span>
              </div>
              <div className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-lg">
                <Flame className="w-4 h-4 text-pink-400" />
                <span className="text-sm text-purple-200">Cards Drawn:</span>
                <span className="text-sm font-bold text-white">{cards.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tarot Cards Display */}
        {showContent && (
          <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center justify-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">The Cards Reveal</h2>
              <Sparkles className="w-6 h-6 text-pink-400" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {cards.map((card, index) => (
                <div
                  key={`${card.id}-${index}`}
                  className={`relative bg-gradient-to-br from-purple-900/60 to-pink-900/60 border border-purple-500/40 rounded-2xl overflow-hidden animate-fade-in-scale animate-float animate-glow ${
                    card.isReversed ? 'rotate-180' : ''
                  } ${visibleCards.has(index) ? 'opacity-100' : 'opacity-0'}`}
                  style={{
                    animationDelay: `${0.3 + index * 0.15}s`,
                    animationDuration: `${5 + index * 0.3}s`,
                    transition: 'opacity 0.5s ease-out',
                  }}
                >
                  {/* Card Image */}
                  <div className="relative w-full aspect-[3/4] bg-gradient-to-br from-black/40 to-purple-900/20">
                    {card.imageUrl ? (
                      <Image
                        src={card.imageUrl}
                        alt={card.nameEn}
                        fill
                        className="object-contain p-3"
                        sizes="(max-width: 768px) 50vw, 20vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="h-16 w-16 text-purple-400/50" />
                      </div>
                    )}
                  </div>

                  {/* Position Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-black/70 backdrop-blur-sm text-xs font-bold px-3 py-1 border border-purple-500/30 shadow-lg">
                      #{index + 1}
                    </Badge>
                  </div>

                  {/* Reversed Indicator */}
                  {card.isReversed && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-gradient-to-r from-red-600 to-red-500 backdrop-blur-sm text-xs font-bold px-3 py-1 shadow-lg animate-pulse">
                        Reversed
                      </Badge>
                    </div>
                  )}

                  {/* Card Info */}
                  <div className="p-4 border-t border-purple-500/30 bg-black/30 backdrop-blur-sm">
                    <p className="text-base font-bold text-white mb-1 truncate">{card.name}</p>
                    <p className="text-xs text-purple-300 truncate">{card.nameEn}</p>
                  </div>

                  {/* Glow Effect */}
                  <div className="absolute inset-0 border-2 border-transparent hover:border-purple-500/50 transition-all duration-300 rounded-2xl pointer-events-none" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Interpretation */}
        {showContent && (
          <Card className="bg-black/40 backdrop-blur-md border-purple-500/30 mb-8 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <CardContent className="pt-8 pb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center animate-glow">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">AI Interpretation</h2>
                  <p className="text-sm text-purple-300">Powered by advanced artificial intelligence</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-950/30 to-pink-950/30 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 prose prose-invert prose-purple max-w-none text-white">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {streamingText || sharedData.interpretation}
                </ReactMarkdown>
              </div>

              {/* Streaming Indicator */}
              {streamingText && streamingText.length < sharedData.interpretation.length && (
                <div className="flex items-center gap-2 mt-4 text-purple-400 text-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <span>AI is revealing insights...</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Final CTA Section */}
        {showContent && (
          <Card className="bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-purple-900/40 backdrop-blur-md border-purple-500/30 mb-8 animate-fade-in-up animate-glow" style={{ animationDelay: '1s' }}>
            <CardContent className="pt-10 pb-10">
              <div className="text-center">
                {/* Crown Icon */}
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-purple-500/20 rounded-full animate-pulse" />
                  <Crown className="absolute inset-0 flex items-center justify-center h-10 w-10 text-yellow-400" />
                </div>

                {/* Main Heading */}
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Discover Your Own Path?
                </h2>

                {/* Description */}
                <p className="text-lg text-purple-200/80 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Join thousands of seekers who have unlocked profound insights with our AI-powered tarot readings.
                  Get unlimited interpretations, premium spreads, and personalized guidance.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap justify-center gap-4 mb-10">
                  <Link href="/">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-10 py-4 text-lg font-semibold gradient-animate transition-all hover:scale-105"
                    >
                      <Zap className="mr-2 w-5 h-5" />
                      Start Your Free Reading
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-purple-500/40 text-purple-200 hover:bg-purple-500/10 px-10 py-4 text-lg transition-all hover:scale-105"
                    >
                      <Star className="mr-2 w-5 h-5 text-yellow-400" />
                      View Premium Plans
                    </Button>
                  </Link>
                </div>

                {/* Social Proof */}
                <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-purple-300/70">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-3">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 border-2 border-black flex items-center justify-center text-xs font-bold text-white shadow-lg"
                        >
                          {String.fromCharCode(65 + i)}
                        </div>
                      ))}
                    </div>
                    <span className="font-medium">10k+ Readings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="font-medium">4.9 Rating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-400" />
                    <span className="font-medium">Loved by Seekers</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-purple-300/50 text-sm">
          <p className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            Powered by Mentob AI • Unlock the mysteries of tarot with artificial intelligence
            <Sparkles className="w-4 h-4" />
          </p>
        </div>
      </div>
    </div>
  );
}
