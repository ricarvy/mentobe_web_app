'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Sparkles, Star, Crown, RefreshCw, ArrowLeft, Heart } from 'lucide-react';

const mysticAnswers = [
  "The universe whispers: trust the path before you, for it holds unexpected treasures.",
  "In silence lies the answer you seek. Quiet your mind and listen to your heart.",
  "The stars align in your favor. Now is the time to act with courage and conviction.",
  "What you seek is seeking you. Open your eyes to the opportunities around you.",
  "The wisdom you need flows through your veins. Trust your intuition above all else.",
  "Patience, dear seeker. The answer reveals itself in perfect timing.",
  "Your dreams are closer than you imagine. Take one step forward today.",
  "The ancient knowledge says: balance is the key to all you desire.",
  "Love and light surround you. Embrace the support of those who care.",
  "The cosmic energies are shifting in your favor. Prepare for transformation.",
  "Your inner wisdom shines brighter than any external guidance. Look within.",
  "The cards reveal: a new beginning awaits those who dare to take the first step.",
  "Fear not the unknown, for it holds the seeds of your greatest growth.",
  "The universe conspires to help those who help themselves. Trust the process.",
  "Your question carries the answer. Reflect on what truly matters to you.",
  "The mystic realm offers: clarity comes through action, not contemplation alone.",
  "Embrace change, for it is the universe's way of guiding you to your destiny.",
  "Your path is unique. Do not compare your journey to others' timelines.",
  "The answer lies in the question itself. What is your heart truly asking?",
  "Trust that everything happens for a reason, even when you cannot see it yet.",
  "The ancient wisdom reminds us: we become what we believe we are.",
  "Your potential is limitless. Do not let doubt dim your inner light.",
  "The universe rewards those who take calculated risks. Leap with faith.",
  "In every ending, there is a new beginning. Embrace the cycle of life.",
  "Your words hold power. Speak only what you wish to manifest into reality.",
  "The mystic answer: you are exactly where you need to be right now.",
  "Love is the most powerful force in the universe. Let it guide your decisions.",
  "The answer you seek is not what you expect, but what you truly need.",
  "Trust the journey, even when you cannot see the destination.",
  "Your intuition is your greatest compass. Follow its guidance without hesitation.",
  "The universe offers: all answers lie within. Look inward with an open heart.",
];

