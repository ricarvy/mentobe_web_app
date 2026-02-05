'use client';

import { useState, useEffect, Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { Menu, Sparkles, User, LogOut, Zap, ChevronDown } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { languages } from '@/lib/translations';
import { useUser } from '@/lib/userContext';
import { useTarotFlow } from '@/lib/tarotFlowContext';
import { getQuota } from '@/lib/quota';
import { useRouter } from 'next/navigation';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const { language, setLanguage, t } = useI18n();
  const { user, logout } = useUser();
  const { isInFlow, resetFlow } = useTarotFlow();
  const [quota, setQuota] = useState<{ remaining: number; total: number | string; isDemo: boolean } | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Fetch quota when user changes
  useEffect(() => {
    if (user) {
      getQuota(user.id)
        .then(setQuota)
        .catch(err => console.error('Error fetching quota in header:', err));
    }
  }, [user]);

  const navItems = [
    { name: t.header.home, href: '/' },
    { name: t.header.answerBook, href: '/answer-book' },
    { name: t.header.palmReading, href: '/palm-reading' },
    { name: t.header.pricing, href: '/pricing' },
  ];

  const tarotDropdownItems = [
    { name: t.home.selectSpread || 'Start Reading', href: '/ai-tarot' },
    { name: t.tarotCards?.title || 'All Tarot Cards', href: '/tarot-cards' },
  ];

  // 处理Home点击：如果在流程中，重置流程；否则正常跳转
  const handleHomeClick = (e: React.MouseEvent) => {
    if (isInFlow && pathname === '/') {
      e.preventDefault();
      resetFlow();
      // 滚动到页面顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // 如果不在流程中或在其他页面，让Link正常工作
    // 移动端关闭菜单
    setIsOpen(false);
  };

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (href === '/') {
      handleHomeClick(e);
      return;
    }

    if (href === '/palm-reading') {
      const isProOrPremium = user?.vipLevel === 'pro' || user?.vipLevel === 'premium';
      if (!isProOrPremium) {
        e.preventDefault();
        setShowProModal(true);
        setIsOpen(false);
        return;
      }
    }

    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-purple-500/20 bg-black/40 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" onClick={handleHomeClick} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="relative h-8 w-8 rounded-full overflow-hidden">
              <Image 
                src="/logo.jpeg" 
                alt="Mentob AI Logo" 
                fill
                className="object-cover"
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Mentob AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item, index) => (
              <Fragment key={item.href}>
                <Link
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="text-sm font-medium text-purple-200 hover:text-white transition-colors flex items-center gap-1"
                >
                  {item.name}
                  {item.href === '/palm-reading' && (
                    <Badge className="ml-0.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-bold px-1.5 py-0.5 h-4 min-w-0 leading-none">
                      PRO
                    </Badge>
                  )}
                </Link>

                {/* AI Tarot Dropdown - Inserted after Home (index 0) */}
                {index === 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="text-purple-200 hover:text-white hover:bg-purple-500/10 gap-1 px-3 py-2 h-auto text-sm font-medium">
                        {t.header.aiTarot}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="bg-black/90 border-purple-500/20">
                      {tarotDropdownItems.map((dropdownItem) => (
                        <DropdownMenuItem key={dropdownItem.name} asChild>
                          <Link
                            href={dropdownItem.href}
                            className="text-purple-200 hover:text-white hover:bg-purple-500/10 cursor-pointer"
                          >
                            {dropdownItem.name}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </Fragment>
            ))}
          </nav>

          {/* CTA Button and Language Selector */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-purple-200 hover:text-white hover:bg-purple-500/10 gap-2">
                  <span className="text-lg">{languages.find(l => l.code === language)?.flag || '🌐'}</span>
                  <span className="text-sm font-medium hidden sm:inline">{languages.find(l => l.code === language)?.name || 'Language'}</span>
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
                    {language === lang.code && <span className="ml-auto text-purple-400">✓</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`text-purple-200 hover:text-white hover:bg-purple-500/10 gap-2 relative p-1.5 ${
                      user.vipLevel === 'pro'
                        ? 'vip-pro-border'
                        : user.vipLevel === 'premium'
                        ? 'vip-premium-border'
                        : ''
                    }`}
                  >
                    <User className="h-4 w-4" />
                    <span>{user.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-black/90 border-purple-500/20">
                  {/* Quota Display */}
                  {quota && (
                    <div className="px-2 py-2 border-b border-purple-500/20">
                      <div className="flex items-center gap-2 px-2 py-1">
                        <Zap className="h-3 w-3 text-purple-400" />
                        <span className="text-xs text-purple-300">{t.common.dailyQuota}:</span>
                      </div>
                      <div className="px-2 py-1">
                        {quota.isDemo ? (
                          <Badge variant="secondary" className="bg-purple-600/20 text-purple-300 border-purple-500/30">
                            ∞ Unlimited
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className={quota.remaining > 0 ? "bg-green-600/20 text-green-300 border-green-500/30" : "bg-red-600/20 text-red-300 border-red-500/30"}>
                            {quota.remaining} / {quota.total}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer text-purple-200 hover:text-white hover:bg-purple-500/10">
                      <User className="h-4 w-4" />
                      <span>{t.common.profile}</span>
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
                <Button
                  variant="ghost"
                  className="text-purple-200 hover:text-white hover:bg-purple-500/10"
                  asChild
                >
                  <Link href="/login">{t.common.signIn}</Link>
                </Button>
                <Button
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  asChild
                >
                  <Link href="/login">{t.common.getStarted}</Link>
                </Button>
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
            <SheetContent side="right" className="bg-black/90 border-purple-500/20">
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto px-4">
                  <nav className="flex flex-col gap-4 mt-8">
                    {navItems.map((item, index) => (
                      <Fragment key={item.href}>
                        <Link
                          href={item.href}
                          onClick={(e) => handleNavClick(e, item.href)}
                          className="text-lg font-medium text-purple-200 hover:text-white transition-colors py-2 flex items-center gap-2"
                        >
                          {item.name}
                          {item.href === '/palm-reading' && (
                            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-2 py-0.5">
                              PRO
                            </Badge>
                          )}
                        </Link>
                        {index === 0 && (
                          <div className="pt-1">
                            <p className="text-sm font-semibold text-purple-300 mb-2">{t.header.aiTarot}</p>
                            <div className="flex flex-col gap-1 pl-3">
                              {tarotDropdownItems.map((dropdownItem) => (
                                <Link
                                  key={dropdownItem.name}
                                  href={dropdownItem.href}
                                  onClick={() => setIsOpen(false)}
                                  className="text-base font-medium text-purple-200/80 hover:text-white transition-colors py-2"
                                >
                                  {dropdownItem.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </Fragment>
                    ))}
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
                            {language === lang.code && <span className="ml-auto text-purple-400">✓</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                    {user && quota && (
                      <div className="px-2 py-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="h-3 w-3 text-purple-400" />
                          <span className="text-xs text-purple-300">{t.common.dailyQuota}:</span>
                        </div>
                        <div>
                          {quota.isDemo ? (
                            <Badge variant="secondary" className="bg-purple-600/20 text-purple-300 border-purple-500/30">
                              ∞ Unlimited
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className={quota.remaining > 0 ? "bg-green-600/20 text-green-300 border-green-500/30" : "bg-red-600/20 text-red-300 border-red-500/30"}>
                              {quota.remaining} / {quota.total}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </nav>
                </div>
                <div className="sticky bottom-0 px-4 py-4 bg-black/90 border-t border-purple-500/20">
                  {user ? (
                    <div className="flex flex-col gap-3">
                      <Button
                        variant="ghost"
                        className="text-purple-200 hover:text-white hover:bg-purple-500/10 w-full justify-start"
                        asChild
                      >
                        <Link href="/profile" onClick={() => setIsOpen(false)}>
                          <User className="h-4 w-4 mr-2" />
                          <span>{user.username}</span>
                        </Link>
                      </Button>
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
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Button
                        variant="ghost"
                        className="text-purple-200 hover:text-white hover:bg-purple-500/10 w-full"
                        asChild
                      >
                        <Link href="/login" onClick={() => setIsOpen(false)}>
                          {t.common.signIn}
                        </Link>
                      </Button>
                      <Button
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full"
                        asChild
                      >
                        <Link href="/login" onClick={() => setIsOpen(false)}>
                          {t.common.getStarted}
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Custom Styles for VIP Borders */}
      <style jsx global>{`
        .vip-pro-border {
          position: relative;
          background: linear-gradient(135deg, #a855f7, #ec4899, #a855f7);
          background-size: 200% 200%;
          animation: pro-border-rotate 3s linear infinite;
          border-radius: 8px;
        }
        .vip-pro-border::before {
          content: '';
          position: absolute;
          inset: 2px;
          background: rgba(0, 0, 0, 0.9);
          border-radius: 6px;
          z-index: -1;
        }
        @keyframes pro-border-rotate {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .vip-premium-border {
          position: relative;
          background: linear-gradient(135deg, #a855f7, #fbbf24, #ec4899, #fbbf24, #a855f7);
          background-size: 300% 300%;
          animation: premium-border-rotate 2s linear infinite;
          border-radius: 8px;
          box-shadow: 0 0 20px rgba(251, 191, 36, 0.4), 0 0 40px rgba(168, 85, 247, 0.3);
        }
        .vip-premium-border::before {
          content: '';
          position: absolute;
          inset: 2px;
          background: rgba(0, 0, 0, 0.9);
          border-radius: 6px;
          z-index: -1;
        }
        @keyframes premium-border-rotate {
          0% { background-position: 0% 50%; }
          25% { background-position: 100% 0%; }
          50% { background-position: 100% 100%; }
          75% { background-position: 0% 100%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <ProUpgradeModal
        isOpen={showProModal}
        onClose={() => setShowProModal(false)}
        onSubscribe={() => {
          setShowProModal(false);
          router.push('/pricing');
        }}
      />
    </header>
  );
}
