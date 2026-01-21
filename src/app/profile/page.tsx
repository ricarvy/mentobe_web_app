'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/lib/userContext';
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
            <CardTitle className="text-white">Not Logged In</CardTitle>
            <CardDescription className="text-purple-200">
              Please log in to view your profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => (window.location.href = '/login')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-2">
        <User className="h-8 w-8 text-purple-400" />
        {t.common.profile || 'Profile'}
      </h1>

      <div className="space-y-6">
        {/* User Info Card */}
        <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">Account Information</CardTitle>
            <CardDescription className="text-purple-200">
              Your account details and settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-purple-200">
              <User className="h-5 w-5 text-purple-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-purple-300">{t.common.username || 'Username'}</p>
                <p className="font-semibold text-white">{user.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-purple-200">
              <Mail className="h-5 w-5 text-purple-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-purple-300">{t.common.email || 'Email'}</p>
                <p className="font-semibold text-white">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-purple-200">
              <Shield className="h-5 w-5 text-purple-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-purple-300">Account Type</p>
                <p className="font-semibold text-white">
                  {user.isDemo ? (
                    <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                      Demo Account
                    </Badge>
                  ) : (
                    <Badge variant="default" className="bg-purple-600">
                      Standard Account
                    </Badge>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quota Information */}
        <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-6 w-6 text-purple-400" />
              Daily Quota
            </CardTitle>
            <CardDescription className="text-purple-200">
              Your AI interpretation usage for today
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
                      {quotaInfo.total - quotaInfo.remaining} of {quotaInfo.total} interpretations used today
                    </p>
                  </div>
                )}

                {quotaInfo.isDemo && (
                  <p className="text-sm text-purple-300">
                    Demo accounts have unlimited AI interpretations.
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-4 text-purple-200">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400 mr-2" />
                Loading quota information...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="h-6 w-6 text-purple-400" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-purple-200">
              Common tasks and navigation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/history">
              <Button
                variant="outline"
                className="w-full justify-start border-purple-500/30 text-purple-200 hover:bg-purple-500/10"
              >
                <History className="mr-3 h-5 w-5" />
                {t.home.history || 'View Reading History'}
              </Button>
            </Link>
            <Link href="/">
              <Button
                variant="outline"
                className="w-full justify-start border-purple-500/30 text-purple-200 hover:bg-purple-500/10"
              >
                <Sparkles className="mr-3 h-5 w-5" />
                {t.home.newReading || 'New Reading'}
              </Button>
            </Link>
            <Button
              onClick={() => {
                logout();
                window.location.href = '/';
              }}
              variant="outline"
              className="w-full justify-start border-red-500/30 text-red-200 hover:bg-red-500/10"
            >
              <LogOut className="mr-3 h-5 w-5" />
              {t.common.logout}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
