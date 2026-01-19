'use client';

import { useI18n } from '@/lib/i18n';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { Shield, Lock, Eye, Cookie, CheckCircle, Mail } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const { t } = useI18n();
  const p = t.privacyPolicy;

  const currentDate = new Date();
  const formattedDate = `${currentDate.getFullYear()}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${String(currentDate.getDate()).padStart(2, '0')}`;

  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 lg:ml-64">
          <div className="container mx-auto px-4 py-12 max-w-4xl">
            {/* Header */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-10 w-10 text-purple-400" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {p.title}
                </h1>
              </div>
              <p className="text-purple-200/60 text-sm">
                {p.lastUpdated}{formattedDate}
              </p>
            </div>

            {/* Introduction */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 mb-8 backdrop-blur-sm">
              <p className="text-purple-100 leading-relaxed">{p.introduction}</p>
            </div>

            {/* Table of Contents */}
            <div className="bg-black/40 border border-purple-500/20 rounded-2xl p-6 mb-8 backdrop-blur-sm">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <Eye className="h-6 w-6 text-purple-400" />
                {p.tableOfContents}
              </h2>
              <ul className="space-y-3">
                <li>
                  <a href="#information" className="text-purple-300 hover:text-purple-100 transition-colors flex items-center gap-2">
                    <span className="text-purple-400">1.</span> {p.sections.information}
                  </a>
                </li>
                <li>
                  <a href="#usage" className="text-purple-300 hover:text-purple-100 transition-colors flex items-center gap-2">
                    <span className="text-purple-400">2.</span> {p.sections.usage}
                  </a>
                </li>
                <li>
                  <a href="#sharing" className="text-purple-300 hover:text-purple-100 transition-colors flex items-center gap-2">
                    <span className="text-purple-400">3.</span> {p.sections.sharing}
                  </a>
                </li>
                <li>
                  <a href="#security" className="text-purple-300 hover:text-purple-100 transition-colors flex items-center gap-2">
                    <span className="text-purple-400">4.</span> {p.sections.security}
                  </a>
                </li>
                <li>
                  <a href="#cookies" className="text-purple-300 hover:text-purple-100 transition-colors flex items-center gap-2">
                    <span className="text-purple-400">5.</span> {p.sections.cookies}
                  </a>
                </li>
                <li>
                  <a href="#rights" className="text-purple-300 hover:text-purple-100 transition-colors flex items-center gap-2">
                    <span className="text-purple-400">6.</span> {p.sections.rights}
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-purple-300 hover:text-purple-100 transition-colors flex items-center gap-2">
                    <span className="text-purple-400">7.</span> {p.sections.contact}
                  </a>
                </li>
              </ul>
            </div>

            {/* Section 1: Information We Collect */}
            <section id="information" className="mb-12">
              <div className="bg-black/40 border border-purple-500/20 rounded-2xl p-8 backdrop-blur-sm">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                  <Shield className="h-7 w-7 text-purple-400" />
                  {p.information.title}
                </h2>
                
                <div className="space-y-6">
                  <div className="pl-4 border-l-2 border-purple-500/30">
                    <h3 className="text-lg font-semibold text-purple-200 mb-2">{p.information.personal}</h3>
                    <p className="text-purple-100/80">{p.information.personalDesc}</p>
                  </div>
                  
                  <div className="pl-4 border-l-2 border-pink-500/30">
                    <h3 className="text-lg font-semibold text-purple-200 mb-2">{p.information.tarot}</h3>
                    <p className="text-purple-100/80">{p.information.tarotDesc}</p>
                  </div>
                  
                  <div className="pl-4 border-l-2 border-purple-500/30">
                    <h3 className="text-lg font-semibold text-purple-200 mb-2">{p.information.usage}</h3>
                    <p className="text-purple-100/80">{p.information.usageDesc}</p>
                  </div>
                  
                  <div className="pl-4 border-l-2 border-pink-500/30">
                    <h3 className="text-lg font-semibold text-purple-200 mb-2">{p.information.device}</h3>
                    <p className="text-purple-100/80">{p.information.deviceDesc}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: How We Use Your Information */}
            <section id="usage" className="mb-12">
              <div className="bg-black/40 border border-purple-500/20 rounded-2xl p-8 backdrop-blur-sm">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                  <Eye className="h-7 w-7 text-purple-400" />
                  {p.usage.title}
                </h2>
                
                <p className="text-purple-100/80 mb-6">{p.usage.intro}</p>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mt-1">
                      <CheckCircle className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-purple-200 mb-2">{p.usage.service}</h3>
                      <p className="text-purple-100/80">{p.usage.serviceDesc}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center mt-1">
                      <CheckCircle className="h-5 w-5 text-pink-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-purple-200 mb-2">{p.usage.account}</h3>
                      <p className="text-purple-100/80">{p.usage.accountDesc}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mt-1">
                      <CheckCircle className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-purple-200 mb-2">{p.usage.personalization}</h3>
                      <p className="text-purple-100/80">{p.usage.personalizationDesc}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center mt-1">
                      <CheckCircle className="h-5 w-5 text-pink-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-purple-200 mb-2">{p.usage.analytics}</h3>
                      <p className="text-purple-100/80">{p.usage.analyticsDesc}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mt-1">
                      <CheckCircle className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-purple-200 mb-2">{p.usage.security}</h3>
                      <p className="text-purple-100/80">{p.usage.securityDesc}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center mt-1">
                      <CheckCircle className="h-5 w-5 text-pink-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-purple-200 mb-2">{p.usage.legal}</h3>
                      <p className="text-purple-100/80">{p.usage.legalDesc}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Information Sharing and Disclosure */}
            <section id="sharing" className="mb-12">
              <div className="bg-black/40 border border-purple-500/20 rounded-2xl p-8 backdrop-blur-sm">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                  <Eye className="h-7 w-7 text-purple-400" />
                  {p.sharing.title}
                </h2>
                
                <p className="text-purple-100/80 mb-6">{p.sharing.intro}</p>
                
                <div className="space-y-6">
                  <div className="pl-4 border-l-2 border-purple-500/30">
                    <h3 className="text-lg font-semibold text-purple-200 mb-2">{p.sharing.service}</h3>
                    <p className="text-purple-100/80">{p.sharing.serviceDesc}</p>
                  </div>
                  
                  <div className="pl-4 border-l-2 border-pink-500/30">
                    <h3 className="text-lg font-semibold text-purple-200 mb-2">{p.sharing.legal}</h3>
                    <p className="text-purple-100/80">{p.sharing.legalDesc}</p>
                  </div>
                  
                  <div className="pl-4 border-l-2 border-purple-500/30">
                    <h3 className="text-lg font-semibold text-purple-200 mb-2">{p.sharing.transfer}</h3>
                    <p className="text-purple-100/80">{p.sharing.transferDesc}</p>
                  </div>
                  
                  <div className="pl-4 border-l-2 border-pink-500/30">
                    <h3 className="text-lg font-semibold text-purple-200 mb-2">{p.sharing.safety}</h3>
                    <p className="text-purple-100/80">{p.sharing.safetyDesc}</p>
                  </div>
                  
                  <div className="pl-4 border-l-2 border-purple-500/30">
                    <h3 className="text-lg font-semibold text-purple-200 mb-2">{p.sharing.consent}</h3>
                    <p className="text-purple-100/80">{p.sharing.consentDesc}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Data Security */}
            <section id="security" className="mb-12">
              <div className="bg-black/40 border border-purple-500/20 rounded-2xl p-8 backdrop-blur-sm">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                  <Lock className="h-7 w-7 text-purple-400" />
                  {p.security.title}
                </h2>
                
                <p className="text-purple-100/80 mb-6">{p.security.intro}</p>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mt-1">
                      <Lock className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-purple-200 mb-2">{p.security.encryption}</h3>
                      <p className="text-purple-100/80">{p.security.encryptionDesc}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center mt-1">
                      <Lock className="h-5 w-5 text-pink-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-purple-200 mb-2">{p.security.access}</h3>
                      <p className="text-purple-100/80">{p.security.accessDesc}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mt-1">
                      <Lock className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-purple-200 mb-2">{p.security.monitoring}</h3>
                      <p className="text-purple-100/80">{p.security.monitoringDesc}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                  <p className="text-yellow-200/90 text-sm">{p.security.disclaimer}</p>
                </div>
              </div>
            </section>

            {/* Section 5: Cookies and Tracking Technologies */}
            <section id="cookies" className="mb-12">
              <div className="bg-black/40 border border-purple-500/20 rounded-2xl p-8 backdrop-blur-sm">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                  <Cookie className="h-7 w-7 text-purple-400" />
                  {p.cookies.title}
                </h2>
                
                <p className="text-purple-100/80 mb-6">{p.cookies.intro}</p>
                
                <div className="space-y-6">
                  <div className="pl-4 border-l-2 border-purple-500/30">
                    <h3 className="text-lg font-semibold text-purple-200 mb-2">{p.cookies.essential}</h3>
                    <p className="text-purple-100/80">{p.cookies.essentialDesc}</p>
                  </div>
                  
                  <div className="pl-4 border-l-2 border-pink-500/30">
                    <h3 className="text-lg font-semibold text-purple-200 mb-2">{p.cookies.analytics}</h3>
                    <p className="text-purple-100/80">{p.cookies.analyticsDesc}</p>
                  </div>
                  
                  <div className="pl-4 border-l-2 border-purple-500/30">
                    <h3 className="text-lg font-semibold text-purple-200 mb-2">{p.cookies.preference}</h3>
                    <p className="text-purple-100/80">{p.cookies.preferenceDesc}</p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                  <p className="text-purple-200/90 text-sm">{p.cookies.management}</p>
                </div>
              </div>
            </section>

            {/* Section 6: Your Privacy Rights */}
            <section id="rights" className="mb-12">
              <div className="bg-black/40 border border-purple-500/20 rounded-2xl p-8 backdrop-blur-sm">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                  <CheckCircle className="h-7 w-7 text-purple-400" />
                  {p.rights.title}
                </h2>
                
                <p className="text-purple-100/80 mb-6">{p.rights.intro}</p>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-purple-200 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-purple-400" />
                      {p.rights.access}
                    </h3>
                    <p className="text-purple-100/80 text-sm">{p.rights.accessDesc}</p>
                  </div>
                  
                  <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-purple-200 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-pink-400" />
                      {p.rights.correction}
                    </h3>
                    <p className="text-purple-100/80 text-sm">{p.rights.correctionDesc}</p>
                  </div>
                  
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-purple-200 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-purple-400" />
                      {p.rights.deletion}
                    </h3>
                    <p className="text-purple-100/80 text-sm">{p.rights.deletionDesc}</p>
                  </div>
                  
                  <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-purple-200 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-pink-400" />
                      {p.rights.portability}
                    </h3>
                    <p className="text-purple-100/80 text-sm">{p.rights.portabilityDesc}</p>
                  </div>
                  
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-purple-200 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-purple-400" />
                      {p.rights.objection}
                    </h3>
                    <p className="text-purple-100/80 text-sm">{p.rights.objectionDesc}</p>
                  </div>
                  
                  <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-purple-200 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-pink-400" />
                      {p.rights.restriction}
                    </h3>
                    <p className="text-purple-100/80 text-sm">{p.rights.restrictionDesc}</p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                  <p className="text-purple-200/90 text-sm">{p.rights.contactMethod}</p>
                </div>
              </div>
            </section>

            {/* Section 7: Contact Us */}
            <section id="contact" className="mb-12">
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-8 backdrop-blur-sm">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                  <Mail className="h-7 w-7 text-purple-400" />
                  {p.contact.title}
                </h2>
                
                <p className="text-purple-100/80 mb-6">{p.contact.intro}</p>
                
                <div className="bg-black/40 border border-purple-500/20 rounded-xl p-6">
                  <p className="text-purple-200 mb-2">
                    {p.contact.email}
                    <a href={`mailto:${p.contact.emailValue}`} className="text-purple-400 hover:text-purple-300 transition-colors font-semibold ml-2">
                      {p.contact.emailValue}
                    </a>
                  </p>
                  <p className="text-purple-100/60 text-sm mt-4">{p.contact.response}</p>
                </div>
              </div>
            </section>

            {/* Back to Top */}
            <div className="text-center mt-12">
              <a
                href="#top"
                className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
              >
                <span>↑</span>
                <span>Back to Top</span>
              </a>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
