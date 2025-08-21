'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
    <div className="min-h-screen bg-gradient-to-br from-nordic-light to-nordic-primary/20 dark:from-gray-900 dark:to-nordic-dark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link href="/" className="flex justify-center">
            <h1 className="text-4xl font-bold text-nordic-dark dark:text-nordic-light">Nordic GmbH</h1>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-nordic-dark dark:text-nordic-light">
            Anmelden
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
            Oder{' '}
            <Link href="/register" className="font-medium text-nordic-primary hover:text-nordic-dark dark:hover:text-nordic-light">
              registrieren Sie sich für ein neues Konto
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-nordic-light/30 dark:border-nordic-dark/30" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-nordic-dark dark:text-nordic-light">
                E-Mail-Adresse
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-nordic-light dark:border-nordic-dark placeholder-gray-500 dark:placeholder-gray-400 text-nordic-dark dark:text-nordic-light bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-nordic-primary focus:border-nordic-primary focus:z-10 sm:text-sm"
                placeholder="Ihre E-Mail-Adresse"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-nordic-dark dark:text-nordic-light">
                Passwort
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-nordic-light dark:border-nordic-dark placeholder-gray-500 dark:placeholder-gray-400 text-nordic-dark dark:text-nordic-light bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-nordic-primary focus:border-nordic-primary focus:z-10 sm:text-sm"
                placeholder="Ihr Passwort"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
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

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-nordic-primary hover:bg-nordic-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nordic-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {loading ? 'Anmeldung...' : 'Anmelden'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
