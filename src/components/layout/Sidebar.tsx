'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, History, ChevronLeft, Menu, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useSidebar } from './SidebarContext';

export function Sidebar() {
  const { isCollapsed, toggleCollapse, isMobileOpen, setIsMobileOpen } = useSidebar();
  const { t } = useI18n();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden lg:flex fixed left-0 top-16 z-40 h-[calc(100vh-4rem)]
          border-r border-purple-500/20 bg-black/40 backdrop-blur-md
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        {/* Collapse/Expand Button */}
        <Button
          onClick={toggleCollapse}
          variant="ghost"
          size="icon"
          className={`
            absolute -right-3 top-6 z-50 h-6 w-6 rounded-full
            bg-gradient-to-r from-purple-600 to-pink-600
            hover:from-purple-700 hover:to-pink-700
            text-white transition-transform duration-300
            ${isCollapsed ? 'rotate-0' : 'rotate-180'}
          `}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <ScrollArea className="h-full px-2 py-6">
          <div className="space-y-2">
            {/* History Button */}
            <Link href="/history">
              <Button
                variant="ghost"
                className={`
                  w-full transition-all duration-300
                  ${isCollapsed 
                    ? 'justify-center p-3' 
                    : 'justify-start px-4 py-3'
                  }
                  text-purple-200 hover:text-white hover:bg-purple-500/10
                `}
                title={t.home.history || 'Reading History'}
              >
                <History className={`
                  flex-shrink-0 transition-all duration-300
                  ${isCollapsed ? 'h-5 w-5' : 'h-5 w-5 mr-3'}
                `} />
                {!isCollapsed && (
                  <span className="truncate">{t.home.history || 'Reading History'}</span>
                )}
              </Button>
            </Link>
          </div>
        </ScrollArea>
      </aside>

      {/* Mobile Sidebar Toggle Button */}
      <Button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed bottom-24 right-4 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
        size="icon"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Mobile Sidebar */}
      <aside
        className={`
          lg:hidden fixed inset-y-0 left-0 z-50 w-80
          border-r border-purple-500/20 bg-black/90 backdrop-blur-md
          transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-16 items-center justify-between border-b border-purple-500/20 px-6">
          <span className="text-lg font-bold text-white">Menu</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(false)}
            className="text-purple-200 hover:text-white"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-4rem)] px-4 py-6">
          <div className="space-y-2">
            {/* History Button */}
            <Link href="/history">
              <Button
                variant="ghost"
                className="w-full justify-start text-purple-200 hover:text-white hover:bg-purple-500/10 px-4 py-3"
                onClick={() => setIsMobileOpen(false)}
              >
                <History className="mr-3 h-5 w-5 flex-shrink-0" />
                <span className="truncate">{t.home.history || 'Reading History'}</span>
              </Button>
            </Link>
          </div>
        </ScrollArea>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
