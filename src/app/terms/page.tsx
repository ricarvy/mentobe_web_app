'use client';

import { useI18n } from '@/lib/i18n';
import Link from 'next/link';

export default function TermsOfServicePage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-black">
      {/* 星空背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-black to-pink-950" />
        <div className="absolute inset-0">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-twinkle"
              style={{
                width: Math.random() * 3 + 1,
                height: Math.random() * 3 + 1,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${Math.random() * 3 + 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* 内容 */}
      <div className="relative z-10 container mx-auto px-4 py-20 max-w-4xl">
        {/* 标题 */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {t.termsOfService.title}
          </h1>
          <p className="text-purple-300/60 text-sm">
            {t.termsOfService.lastUpdated}
          </p>
        </div>

        {/* 主要内容 */}
        <div className="space-y-8">
          {/* 介绍 */}
          <div className="bg-purple-900/10 border border-purple-500/20 rounded-lg p-6 backdrop-blur-sm">
            <p className="text-purple-200/80 leading-relaxed">
              {t.termsOfService.introduction}
            </p>
          </div>

          {/* 接受条款 */}
          <div className="bg-purple-900/10 border border-purple-500/20 rounded-lg p-6 backdrop-blur-sm">
            <p className="text-purple-200/80 leading-relaxed font-semibold">
              {t.termsOfService.acceptance}
            </p>
          </div>

          {/* 服务条款章节 */}
          <div className="space-y-6">
            {/* 1. 服务 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                {t.termsOfService.sections.services}
              </h2>
              <div className="bg-purple-900/10 border border-purple-500/20 rounded-lg p-6 backdrop-blur-sm">
                <p className="text-purple-200/80 leading-relaxed whitespace-pre-line">
                  {t.termsOfService.sections.servicesDesc}
                </p>
              </div>
            </section>

            {/* 2. 用户账户 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                {t.termsOfService.sections.userAccount}
              </h2>
              <div className="bg-purple-900/10 border border-purple-500/20 rounded-lg p-6 backdrop-blur-sm">
                <p className="text-purple-200/80 leading-relaxed whitespace-pre-line">
                  {t.termsOfService.sections.userAccountDesc}
                </p>
              </div>
            </section>

            {/* 3. 付费服务 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                {t.termsOfService.sections.paidServices}
              </h2>
              <div className="bg-purple-900/10 border border-purple-500/20 rounded-lg p-6 backdrop-blur-sm">
                <p className="text-purple-200/80 leading-relaxed whitespace-pre-line">
                  {t.termsOfService.sections.paidServicesDesc}
                </p>
              </div>
            </section>

            {/* 4. 退款政策 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                {t.termsOfService.sections.refundPolicy}
              </h2>
              <div className="bg-purple-900/10 border border-purple-500/20 rounded-lg p-6 backdrop-blur-sm">
                <p className="text-purple-200/80 leading-relaxed whitespace-pre-line">
                  {t.termsOfService.sections.refundPolicyDesc}
                </p>
              </div>
            </section>

            {/* 5. 用户行为 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                {t.termsOfService.sections.userConduct}
              </h2>
              <div className="bg-purple-900/10 border border-purple-500/20 rounded-lg p-6 backdrop-blur-sm">
                <p className="text-purple-200/80 leading-relaxed whitespace-pre-line">
                  {t.termsOfService.sections.userConductDesc}
                </p>
              </div>
            </section>

            {/* 6. 知识产权 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                {t.termsOfService.sections.intellectualProperty}
              </h2>
              <div className="bg-purple-900/10 border border-purple-500/20 rounded-lg p-6 backdrop-blur-sm">
                <p className="text-purple-200/80 leading-relaxed whitespace-pre-line">
                  {t.termsOfService.sections.intellectualPropertyDesc}
                </p>
              </div>
            </section>

            {/* 7. 免责声明 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                {t.termsOfService.sections.disclaimers}
              </h2>
              <div className="bg-purple-900/10 border border-purple-500/20 rounded-lg p-6 backdrop-blur-sm">
                <p className="text-purple-200/80 leading-relaxed whitespace-pre-line">
                  {t.termsOfService.sections.disclaimersDesc}
                </p>
              </div>
            </section>

            {/* 8. 责任限制 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                {t.termsOfService.sections.limitation}
              </h2>
              <div className="bg-purple-900/10 border border-purple-500/20 rounded-lg p-6 backdrop-blur-sm">
                <p className="text-purple-200/80 leading-relaxed whitespace-pre-line">
                  {t.termsOfService.sections.limitationDesc}
                </p>
              </div>
            </section>

            {/* 9. 终止 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                {t.termsOfService.sections.termination}
              </h2>
              <div className="bg-purple-900/10 border border-purple-500/20 rounded-lg p-6 backdrop-blur-sm">
                <p className="text-purple-200/80 leading-relaxed whitespace-pre-line">
                  {t.termsOfService.sections.terminationDesc}
                </p>
              </div>
            </section>

            {/* 10. 管辖法律 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                {t.termsOfService.sections.governingLaw}
              </h2>
              <div className="bg-purple-900/10 border border-purple-500/20 rounded-lg p-6 backdrop-blur-sm">
                <p className="text-purple-200/80 leading-relaxed whitespace-pre-line">
                  {t.termsOfService.sections.governingLawDesc}
                </p>
              </div>
            </section>

            {/* 11. 条款变更 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                {t.termsOfService.sections.changes}
              </h2>
              <div className="bg-purple-900/10 border border-purple-500/20 rounded-lg p-6 backdrop-blur-sm">
                <p className="text-purple-200/80 leading-relaxed whitespace-pre-line">
                  {t.termsOfService.sections.changesDesc}
                </p>
              </div>
            </section>

            {/* 12. 联系我们 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                {t.termsOfService.sections.contact}
              </h2>
              <div className="bg-purple-900/10 border border-purple-500/20 rounded-lg p-6 backdrop-blur-sm">
                <p className="text-purple-200/80 leading-relaxed mb-4">
                  {t.termsOfService.sections.contactIntro}
                </p>
                <p className="text-purple-200/80">
                  <span className="font-semibold">{t.termsOfService.sections.email}</span>
                  <Link
                    href={`mailto:${t.termsOfService.sections.emailValue}`}
                    className="text-purple-400 hover:text-purple-300 transition-colors ml-2"
                  >
                    {t.termsOfService.sections.emailValue}
                  </Link>
                </p>
              </div>
            </section>
          </div>

          {/* 返回首页按钮 */}
          <div className="pt-8">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all"
            >
              ← {t.common.getStarted}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
