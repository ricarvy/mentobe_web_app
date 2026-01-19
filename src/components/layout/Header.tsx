'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, Sparkles, Globe, User, LogOut } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { languages } from '@/lib/translations';
import { useUser } from '@/lib/userContext';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useI18n();
  const { user, logout } = useUser();

  const navItems = [
    { name: t.header.home, href: '/' },
    { name: t.tarotCards?.title || 'All Tarot Cards', href: '/tarot-cards' },
    { name: t.header.pricing, href: '/pricing' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-purple-500/20 bg-black/40 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Sparkles className="h-6 w-6 text-purple-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Mentob AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-purple-200 hover:text-white transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* CTA Button and Language Selector */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-purple-200 hover:text-white hover:bg-purple-500/10">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-black/90 border-purple-500/20">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`flex items-center gap-2 text-purple-200 hover:text-white hover:bg-purple-500/10 cursor-pointer ${
                      language === lang.code ? 'bg-purple-500/20' : ''
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-purple-200 hover:text-white hover:bg-purple-500/10 gap-2"
                  >
                    <User className="h-4 w-4" />
                    <span>{user.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-black/90 border-purple-500/20">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer text-purple-200 hover:text-white hover:bg-purple-500/10">
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center gap-2 text-purple-200 hover:text-white hover:bg-purple-500/10 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t.common.logout}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-purple-200 hover:text-white hover:bg-purple-500/10"
                  >
                    {t.common.signIn}
                  </Button>
                </Link>
                <Link href="/login">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    {t.common.getStarted}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-purple-200 hover:text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-black/90 border-purple-500/20">
              <nav className="flex flex-col gap-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium text-purple-200 hover:text-white transition-colors py-2"
                  >
                    {item.name}
                  </Link>
                ))}
                
                {/* Mobile Language Selector */}
                <div className="py-4 border-t border-purple-500/20 mt-4">
                  <p className="text-sm font-semibold text-purple-300 mb-3">{t.common.language}</p>
                  <div className="flex flex-col gap-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsOpen(false);
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                          language === lang.code
                            ? 'bg-purple-500/20 text-white'
                            : 'text-purple-200 hover:bg-purple-500/10 hover:text-white'
                        }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-6">
                  {user ? (
                    <>
                      <Link href="/profile" onClick={() => setIsOpen(false)}>
                        <Button
                          variant="ghost"
                          className="text-purple-200 hover:text-white hover:bg-purple-500/10 w-full justify-start gap-2"
                        >
                          <User className="h-4 w-4" />
                          <span>{user.username}</span>
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          logout();
                          setIsOpen(false);
                        }}
                        className="text-purple-200 hover:text-white hover:bg-purple-500/10 w-full justify-start gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>{t.common.logout}</span>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setIsOpen(false)}>
                        <Button
                          variant="ghost"
                          className="text-purple-200 hover:text-white hover:bg-purple-500/10 w-full"
                        >
                          {t.common.signIn}
                        </Button>
                      </Link>
                      <Link href="/login" onClick={() => setIsOpen(false)}>
                        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full">
                          {t.common.getStarted}
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
