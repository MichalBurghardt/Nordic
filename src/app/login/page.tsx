'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ResponsiveContainer from '@/components/ResponsiveContainer';
import ResponsiveCard from '@/components/ResponsiveCard';
import ResponsiveButton from '@/components/ResponsiveButton';
import ResponsiveInput from '@/components/ResponsiveInput';
import AdvancedThemeToggle from '@/components/AdvancedThemeToggle';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Sprawdź rolę użytkownika i przekieruj odpowiednio
        if (data.user.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (data.user.role === 'hr') {
          router.push('/hr/dashboard');
        } else if (data.user.role === 'client') {
          router.push('/client/dashboard');
        } else {
          router.push('/employee');
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-nordic-light to-nordic-primary/20 dark:from-gray-900 dark:to-nordic-dark flex items-center justify-center">
      <ResponsiveContainer maxWidth="sm" padding="md">
        <div className="space-y-6 lg:space-y-8">
          {/* Header */}
          <div className="text-center">
            <Link href="/" className="inline-block">
              <h1 className="text-3xl sm:text-4xl font-bold text-nordic-dark dark:text-nordic-light">Nordic GmbH</h1>
            </Link>
            <h2 className="mt-4 lg:mt-6 text-2xl sm:text-3xl font-extrabold text-nordic-dark dark:text-nordic-light">
              Anmelden
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Oder{' '}
              <Link href="/register" className="font-medium text-nordic-primary hover:text-nordic-dark dark:hover:text-nordic-light">
                registrieren Sie sich für ein neues Konto
              </Link>
            </p>
          </div>
          
          {/* Login Form */}
          <ResponsiveCard padding="lg" shadow="lg">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <ResponsiveInput
                  id="email"
                  name="email"
                  type="email"
                  label="E-Mail-Adresse"
                  placeholder="Ihre E-Mail-Adresse"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
                
                <ResponsiveInput
                  id="password"
                  name="password"
                  type="password"
                  label="Passwort"
                  placeholder="Ihr Passwort"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-nordic-primary focus:ring-nordic-primary border-nordic-light dark:border-nordic-dark rounded bg-white dark:bg-gray-700"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-nordic-dark dark:text-nordic-light">
                    Angemeldet bleiben
                  </label>
                </div>

                <div className="text-sm">
                  <Link href="/forgot-password" className="font-medium text-nordic-primary hover:text-nordic-dark dark:hover:text-nordic-light">
                    Passwort vergessen?
                  </Link>
                </div>
              </div>

              <ResponsiveButton
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                fullWidth={true}
              >
                {loading ? 'Anmeldung...' : 'Anmelden'}
              </ResponsiveButton>
            </form>
          </ResponsiveCard>

          {/* Theme Toggle */}
          <div className="flex justify-center">
            <AdvancedThemeToggle />
          </div>
        </div>
      </ResponsiveContainer>
    </div>
  );
}
