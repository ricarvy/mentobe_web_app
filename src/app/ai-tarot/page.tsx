'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// Force rebuild hash change: v1.1.1
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Sparkles, MessageSquare, Star, Brain, Loader2 } from 'lucide-react';
import { spreads, drawCards, type Spread, getSpreadRequirement } from '@/lib/tarot';
import { TarotSpreadSelector } from '@/components/TarotSpreadSelector';
import { TarotCardDisplay } from '@/components/TarotCardDisplay';
import { TarotResult } from '@/components/TarotResult';
import { SuggestedQuestions } from '@/components/SuggestedQuestions';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { PremiumUpgradeModal } from '@/components/PremiumUpgradeModal';
import { useI18n } from '@/lib/i18n';
import { useSpreadTranslations } from '@/lib/spreadTranslations';
import { useTarotFlow } from '@/lib/tarotFlowContext';
import { useUser, convertApiUserToUser } from '@/lib/userContext';
import { DEMO_ACCOUNT } from '@/config/demo-account';
import { saveAuthCredentials } from '@/lib/auth';
import { apiRequest, streamApiRequest, ApiRequestError } from '@/lib/api-client';
import { getQuota } from '@/lib/quota';
import { useAnalytics } from '@/components/GA4Tracker';

interface ApiSpread {
  id: number;
  name: string;
  name_en: string | null;
  name_jp: string | null;
  description: string;
  description_en: string | null;
  description_jp: string | null;
  card_count: number;
  permission: string;
  category_id: number;
}

interface ApiCategory {
  id: number;
  slug: string;
  name: string;
  name_en: string | null;
  name_jp: string | null;
  spreads: ApiSpread[];
}

const STATIC_CATEGORIES = [
  { slug: 'recommended' },
  { slug: 'basic' },
  { slug: 'love' },
  { slug: 'decision' },
  { slug: 'career' },
  { slug: 'self' },
  { slug: 'advanced' }
];