export default function AnswerBookPage() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isRevealing, setIsRevealing] = useState(false);
  const [hasAsked, setHasAsked] = useState(false);

  const revealAnswer = () => {
    if (!question.trim()) return;

    setIsRevealing(true);
    setAnswer('');

    // Random answer animation
    const duration = 3000;
    const interval = 100;
    let elapsed = 0;

    const animationInterval = setInterval(() => {
      elapsed += interval;
      const randomAnswer = mysticAnswers[Math.floor(Math.random() * mysticAnswers.length)];
      setAnswer(randomAnswer);

      if (elapsed >= duration) {
        clearInterval(animationInterval);
        const finalAnswer = mysticAnswers[Math.floor(Math.random() * mysticAnswers.length)];
        setAnswer(finalAnswer);
        setIsRevealing(false);
        setHasAsked(true);
      }
    }, interval);
  };

  const askAgain = () => {
    setAnswer('');
    setHasAsked(false);
  };

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

        {/* Floating Book Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`book-${i}`}
            className="absolute animate-float opacity-10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${8 + i * 0.5}s`,
            }}
          >
            <BookOpen className="w-8 h-8 text-purple-400" />
          </div>
        ))}

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
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(8deg); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.5), 0 0 80px rgba(236, 72, 153, 0.3); }
          50% { box-shadow: 0 0 60px rgba(168, 85, 247, 0.8), 0 0 100px rgba(236, 72, 153, 0.5); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 30px rgba(236, 72, 153, 0.4); }
          50% { box-shadow: 0 0 60px rgba(236, 72, 153, 0.8); }
        }
        @keyframes book-open {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(180deg); }
        }
        .animate-twinkle { animation: twinkle ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 4s ease-in-out infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-glow { animation: glow 4s ease-in-out infinite; }
        .animate-fade-in-up { animation: fadeInUp 1s ease-out forwards; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .gradient-animate {
          background-size: 200% 200%;
          animation: gradient-rotate 5s ease infinite;
        }
      `}</style>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-purple-300 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          {/* Decorative Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-purple-900/40 border border-purple-500/30 rounded-full mb-8 backdrop-blur-sm animate-glow">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-semibold text-purple-200 tracking-wide">MYSTIC ANSWER BOOK</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-glow">
            Ask the Universe
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-purple-200/80 max-w-2xl mx-auto mb-8 leading-relaxed">
            Pose your question to the ancient wisdom of the Answer Book and receive mystical guidance
            from the cosmos
          </p>
        </div>

        {/* Question Input Card */}
        {!hasAsked && (
          <Card className="bg-black/40 backdrop-blur-md border-2 border-purple-500/30 mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <CardContent className="pt-8 pb-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Your Question
                  </label>
                  <Textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="What guidance do you seek from the universe? Ask your question here..."
                    className="bg-black/30 border-purple-500/30 text-white placeholder:text-purple-500/50 min-h-[120px] focus:border-purple-500/50 focus:ring-purple-500/20"
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={revealAnswer}
                    disabled={!question.trim() || isRevealing}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gradient-animate transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    size="lg"
                  >
                    {isRevealing ? (
                      <>
                        <Sparkles className="mr-2 w-5 h-5 animate-spin" />
                        Consulting the Universe...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 w-5 h-5" />
                        Reveal Answer
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Answer Display */}
        {hasAsked && answer && (
          <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-md border-2 border-pink-500/30 mb-8 animate-fade-in-up animate-glow">
            <CardContent className="pt-10 pb-10">
              <div className="text-center">
                {/* Book Icon */}
                <div className="relative w-24 h-24 mx-auto mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full animate-pulse-glow" />
                  <BookOpen className="absolute inset-0 flex items-center justify-center h-12 w-12 text-pink-400" />
                </div>

                {/* Question Display */}
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-4">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-purple-300">Your Question</span>
                  </div>
                  <p className="text-xl text-white/90 italic">"{question}"</p>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
                  <Heart className="w-6 h-6 text-pink-400" />
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
                </div>

                {/* Answer Display */}
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/10 border border-pink-500/20 rounded-full mb-6">
                    <Crown className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-pink-300">Mystic Answer</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-white leading-relaxed animate-fade-in-up">
                    "{answer}"
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap justify-center gap-4">
                  <Button
                    onClick={askAgain}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gradient-animate transition-all hover:scale-105"
                    size="lg"
                  >
                    <RefreshCw className="mr-2 w-5 h-5" />
                    Ask Another Question
                  </Button>
                  <Link href="/">
                    <Button
                      variant="outline"
                      className="border-purple-500/40 text-purple-200 hover:bg-purple-500/10 transition-all hover:scale-105"
                      size="lg"
                    >
                      <ArrowLeft className="mr-2 w-5 h-5" />
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips Section */}
        <Card className="bg-black/30 backdrop-blur-md border border-purple-500/20 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <CardContent className="pt-6 pb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Mystic Wisdom Tips</h3>
                <ul className="space-y-2 text-sm text-purple-200/70">
                  <li className="flex items-start gap-2">
                    <Star className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>Ask specific questions for clearer guidance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>Trust your intuition when interpreting the answer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>The Answer Book provides guidance, but you create your destiny</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 text-purple-300/50 text-sm">
          <p className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            Powered by Mentob AI • Mystic wisdom from the universe
            <Sparkles className="w-4 h-4" />
          </p>
        </div>
      </div>
    </div>
  );
}
