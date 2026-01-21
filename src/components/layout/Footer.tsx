'use client';

import Link from 'next/link';
import { Sparkles, Twitter, Instagram, Facebook, Mail } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export function Footer() {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: t.footer.features, href: '#features' },
      { name: t.footer.pricing, href: '/pricing' },
      { name: t.header.tarotSpreads, href: '#spreads' },
    ],
    company: [
      { name: t.footer.aboutUs, href: '#about' },
      { name: t.footer.blog, href: '#blog' },
      { name: t.footer.careers, href: '#careers' },
      { name: t.footer.contact, href: '#contact' },
    ],
    resources: [
      { name: t.footer.documentation, href: '#docs' },
      { name: t.footer.helpCenter, href: '#help' },
      { name: t.footer.community, href: '#community' },
    ],
    legal: [
      { name: t.footer.termsOfService, href: '/terms' },
      { name: t.footer.privacyPolicy, href: '/privacy' },
      { name: t.footer.cookiePolicy, href: '#cookies' },
      { name: t.footer.gdpr, href: '#gdpr' },
      { name: t.footer.disclaimer, href: '#disclaimer' },
    ],
  };

  const socialLinks = [
    { name: 'Twitter', href: 'https://twitter.com', icon: Twitter },
    { name: 'Instagram', href: 'https://instagram.com', icon: Instagram },
    { name: 'Facebook', href: 'https://facebook.com', icon: Facebook },
    { name: 'Email', href: 'mailto:contact@mentobai.com', icon: Mail },
  ];

  return (
    <footer className="border-t border-purple-500/20 bg-black/40 backdrop-blur-md">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Sparkles className="h-6 w-6 text-purple-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Mentob AI
              </span>
            </Link>
            <p className="mt-4 text-sm text-purple-200/80 max-w-sm">
              {t.footer.description}
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-4 mt-6">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 hover:text-white transition-all"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">{t.footer.product}</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-purple-200/80 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">{t.footer.company}</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-purple-200/80 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">{t.footer.legal}</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-purple-200/80 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-purple-500/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-purple-200/60">
              © {currentYear} Mentob AI. {t.footer.allRightsReserved}.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-sm text-purple-200/60 hover:text-white transition-colors">
                {t.footer.privacyPolicy}
              </Link>
              <Link href="/terms" className="text-sm text-purple-200/60 hover:text-white transition-colors">
                {t.footer.termsOfService}
              </Link>
              <Link href="#cookies" className="text-sm text-purple-200/60 hover:text-white transition-colors">
                {t.footer.cookiePolicy}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
