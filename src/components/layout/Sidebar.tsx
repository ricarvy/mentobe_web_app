'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, History, ChevronRight, Menu } from 'lucide-react';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r border-purple-500/20 bg-black/40 backdrop-blur-md">
        <ScrollArea className="h-full px-4 py-6">
          <div className="space-y-6">
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
