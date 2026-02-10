'use client';

import { useI18n } from '@/lib/i18n';
import { AlertTriangle, Sparkles, Brain, Scale, FileWarning } from 'lucide-react';

export default function DisclaimerPage() {
  const { t } = useI18n();
  const d = t.disclaimer;

  const currentDate = new Date();
  const formattedDate = `${currentDate.getFullYear()}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${String(currentDate.getDate()).padStart(2, '0')}`;

  return (
    <div className="min-h-screen">
      <main>
          <div className="container mx-auto px-4 py-12 max-w-4xl">
            {/* Header */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-10 w-10 text-purple-400" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {d.title}
                </h1>
              </div>
              <p className="text-purple-200/60 text-sm">
                {d.lastUpdated}{formattedDate}
              </p>
            </div>

            {/* Introduction */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 mb-8 backdrop-blur-sm">
              <p className="text-purple-100 leading-relaxed">{d.introduction}</p>
            </div>

            {/* Sections */}
            <div className="space-y-8">
              {/* Entertainment */}
              <section className="bg-black/40 border border-purple-500/20 rounded-2xl p-8 backdrop-blur-sm">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                  <Sparkles className="h-7 w-7 text-purple-400" />
                  {d.entertainment.title}
                </h2>
                <p className="text-purple-100/80 leading-relaxed">
                  {d.entertainment.content}
                </p>
              </section>

              {/* Not Professional Advice */}
              <section className="bg-black/40 border border-purple-500/20 rounded-2xl p-8 backdrop-blur-sm">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                  <Brain className="h-7 w-7 text-purple-400" />
                  {d.professional.title}
                </h2>
                <p className="text-purple-100/80 mb-4">
                  {d.professional.content}
                </p>
                <ul className="list-disc list-inside space-y-2 text-purple-200/80 ml-4">
                  <li>{d.professional.medical}</li>
                  <li>{d.professional.legal}</li>
                  <li>{d.professional.financial}</li>
                  <li>{d.professional.psychological}</li>
                </ul>
              </section>

              {/* AI Limitations */}
              <section className="bg-black/40 border border-purple-500/20 rounded-2xl p-8 backdrop-blur-sm">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                  <Scale className="h-7 w-7 text-purple-400" />
                  {d.ai.title}
                </h2>
                <p className="text-purple-100/80 leading-relaxed">
                  {d.ai.content}
                </p>
              </section>

              {/* Liability */}
              <section className="bg-black/40 border border-purple-500/20 rounded-2xl p-8 backdrop-blur-sm">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                  <FileWarning className="h-7 w-7 text-purple-400" />
                  {d.liability.title}
                </h2>
                <p className="text-purple-100/80 leading-relaxed">
                  {d.liability.content}
                </p>
              </section>
            </div>
          </div>
      </main>
    </div>
  );
}
