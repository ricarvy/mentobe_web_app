'use client';

import { useI18n } from '@/lib/i18n';
import { Shield, Lock, FileText, Mail, CheckCircle } from 'lucide-react';

export default function GDPRPage() {
  const { t } = useI18n();
  const g = t.gdpr;

  const currentDate = new Date();
  const formattedDate = `${currentDate.getFullYear()}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${String(currentDate.getDate()).padStart(2, '0')}`;

  return (
    <div className="min-h-screen">
      <main>
          <div className="container mx-auto px-4 py-12 max-w-4xl">
            {/* Header */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-10 w-10 text-purple-400" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {g.title}
                </h1>
              </div>
              <p className="text-purple-200/60 text-sm">
                {g.lastUpdated}{formattedDate}
              </p>
            </div>

            {/* Introduction */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 mb-8 backdrop-blur-sm">
              <p className="text-purple-100 leading-relaxed">{g.introduction}</p>
            </div>

            {/* Rights */}
            <section className="bg-black/40 border border-purple-500/20 rounded-2xl p-8 backdrop-blur-sm mb-8">
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                <Lock className="h-7 w-7 text-purple-400" />
                {g.rights.title}
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-purple-500/5 p-4 rounded-xl border border-purple-500/10">
                  <h3 className="text-lg font-semibold text-purple-200 mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-400" />
                    {g.rights.access}
                  </h3>
                  <p className="text-purple-100/70 text-sm">{g.rights.accessDesc}</p>
                </div>
                
                <div className="bg-purple-500/5 p-4 rounded-xl border border-purple-500/10">
                  <h3 className="text-lg font-semibold text-purple-200 mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-400" />
                    {g.rights.rectification}
                  </h3>
                  <p className="text-purple-100/70 text-sm">{g.rights.rectificationDesc}</p>
                </div>

                <div className="bg-purple-500/5 p-4 rounded-xl border border-purple-500/10">
                  <h3 className="text-lg font-semibold text-purple-200 mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-400" />
                    {g.rights.erasure}
                  </h3>
                  <p className="text-purple-100/70 text-sm">{g.rights.erasureDesc}</p>
                </div>

                <div className="bg-purple-500/5 p-4 rounded-xl border border-purple-500/10">
                  <h3 className="text-lg font-semibold text-purple-200 mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-400" />
                    {g.rights.restrict}
                  </h3>
                  <p className="text-purple-100/70 text-sm">{g.rights.restrictDesc}</p>
                </div>

                <div className="bg-purple-500/5 p-4 rounded-xl border border-purple-500/10">
                  <h3 className="text-lg font-semibold text-purple-200 mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-400" />
                    {g.rights.object}
                  </h3>
                  <p className="text-purple-100/70 text-sm">{g.rights.objectDesc}</p>
                </div>

                <div className="bg-purple-500/5 p-4 rounded-xl border border-purple-500/10">
                  <h3 className="text-lg font-semibold text-purple-200 mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-400" />
                    {g.rights.portability}
                  </h3>
                  <p className="text-purple-100/70 text-sm">{g.rights.portabilityDesc}</p>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-black/40 border border-purple-500/20 rounded-2xl p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                <Mail className="h-7 w-7 text-purple-400" />
                {g.contact.title}
              </h2>
              <p className="text-purple-100/80 leading-relaxed">
                {g.contact.content}
              </p>
            </section>
          </div>
      </main>
    </div>
  );
}
