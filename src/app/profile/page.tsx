'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser } from '@/lib/userContext';
import { useI18n } from '@/lib/i18n';
import { addAuthHeader } from '@/lib/auth';
import { apiRequest, ApiRequestError } from '@/lib/api-client';
import { Calendar, User, Mail, Clock, ChevronRight, ChevronDown, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface HistoryItem {
  id: string;
  question: string;
  interpretation: string;
  spreadType: string;
  createdAt: string;
  cards: string;
}

export default function ProfilePage() {
  const { user, logout } = useUser();
  const { t } = useI18n();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const data = await apiRequest<{ interpretations: HistoryItem[] }>(
        `/api/tarot/history?userId=${user.id}`,
        {
          method: 'GET',
        }
      );

      setHistory(data.interpretations || []);
    } catch (error) {
      console.error('Error fetching history:', error);
      if (error instanceof ApiRequestError) {
        console.error('[History Error]', error.message, error.code, error.details);
      }
    } finally {
      setLoading(false);
    }
  };

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
    <div className="container mx-auto px-4 py-8">
      {/* User Info Card */}
      <Card className="mb-8 bg-black/40 backdrop-blur-sm border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="h-6 w-6 text-purple-400" />
            {t.common.profile || 'Profile'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 text-purple-200">
            <User className="h-5 w-5 text-purple-400" />
            <div>
              <p className="text-sm text-purple-300">{t.common.username || 'Username'}</p>
              <p className="font-semibold text-white">{user.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-purple-200">
            <Mail className="h-5 w-5 text-purple-400" />
            <div>
              <p className="text-sm text-purple-300">{t.common.email || 'Email'}</p>
              <p className="font-semibold text-white">{user.email}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-purple-500/20">
            <Button
              onClick={() => {
                logout();
                window.location.href = '/';
              }}
              variant="outline"
              className="border-purple-500/30 text-purple-200 hover:bg-purple-500/10"
            >
              {t.common.logout}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reading History Card */}
      <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-6 w-6 text-purple-400" />
            {t.home.history || 'Reading History'}
          </CardTitle>
          <CardDescription className="text-purple-200">
            Your past tarot readings and interpretations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-purple-200">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400" />
              <span className="ml-3">{t.home.loading || 'Loading...'}</span>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-purple-200">
              <Sparkles className="h-16 w-16 mx-auto mb-4 text-purple-400 opacity-50" />
              <p className="text-lg mb-2">{t.home.noHistory || 'No reading history yet'}</p>
              <p className="text-sm text-purple-300 mb-6">
                {t.home.startReading || 'Start your first tarot reading today'}
              </p>
              <Button
                onClick={() => (window.location.href = '/')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {t.home.newReading || 'New Reading'}
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {history.map((item) => (
                  <Card
                    key={item.id}
                    className="bg-black/30 border-purple-500/20 overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                      className="w-full p-4 text-left hover:bg-purple-500/5 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-purple-400" />
                            <span className="text-sm text-purple-300">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                            <span className="text-sm text-purple-300">
                              {new Date(item.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-white line-clamp-2">
                            {item.question}
                          </p>
                          <p className="text-xs text-purple-300 mt-1">
                            Spread: {item.spreadType}
                          </p>
                        </div>
                        {expandedItem === item.id ? (
                          <ChevronDown className="text-purple-400 w-5 h-5 flex-shrink-0 mt-1" />
                        ) : (
                          <ChevronRight className="text-purple-400 w-5 h-5 flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </button>

                    {expandedItem === item.id && (
                      <div className="border-t border-purple-500/20 p-4">
                        <div className="bg-black/40 rounded-lg p-4 prose prose-invert prose-purple max-w-none">
                          <h4 className="text-white font-semibold mb-2">Interpretation:</h4>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {item.interpretation}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
