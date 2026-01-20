'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { spreads, drawCards, type TarotCard, type Spread } from '@/lib/tarot';
import { TarotSpreadSelector } from '@/components/TarotSpreadSelector';
import { TarotCardDisplay } from '@/components/TarotCardDisplay';
import { TarotResult } from '@/components/TarotResult';
import { SuggestedQuestions } from '@/components/SuggestedQuestions';
import { useI18n } from '@/lib/i18n';
import { useSpreadTranslations } from '@/lib/spreadTranslations';
import { DEMO_ACCOUNT } from '@/config/demo-account';
import { saveAuthCredentials, addAuthHeader, clearAuthCredentials } from '@/lib/auth';

export default function Home() {
  const { t } = useI18n();
  const { getTranslatedSpread } = useSpreadTranslations();
  const [selectedSpread, setSelectedSpread] = useState<Spread | null>(null);
  const [question, setQuestion] = useState('');
  const [drawnCards, setDrawnCards] = useState<TarotCard[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [user, setUser] = useState<{ id: string; username: string; email: string; isDemo?: boolean } | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState(DEMO_ACCOUNT.email);
  const [password, setPassword] = useState(DEMO_ACCOUNT.password);
  const [aiInterpretation, setAiInterpretation] = useState('');
  const [showAiInterpretation, setShowAiInterpretation] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [remainingQuota, setRemainingQuota] = useState(3);
  const [quotaInfo, setQuotaInfo] = useState<{ remaining: number; total: number | string; isDemo: boolean }>({ remaining: 3, total: 3, isDemo: false });

  // 从localStorage加载用户信息
  useEffect(() => {
    const savedUser = localStorage.getItem('tarot_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      fetchQuota(parsedUser.id);
    }
  }, []);

  const fetchQuota = async (userId: string) => {
    try {
      const headers = addAuthHeader({ 'Content-Type': 'application/json' });
      const response = await fetch(`/api/auth/quota?userId=${userId}`, {
        method: 'GET',
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setRemainingQuota(data.remaining);
        setQuotaInfo({
          remaining: data.remaining,
          total: data.total,
          isDemo: data.isDemo || false,
        });
      } else {
        console.error('Failed to fetch quota:', response.status, response.statusText);
        // 尝试读取错误信息
        try {
          const errorText = await response.text();
          console.error('Error response:', errorText);
        } catch (e) {
          console.error('Could not read error response');
        }
      }
    } catch (error) {
      console.error('Error fetching quota:', error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      alert(`${t.auth.pleaseEnterEmail} and ${t.auth.pleaseEnterPassword}`);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${email}:${password}`)}`,
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || t.auth.loginFailed);
        return;
      }

      const userData = await response.json();
      setUser(userData);
      // 存储用户信息和认证凭证
      saveAuthCredentials(userData, email, password);
      setShowLoginModal(false);
      await fetchQuota(userData.id);
    } catch (error) {
      console.error('Error:', error);
      alert(t.auth.loginFailed);
    }
  };

  const handleLogout = () => {
    setUser(null);
    clearAuthCredentials();
    setRemainingQuota(3);
    setEmail(DEMO_ACCOUNT.email);
    setPassword(DEMO_ACCOUNT.password);
  };

  const handleSpreadSelect = (spread: Spread) => {
    setSelectedSpread(spread);
  };

  const handleDraw = () => {
    if (!selectedSpread || !question.trim()) return;

    setIsDrawing(true);
    const cards = drawCards(selectedSpread.positions.length);
    setDrawnCards(cards);

    setTimeout(() => {
      setIsDrawing(false);
      setShowResult(true);
    }, 2000);
  };

  const handleGetAiInterpretation = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (!quotaInfo.isDemo && remainingQuota <= 0) {
      alert(t.home.quotaExceeded);
      return;
    }

    setIsGenerating(true);
    setShowAiInterpretation(true);

    try {
      const headers = addAuthHeader({ 'Content-Type': 'application/json' });
      const response = await fetch('/api/tarot/interpret', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId: user.id,
          question,
          spread: selectedSpread,
          cards: drawnCards,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to get interpretation';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // 如果无法解析为 JSON，尝试读取文本
          try {
            const errorText = await response.text();
            console.error('Interpret API error response:', errorText);
            errorMessage = `Server error (${response.status}): ${errorText}`;
          } catch (textError) {
            errorMessage = `Server error (${response.status})`;
          }
        }
        throw new Error(errorMessage);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let result = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        result += text;
        setAiInterpretation(result);
      }

      // 更新剩余限额
      await fetchQuota(user.id);
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate interpretation, please try again later');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setSelectedSpread(null);
    setQuestion('');
    setDrawnCards([]);
    setIsDrawing(false);
    setShowResult(false);
    setAiInterpretation('');
    setShowAiInterpretation(false);
  };

  const handleSelectQuestion = (selectedQuestion: string) => {
    setQuestion(selectedQuestion);
    // Scroll to the question input
    setTimeout(() => {
      const questionInput = document.querySelector('textarea');
      if (questionInput) {
        questionInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        questionInput.focus();
      }
    }, 100);
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            {t.home.title}
          </h1>
          <p className="text-lg text-purple-200">
            {t.home.subtitle}
          </p>
        </div>

        {!selectedSpread && (
          <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30" id="spreads">
            <CardHeader>
              <CardTitle className="text-white">{t.home.selectSpread}</CardTitle>
              <CardDescription className="text-purple-200">
                {t.home.welcome}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TarotSpreadSelector
                spreads={spreads}
                onSpreadSelect={handleSpreadSelect}
              />
            </CardContent>
          </Card>
        )}

        {selectedSpread && !showResult && (
          <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white">{getTranslatedSpread(selectedSpread).name}</CardTitle>
              <CardDescription className="text-purple-200">
                {getTranslatedSpread(selectedSpread).description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Suggested Questions */}
              <SuggestedQuestions onSelectQuestion={handleSelectQuestion} />

              <div>
                <Label className="block text-sm font-medium mb-2 text-purple-200">
                  {t.home.chooseQuestion}
                </Label>
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={t.home.questionPlaceholder}
                  className="bg-black/30 border-purple-500/30 text-white placeholder:text-purple-300/50 min-h-[100px]"
                />
              </div>

              <Button
                onClick={handleDraw}
                disabled={!question.trim() || isDrawing}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isDrawing ? t.home.drawCards : t.home.drawCards}
              </Button>

              <Button
                onClick={() => setSelectedSpread(null)}
                variant="outline"
                className="w-full border-purple-500/30 text-purple-200 hover:bg-purple-500/10"
              >
                {t.header.tarotSpreads}
              </Button>
            </CardContent>
          </Card>
        )}

        {showResult && (
          <>
            <TarotCardDisplay
              cards={drawnCards}
              positions={selectedSpread!.positions}
              isDrawing={isDrawing}
              spread={selectedSpread!}
            />

            {!user && (
              <Card className="mt-8 bg-black/40 backdrop-blur-sm border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white">{t.home.getAiInterpretation}</CardTitle>
                  <CardDescription className="text-purple-200">
                    {t.home.loginRequired}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setShowLoginModal(true)}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {t.common.signIn}
                  </Button>
                </CardContent>
              </Card>
            )}

            {user && !showAiInterpretation && (
              <Card className="mt-8 bg-black/40 backdrop-blur-sm border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white">{t.home.getAiInterpretation}</CardTitle>
                  <CardDescription className="text-purple-200">
                    {t.home.interpretation}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 text-sm text-purple-200">
                    {quotaInfo.isDemo ? (
                      <span>{t.home.dailyQuota}: Unlimited</span>
                    ) : (
                      <span>{t.home.dailyQuota}: {remainingQuota}/{quotaInfo.total}</span>
                    )}
                  </div>
                  <Button
                    onClick={handleGetAiInterpretation}
                    disabled={isGenerating || (!quotaInfo.isDemo && remainingQuota <= 0)}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 relative overflow-hidden"
                  >
                    {isGenerating && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      </div>
                    )}
                    <span className={isGenerating ? 'pl-8' : ''}>
                      {isGenerating ? `${t.home.generating}...` : (!quotaInfo.isDemo && remainingQuota <= 0) ? t.home.quotaExceeded : t.home.getAiInterpretation}
                    </span>
                  </Button>
                </CardContent>
              </Card>
            )}

            {showAiInterpretation && (
              <TarotResult
                question={question}
                cards={drawnCards}
                positions={selectedSpread!.positions}
                interpretation={aiInterpretation}
                isGenerating={isGenerating}
                onReset={handleReset}
              />
            )}
          </>
        )}
      </div>

      {/* Login Modal */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="bg-black/80 border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-white">{t.common.signIn}</DialogTitle>
            <DialogDescription className="text-purple-200">
              {t.home.loginRequired}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-purple-200">{t.auth.email}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.auth.pleaseEnterEmail}
                className="bg-black/30 border-purple-500/30 text-white placeholder:text-purple-300/50 mt-2"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-purple-200">{t.auth.password}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.auth.pleaseEnterPassword}
                className="bg-black/30 border-purple-500/30 text-white placeholder:text-purple-300/50 mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleLogin}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {t.common.signIn}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
