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
      alert('Please enter username and email');
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
        alert(error.error || 'Login failed');
        return;
      }

      const userData = await response.json();
      setUser(userData);
      localStorage.setItem('tarot_user', JSON.stringify(userData));
      setShowLoginModal(false);
      await fetchQuota(userData.id);
    } catch (error) {
      console.error('Error:', error);
      alert('Login failed, please try again later');
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
      alert('Daily interpretation limit reached, please try again tomorrow');
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
      alert(error instanceof Error ? error.message : 'Failed to generate interpretation, please try again later');
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
      setAiSuggestion('Failed to generate suggestion, please try again later');
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
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            Discover Your Future
          </h1>
          <p className="text-lg text-purple-200">
            Unlock the mysteries of life with AI-powered tarot readings
          </p>
        </div>

        {!selectedSpread && (
          <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30" id="spreads">
            <CardHeader>
              <CardTitle className="text-white">Choose a Tarot Spread</CardTitle>
              <CardDescription className="text-purple-200">
                Select a spread to begin your tarot journey
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
              <CardTitle className="text-white">{selectedSpread.name}</CardTitle>
              <CardDescription className="text-purple-200">
                {selectedSpread.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="block text-sm font-medium mb-2 text-purple-200">
                  Your Question
                </Label>
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter your question..."
                  className="bg-black/30 border-purple-500/30 text-white placeholder:text-purple-300/50 min-h-[100px]"
                />
              </div>

              <Button
                onClick={handleDraw}
                disabled={!question.trim() || isDrawing}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isDrawing ? 'Drawing cards...' : 'Start Reading'}
              </Button>

              <Button
                onClick={() => setSelectedSpread(null)}
                variant="outline"
                className="w-full border-purple-500/30 text-purple-200 hover:bg-purple-500/10"
              >
                Back to Spreads
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
                  <CardTitle className="text-white">Get AI Interpretation</CardTitle>
                  <CardDescription className="text-purple-200">
                    Sign in to unlock 3 free AI-powered tarot interpretations daily
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setShowLoginModal(true)}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Sign In
                  </Button>
                </CardContent>
              </Card>
            )}

            {user && !showAiInterpretation && (
              <Card className="mt-8 bg-black/40 backdrop-blur-sm border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white">Get AI Interpretation</CardTitle>
                  <CardDescription className="text-purple-200">
                    Let AI provide detailed interpretation of your cards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 text-sm text-purple-200">
                    <span>Daily interpretations remaining: {remainingQuota}/3</span>
                  </div>
                  <Button
                    onClick={handleGetAiInterpretation}
                    disabled={isGenerating || remainingQuota <= 0}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isGenerating ? 'Generating...' : remainingQuota <= 0 ? 'Daily limit reached' : 'Generate Interpretation'}
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

      {/* Login Modal */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="bg-black/80 border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-white">Sign In</DialogTitle>
            <DialogDescription className="text-purple-200">
              Sign in to unlock 3 free AI-powered tarot interpretations daily
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-purple-200">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="bg-black/30 border-purple-500/30 text-white placeholder:text-purple-300/50 mt-2"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-purple-200">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                className="bg-black/30 border-purple-500/30 text-white placeholder:text-purple-300/50 mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleLogin}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Sign In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
