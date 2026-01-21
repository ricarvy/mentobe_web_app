'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { spreads, drawCards, type Spread } from '@/lib/tarot';
import { TarotSpreadSelector } from '@/components/TarotSpreadSelector';
import { TarotCardDisplay } from '@/components/TarotCardDisplay';
import { TarotResult } from '@/components/TarotResult';
import { SuggestedQuestions } from '@/components/SuggestedQuestions';
import { useI18n } from '@/lib/i18n';
import { useSpreadTranslations } from '@/lib/spreadTranslations';
import { useTarotFlow } from '@/lib/tarotFlowContext';
import { useUser } from '@/lib/userContext';
import { VipLevel, getVipInfo } from '@/lib/vip';
import { DEMO_ACCOUNT } from '@/config/demo-account';
import { saveAuthCredentials } from '@/lib/auth';
import { apiRequest, streamApiRequest, ApiRequestError } from '@/lib/api-client';
import { getQuota } from '@/lib/quota';

// VIP Avatar Component
interface VipAvatarProps {
  username: string;
  vipLevel?: number;
  vipExpireAt?: string | null;
}

function VipAvatar({ username, vipLevel, vipExpireAt }: VipAvatarProps) {
  const vipInfo = getVipInfo(vipLevel, vipExpireAt);

  // 根据VIP等级获取头像边框样式
  const getAvatarBorderClass = () => {
    switch (vipInfo.level) {
      case VipLevel.PRO:
        return 'vip-avatar-pro';
      case VipLevel.PREMIUM:
        return 'vip-avatar-premium';
      case VipLevel.FREE:
      default:
        return 'vip-avatar-free';
    }
  };

  // 获取用户首字母作为头像
  const avatarInitial = username.charAt(0).toUpperCase();

  return (
    <div className={`relative ${getAvatarBorderClass()} rounded-full`}>
      {/* VIP等级1：紫色边框 */}
      {vipInfo.level === VipLevel.PRO && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 animate-pulse blur-sm opacity-75"></div>
      )}

      {/* VIP等级2：金色边框 */}
      {vipInfo.level === VipLevel.PREMIUM && (
        <>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-500 animate-pulse blur-md opacity-75"></div>
          <div className="absolute inset-[-4px] rounded-full border-2 border-yellow-300/30 animate-spin-slow"></div>
          <div className="absolute inset-[-8px] rounded-full border border-orange-300/20 animate-spin-slow-reverse"></div>
        </>
      )}

      {/* 头像主体 */}
      <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl overflow-hidden">
        {avatarInitial}
      </div>

      {/* VIP徽章 */}
      {vipInfo.level !== VipLevel.FREE && (
        <div className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-xs font-bold text-white shadow-lg ${
          vipInfo.level === VipLevel.PRO ? 'bg-purple-600' : 'bg-yellow-500'
        }`}>
          {vipInfo.name}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { t } = useI18n();
  const { getTranslatedSpread } = useSpreadTranslations();
  const { user: contextUser } = useUser();
  const {
    state: {
      selectedSpread,
      question,
      drawnCards,
      isDrawing,
      showResult,
      aiInterpretation,
      showAiInterpretation,
      isGenerating,
    },
    setSelectedSpread,
    setQuestion,
    setDrawnCards,
    setIsDrawing,
    setShowResult,
    setAiInterpretation,
    setShowAiInterpretation,
    setIsGenerating,
    resetFlow,
  } = useTarotFlow();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState(DEMO_ACCOUNT.email);
  const [password, setPassword] = useState(DEMO_ACCOUNT.password);
  const [remainingQuota, setRemainingQuota] = useState(3);
  const [quotaInfo, setQuotaInfo] = useState<{ remaining: number; total: number | string; isDemo: boolean }>({ remaining: 3, total: 3, isDemo: false });

  // 当用户登录时获取quota信息
  useEffect(() => {
    if (contextUser?.id) {
      fetchQuota(contextUser.id);
    }
  }, [contextUser?.id]);

  const fetchQuota = async (userId: string) => {
    try {
      const data = await getQuota(userId);

      setRemainingQuota(data.remaining);
      setQuotaInfo({
        remaining: data.remaining,
        total: data.total,
        isDemo: data.isDemo || false,
      });
    } catch (error) {
      console.error('Error fetching quota:', error);
      if (error instanceof ApiRequestError) {
        console.error('[Quota Error]', error.message, error.code, error.details);
      }
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      alert(`${t.auth.pleaseEnterEmail} and ${t.auth.pleaseEnterPassword}`);
      return;
    }

    try {
      const userData = await apiRequest<{
        id: string;
        username: string;
        email: string;
        isDemo: boolean;
      }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        requireAuth: false, // 登录接口不需要Authorization header，但会在请求体中包含凭证
      });

      // 存储用户信息和认证凭证
      saveAuthCredentials(userData, email, password);
      setShowLoginModal(false);
      // UserContext会自动更新，不需要手动setUser
      await fetchQuota(userData.id);
      // 刷新页面以更新用户信息
      window.location.reload();
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof ApiRequestError) {
        // 友好的错误提示
        alert(error.isServerError ? '服务器繁忙，请稍后再试' : error.message);
      } else {
        alert(t.auth.loginFailed);
      }
    }
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
    if (!contextUser) {
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
      await streamApiRequest(
        '/api/tarot/interpret',
        {
          method: 'POST',
          body: JSON.stringify({
            userId: contextUser.id,
            question,
            spread: selectedSpread,
            cards: drawnCards,
          }),
        },
        (text) => {
          setAiInterpretation((prev) => prev + text);
        },
        async (fullText) => {
          // 流式响应完成
          console.log('Interpretation completed, length:', fullText.length);
          // 更新剩余限额
          if (contextUser?.id) {
            await fetchQuota(contextUser.id);
          }
        },
        (error) => {
          console.error('Stream error:', error);
          if (error.isServerError) {
            alert('服务器繁忙，请稍后再试');
          } else {
            alert(error.message);
          }
        }
      );
    } catch (error) {
      console.error('Error:', error);
      if (error instanceof ApiRequestError) {
        alert(error.isServerError ? '服务器繁忙，请稍后再试' : error.message);
      } else {
        alert('生成解读失败，请稍后再试');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    resetFlow();
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

        {/* User Avatar Section */}
        {contextUser && (
          <div className="flex justify-center mb-8">
            <VipAvatar
              username={contextUser.username}
              vipLevel={contextUser.vipLevel}
              vipExpireAt={contextUser.vipExpireAt}
            />
          </div>
        )}

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

            {!contextUser && (
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

            {contextUser && !showAiInterpretation && (
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