export default function Home() {
  const router = useRouter();
  const { t, language } = useI18n();
  const { getTranslatedSpread } = useSpreadTranslations();
  const { user, setUser } = useUser();
  const { trackEvent } = useAnalytics();
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
  const [showProUpgradeModal, setShowProUpgradeModal] = useState(false);
  const [showPremiumUpgradeModal, setShowPremiumUpgradeModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remainingQuota, setRemainingQuota] = useState(3);
  const [quotaInfo, setQuotaInfo] = useState<{ remaining: number; total: number | string; isDemo: boolean }>({ remaining: 3, total: 3, isDemo: false });
  const [tone, setTone] = useState<'mystical' | 'rational' | 'warm' | 'direct'>('mystical');
  const [cardStyle, setCardStyle] = useState<'classic' | 'modern' | 'fantasy'>('classic');
  const [apiCategories, setApiCategories] = useState<ApiCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // 从localStorage加载用户信息
  useEffect(() => {
    trackEvent('feature_start', { feature_name: 'ai_tarot' });
    
    const savedUser = localStorage.getItem('tarot_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      fetchQuota(parsedUser.id);
    }

    const savedStyle = localStorage.getItem('tarot_card_style');
    if (savedStyle === 'classic' || savedStyle === 'modern' || savedStyle === 'fantasy') {
      setCardStyle(savedStyle);
    }

    // Fetch categories
    fetchCategories();
  }, [setUser, trackEvent]);

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const data = await apiRequest<ApiCategory[]>('/api/tarot/categories');
      if (Array.isArray(data)) {
        setApiCategories(data);
      } else {
        console.error('API returned invalid categories format:', data);
        setApiCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to local spreads if API fails?
      // For now, we'll just log the error. The UI will use static spreads if apiCategories is empty, or we can handle it.
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const getSpreadsForCategory = (categorySlug: string): Spread[] => {
    const category = apiCategories.find(c => c.slug === categorySlug);
    // If API category not found or has no spreads, fall back to local logic (though category list comes from API now)
    // If apiCategories is empty, we might want to fallback to static logic completely.
    // But since we render tabs based on apiCategories, this function will only be called with valid slugs if apiCategories is populated.
    
    if (!category || apiCategories.length === 0) {
      return spreads.filter(s => s.category === categorySlug);
    }

    return (category.spreads || []).map(apiSpread => {
      // Find matching local spread to get positions
      const localSpread = spreads.find(s => s.name === apiSpread.name);
      
      let name = apiSpread.name;
      let description = apiSpread.description;

      // Use localized content if available and local spread not found (or to override?)
      // If local spread is found, useSpreadTranslations will handle translation based on ID.
      // If NOT found, we must provide translated content here.
      if (!localSpread) {
        if (language === 'en') {
          name = apiSpread.name_en || name;
          description = apiSpread.description_en || description;
        } else if (language === 'ja') {
          name = apiSpread.name_jp || name;
          description = apiSpread.description_jp || description;
        }
      } else {
        // If local spread exists, we rely on its ID for translation lookup in TarotSpreadSelector -> useSpreadTranslations
        // So we can keep the base name/desc or use the local one.
        name = localSpread.name;
        description = localSpread.description;
      }

      return {
        id: localSpread?.id || apiSpread.id.toString(),
        name,
        description,
        category: categorySlug as any,
        permission: (apiSpread.permission?.toLowerCase() || 'free') as 'free' | 'pro' | 'premium',
        positions: localSpread?.positions || Array(apiSpread.card_count).fill(0).map((_, i) => ({
          id: `pos_${i}`,
          name: `Position ${i + 1}`,
          description: ''
        }))
      };
    });
  };


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
        isActive: boolean;
        isDemo: boolean;
        unlimitedQuota: boolean;
        vipLevel: number;
        vipExpireAt: string | null;
      }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        requireAuth: false, // 登录接口不需要Authorization header，但会在请求体中包含凭证
      });

      // 转换API响应为User类型
      const convertedUser = convertApiUserToUser(userData);
      setUser(convertedUser);
      // 存储用户信息和认证凭证
      saveAuthCredentials(convertedUser as unknown as Record<string, unknown>, email, password);
      setShowLoginModal(false);
      await fetchQuota(convertedUser.id);
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
    const requirement = getSpreadRequirement(spread);

    // 检查是否为 Premium 专用的牌阵
    if (requirement === 'premium') {
      // 检查用户是否登录
      if (!user) {
        setShowLoginModal(true);
        return;
      }

      // 检查用户是否为 Premium
      if (user.vipLevel !== 'premium') {
        // 打开Premium升级提示弹窗
        setShowPremiumUpgradeModal(true);
        return;
      }
    }

    // 检查是否为 Pro 专用的牌阵
    if (requirement === 'pro') {
      // 检查用户是否登录
      if (!user) {
        setShowLoginModal(true);
        return;
      }

      // 检查用户是否为 Pro 或 Premium
      if (user.vipLevel !== 'pro' && user.vipLevel !== 'premium') {
        // 打开升级提示弹窗
        setShowProUpgradeModal(true);
        return;
      }
    }

    setSelectedSpread(spread);
    trackEvent('spread_click', { 
      spread_type: spread.category,
      spread_name: spread.name 
    });
  };

  const handleDraw = () => {
    if (!selectedSpread || !question.trim()) return;

    setIsDrawing(true);
    const cards = drawCards(selectedSpread.positions.length);
    setDrawnCards(cards);
    trackEvent('draw_cards', { 
      query: question,
      spread_type: selectedSpread.category,
      spread_name: selectedSpread.name,
      cards: cards.map(c => c.name)
    });

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

    if (!selectedSpread) {
      alert('请先选择牌阵');
      return;
    }

    setIsGenerating(true);
    setShowAiInterpretation(true);
    trackEvent('tarot_request_interpretation', { 
      feature_name: 'ai_tarot',
      query: question,
      spread_type: selectedSpread?.category,
      spread_name: selectedSpread?.name,
      cards: drawnCards.map(c => c.name),
      tone,
      card_style: cardStyle,
    });

    try {
      await streamApiRequest(
        '/api/tarot/interpret',
        {
          method: 'POST',
          body: JSON.stringify({
            userId: user.id,
            question,
            spread: selectedSpread,
            cards: drawnCards,
            tone,
          }),
        },
        (text) => {
          setAiInterpretation((prev) => prev + text);
        },
        async (fullText) => {
          // 流式响应完成
          console.log('Interpretation completed, length:', fullText.length);
          trackEvent('tarot_interpretation_generated', { 
            feature_name: 'ai_tarot',
            query: question,
            spread_type: selectedSpread?.category,
            spread_name: selectedSpread?.name,
            cards: drawnCards.map(c => c.name),
            interpretation: fullText, // Full text might be too long for some analytics, but requested
            is_free: !user?.vipLevel,
            word_count: fullText.length
          });
          // 更新剩余限额
          await fetchQuota(user.id);
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
    trackEvent('sug_query_click', {
      sug_query: selectedQuestion,
      spread_type: selectedSpread?.category,
      spread_name: selectedSpread?.name
    });
    // Scroll to the question input
    setTimeout(() => {
      const questionInput = document.querySelector('textarea');
      if (questionInput) {
        questionInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        questionInput.focus();
      }
    }, 100);
  };

  const activeCategories = apiCategories.length > 0 ? apiCategories : STATIC_CATEGORIES;

  const getCategoryName = (category: ApiCategory | { slug: string }) => {
    if ('name' in category) {
      if (language === 'en') return category.name_en || category.name;
      if (language === 'ja') return category.name_jp || category.name;
      return category.name;
    }
    // Fallback to static translations
    const staticMap: Record<string, string> = {
      recommended: t.home.spreadCategories.recommended,
      basic: t.home.spreadCategories.basic,
      love: t.home.spreadCategories.love,
      decision: t.home.spreadCategories.decision,
      career: t.home.spreadCategories.career,
      self: t.home.spreadCategories.self,
      advanced: t.home.spreadCategories.advanced,
    };
    return staticMap[category.slug] || category.slug;
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          {/* Decorative Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-purple-900/40 border border-purple-500/30 rounded-full mb-8 backdrop-blur-sm animate-glow">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-semibold text-purple-200 tracking-wide">{t.home.subtitle}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-text-glow">
            {t.home.title}
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-purple-200/70 max-w-2xl mx-auto leading-relaxed">
            {t.landingPage.heroSubtitle}
          </p>
        </div>

        <style jsx>{`
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.5), 0 0 80px rgba(236, 72, 153, 0.3); }
            50% { box-shadow: 0 0 60px rgba(168, 85, 247, 0.8), 0 0 100px rgba(236, 72, 153, 0.5); }
          }
          @keyframes text-glow {
            0%, 100% { text-shadow: 0 0 20px rgba(236, 72, 153, 0.5), 0 0 40px rgba(168, 85, 247, 0.3); }
            50% { text-shadow: 0 0 30px rgba(236, 72, 153, 0.8), 0 0 60px rgba(168, 85, 247, 0.5); }
          }
          @keyframes selectSpreadPulse {
            0%, 100% {
              transform: scale(1);
              filter: drop-shadow(0 0 15px rgba(168, 85, 247, 0.6));
            }
            50% {
              transform: scale(1.05);
              filter: drop-shadow(0 0 30px rgba(236, 72, 153, 0.8));
            }
          }

          @keyframes welcomeFade {
            0% {
              opacity: 0.7;
              filter: brightness(0.9);
            }
            100% {
              opacity: 1;
              filter: brightness(1.2);
            }
          }
          .animate-glow { animation: glow 4s ease-in-out infinite; }
          .animate-text-glow { animation: text-glow 3s ease-in-out infinite; }
        `}</style>

        {!selectedSpread && (
          <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30" id="spreads">
            <CardHeader className="text-center">
              <CardTitle className="text-white text-2xl" style={{
                animation: 'selectSpreadPulse 2.5s ease-in-out infinite',
                textShadow: '0 0 15px rgba(168, 85, 247, 0.6), 0 0 30px rgba(236, 72, 153, 0.4)'
              }}>
                {t.home.selectSpread}
              </CardTitle>
              <CardDescription className="text-purple-200" style={{
                animation: 'welcomeFade 3s ease-in-out infinite alternate'
              }}>
                {t.home.welcome}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCategories && apiCategories.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                </div>
              ) : (
                <Tabs defaultValue={activeCategories[0]?.slug || 'recommended'} className="w-full">
                  <TabsList className="w-full justify-start bg-black/20 border-purple-500/30 overflow-x-auto">
                    {activeCategories.map((category) => (
                      <TabsTrigger 
                        key={category.slug} 
                        value={category.slug} 
                        onClick={() => trackEvent('spread_type_click', { spread_type: category.slug })}
                        className="data-[state=active]:bg-purple-600/30 text-purple-200 data-[state=active]:text-white whitespace-nowrap"
                      >
                        {getCategoryName(category)}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {activeCategories.map((category) => (
                    <TabsContent key={category.slug} value={category.slug} className="mt-6">
                      <TarotSpreadSelector
                        spreads={getSpreadsForCategory(category.slug)}
                        onSpreadSelect={handleSpreadSelect}
                      />
                    </TabsContent>
                  ))}
                </Tabs>
              )}
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
                variant="ghost"
                className="w-full bg-black/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/20 hover:border-purple-400/50 hover:text-white transition-all duration-200"
              >
                {t.home.reselectSpread}
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
                  <Button
                    onClick={() => setSelectedSpread(null)}
                    variant="ghost"
                    className="w-full mt-3 bg-black/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/20 hover:border-purple-400/50 hover:text-white transition-all duration-200"
                  >
                    {t.home.reselectSpread}
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
                  
                  <div className="mb-8">
                    <Label className="block text-base sm:text-lg font-medium mb-3 sm:mb-4 text-center text-white">{t.settings?.tone || 'Interpretation Style'}</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                      {(
                        [
                          { id: 'mystical', label: t.settings?.toneMystical, desc: t.settings?.toneMysticalDesc, icon: MessageSquare },
                          { id: 'direct', label: t.settings?.toneDirect, desc: t.settings?.toneDirectDesc, icon: Sparkles },
                          { id: 'warm', label: t.settings?.toneWarm, desc: t.settings?.toneWarmDesc, icon: Star },
                          { id: 'rational', label: t.settings?.toneRational, desc: t.settings?.toneRationalDesc, icon: Brain },
                        ] as const
                      ).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setTone(item.id)}
                          className={`
                            relative flex flex-col p-3 md:p-4 rounded-xl border cursor-pointer transition-all duration-300 h-full
                            ${tone === item.id 
                              ? 'bg-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                              : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'}
                          `}
                        >
                          <div className={`
                            w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center mb-2 md:mb-3
                            ${tone === item.id ? 'bg-white text-black' : 'bg-white/10 text-white'}
                          `}>
                            <item.icon className="w-4 h-4 md:w-5 md:h-5" />
                          </div>
                          
                          <h3 className="font-bold text-base md:text-lg mb-1 md:mb-2 text-white">{item.label}</h3>
                          
                          <p className="text-xs md:text-sm text-gray-400 leading-relaxed mb-3 md:mb-4 flex-grow">
                            {item.desc}
                          </p>
                          
                          <div className={`
                            mt-auto text-sm font-medium flex items-center
                            ${tone === item.id ? 'text-white' : 'text-gray-500'}
                          `}>
                            {tone === item.id ? (
                              <span className="flex items-center gap-1">
                                {t.settings?.currentStyle} <span className="text-xs">→</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                {t.settings?.selectStyle} <span className="text-xs">→</span>
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
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
                  <Button
                    onClick={() => setSelectedSpread(null)}
                    variant="ghost"
                    className="w-full mt-3 bg-black/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/20 hover:border-purple-400/50 hover:text-white transition-all duration-200"
                  >
                    {t.home.reselectSpread}
                  </Button>
                </CardContent>
              </Card>
            )}

            {showAiInterpretation && (
              <TarotResult
                question={question}
                cards={drawnCards}
                spread={selectedSpread!}
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

      {/* Pro Upgrade Modal */}
      <ProUpgradeModal
        isOpen={showProUpgradeModal}
        onClose={() => setShowProUpgradeModal(false)}
        onSubscribe={() => {
          setShowProUpgradeModal(false);
          router.push('/pricing');
        }}
      />

      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal
        isOpen={showPremiumUpgradeModal}
        onClose={() => setShowPremiumUpgradeModal(false)}
        onSubscribe={() => {
          setShowPremiumUpgradeModal(false);
          router.push('/pricing');
        }}
      />
    </div>
  );
}
