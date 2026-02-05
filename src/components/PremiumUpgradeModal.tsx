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
      <DialogContent 
        className="bg-gradient-to-br from-purple-900/95 via-amber-900/80 to-purple-900/95 border-amber-500/50 text-white max-w-md"
        showCloseButton={false}
      >
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
            <Button
              onClick={onSubscribe}
              className="w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:via-yellow-300 hover:to-amber-400 text-amber-900 font-bold py-6 text-lg shadow-lg shadow-amber-500/30 relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
                </svg>
                {t.home.premiumUpgradeRequired.subscribeNow}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 opacity-0 hover:opacity-100 transition-opacity"></div>
            </Button>
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
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
