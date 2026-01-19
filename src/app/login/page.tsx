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
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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

    if (!formData.password) {
      newErrors.password = t.auth.pleaseEnterPassword;
    } else if (formData.password.length < 6) {
      newErrors.password = t.auth.weakPassword;
    }

    if (!isLogin) {
      if (!formData.username) {
        newErrors.username = t.auth.pleaseEnterUsername;
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = t.auth.pleaseConfirmPassword;
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = t.auth.passwordsDoNotMatch;
      }
    }

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
      if (isLogin) {
        // Handle login
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Store user info in localStorage (in production, use secure cookies)
          localStorage.setItem('user', JSON.stringify(data));
          // Redirect to home page
          window.location.href = '/';
        } else {
          setErrors({ submit: data.error || t.auth.loginFailed });
        }
      } else {
        // Handle registration
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Auto login after registration
          localStorage.setItem('user', JSON.stringify(data));
          window.location.href = '/';
        } else {
          setErrors({ submit: data.error || t.auth.registrationFailed });
        }
      }
    } catch (error) {
      setErrors({ submit: isLogin ? t.auth.loginFailed : t.auth.registrationFailed });
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
              {isLogin ? t.auth.welcomeBack : t.auth.createYourAccount}
            </CardTitle>
            <CardDescription className="text-center text-purple-200/80">
              {isLogin ? 'Sign in to your account to continue' : 'Create a new account to get started'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username - only for registration */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-purple-200">
                    {t.auth.username}
                  </Label>
                  <div className="relative">
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder={t.auth.usernamePlaceholder}
                      value={formData.username}
                      onChange={handleInputChange}
                      className={`bg-black/40 border-purple-500/20 text-white placeholder:text-purple-200/50 ${
                        errors.username ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  {errors.username && (
                    <p className="text-sm text-red-400">{errors.username}</p>
                  )}
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-purple-200">
                  {t.auth.email}
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
                  {t.auth.password}
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
                    className={`pl-10 pr-10 bg-black/40 border-purple-500/20 text-white placeholder:text-purple-200/50 ${
                      errors.password ? 'border-red-500' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password - only for registration */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-purple-200">
                    {t.auth.confirmPassword}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder={t.auth.pleaseConfirmPassword}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`pl-10 pr-10 bg-black/40 border-purple-500/20 text-white placeholder:text-purple-200/50 ${
                        errors.confirmPassword ? 'border-red-500' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-400">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              {/* Remember Me & Forgot Password - only for login */}
              {isLogin && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      id="remember"
                      name="rememberMe"
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-purple-500/30 bg-black/40 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="remember" className="text-sm text-purple-200/80 cursor-pointer">
                      {t.auth.rememberMe}
                    </label>
                  </div>
                  <Link href="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                    {t.auth.forgotPassword}
                  </Link>
                </div>
              )}

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
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </span>
                ) : (
                  isLogin ? t.common.signIn : t.auth.createAccount
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
            {/* Demo Account Info - only for login */}
            {isLogin && (
              <div className="w-full p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-semibold text-purple-200">{t.auth.demoAccount}</span>
                </div>
                <p className="text-xs text-purple-200/70">{t.auth.demoAccountHint}</p>
                <div className="text-xs text-purple-200/90 space-y-1 mt-2">
                  <p>{t.auth.demoCredentials}</p>
                  <p className="font-mono bg-black/30 px-2 py-1 rounded">{t.auth.demoEmail}</p>
                  <p className="font-mono bg-black/30 px-2 py-1 rounded">{t.auth.demoPassword}</p>
                </div>
              </div>
            )}
            <div className="text-center text-sm text-purple-200/80">
              {isLogin ? t.auth.dontHaveAccount : t.auth.alreadyHaveAccount}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                }}
                className="ml-1 text-purple-400 hover:text-purple-300 transition-colors font-medium"
              >
                {isLogin ? t.auth.createAccount : t.common.signIn}
              </button>
            </div>
            
            <div className="text-center text-xs text-purple-200/40">
              By {isLogin ? 'signing in' : 'creating an account'}, you agree to our{' '}
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
