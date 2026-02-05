'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser, convertVipLevelFromApi } from '@/lib/userContext';
import { useI18n } from '@/lib/i18n';
import { ApiRequestError } from '@/lib/api-client';
import { getQuota } from '@/lib/quota';
import { User, Mail, Calendar, History, Settings, Shield, LogOut, Sparkles, Check, X, Infinity } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useUser();
  const { t } = useI18n();
  const [quotaInfo, setQuotaInfo] = useState<{ remaining: number; total: number | string; isDemo: boolean } | null>(null);

  const fetchQuota = useCallback(async () => {
    if (!user) return;

    try {
      const data = await getQuota(user.id);

      setQuotaInfo({
        remaining: data.remaining,
        total: data.total,
        isDemo: data.isDemo || false,
      });
    } catch (error) {
      console.error('Error fetching quota:', error);
      if (error instanceof ApiRequestError) {
        console.error('[Quota Error]', error.message, error.code, error.details);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchQuota();
    }
  }, [user, fetchQuota]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md bg-black/40 backdrop-blur-sm border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">{t.common.notLoggedIn || 'Not Logged In'}</CardTitle>
            <CardDescription className="text-purple-200">
              {t.common.loginToViewProfile || 'Please log in to view your profile'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => (window.location.href = '/login')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {t.common.goToLogin || 'Go to Login'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 flex items-center gap-2">
        <User className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
        {t.common.profile || 'Profile'}
      </h1>

      <div className="space-y-4 sm:space-y-6">
        {/* User Info Card */}
        <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-white text-lg sm:text-xl">{t.common.accountInformation || 'Account Information'}</CardTitle>
            <CardDescription className="text-purple-200 text-sm sm:text-base">
              {t.common.accountDetails || 'Your account details and settings'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex items-center gap-3 text-purple-200">
                <User className="h-5 w-5 text-purple-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-purple-300">{t.common.username || 'Username'}</p>
                  <p className="font-semibold text-white truncate text-sm sm:text-base">{user.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-purple-200">
                <Mail className="h-5 w-5 text-purple-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-purple-300">{t.common.email || 'Email'}</p>
                  <p className="font-semibold text-white truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-purple-200">
                <Shield className="h-5 w-5 text-purple-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-purple-300">{t.common.accountType}</p>
                  <p className="font-semibold text-white">
                    {user.isDemo ? (
                      <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                        {t.common.demoAccount}
                      </Badge>
                    ) : (
                      <Badge variant="default" className="bg-purple-600">
                        {t.common.standardAccount}
                      </Badge>
                    )}
                  </p>
                </div>
              </div>

              {/* VIP Level */}
              <div className="flex items-center gap-3 text-purple-200">
                <Sparkles className="h-5 w-5 text-purple-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-purple-300">{t.common.subscriptionPlan}</p>
                  <p className="font-semibold text-white flex items-center gap-2">
                    {(() => {
                      const normalizedVipLevel = convertVipLevelFromApi(
                        typeof user.vipLevel === 'number' ? user.vipLevel : user.vipLevel === 'pro' ? 1 : user.vipLevel === 'premium' ? 2 : 0
                      );
                      if (normalizedVipLevel === 'pro') {
                        return (
                          <Badge variant="default" className="bg-gradient-to-r from-purple-600 to-pink-600">
                            {t.common.proMember}
                          </Badge>
                        );
                      }
                      if (normalizedVipLevel === 'premium') {
                        return (
                          <Badge variant="default" className="bg-gradient-to-r from-yellow-600 to-orange-600">
                            {t.common.premiumMember}
                          </Badge>
                        );
                      }
                      return (
                        <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                          {t.common.freeMember || 'Free'}
                        </Badge>
                      );
                    })()}
                  </p>
                </div>
              </div>
            </div>

            {/* VIP Expire Date - Full Width */}
            {user.vipExpireAt && (
              <div className="flex items-center gap-3 text-purple-200 mt-4 pt-4 border-t border-purple-500/20">
                <Calendar className="h-5 w-5 text-purple-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-purple-300">{t.common.subscriptionExpires}</p>
                  <p className="font-semibold text-white">
                    {new Date(user.vipExpireAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quota Information */}
        <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-6 w-6 text-purple-400" />
              {t.common.dailyQuota}
            </CardTitle>
            <CardDescription className="text-purple-200">
              {t.common.quotaDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {quotaInfo ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-300 mb-1">
                      {t.home.dailyQuota || 'Daily Quota Remaining'}
                    </p>
                    <p className="text-3xl font-bold text-white">
                      {quotaInfo.isDemo ? '∞' : quotaInfo.remaining}
                      <span className="text-lg text-purple-300 ml-1">
                        / {quotaInfo.isDemo ? '∞' : quotaInfo.total} {t.home.times || 'times'}
                      </span>
                    </p>
                  </div>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    quotaInfo.isDemo ? 'bg-purple-600' : 
                    quotaInfo.remaining > 0 ? 'bg-green-600' : 'bg-red-600'
                  }`}>
                    {quotaInfo.isDemo ? (
                      <Infinity className="h-8 w-8 text-white" />
                    ) : quotaInfo.remaining > 0 ? (
                      <Check className="h-8 w-8 text-white" />
                    ) : (
                      <X className="h-8 w-8 text-white" />
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {!quotaInfo.isDemo && typeof quotaInfo.total === 'number' && (
                  <div className="space-y-2">
                    <div className="h-2 bg-purple-900/30 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          quotaInfo.remaining > 0 ? 'bg-purple-600' : 'bg-red-600'
                        }`}
                        style={{
                          width: `${(quotaInfo.remaining / quotaInfo.total) * 100}%`
                        }}
                      />
                    </div>
                    <p className="text-xs text-purple-300">
                      {t.common.interpretationsUsed.replace('{}', String(quotaInfo.total - quotaInfo.remaining)).replace('{}', String(quotaInfo.total))}
                    </p>
                  </div>
                )}

                {quotaInfo.isDemo && (
                  <p className="text-sm text-purple-300">
                    {t.common.demoAccountQuotaHint}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-4 text-purple-200">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400 mr-2" />
                {t.common.loadingQuota}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="relative bg-gradient-to-br from-purple-900/30 via-black/40 to-pink-900/30 backdrop-blur-sm border-purple-500/30 shadow-lg shadow-purple-500/5 overflow-hidden">
          {/* 光晕效果 */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent"></div>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>

          <CardHeader className="relative z-10 p-4 sm:p-6">
            <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30">
                <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-purple-300" />
              </div>
              <span className="bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                {t.common.quickActions}
              </span>
            </CardTitle>
            <CardDescription className="text-purple-300/80 text-xs sm:text-sm">
              {t.common.quickActionsDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 space-y-2.5 p-4 sm:p-6 pt-0 sm:pt-0">
            <Link href="/history">
              <Button
                variant="outline"
                className="w-full justify-start bg-black/30 border-blue-500/20 text-blue-200/90 hover:bg-blue-500/20 hover:border-blue-400/40 hover:text-blue-100 hover:shadow-md hover:shadow-blue-500/10 transition-all duration-200"
              >
                <History className="mr-3 h-5 w-5 text-blue-400" />
                {t.home.history || 'View Reading History'}
              </Button>
            </Link>
            <Link href="/">
              <Button
                variant="outline"
                className="w-full justify-start bg-black/30 border-purple-500/20 text-purple-200/90 hover:bg-purple-500/20 hover:border-purple-400/40 hover:text-purple-100 hover:shadow-md hover:shadow-purple-500/10 transition-all duration-200"
              >
                <Sparkles className="mr-3 h-5 w-5 text-purple-400" />
                {t.home.newReading || 'New Reading'}
              </Button>
            </Link>
            <Button
              onClick={() => {
                logout();
                window.location.href = '/';
              }}
              variant="outline"
              className="w-full justify-start bg-black/30 border-red-500/20 text-red-200/90 hover:bg-red-500/20 hover:border-red-400/40 hover:text-red-100 hover:shadow-md hover:shadow-red-500/10 transition-all duration-200"
            >
              <LogOut className="mr-3 h-5 w-5 text-red-400" />
              {t.common.logout}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
