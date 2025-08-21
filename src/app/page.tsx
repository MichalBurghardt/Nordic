'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import AdvancedThemeToggle from "@/components/AdvancedThemeToggle";
import FeatureCarousel from "@/components/FeatureCarousel";

export default function Home() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

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

  return (
    <div className="min-h-screen bg-white dark:bg-nordic-dark transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-nordic-dark border-b border-nordic-light dark:border-nordic-primary shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-nordic-dark dark:text-nordic-light">Nordic</h1>
              <span className="ml-2 text-3xl font-bold text-nordic-primary">Zeitarbeit GmbH</span>
            </div>
            <div className="flex items-center space-x-4">
              <AdvancedThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Login */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side - Login Form */}
          <div className="flex justify-center lg:justify-start">
            <div className="w-full max-w-md">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-nordic-light dark:border-nordic-dark">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-nordic-dark dark:text-nordic-light">Anmelden</h3>
                  <p className="text-nordic-primary mt-2">Melden Sie sich in Ihr Konto an</p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-nordic-dark dark:text-nordic-light mb-1">
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
                      className="w-full px-3 py-2 border border-nordic-light dark:border-nordic-dark placeholder-gray-500 dark:placeholder-gray-400 text-nordic-dark dark:text-nordic-light bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-nordic-primary focus:border-nordic-primary sm:text-sm"
                      placeholder="ihre.email@beispiel.de"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-nordic-dark dark:text-nordic-light mb-1">
                      Passwort
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-3 py-2 pr-10 border border-nordic-light dark:border-nordic-dark placeholder-gray-500 dark:placeholder-gray-400 text-nordic-dark dark:text-nordic-light bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-nordic-primary focus:border-nordic-primary sm:text-sm"
                        placeholder="Ihr Passwort"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <svg className="h-5 w-5 text-gray-400 hover:text-nordic-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-gray-400 hover:text-nordic-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
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
                        Vergessen?
                      </Link>
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-nordic-primary hover:bg-nordic-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nordic-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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

                  <div className="text-center">
                    <p className="text-sm text-nordic-primary">
                      Noch kein Konto?{' '}
                      <Link href="/register" className="font-medium text-nordic-primary hover:text-nordic-dark dark:hover:text-nordic-light underline">
                        Jetzt registrieren
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Right Side - Welcome & Features */}
          <div className="text-center lg:text-right">
            <h2 className="text-5xl font-bold text-nordic-dark dark:text-nordic-light mb-6">
              Moderne Zeitarbeit
              <span className="text-nordic-primary"> Verwaltung</span>
            </h2>
            <p className="text-xl text-nordic-primary mb-8">
              Effiziente Verwaltung von Zeitarbeitskräften, Kunden und Einsätzen. 
              Optimieren Sie Ihre Personalvermittlung mit unserem intelligenten System.
            </p>
            
            {/* Feature Carousel */}
            <div className="mt-12">
              <FeatureCarousel>
                {/* Feature 1 */}
                <div className="card p-6 hover:shadow-xl transition-all duration-200">
                  <div className="w-12 h-12 bg-nordic-light dark:bg-nordic-primary rounded-lg flex items-center justify-center mx-auto lg:ml-auto lg:mr-0 mb-4">
                    <svg className="w-6 h-6 text-nordic-primary dark:text-nordic-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-nordic-dark dark:text-nordic-light mb-2">Personal Management</h3>
                  <p className="text-sm text-nordic-primary">
                    Verwalten Sie Ihre Zeitarbeitskräfte mit detaillierten Profilen und Qualifikationen.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="card p-6 hover:shadow-xl transition-all duration-200">
                  <div className="w-12 h-12 bg-nordic-light dark:bg-nordic-primary rounded-lg flex items-center justify-center mx-auto lg:ml-auto lg:mr-0 mb-4">
                    <svg className="w-6 h-6 text-nordic-primary dark:text-nordic-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-nordic-dark dark:text-nordic-light mb-2">Kunden Verwaltung</h3>
                  <p className="text-sm text-nordic-primary">
                    Zentrale Verwaltung aller Kundendaten mit Kontaktinformationen.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="card p-6 hover:shadow-xl transition-all duration-200">
                  <div className="w-12 h-12 bg-nordic-light dark:bg-nordic-primary rounded-lg flex items-center justify-center mx-auto lg:ml-auto lg:mr-0 mb-4">
                    <svg className="w-6 h-6 text-nordic-primary dark:text-nordic-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-nordic-dark dark:text-nordic-light mb-2">Einsatz Planung</h3>
                  <p className="text-sm text-nordic-primary">
                    Intelligente Zuordnung von Personal zu Einsätzen basierend auf Qualifikationen.
                  </p>
                </div>
              </FeatureCarousel>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-nordic-dark text-nordic-light py-12 mt-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Nordic Zeitarbeit GmbH</h3>
            <p className="text-nordic-primary mb-6">
              Professionelle Lösung für die Zeitarbeitsbranche
            </p>
            <div className="flex justify-center space-x-6">
              <Link href="/about" className="text-nordic-primary hover:text-nordic-light transition-colors">Über uns</Link>
              <Link href="/contact" className="text-nordic-primary hover:text-nordic-light transition-colors">Kontakt</Link>
              <Link href="/privacy" className="text-nordic-primary hover:text-nordic-light transition-colors">Datenschutz</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
