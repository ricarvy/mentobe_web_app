'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useI18n } from '@/lib/i18n';

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}

export function ProUpgradeModal({ isOpen, onClose, onSubscribe }: ProUpgradeModalProps) {
  const { t } = useI18n();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-purple-900/95 to-pink-900/95 border-purple-500/50 text-white max-w-md">
        <div className="pt-8 pb-6">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/50">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center mb-3">
            {t.home.proUpgradeRequired.title}
          </h2>

          {/* Description */}
          <p className="text-purple-200 text-center mb-6">
            {t.home.proUpgradeRequired.description}
          </p>

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={onSubscribe}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-6 text-lg shadow-lg shadow-purple-500/30"
            >
              {t.home.proUpgradeRequired.subscribeNow}
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full text-purple-300 hover:text-white hover:bg-purple-500/20"
            >
              {t.common.cancel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
