import { useState } from 'react';
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
    <div className="auth-page flex min-h-screen flex-col bg-gray-100 px-4 py-12 dark:bg-gray-950 sm:px-6 lg:px-8">
      <div className="flex flex-grow items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">TickTrack</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">Your time tracking companion</p>

            <CardTitle className="pt-4 text-3xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
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
              <form className="space-y-6" onSubmit={handlePasswordReset}>
                <div>
                  <label
                    htmlFor="reset-email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
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

                <div className="flex flex-col space-y-3">
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Processing...' : 'Send Reset Link'}
                  </Button>

                  <Button type="button" variant="link" onClick={resetForm}>
                    Back to login
                  </Button>
                </div>
              </form>
            ) : isSignUpMode ? (
              <form className="space-y-6" onSubmit={handleSignUp}>
                <div>
                  <label
                    htmlFor="signup-email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
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
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
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
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
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

                <div className="flex flex-col space-y-3">
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>

                  <Button type="button" variant="link" onClick={resetForm}>
                    Back to login
                  </Button>
                </div>
              </form>
            ) : (
              <form className="space-y-6" onSubmit={handleLogin}>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
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
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
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

                <div className="flex flex-col space-y-3">
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Signing in...' : 'Sign in'}
                  </Button>

                  <div className="flex justify-between">
                    <Button type="button" variant="link" className="px-0" onClick={showResetMode}>
                      Forgot password?
                    </Button>

                    <Button type="button" variant="link" className="px-0" onClick={showSignUpMode}>
                      Create account
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
