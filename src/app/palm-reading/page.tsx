'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hand, Sparkles, Star, Crown, ArrowLeft, Camera, Upload, Eye, Heart, Zap } from 'lucide-react';
import Image from 'next/image';

const palmistryInsights = {
  "Life Line": {
    icon: "❤️",
    description: "Your life line reveals your vitality and life journey",
    detail: "A strong, unbroken life line indicates robust health and resilience. Any breaks or forks may signal significant life changes or challenges that will ultimately strengthen you."
  },
  "Head Line": {
    icon: "🧠",
    description: "Your head line reflects your intellect and mental approach",
    detail: "A deep, straight head line suggests practical thinking and logical reasoning. A curved line indicates creativity and intuitive thinking."
  },
  "Heart Line": {
    icon: "💕",
    description: "Your heart line reveals your emotional nature and relationships",
    detail: "A prominent heart line shows emotional depth and capacity for love. The length and shape indicate how you express and receive affection."
  },
  "Fate Line": {
    icon: "⭐",
    description: "Your fate line reveals destiny and career path",
    detail: "A clear fate line suggests a well-defined life purpose. Its strength indicates how much external events versus personal choices shape your destiny."
  }
};

export default function PalmReadingPage() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);
  const [insights, setInsights] = useState<typeof palmistryInsights | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/png');
        setImage(imageData);
        setIsCaptured(true);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setIsCaptured(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const retakePhoto = () => {
    setImage(null);
    setIsCaptured(false);
    setInsights(null);
    startCamera();
  };

  const analyzePalm = () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setInsights(palmistryInsights);
      setIsAnalyzing(false);
    }, 3000);
  };

  const resetAnalysis = () => {
    setImage(null);
    setIsCaptured(false);
    setInsights(null);
    startCamera();
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

        {/* Floating Hand Particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={`hand-${i}`}
            className="absolute animate-float opacity-10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${7 + i * 0.6}s`,
            }}
          >
            <Hand className="w-8 h-8 text-pink-400" />
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
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes scan-line {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        .animate-twinkle { animation: twinkle ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 4s ease-in-out infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-glow { animation: glow 4s ease-in-out infinite; }
        .animate-fade-in-up { animation: fadeInUp 1s ease-out forwards; }
        .animate-pulse-ring { animation: pulse-ring 1.5s ease-out infinite; }
        .animate-scan-line { animation: scan-line 2s linear infinite; }
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
            <Hand className="w-5 h-5 text-pink-400" />
            <span className="text-sm font-semibold text-purple-200 tracking-wide">AI PALM READING</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-glow">
            Read Your Palm
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-purple-200/80 max-w-2xl mx-auto mb-8 leading-relaxed">
            Upload or capture your palm print and discover the secrets of your destiny
            through advanced AI-powered palmistry analysis
          </p>
        </div>

        {!isCaptured ? (
          <>
            {/* Camera Section */}
            <Card className="bg-black/40 backdrop-blur-md border-2 border-purple-500/30 mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <CardContent className="pt-8 pb-8">
                <div className="relative w-full max-w-lg mx-auto">
                  {/* Video Container */}
                  <div className="relative aspect-[3/4] bg-black/60 rounded-2xl overflow-hidden border-2 border-purple-500/30">
                    {videoRef.current?.srcObject ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <Camera className="w-16 h-16 text-purple-400/50 mx-auto mb-4" />
                          <p className="text-purple-400">Initializing camera...</p>
                        </div>
                      </div>
                    )}

                    {/* Palm Guide Overlay */}
                    <div className="absolute inset-4 border-2 border-dashed border-purple-500/30 rounded-xl pointer-events-none">
                      <div className="absolute top-2 left-2 right-2 flex justify-center">
                        <span className="text-xs text-purple-400/70">Place your palm here</span>
                      </div>
                    </div>
                  </div>

                  {/* Capture Button */}
                  <div className="mt-6 flex justify-center">
                    <Button
                      onClick={capturePhoto}
                      disabled={!videoRef.current?.srcObject}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gradient-animate transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      size="lg"
                    >
                      <Camera className="mr-2 w-5 h-5" />
                      Capture Photo
                    </Button>
                  </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 my-8">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
                  <span className="text-sm text-purple-400">or</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
                </div>

                {/* Upload Button */}
                <div className="text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="border-purple-500/40 text-purple-200 hover:bg-purple-500/10 transition-all hover:scale-105"
                    size="lg"
                  >
                    <Upload className="mr-2 w-5 h-5" />
                    Upload Image
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tips Section */}
            <Card className="bg-black/30 backdrop-blur-md border border-purple-500/20 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <CardContent className="pt-6 pb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Palm Reading Tips</h3>
                    <ul className="space-y-2 text-sm text-purple-200/70">
                      <li className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <span>Use good lighting to capture clear palm lines</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <span>Spread your fingers naturally, not too tight</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <span>Center your palm in the frame for best results</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : !insights ? (
          <>
            {/* Preview Section */}
            <Card className="bg-black/40 backdrop-blur-md border-2 border-purple-500/30 mb-8 animate-fade-in-up">
              <CardContent className="pt-8 pb-8">
                <div className="relative w-full max-w-lg mx-auto">
                  {/* Image Preview */}
                  <div className="relative aspect-[3/4] bg-black/60 rounded-2xl overflow-hidden border-2 border-purple-500/30">
                    {image && (
                      <Image
                        src={image}
                        alt="Captured palm"
                        fill
                        className="object-cover"
                      />
                    )}

                    {/* Corner Decorations */}
                    <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-purple-500/50" />
                    <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-purple-500/50" />
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-purple-500/50" />
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-purple-500/50" />
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex flex-wrap justify-center gap-4">
                    <Button
                      onClick={analyzePalm}
                      disabled={isAnalyzing}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gradient-animate transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      size="lg"
                    >
                      {isAnalyzing ? (
                        <>
                          <Sparkles className="mr-2 w-5 h-5 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 w-5 h-5" />
                          Analyze Palm
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={retakePhoto}
                      variant="outline"
                      className="border-purple-500/40 text-purple-200 hover:bg-purple-500/10 transition-all hover:scale-105"
                      size="lg"
                    >
                      <Camera className="mr-2 w-5 h-5" />
                      Retake Photo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Results Section */}
            <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-md border-2 border-pink-500/30 mb-8 animate-fade-in-up animate-glow">
              <CardContent className="pt-10 pb-10">
                <div className="text-center mb-10">
                  {/* Hand Icon */}
                  <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full animate-pulse-ring" />
                    <Hand className="absolute inset-0 flex items-center justify-center h-12 w-12 text-pink-400" />
                  </div>

                  {/* Title */}
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Your Palm Reading Results
                  </h2>
                  <p className="text-purple-200/70">
                    Revealed by AI palmistry analysis
                  </p>
                </div>

                {/* Insights Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-10">
                  {Object.entries(insights).map(([key, value], index) => (
                    <div
                      key={key}
                      className="bg-black/30 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.2}s` }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{value.icon}</div>
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">{key}</h3>
                          <p className="text-sm text-purple-300 mb-3">{value.description}</p>
                          <p className="text-sm text-purple-200/70 leading-relaxed">
                            {value.detail}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap justify-center gap-4">
                  <Button
                    onClick={resetAnalysis}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gradient-animate transition-all hover:scale-105"
                    size="lg"
                  >
                    <Camera className="mr-2 w-5 h-5" />
                    Read Another Palm
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
              </CardContent>
            </Card>

            {/* Disclaimer */}
            <Card className="bg-black/30 backdrop-blur-md border border-purple-500/20 animate-fade-in-up">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Remember</h3>
                    <p className="text-sm text-purple-200/70">
                      This AI palm reading is for entertainment and self-reflection purposes only. 
                      Trust your intuition and remember that you have the power to shape your own destiny.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Hidden Canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Footer */}
        <div className="text-center mt-12 text-purple-300/50 text-sm">
          <p className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            Powered by Mentob AI • AI palmistry for the modern seeker
            <Sparkles className="w-4 h-4" />
          </p>
        </div>
      </div>
    </div>
  );
}
