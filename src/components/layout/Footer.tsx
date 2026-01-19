'use client';

import Link from 'next/link';
import { Sparkles, Twitter, Instagram, Facebook, Mail } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'Tarot Spreads', href: '#spreads' },
      { name: 'API', href: '#api' },
    ],
    company: [
      { name: 'About Us', href: '#about' },
      { name: 'Blog', href: '#blog' },
      { name: 'Careers', href: '#careers' },
      { name: 'Contact', href: '#contact' },
    ],
    resources: [
      { name: 'Documentation', href: '#docs' },
      { name: 'Help Center', href: '#help' },
      { name: 'Community', href: '#community' },
      { name: 'Terms of Service', href: '#terms' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '#privacy' },
      { name: 'Cookie Policy', href: '#cookies' },
      { name: 'GDPR', href: '#gdpr' },
      { name: 'Disclaimer', href: '#disclaimer' },
    ],
  };

  const socialLinks = [
    { name: 'Twitter', href: 'https://twitter.com', icon: Twitter },
    { name: 'Instagram', href: 'https://instagram.com', icon: Instagram },
    { name: 'Facebook', href: 'https://facebook.com', icon: Facebook },
    { name: 'Email', href: 'mailto:contact@tarotai.com', icon: Mail },
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
                Tarot AI
              </span>
            </Link>
            <p className="mt-4 text-sm text-purple-200/80 max-w-sm">
              Discover the mysteries of the future with AI-powered tarot readings. Get personalized insights and guidance for your life journey.
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
            <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
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
            <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
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
            <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
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
              © {currentYear} Tarot AI. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="#privacy" className="text-sm text-purple-200/60 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="#terms" className="text-sm text-purple-200/60 hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="#cookies" className="text-sm text-purple-200/60 hover:text-white transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
