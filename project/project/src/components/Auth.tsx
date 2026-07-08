import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

export function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isResetMode, setIsResetMode] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme ?? 'dark';

    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';

    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;

      setSuccess('Password reset link has been sent to your email. Please check your inbox.');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during password reset');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;

      if (data.user?.identities?.length === 0) {
        setError('This email is already registered. Please try signing in or reset your password.');
        return;
      }

      setSuccess('Account created successfully! You can now sign in.');
      setIsSignUpMode(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIsResetMode(false);
    setIsSignUpMode(false);
    setError(null);
    setSuccess(null);
    setPassword('');
    setConfirmPassword('');
  };

  const showResetMode = () => {
    setIsResetMode(true);
    setIsSignUpMode(false);
    setError(null);
    setSuccess(null);
    setPassword('');
    setConfirmPassword('');
  };

  const showSignUpMode = () => {
    setIsSignUpMode(true);
    setIsResetMode(false);
    setError(null);
    setSuccess(null);
    setPassword('');
    setConfirmPassword('');
  };

  const title = isResetMode
    ? 'Reset Your Password'
    : isSignUpMode
      ? 'Create an Account'
      : 'Sign in to your account';

  const description = isResetMode
    ? 'Enter your email to receive a password reset link.'
    : isSignUpMode
      ? 'Fill in the details below to create your account.'
      : 'Welcome back. Enter your credentials to continue.';

  return (
    <div className="relative min-h-dvh overflow-hidden bg-gradient-to-br from-blue-100 via-white to-purple-100 text-slate-900 dark:from-blue-950/40 dark:via-slate-950 dark:to-purple-950/40 dark:text-slate-100">
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

      <main className="relative z-10 mx-auto flex min-h-dvh max-w-6xl flex-col items-center justify-center gap-10 px-4 pb-8 pt-20 lg:py-8 lg:flex-row lg:px-8">
        <section className="max-w-xl text-center lg:text-left">
          <div className="mb-4 inline-flex rounded-full border border-blue-200 bg-white/70 px-4 py-2 text-sm font-medium text-blue-700 shadow-sm backdrop-blur dark:border-blue-800 dark:bg-slate-900/70 dark:text-blue-300">
            ⏱ Simple time tracking for focused work
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
            Track your tasks.
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Own your time.
            </span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
            TickTrack helps you manage projects, measure work sessions, attach PDFs and stay focused
            without unnecessary complexity.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border bg-white/70 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-2xl">✅</p>
              <p className="mt-2 font-semibold">Tasks</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Plan and organize work</p>
            </div>

            <div className="rounded-2xl border bg-white/70 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-2xl">⏳</p>
              <p className="mt-2 font-semibold">Sessions</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Track your focus time</p>
            </div>

            <div className="rounded-2xl border bg-white/70 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-2xl">📄</p>
              <p className="mt-2 font-semibold">PDFs</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Keep files with tasks</p>
            </div>
          </div>
        </section>

        <section className="w-full max-w-xl">
          <Card className="border-white/70 bg-white/85 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/85">
            <CardHeader className="space-y-3 px-6 pt-10 text-center sm:px-10">
              <div className="mx-auto mb-5">
                <img
                  src="/icon-512x512.png"
                  alt="TickTrack logo"
                  className="h-14 w-14 rounded-xl shadow-lg"
                />
              </div>

              <h2 className="text-3xl font-bold">TickTrack</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your time tracking companion
              </p>

              <CardTitle className="pt-6 text-2xl">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-8 px-6 pb-10 pt-4 sm:px-10">
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

              {isResetMode ? (
                <form className="space-y-8" onSubmit={handlePasswordReset}>
                  <div>
                    <label
                      htmlFor="reset-email"
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Email address
                    </label>
                    <Input
                      id="reset-email"
                      name="email"
                      type="email"
                      required
                      className="mt-1"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col space-y-6 pt-2">
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? 'Processing...' : 'Send Reset Link'}
                    </Button>

                    <Button type="button" variant="link" onClick={resetForm}>
                      Back to login
                    </Button>
                  </div>
                </form>
              ) : isSignUpMode ? (
                <form className="space-y-8" onSubmit={handleSignUp}>
                  <div>
                    <label
                      htmlFor="signup-email"
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Email address
                    </label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      required
                      className="mt-1"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="signup-password"
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Password
                    </label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      required
                      className="mt-1"
                      placeholder="Password"
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
                      Confirm Password
                    </label>
                    <Input
                      id="confirm-password"
                      name="confirm-password"
                      type="password"
                      required
                      className="mt-1"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      minLength={6}
                    />
                  </div>

                  <div className="flex flex-col space-y-6 pt-2">
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? 'Creating account...' : 'Create Account'}
                    </Button>

                    <Button type="button" variant="link" onClick={resetForm}>
                      Back to login
                    </Button>
                  </div>
                </form>
              ) : (
                <form className="space-y-8" onSubmit={handleLogin}>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Email address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="mt-1"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Password
                    </label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="mt-1"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={6}
                    />
                  </div>

                  <div className="flex flex-col space-y-6 pt-2">
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? 'Signing in...' : 'Sign in'}
                    </Button>

                    <div className="flex justify-between">
                      <Button type="button" variant="link" className="px-0" onClick={showResetMode}>
                        Forgot password?
                      </Button>

                      <Button
                        type="button"
                        variant="link"
                        className="px-0"
                        onClick={showSignUpMode}
                      >
                        Create account
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
