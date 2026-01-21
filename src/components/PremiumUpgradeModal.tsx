'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useI18n } from '@/lib/i18n';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}

export function PremiumUpgradeModal({ isOpen, onClose, onSubscribe }: PremiumUpgradeModalProps) {
  const { t } = useI18n();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-purple-900/95 via-amber-900/80 to-purple-900/95 border-amber-500/50 text-white max-w-md">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-amber-300 hover:text-white transition-colors text-2xl leading-none"
        >
          ×
        </button>

        {/* Premium crown icon */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/50 animate-premium-float">
            <svg
              className="w-9 h-9 text-amber-900"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
            </svg>
          </div>
        </div>

        <div className="pt-10 pb-6">
          {/* Stars decoration */}
          <div className="relative mb-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-amber-400 rounded-full animate-premium-star"
                style={{
                  left: `${10 + (i * 12)}%`,
                  top: `${50 + Math.sin(i) * 20}%`,
                  animationDelay: `${i * 0.2}s`,
                }}
              ></div>
            ))}
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-center mb-3 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent">
            {t.home.premiumUpgradeRequired.title}
          </h2>

          {/* Description */}
          <p className="text-amber-100 text-center mb-6 leading-relaxed">
            {t.home.premiumUpgradeRequired.description}
          </p>

          {/* Premium features */}
          <div className="bg-black/30 rounded-lg p-4 mb-6 border border-amber-500/30">
            <ul className="space-y-2 text-sm text-amber-200">
              <li className="flex items-center gap-2">
                <span className="text-amber-400">✦</span>
                {t.home.premiumUpgradeRequired.feature1}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400">✦</span>
                {t.home.premiumUpgradeRequired.feature2}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400">✦</span>
                {t.home.premiumUpgradeRequired.feature3}
              </li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            {/* Premium subscribe button with ultra-cool effects */}
            <button
              onClick={onSubscribe}
              className="relative group"
            >
              {/* Outer glow pulse */}
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-lg blur-xl opacity-30 group-hover:opacity-60 group-hover:blur-2xl transition-all duration-500 animate-premium-glow"></div>

              {/* Rotating border effect */}
              <div
                className="absolute -inset-[2px] bg-gradient-to-r from-amber-500 via-yellow-400 via-amber-300 to-amber-500 rounded-lg opacity-75"
                style={{
                  backgroundSize: '300% 300%',
                  animation: 'premium-border-rotate 3s linear infinite',
                }}
              ></div>

              {/* Second rotating border (reverse) */}
              <div
                className="absolute -inset-[2px] bg-gradient-to-r from-yellow-300 via-amber-500 via-yellow-400 to-amber-300 rounded-lg opacity-50"
                style={{
                  backgroundSize: '300% 300%',
                  animation: 'premium-border-reverse 4s linear infinite',
                }}
              ></div>

              {/* Button container */}
              <div className="relative bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-lg overflow-hidden">
                {/* Inner flow light effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-premium-flow"></div>

                {/* Top sheen effect */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                {/* Shimmer particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-white/80 rounded-full animate-premium-particle"
                      style={{
                        left: `${15 + i * 15}%`,
                        top: `${30 + (i % 3) * 20}%`,
                        animationDelay: `${i * 0.15}s`,
                      }}
                    ></div>
                  ))}
                </div>

                {/* Button content */}
                <div className="relative px-6 py-6 flex items-center justify-center gap-3 transition-all duration-300 group-hover:scale-105 group-active:scale-95">
                  {/* Crown icon with rotation */}
                  <svg
                    className="w-6 h-6 text-amber-900 animate-premium-icon-pulse group-hover:animate-premium-icon-spin"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
                  </svg>

                  {/* Text with glow */}
                  <span className="text-lg font-bold text-amber-900 relative group-hover:text-amber-800 transition-colors">
                    {t.home.premiumUpgradeRequired.subscribeNow}
                  </span>

                  {/* Sparkle icon on the right */}
                  <svg
                    className="w-5 h-5 text-amber-700 animate-premium-sparkle"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L14.5 9L12 7L9.5 9L12 2Z"/>
                    <path d="M12 22L9.5 15L12 17L14.5 15L12 22Z"/>
                    <path d="M2 12L9 9.5L7 12L9 14.5L2 12Z"/>
                    <path d="M22 12L15 14.5L17 12L15 9.5L22 12Z"/>
                  </svg>
                </div>

                {/* Bottom glow line */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[3px] bg-gradient-to-r from-transparent via-yellow-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity group-hover:w-full"></div>
              </div>
            </button>
            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full text-amber-300 hover:text-white hover:bg-amber-500/20"
            >
              {t.common.cancel}
            </Button>
          </div>
        </div>

        <style jsx>{`
          @keyframes premium-float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-8px);
            }
          }

          @keyframes premium-star {
            0%, 100% {
              opacity: 0;
              transform: scale(0) rotate(0deg);
            }
            50% {
              opacity: 1;
              transform: scale(1) rotate(180deg);
            }
          }

          @keyframes premium-glow {
            0%, 100% {
              opacity: 0.3;
              transform: scale(1);
            }
            50% {
              opacity: 0.6;
              transform: scale(1.05);
            }
          }

          @keyframes premium-border-rotate {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }

          @keyframes premium-border-reverse {
            0% {
              background-position: 100% 50%;
            }
            50% {
              background-position: 0% 50%;
            }
            100% {
              background-position: 100% 50%;
            }
          }

          @keyframes premium-flow {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(200%);
            }
          }

          @keyframes premium-particle {
            0%, 100% {
              opacity: 0;
              transform: translateY(0) scale(0);
            }
            50% {
              opacity: 1;
              transform: translateY(-10px) scale(1);
            }
          }

          @keyframes premium-icon-pulse {
            0%, 100% {
              transform: scale(1);
              filter: drop-shadow(0 0 2px rgba(251, 191, 36, 0.5));
            }
            50% {
              transform: scale(1.1);
              filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.8));
            }
          }

          @keyframes premium-icon-spin {
            0% {
              transform: rotateY(0deg) scale(1);
            }
            50% {
              transform: rotateY(180deg) scale(1.2);
            }
            100% {
              transform: rotateY(360deg) scale(1);
            }
          }

          @keyframes premium-sparkle {
            0%, 100% {
              opacity: 0.6;
              transform: scale(1) rotate(0deg);
            }
            50% {
              opacity: 1;
              transform: scale(1.3) rotate(180deg);
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
