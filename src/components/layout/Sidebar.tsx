'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronRight, ChevronDown, Book, Sparkles, History, Settings, HelpCircle, Menu } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [spreadsOpen, setSpreadsOpen] = useState(false);
  const { t } = useI18n();

  const spreads = [
    { name: 'Single Card', id: 'single', description: 'Quick insights for a single question' },
    { name: 'Three Card', id: 'three', description: 'Past, present, future reading' },
    { name: 'Celtic Cross', id: 'cross', description: 'Comprehensive 10-card spread' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r border-purple-500/20 bg-black/40 backdrop-blur-md">
        <ScrollArea className="h-full px-4 py-6">
          <div className="space-y-6">
            {/* Quick Actions */}
            <div>
              <h3 className="mb-3 px-2 text-sm font-semibold text-purple-300">{t.sidebar.quickActions}</h3>
              <div className="space-y-1">
                <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-purple-200 hover:bg-purple-500/10 hover:text-white transition-colors">
                  <Sparkles className="h-4 w-4" />
                  {t.sidebar.newReading}
                </Link>
                <Link href="#history" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-purple-200 hover:bg-purple-500/10 hover:text-white transition-colors">
                  <History className="h-4 w-4" />
                  {t.sidebar.readingHistory}
                </Link>
              </div>
            </div>

            {/* Tarot Spreads */}
            <div>
              <Collapsible open={spreadsOpen} onOpenChange={setSpreadsOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between px-2 text-purple-300 hover:text-white hover:bg-purple-500/10">
                    <div className="flex items-center gap-2">
                      <Book className="h-4 w-4" />
                      <span className="text-sm font-semibold">{t.sidebar.tarotSpreads}</span>
                    </div>
                    {spreadsOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 mt-2">
                  {spreads.map((spread) => (
                    <Link
                      key={spread.id}
                      href={`#spread-${spread.id}`}
                      className="block rounded-lg px-3 py-2 text-sm text-purple-200 hover:bg-purple-500/10 hover:text-white transition-colors"
                    >
                      <div className="font-medium">{spread.name}</div>
                      <div className="text-xs text-purple-300/70 mt-0.5">{spread.description}</div>
                    </Link>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Resources */}
            <div>
              <h3 className="mb-3 px-2 text-sm font-semibold text-purple-300">{t.sidebar.resources}</h3>
              <div className="space-y-1">
                <Link href="#how-it-works" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-purple-200 hover:bg-purple-500/10 hover:text-white transition-colors">
                  <HelpCircle className="h-4 w-4" />
                  {t.header.howItWorks}
                </Link>
                <Link href="#about" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-purple-200 hover:bg-purple-500/10 hover:text-white transition-colors">
                  <Settings className="h-4 w-4" />
                  {t.header.about}
                </Link>
              </div>
            </div>
          </div>
        </ScrollArea>
      </aside>

      {/* Mobile Sidebar Toggle */}
      <Button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-24 right-4 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
        size="icon"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-80 border-r border-purple-500/20 bg-black/90 backdrop-blur-md transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-purple-500/20 px-6">
          <span className="text-lg font-bold text-white">Menu</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-purple-200 hover:text-white"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-4rem)] px-4 py-6">
          <div className="space-y-6">
            {/* Quick Actions */}
            <div>
              <h3 className="mb-3 px-2 text-sm font-semibold text-purple-300">{t.sidebar.quickActions}</h3>
              <div className="space-y-1">
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-purple-200 hover:bg-purple-500/10 hover:text-white transition-colors"
                >
                  <Sparkles className="h-4 w-4" />
                  {t.sidebar.newReading}
                </Link>
                <Link
                  href="#history"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-purple-200 hover:bg-purple-500/10 hover:text-white transition-colors"
                >
                  <History className="h-4 w-4" />
                  {t.sidebar.readingHistory}
                </Link>
              </div>
            </div>

            {/* Tarot Spreads */}
            <div>
              <Collapsible open={spreadsOpen} onOpenChange={setSpreadsOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between px-2 text-purple-300 hover:text-white hover:bg-purple-500/10">
                    <div className="flex items-center gap-2">
                      <Book className="h-4 w-4" />
                      <span className="text-sm font-semibold">{t.sidebar.tarotSpreads}</span>
                    </div>
                    {spreadsOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 mt-2">
                  {spreads.map((spread) => (
                    <Link
                      key={spread.id}
                      href={`#spread-${spread.id}`}
                      onClick={() => setIsOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm text-purple-200 hover:bg-purple-500/10 hover:text-white transition-colors"
                    >
                      <div className="font-medium">{spread.name}</div>
                      <div className="text-xs text-purple-300/70 mt-0.5">{spread.description}</div>
                    </Link>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Resources */}
            <div>
              <h3 className="mb-3 px-2 text-sm font-semibold text-purple-300">{t.sidebar.resources}</h3>
              <div className="space-y-1">
                <Link
                  href="#how-it-works"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-purple-200 hover:bg-purple-500/10 hover:text-white transition-colors"
                >
                  <HelpCircle className="h-4 w-4" />
                  {t.header.howItWorks}
                </Link>
                <Link
                  href="#about"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-purple-200 hover:bg-purple-500/10 hover:text-white transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  {t.header.about}
                </Link>
              </div>
            </div>
          </div>
        </ScrollArea>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
