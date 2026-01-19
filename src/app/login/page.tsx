'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Mail, Lock, Eye, EyeOff, Chrome, Apple } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const { t } = useI18n();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = t.auth.pleaseEnterEmail;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.auth.pleaseEnterEmail;
    }

    // 不再验证密码，密码可以为任意值

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // 统一使用 register 接口，后端会自动处理登录/注册逻辑
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password || 'demo', // 密码可以为空，默认为 'demo'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Auto login
        localStorage.setItem('tarot_user', JSON.stringify(data));
        window.location.href = '/';
      } else {
        setErrors({ submit: data.error || t.auth.loginFailed });
      }
    } catch (error) {
      setErrors({ submit: t.auth.loginFailed });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setIsLoading(true);
    try {
      // For demo purposes, simulate OAuth flow
      // In production, redirect to OAuth provider
      console.log(`${provider} login initiated`);
      alert(`${provider} login will be implemented with OAuth`);
    } catch (error) {
      setErrors({ submit: `${provider} ${t.auth.loginFailed}` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Sparkles className="h-10 w-10 text-purple-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Mentob AI
            </h1>
          </Link>
        </div>

        <Card className="border-purple-500/20 bg-black/40 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-white">
              {t.common.signIn}
            </CardTitle>
            <CardDescription className="text-center text-purple-200/80">
              Just enter your email to get started
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-purple-200">
                  {t.auth.email} <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t.auth.emailPlaceholder}
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`pl-10 bg-black/40 border-purple-500/20 text-white placeholder:text-purple-200/50 ${
                      errors.email ? 'border-red-500' : ''
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-purple-200">
                  {t.auth.password} <span className="text-purple-300/60 text-xs">(Optional)</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t.auth.passwordPlaceholder}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 bg-black/40 border-purple-500/20 text-white placeholder:text-purple-200/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {errors.submit && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400">{errors.submit}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  t.common.signIn
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-purple-500/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-2 text-purple-200/60">{t.auth.orContinueWith}</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => handleSocialLogin('google')}
                className="w-full bg-black/40 border-purple-500/20 text-white hover:bg-purple-500/10 hover:border-purple-500/40"
              >
                <Chrome className="mr-2 h-5 w-5" />
                {t.auth.googleLogin}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => handleSocialLogin('apple')}
                className="w-full bg-black/40 border-purple-500/20 text-white hover:bg-purple-500/10 hover:border-purple-500/40"
              >
                <Apple className="mr-2 h-5 w-5" />
                {t.auth.appleLogin}
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-xs text-purple-200/40">
              By signing in, you agree to our{' '}
              <Link href="/terms" className="text-purple-400 hover:text-purple-300 transition-colors">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-purple-400 hover:text-purple-300 transition-colors">
                Privacy Policy
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
