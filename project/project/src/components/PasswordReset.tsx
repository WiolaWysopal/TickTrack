import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

export function PasswordReset() {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme ?? 'dark';

    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');

    const code = searchParams.get('code');

    if (code) {
      supabase.auth.exchangeCodeForSession(code).catch((error) => {
        console.error('Error exchanging code for session:', error);
        setError('Invalid or expired reset link. Please request a new password reset.');
      });
    }
  }, [searchParams]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';

    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      setSuccess('Password has been reset successfully. You will be redirected to login.');

      await supabase.auth.signOut();

      setTimeout(() => {
        navigate('/', { replace: true });
      }, 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-gradient-to-br from-blue-100 via-white to-purple-100 text-slate-900 dark:from-blue-950/40 dark:via-slate-950 dark:to-purple-950/40 dark:text-slate-100">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={toggleTheme}
        className="fixed right-4 top-4 z-50 rounded-full bg-white/80 shadow-sm backdrop-blur dark:bg-slate-900/80"
      >
        {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
      </Button>

      <div className="absolute left-[-120px] top-[-120px] h-72 w-72 rounded-full bg-blue-400/30 blur-3xl dark:bg-blue-600/20" />
      <div className="absolute bottom-[-120px] right-[-120px] h-72 w-72 rounded-full bg-purple-400/30 blur-3xl dark:bg-purple-600/20" />

      <main className="relative z-10 mx-auto flex max-w-xl items-center justify-center px-4 pb-8 pt-20 sm:min-h-[100dvh] sm:py-8">
        <Card className="w-full border-white/70 bg-white/85 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/85">
          <CardHeader className="space-y-2 px-6 pt-8 text-center sm:space-y-3 sm:px-10 sm:pt-10">
            <div className="mx-auto mb-5">
              <img
                src="/icon-512x512.png"
                alt="TickTrack logo"
                className="h-14 w-14 rounded-xl shadow-lg"
              />
            </div>

            <h1 className="text-3xl font-bold">TickTrack</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your time tracking companion
            </p>

            <CardTitle className="pt-4 text-2xl sm:pt-6">Reset Your Password</CardTitle>
            <CardDescription>Enter your new password below.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 px-6 pb-8 pt-4 sm:space-y-8 sm:px-10 sm:pb-10 sm:pt-6">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
                {success}
              </div>
            )}

            <form className="space-y-6 sm:space-y-8" onSubmit={handlePasswordReset}>
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  New Password
                </label>
                <Input
                  id="new-password"
                  name="new-password"
                  type="password"
                  required
                  className="mt-1"
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                />
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Confirm New Password
                </label>
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                  className="mt-1"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                />
              </div>

              <div className="flex flex-col space-y-4 pt-1 sm:space-y-6 sm:pt-2">
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Processing...' : 'Reset Password'}
                </Button>

                <Button type="button" variant="link" onClick={() => navigate('/')}>
                  Back to login
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
