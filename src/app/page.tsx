'use client';

import { useState, useEffect } from 'react';
import { StarBackground } from '@/components/StarBackground';
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

export default function Home() {
  const [selectedSpread, setSelectedSpread] = useState<Spread | null>(null);
  const [question, setQuestion] = useState('');
  const [drawnCards, setDrawnCards] = useState<TarotCard[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [user, setUser] = useState<{ id: string; username: string; email: string } | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [aiInterpretation, setAiInterpretation] = useState('');
  const [showAiInterpretation, setShowAiInterpretation] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [remainingQuota, setRemainingQuota] = useState(3);

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
      const response = await fetch(`/api/auth/quota?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setRemainingQuota(data.remaining);
      }
    } catch (error) {
      console.error('Error fetching quota:', error);
    }
  };

  const handleLogin = async () => {
    if (!username.trim() || !email.trim()) {
      alert('请输入用户名和邮箱');
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || '登录失败');
        return;
      }

      const userData = await response.json();
      setUser(userData);
      localStorage.setItem('tarot_user', JSON.stringify(userData));
      setShowLoginModal(false);
      await fetchQuota(userData.id);
    } catch (error) {
      console.error('Error:', error);
      alert('登录失败，请稍后重试');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('tarot_user');
    setRemainingQuota(3);
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

    if (remainingQuota <= 0) {
      alert('今日解读次数已用完，请明天再来');
      return;
    }

    setIsGenerating(true);
    setShowAiInterpretation(true);

    try {
      const response = await fetch('/api/tarot/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          question,
          spread: selectedSpread,
          cards: drawnCards,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get interpretation');
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
      alert(error instanceof Error ? error.message : '解读生成失败，请稍后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGetAiSuggestion = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch('/api/tarot/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          cards: drawnCards,
          interpretation: aiInterpretation,
        }),
      });

      if (!response.ok) throw new Error('Failed to get suggestion');

      const data = await response.json();
      setAiSuggestion(data.suggestion);
    } catch (error) {
      console.error('Error:', error);
      setAiSuggestion('建议生成失败，请稍后重试');
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
    setAiSuggestion('');
  };

  return (
    <div className="min-h-screen text-white">
      <StarBackground />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex justify-between items-center mb-8">
            <div></div>
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-purple-200">
                  {user.username} | 今日剩余解读: {remainingQuota}/3
                </span>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="border-purple-500/30 text-purple-200 hover:bg-purple-500/10"
                >
                  退出登录
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setShowLoginModal(true)}
                variant="outline"
                size="sm"
                className="border-purple-500/30 text-purple-200 hover:bg-purple-500/10"
              >
                登录
              </Button>
            )}
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            塔罗牌指引
          </h1>
          <p className="text-lg text-purple-200">探索命运的奥秘，获得内心的指引</p>
        </header>

        <div className="max-w-4xl mx-auto">
          {!selectedSpread && (
            <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">选择牌阵</CardTitle>
                <CardDescription className="text-purple-200">选择一个牌阵开始你的塔罗之旅</CardDescription>
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
                <CardTitle className="text-white">{selectedSpread.name}</CardTitle>
                <CardDescription className="text-purple-200">{selectedSpread.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="block text-sm font-medium mb-2 text-purple-200">
                    你的问题
                  </Label>
                  <Textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="输入你想问的问题..."
                    className="bg-black/30 border-purple-500/30 text-white placeholder:text-purple-300/50 min-h-[100px]"
                  />
                </div>

                <Button
                  onClick={handleDraw}
                  disabled={!question.trim() || isDrawing}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isDrawing ? '抽牌中...' : '开始抽牌'}
                </Button>

                <Button
                  onClick={() => setSelectedSpread(null)}
                  variant="outline"
                  className="w-full border-purple-500/30 text-purple-200 hover:bg-purple-500/10"
                >
                  返回牌阵选择
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
              />

              {!user && (
                <Card className="mt-8 bg-black/40 backdrop-blur-sm border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-white">获取AI解读</CardTitle>
                    <CardDescription className="text-purple-200">
                      登录即可解锁每日免费三次的塔罗牌AI解读
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => setShowLoginModal(true)}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      登录账号
                    </Button>
                  </CardContent>
                </Card>
              )}

              {user && !showAiInterpretation && (
                <Card className="mt-8 bg-black/40 backdrop-blur-sm border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-white">获取AI解读</CardTitle>
                    <CardDescription className="text-purple-200">
                      让AI为你详细解读牌面含义
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={handleGetAiInterpretation}
                      disabled={isGenerating || remainingQuota <= 0}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {isGenerating ? '生成中...' : remainingQuota <= 0 ? '今日次数已用完' : '生成解读'}
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
                  suggestion={aiSuggestion}
                  isGenerating={isGenerating}
                  onGetSuggestion={handleGetAiSuggestion}
                  onReset={handleReset}
                />
              )}
            </>
          )}
        </div>
      </div>

      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="bg-black/80 border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-white">登录账号</DialogTitle>
            <DialogDescription className="text-purple-200">
              登录即可解锁每日免费三次的塔罗牌AI解读
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-purple-200">用户名</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="输入用户名"
                className="bg-black/30 border-purple-500/30 text-white placeholder:text-purple-300/50 mt-2"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-purple-200">邮箱</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="输入邮箱"
                className="bg-black/30 border-purple-500/30 text-white placeholder:text-purple-300/50 mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleLogin}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              登录
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
