'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Menu, Sparkles, Globe, User, LogOut, Zap } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { languages } from '@/lib/translations';
import { useUser } from '@/lib/userContext';
import { useTarotFlow } from '@/lib/tarotFlowContext';
import { getQuota } from '@/lib/quota';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useI18n();
  const { user, logout } = useUser();
  const { isInFlow, resetFlow } = useTarotFlow();
  const [quota, setQuota] = useState<{ remaining: number; total: number | string; isDemo: boolean } | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Fetch quota when user changes
  useEffect(() => {
    if (user) {
      getQuota(user.id)
        .then(setQuota)
        .catch(err => console.error('Error fetching quota in header:', err));
    } else {
      setQuota(null);
    }
  }, [user]);

  const navItems = [
    { name: t.header.home, href: '/' },
    { name: t.tarotCards?.title || 'All Tarot Cards', href: '/tarot-cards' },
    { name: t.header.pricing, href: '/pricing' },
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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-purple-500/20 bg-black/40 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" onClick={handleHomeClick} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
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
                onClick={item.href === '/' ? handleHomeClick : undefined}
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
                        <span className="text-xs text-purple-300">Daily Quota:</span>
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
            <SheetContent side="right" className="w-[300px] bg-black/90 border-purple-500/20">
              <nav className="flex flex-col gap-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={(e) => {
                      if (item.href === '/') {
                        handleHomeClick(e);
                      } else {
                        setIsOpen(false);
                      }
                    }}
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
                      {/* Quota Display */}
                      {quota && (
                        <div className="px-2 py-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                          <div className="flex items-center gap-2 mb-1">
                            <Zap className="h-3 w-3 text-purple-400" />
                            <span className="text-xs text-purple-300">Daily Quota:</span>
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
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              </nav>
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
    </header>
  );
}
