'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Calendar, Share2, Star, Wand2, Crown, ArrowRight, Copy, Check, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { allTarotCards } from '@/lib/tarot-cards';
import { apiRequest, ApiRequestError } from '@/lib/api-client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  question: string;
  interpretation: string;
  spreadType: string;
  createdAt: string;
  cards: string;
}

export default function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [sharedData, setSharedData] = useState<SharedInterpretation | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [shareId, setShareId] = useState<string>('');

  useEffect(() => {
    const init = async () => {
      const { id } = await params;
      setShareId(id);
      fetchSharedData(id);
    };
    init();
  }, []);

  useEffect(() => {
    if (sharedData?.interpretation && !streamingText) {
      startStreamingText(sharedData.interpretation);
    }
  }, [sharedData]);

  const startStreamingText = (text: string) => {
    let index = 0;
    const speed = 15;

    const interval = setInterval(() => {
      if (index >= text.length) {
        clearInterval(interval);
        return;
      }

      const nextIndex = Math.min(index + speed, text.length);
      setStreamingText(text.substring(0, nextIndex));
      index = nextIndex;
    }, 20);
  };

  const fetchSharedData = async (id: string) => {
    try {
      setLoading(true);
      const data = await apiRequest<SharedInterpretation>(
        `/api/tarot/shared/${id}`,
        { method: 'GET', requireAuth: false }
      );
      setSharedData(data);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        {/* 加载动画 */}
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
            <div className="absolute inset-4 border-3 border-pink-500/20 rounded-full animate-pulse"></div>
            <div className="absolute inset-4 border-3 border-transparent border-t-pink-500 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
            <Sparkles className="absolute inset-0 flex items-center justify-center h-6 w-6 text-purple-400" />
          </div>
          <p className="text-purple-300 animate-pulse">Loading tarot interpretation...</p>
        </div>
      </div>
    );
  }

  if (!sharedData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30 max-w-md">
          <CardContent className="pt-6 text-center">
            <Sparkles className="h-16 w-16 mx-auto mb-4 text-purple-400 opacity-50" />
            <p className="text-white mb-4">Interpretation not found or has expired</p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Start Your Reading
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const cards = parseCards(sharedData.cards);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* 星空背景 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-black to-pink-950" />
        {/* 动态星星 */}
        {[...Array(150)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
        {/* 流光效果 */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent animate-shimmer" />
      </div>

      <style jsx global>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.5), 0 0 40px rgba(236, 72, 153, 0.3); }
          50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.8), 0 0 60px rgba(236, 72, 153, 0.5); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-twinkle { animation: twinkle ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 3s ease-in-out infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-glow { animation: glow 3s ease-in-out infinite; }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
      `}</style>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-6xl">
        {/* Header - 精美的引导区域 */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-6">
            <Crown className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-purple-300">AI-Powered Tarot Reading</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-glow">
            Discover Your Destiny
          </h1>

          <p className="text-xl text-purple-200/80 max-w-2xl mx-auto mb-8">
            This powerful AI interpretation reveals hidden insights and guidance from the tarot cards.
          </p>

          {/* 引导性文案 */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/20 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-purple-200">Unlimited AI Readings</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/20 rounded-lg">
              <Wand2 className="w-5 h-5 text-pink-400" />
              <span className="text-sm text-purple-200">78 Tarot Cards</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/20 rounded-lg">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-purple-200">Premium Insights</span>
            </div>
          </div>

          <Link href="/">
            <Button
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-3 text-lg"
            >
              Get Your Free Reading
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>

        {/* 卡片展示区域 */}
        <Card className="bg-black/40 backdrop-blur-md border-purple-500/30 mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-purple-400" />
                  <span className="text-sm text-purple-300">
                    {new Date(sharedData.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <CardTitle className="text-2xl text-white mb-2">{sharedData.question}</CardTitle>
                <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                  {sharedData.spreadType}
                </Badge>
              </div>
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="border-purple-500/30 text-purple-200 hover:bg-purple-500/10"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Share
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* 卡牌展示 */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              {cards.map((card, index) => (
                <div
                  key={`${card.id}-${index}`}
                  className={`relative bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-xl overflow-hidden animate-float ${
                    card.isReversed ? 'rotate-180' : ''
                  }`}
                  style={{
                    animationDelay: `${index * 0.2}s`,
                    animationDuration: `${6 + index * 0.5}s`,
                  }}
                >
                  {/* 卡牌图片 */}
                  <div className="relative w-full h-48 bg-black/30">
                    {card.imageUrl ? (
                      <Image
                        src={card.imageUrl}
                        alt={card.nameEn}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 50vw, 20vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="h-10 w-10 text-purple-400/50" />
                      </div>
                    )}
                  </div>

                  {/* 位置徽章 */}
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-black/60 backdrop-blur-sm text-xs font-semibold px-2 py-1 border border-purple-500/30">
                      #{index + 1}
                    </Badge>
                  </div>

                  {/* 逆位指示器 */}
                  {card.isReversed && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-red-600/90 backdrop-blur-sm text-xs px-2 py-1">
                        Reversed
                      </Badge>
                    </div>
                  )}

                  {/* 卡牌信息 */}
                  <div className="p-3 border-t border-purple-500/20 bg-black/20">
                    <p className="text-sm font-semibold text-white mb-1 truncate">{card.name}</p>
                    <p className="text-xs text-purple-300 truncate">{card.nameEn}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* AI解读 */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-400" />
                AI Interpretation
              </h3>
              <div className="bg-black/30 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 prose prose-invert prose-purple max-w-none text-white">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {streamingText || sharedData.interpretation}
                </ReactMarkdown>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA区域 */}
        <Card className="bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-purple-900/30 backdrop-blur-md border-purple-500/30 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <Crown className="h-12 w-12 text-yellow-400 mx-auto mb-4 animate-pulse" />
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Unlock Your Future?
              </h2>
              <p className="text-lg text-purple-200/80 mb-8 max-w-2xl mx-auto">
                Join thousands of seekers discovering profound insights with our AI-powered tarot readings.
                Get unlimited interpretations, premium spreads, and personalized guidance.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-3 text-lg"
                  >
                    Get Your Free Reading
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-purple-500/30 text-purple-200 hover:bg-purple-500/10 px-8 py-3 text-lg"
                  >
                    View Plans
                    <Star className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>

              {/* 社交证明 */}
              <div className="mt-8 flex items-center justify-center gap-6 text-sm text-purple-300/60">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 border-2 border-black flex items-center justify-center text-xs"
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                  </div>
                  <span>10k+ readings</span>
                </div>
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span>4.9 rating</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 底部 */}
        <div className="text-center mt-12 text-purple-300/60 text-sm">
          <p>Powered by Mentob AI • Unlock the mysteries of tarot with artificial intelligence</p>
        </div>
      </div>
    </div>
  );
}
