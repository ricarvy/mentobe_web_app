'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { type TarotCard, type Spread, type SpreadPosition } from '@/lib/tarot';
import { useI18n } from '@/lib/i18n';
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Share2, Copy, Check, MessageCircleQuestion } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { apiRequest, ApiRequestError } from '@/lib/api-client';
import { useTarotFlow } from '@/lib/tarotFlowContext';

interface TarotResultProps {
  question: string;
  cards: TarotCard[];
  spread: Spread;
  positions: SpreadPosition[];
  interpretation: string;
  isGenerating: boolean;
  onReset: () => void;
  readingId?: string | null;
}

export function TarotResult({
  question,
  cards,
  spread,
  positions,
  interpretation,
  isGenerating,
  onReset,
  readingId,
}: TarotResultProps) {
  const { t, language } = useI18n();
  const [expandedCardIndex, setExpandedCardIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [followups, setFollowups] = useState<string[]>([]);
  const [isLoadingFollowups, setIsLoadingFollowups] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingFollowup, setPendingFollowup] = useState<string | null>(null);
  const { setQuestion, setShowResult, setAiInterpretation, setShowAiInterpretation } = useTarotFlow();

  const handleCopyLink = () => {
    if (!readingId) return;
    const url = `${window.location.origin}/share/${readingId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!interpretation || isGenerating) return;
    (async () => {
      try {
        setIsLoadingFollowups(true);
        const data = await apiRequest<{ questions?: string[]; followups?: string[]; suggestion?: string }>(
          '/api/tarot/followup',
          {
            method: 'POST',
            body: JSON.stringify({
              question,
              spread,
              cards,
              interpretation,
              followupCount: 0,
              lang: language
            }),
          }
        );
        const q = (data.questions || data.followups) ?? [];
        // 如果后端返回 suggestion（单段文本），可拆分为两条问题（尽量安全处理）
        if (q.length === 0 && typeof data.suggestion === 'string') {
          const text: string = data.suggestion;
          const parts = text.split(/[\n\r]+/).map(s => s.trim()).filter(Boolean);
          setFollowups(parts);
        } else {
          setFollowups(q);
        }
      } catch (error) {
        if (error instanceof ApiRequestError) {
          console.warn('Followup API error:', error.message, error.code);
        } else {
          console.warn('Followup API unknown error:', error);
        }
        setFollowups([]);
      } finally {
        setIsLoadingFollowups(false);
      }
    })();
  }, [interpretation, isGenerating, question, readingId, cards, spread, language]);

  return (
    <div className="mt-8 space-y-6">
      {/* 牌的详细信息 */}
      <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white">{t.home.tarotCards}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {cards.map((card, index) => (
            <div key={index} className="border border-purple-500/20 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedCardIndex(expandedCardIndex === index ? null : index)}
                className="w-full p-3 flex items-center justify-between bg-purple-900/20 hover:bg-purple-900/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {card.imageUrl && (
                    <img
                      src={card.imageUrl}
                      alt={card.nameEn}
                      className="w-12 h-16 object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">{card.name}</p>
                    <p className="text-xs text-purple-200">{card.nameEn}</p>
                    {card.isReversed && (
                      <p className="text-xs text-pink-300 mt-0.5">{t.tarotCard.reversed}</p>
                    )}
                  </div>
                </div>
                {expandedCardIndex === index ? (
                  <ChevronUp className="text-purple-400 w-5 h-5" />
                ) : (
                  <ChevronDown className="text-purple-400 w-5 h-5" />
                )}
              </button>

              {expandedCardIndex === index && (
                <div className="p-4 bg-black/30 space-y-3">
                  {card.imageUrl && (
                    <div className="flex justify-center">
                      <img
                        src={card.imageUrl}
                        alt={card.nameEn}
                        className="max-w-[200px] max-h-[300px] object-contain rounded-lg border border-purple-500/30"
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-purple-300 mb-1">
                      {t.tarotCard.meaning}
                    </p>
                    <p className="text-xs text-purple-100">{card.meaning}</p>
                  </div>
                  {card.isReversed && (
                    <div>
                      <p className="text-sm font-semibold text-pink-300 mb-1">
                        {t.tarotCard.reversedMeaning}
                      </p>
                      <p className="text-xs text-pink-100">{card.reversedMeaning}</p>
                    </div>
                  )}
                  {positions[index] && (
                    <div>
                      <p className="text-sm font-semibold text-purple-200 mb-1">
                        {positions[index].name}
                      </p>
                      <p className="text-xs text-purple-300">{positions[index].description}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {interpretation && (
        <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">{t.home.interpretation}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Display Question */}
            <div className="mb-4 p-4 bg-purple-900/20 border border-purple-500/20 rounded-lg text-center">
              <p className="text-sm text-purple-300 font-medium mb-1">
                {t.home.yourQuestion}:
              </p>
              <p className="text-white italic">"{question}"</p>
            </div>

            <div className="bg-black/30 rounded-lg p-4 min-h-[200px] text-purple-100 prose prose-invert prose-purple max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {interpretation}
              </ReactMarkdown>
            </div>
            
            {!isGenerating && (
              <div className="mt-8 pt-6 border-t border-purple-500/30">
                {(isLoadingFollowups || followups.length > 0) && (
                  <div className="mt-6 mb-8 animate-float">
                    <div className="flex items-center justify-center gap-2 mb-4 text-purple-200">
                      <MessageCircleQuestion className="w-5 h-5" />
                      <p className="font-medium text-lg">相关追问</p>
                    </div>
                    {isLoadingFollowups ? (
                      <div className="flex justify-center items-center py-6 space-x-2 bg-purple-900/10 rounded-lg border border-purple-500/20">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {followups.map((fq, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            className="w-full h-auto py-3 px-4 border-purple-500/40 bg-purple-900/10 text-purple-100 hover:bg-purple-500/20 hover:text-white hover:border-purple-400/60 transition-all duration-300 text-left justify-start whitespace-normal"
                            onClick={() => {
                              setPendingFollowup(fq);
                              setConfirmOpen(true);
                            }}
                          >
                            {fq}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {readingId && (
                  <div className="flex justify-center mb-6">
                    <Button 
                      onClick={handleCopyLink}
                      variant="outline" 
                      className="border-purple-500/50 text-purple-200 hover:bg-purple-500/20 hover:text-white gap-2"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                      {copied ? (t.common?.copied || 'Copied') : (t.common?.share || 'Share Result')}
                    </Button>
                  </div>
                )}

                <p className="text-center text-purple-200 mb-4 font-medium">{t.header.stillHaveQuestions}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/answer-book" className="block p-4 rounded-lg bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 hover:border-purple-500/60 transition-all text-center group">
                    <span className="text-purple-100 group-hover:text-white transition-colors text-sm">{t.header.goToAnswerBook}</span>
                  </Link>
                  <Link href="/palm-reading" className="block p-4 rounded-lg bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/30 hover:border-purple-500/60 transition-all text-center group">
                    <span className="text-purple-100 group-hover:text-white transition-colors text-sm">{t.header.goToPalmReading}</span>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI解读加载状态 */}
      {!interpretation && isGenerating && (
        <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">{t.home.interpretation}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black/30 rounded-lg p-8 min-h-[200px] flex flex-col items-center justify-center">
              {/* 加载动画 */}
              <div className="relative w-20 h-20 mb-4">
                <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-4 border-transparent border-t-pink-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              <p className="text-purple-200 text-sm animate-pulse">
                {t.home.generating}...
              </p>
              <p className="text-purple-300/70 text-xs mt-2">
                AI正在为您解读塔罗牌的奥秘
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4 pt-4">
        <Button
            onClick={onReset}
            variant="default"
            className="flex-1 bg-purple-600 hover:bg-purple-500 text-white border-none shadow-lg shadow-purple-900/20"
          >
          {t.header.home}
        </Button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="bg-black/80 border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-white">是否确认继续追问？</DialogTitle>
            <DialogDescription className="text-purple-200">
              我们将使用相同的牌阵重新抽牌，并用所选问题进行新的解读。
            </DialogDescription>
          </DialogHeader>
          <div className="text-purple-200 text-sm break-words">
            {pendingFollowup}
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
              className="text-purple-200 border-purple-500/30"
            >
              取消
            </Button>
            <Button
              onClick={() => {
                if (pendingFollowup) {
                  setQuestion(pendingFollowup);
                  setAiInterpretation('');
                  setShowAiInterpretation(false);
                  setShowResult(false);
                  setConfirmOpen(false);
                }
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
