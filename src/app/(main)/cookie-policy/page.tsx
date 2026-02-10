'use client';

import { useI18n } from '@/lib/i18n';
import { Cookie, Info, Settings, Shield, List } from 'lucide-react';

export default function CookiePolicyPage() {
  const { t } = useI18n();
  const c = t.cookiePolicy;

  const currentDate = new Date();
  const formattedDate = `${currentDate.getFullYear()}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${String(currentDate.getDate()).padStart(2, '0')}`;

  return (
    <div className="min-h-screen">
      <main>
          <div className="container mx-auto px-4 py-12 max-w-4xl">
            {/* Header */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <Cookie className="h-10 w-10 text-purple-400" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {c.title}
                </h1>
              </div>
              <p className="text-purple-200/60 text-sm">
                {c.lastUpdated}{formattedDate}
              </p>
            </div>

            {/* Introduction */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 mb-8 backdrop-blur-sm">
              <p className="text-purple-100 leading-relaxed">{c.introduction}</p>
            </div>

            {/* Sections */}
            <div className="space-y-8">
              {/* What are cookies */}
              <section className="bg-black/40 border border-purple-500/20 rounded-2xl p-8 backdrop-blur-sm">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                  <Info className="h-7 w-7 text-purple-400" />
                  {c.whatAreCookies.title}
                </h2>
                <p className="text-purple-100/80 leading-relaxed">
                  {c.whatAreCookies.content}
                </p>
              </section>

              {/* How we use cookies */}
              <section className="bg-black/40 border border-purple-500/20 rounded-2xl p-8 backdrop-blur-sm">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                  <Settings className="h-7 w-7 text-purple-400" />
                  {c.howWeUse.title}
                </h2>
                <p className="text-purple-100/80 leading-relaxed">
                  {c.howWeUse.content}
                </p>
              </section>

              {/* Types of cookies */}
              <section className="bg-black/40 border border-purple-500/20 rounded-2xl p-8 backdrop-blur-sm">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                  <List className="h-7 w-7 text-purple-400" />
                  {c.types.title}
                </h2>
                <div className="space-y-6">
                  <div className="pl-4 border-l-2 border-purple-500/30">
                    <h3 className="text-lg font-semibold text-purple-200 mb-2">{c.types.essential}</h3>
                    <p className="text-purple-100/80">{c.types.essentialDesc}</p>
                  </div>
                  <div className="pl-4 border-l-2 border-pink-500/30">
                    <h3 className="text-lg font-semibold text-purple-200 mb-2">{c.types.analytics}</h3>
                    <p className="text-purple-100/80">{c.types.analyticsDesc}</p>
                  </div>
                </div>
              </section>

              {/* Control */}
              <section className="bg-black/40 border border-purple-500/20 rounded-2xl p-8 backdrop-blur-sm">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                  <Shield className="h-7 w-7 text-purple-400" />
                  {c.control.title}
                </h2>
                <p className="text-purple-100/80 leading-relaxed">
                  {c.control.content}
                </p>
              </section>
            </div>
          </div>
      </main>
    </div>
  );
}
