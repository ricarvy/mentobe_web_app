'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/lib/userContext';
import { useI18n } from '@/lib/i18n';
import { apiRequest, ApiRequestError } from '@/lib/api-client';
import { Calendar, Clock, ChevronRight, ChevronDown, Sparkles, History, ArrowLeft, RefreshCw, Share2, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { allTarotCards } from '@/lib/tarot-cards';

interface TarotCard {
  id: string;
  name: string;
  nameEn: string;
  meaning: string;
  reversedMeaning: string;
  isReversed: boolean;
  imageUrl?: string;
}

interface HistoryItem {
  id: string;
  question: string;
  interpretation: string;
  spreadType: string;
  createdAt: string;
  cards: string; // JSON string
}

export default function HistoryPage() {
  const { user } = useUser();
  const { t } = useI18n();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // 流式显示状态
  const [streamingText, setStreamingText] = useState<Record<string, string>>({});
  const [isStreaming, setIsStreaming] = useState<Record<string, boolean>>({});

  // 分享相关状态
  const [copiedLinks, setCopiedLinks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // 流式显示效果
  useEffect(() => {
    if (expandedItem) {
      const item = history.find(h => h.id === expandedItem);
      if (item?.interpretation && !streamingText[expandedItem]) {
        // 开始流式显示
        startStreamingText(expandedItem, item.interpretation);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedItem, history]);

  const startStreamingText = (itemId: string, text: string) => {
    setIsStreaming(prev => ({ ...prev, [itemId]: true }));
    setStreamingText(prev => ({ ...prev, [itemId]: '' }));

    let index = 0;
    const speed = 10; // 每次显示的字符数

    const interval = setInterval(() => {
      if (index >= text.length) {
        clearInterval(interval);
        setIsStreaming(prev => ({ ...prev, [itemId]: false }));
        return;
      }

      const nextIndex = Math.min(index + speed, text.length);
      setStreamingText(prev => ({
        ...prev,
        [itemId]: text.substring(0, nextIndex)
      }));

      index = nextIndex;
    }, 30); // 每30ms更新一次
  };

  const fetchHistory = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setRefreshing(true);

      const data = await apiRequest<{ interpretations: HistoryItem[] }>(
        `/api/tarot/history?userId=${user.id}`,
        {
          method: 'GET',
        }
      );

      setHistory(data.interpretations || []);
    } catch (error) {
      console.error('Error fetching history:', error);
      if (error instanceof ApiRequestError) {
        console.error('[History Error]', error.message, error.code, error.details);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchHistory();
  };

  const handleShare = async (itemId: string) => {
    const shareUrl = `${window.location.origin}/share/${itemId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLinks(prev => ({ ...prev, [itemId]: true }));
      setTimeout(() => {
        setCopiedLinks(prev => ({ ...prev, [itemId]: false }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const parseCards = (cardsJson: string): TarotCard[] => {
    try {
      const parsedCards = JSON.parse(cardsJson);
      return parsedCards.map((card: Partial<TarotCard> & { id: string | number }) => {
        // 从本地卡牌数据中查找完整信息
        const localCard = allTarotCards.find(c => String(c.id) === String(card.id));
        return {
          ...card,
          nameEn: localCard?.nameEn || card.nameEn || '',
          meaning: localCard?.meaning || card.meaning || '',
          reversedMeaning: localCard?.reversedMeaning || card.reversedMeaning || '',
          imageUrl: localCard?.imageUrl || card.imageUrl || '',
          keywords: localCard?.keywords || [],
          suit: localCard?.suit,
          number: localCard?.number,
        };
      });
    } catch (error) {
      console.error('Error parsing cards JSON:', error);
      return [];
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md bg-black/40 backdrop-blur-sm border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">Not Logged In</CardTitle>
            <CardDescription className="text-purple-200">
              Please log in to view your reading history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => (window.location.href = '/login')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/profile">
              <Button
                variant="ghost"
                size="icon"
                className="text-purple-200 hover:text-white hover:bg-purple-500/10"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
                <History className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
                {t.home.history || 'Reading History'}
              </h1>
              <p className="text-purple-300 mt-1 text-sm sm:text-base">
                Your past tarot readings and AI interpretations
              </p>
            </div>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="border-purple-500/30 text-purple-200 hover:bg-purple-500/10"
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {t.home.loading || 'Refresh'}
          </Button>
        </div>
      </div>

      {/* History List */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-purple-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400" />
          <span className="ml-3">{t.home.loading || 'Loading...'}</span>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-12">
          <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30 max-w-md mx-auto">
            <CardContent className="pt-6">
              <Sparkles className="h-16 w-16 mx-auto mb-4 text-purple-400 opacity-50" />
              <p className="text-lg mb-2 text-white">
                {t.home.noHistory || 'No reading history yet'}
              </p>
              <p className="text-sm text-purple-300 mb-6">
                {t.home.startReading || 'Start your first tarot reading today'}
              </p>
              <Link href="/">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  {t.home.newReading || 'New Reading'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-200px)] pr-4">
          <div className="space-y-4">
            {history.map((item) => {
              const isExpanded = expandedItem === item.id;
              const cards = parseCards(item.cards);

              return (
                <Card
                  key={item.id}
                  className="bg-black/40 backdrop-blur-sm border-purple-500/30 overflow-hidden"
                >
                  {/* Header - Always Visible */}
                  <button
                    onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                    className="w-full p-6 text-left hover:bg-purple-500/5 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar className="h-4 w-4 text-purple-400" />
                          <span className="text-sm text-purple-300">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-sm text-purple-300">
                            {new Date(item.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-base font-medium text-white mb-2 line-clamp-2">
                          {item.question}
                        </p>
                        <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                          {item.spreadType}
                        </Badge>
                        <p className="text-xs text-purple-300 mt-2 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {cards.length} {cards.length === 1 ? 'card' : 'cards'} drawn
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="text-purple-400 w-5 h-5 flex-shrink-0 mt-1" />
                      ) : (
                        <ChevronRight className="text-purple-400 w-5 h-5 flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-purple-500/20 p-6 space-y-6">
                      {/* Cards Drawn */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-purple-400" />
                          Cards Drawn
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                          {cards.map((card, index) => (
                            <div
                              key={`${card.id}-${index}`}
                              className="relative bg-black/30 border border-purple-500/20 rounded-lg overflow-hidden"
                            >
                              {/* Card Image */}
                              <div className={`relative w-full h-40 bg-gradient-to-br from-purple-900/50 to-pink-900/50 ${card.isReversed ? 'rotate-180' : ''}`}>
                                {card.imageUrl ? (
                                  <Image
                                    src={card.imageUrl}
                                    alt={card.nameEn}
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles className="h-8 w-8 text-purple-400/50" />
                                  </div>
                                )}
                              </div>

                              {/* Position Badge */}
                              <div className="absolute top-1 left-1">
                                <Badge
                                  variant="secondary"
                                  className="bg-black/60 backdrop-blur-sm text-[10px] font-semibold px-1.5 py-0.5"
                                >
                                  #{index + 1}
                                </Badge>
                              </div>

                              {/* Reversed Indicator */}
                              {card.isReversed && (
                                <div className="absolute top-1 right-1">
                                  <Badge
                                    variant="destructive"
                                    className="bg-red-600/90 backdrop-blur-sm text-[10px] px-1.5 py-0.5"
                                  >
                                    Reversed
                                  </Badge>
                                </div>
                              )}
                              {/* Card Info */}
                              <div className="p-2 border-t border-purple-500/20 mt-auto">
                                <p className="text-xs font-semibold text-white mb-0.5 truncate">
                                  {card.name}
                                </p>
                                <p className="text-[10px] text-purple-300 truncate">
                                  {card.nameEn}
                                </p>
                                {!card.isReversed && (
                                  <Badge
                                    variant="outline"
                                    className="border-purple-500/30 text-purple-300 text-[10px] mt-1"
                                  >
                                    Upright
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* AI Interpretation */}
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-white mb-3 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                          AI Interpretation
                          {isStreaming[item.id] && (
                            <span className="flex items-center gap-1 text-xs text-purple-400">
                              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
                              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse delay-100" />
                              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse delay-200" />
                            </span>
                          )}
                        </h3>
                        {item.interpretation ? (
                          <div className="bg-black rounded-lg p-3 sm:p-4 prose prose-invert prose-purple max-w-none border border-purple-500/20 text-white text-sm sm:text-base">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {streamingText[item.id] || item.interpretation}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <div className="bg-black rounded-lg p-4 border border-purple-500/20 text-center">
                            <p className="text-purple-300 text-sm">
                              No interpretation available
                            </p>
                          </div>
                        )}

                        {/* 分享按钮 */}
                        <div className="mt-4 pt-4 border-t border-purple-500/20">
                          <Button
                            onClick={() => handleShare(item.id)}
                            variant="outline"
                            className="w-full border-purple-500/30 text-purple-200 hover:bg-purple-500/10 transition-all"
                          >
                            {copiedLinks[item.id] ? (
                              <>
                                <Check className="w-4 h-4 mr-2" />
                                Link Copied!
                              </>
                            ) : (
                              <>
                                <Share2 className="w-4 h-4 mr-2" />
                                Share This Reading
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
