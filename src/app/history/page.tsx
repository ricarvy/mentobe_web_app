'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/lib/userContext';
import { useI18n } from '@/lib/i18n';
import { apiRequest, ApiRequestError } from '@/lib/api-client';
import { Calendar, Clock, ChevronRight, ChevronDown, Sparkles, History, ArrowLeft, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

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

  const parseCards = (cardsJson: string): TarotCard[] => {
    try {
      return JSON.parse(cardsJson);
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
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Link href="/profile">
              <Button
                variant="ghost"
                size="icon"
                className="text-purple-200 hover:text-white hover:bg-purple-500/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <History className="h-8 w-8 text-purple-400" />
                {t.home.history || 'Reading History'}
              </h1>
              <p className="text-purple-300 mt-1">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {cards.map((card, index) => (
                            <Card
                              key={`${card.id}-${index}`}
                              className="bg-black/30 border-purple-500/20 p-3"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                  <Badge
                                    variant={card.isReversed ? "destructive" : "default"}
                                    className="text-xs"
                                  >
                                    {index + 1}
                                  </Badge>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-white mb-1 truncate">
                                    {card.name}
                                  </p>
                                  <p className="text-xs text-purple-300 truncate">
                                    {card.nameEn}
                                  </p>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs mt-2 ${
                                      card.isReversed
                                        ? 'border-red-500/30 text-red-300'
                                        : 'border-purple-500/30 text-purple-300'
                                    }`}
                                  >
                                    {card.isReversed ? 'Reversed' : 'Upright'}
                                  </Badge>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>

                      {/* AI Interpretation */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-purple-400" />
                          AI Interpretation
                        </h3>
                        <div className="bg-black/40 rounded-lg p-4 prose prose-invert prose-purple max-w-none border border-purple-500/20">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {item.interpretation}
                          </ReactMarkdown>
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
