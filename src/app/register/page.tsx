'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ResponsiveContainer from '@/components/ResponsiveContainer';
import ResponsiveCard from '@/components/ResponsiveCard';
import ResponsiveButton from '@/components/ResponsiveButton';
import ResponsiveInput from '@/components/ResponsiveInput';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Walidacja hasła
    if (formData.password !== formData.confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen lang sein');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Registrierung erfolgreich! Sie werden weitergeleitet...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.error || 'Registrierung fehlgeschlagen');
      }
    } catch {
      setError('Netzwerkfehler. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-nordic-light to-nordic-primary/20 dark:from-gray-900 dark:to-nordic-dark/50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <ResponsiveContainer maxWidth="md" padding="none">
        <div className="w-full space-y-8">
          <div>
            <Link href="/" className="flex justify-center">
              <h1 className="text-4xl font-bold text-nordic-dark dark:text-nordic-light">Nordic GmbH</h1>
            </Link>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-nordic-dark dark:text-nordic-light">
              Konto erstellen
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
              Oder{' '}
              <Link href="/login" className="font-medium text-nordic-primary hover:text-nordic-dark dark:hover:text-nordic-light">
                melden Sie sich in Ihr bestehendes Konto an
              </Link>
            </p>
          </div>
          
          <ResponsiveCard padding="lg" shadow="xl">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded">
                  {success}
                </div>
              )}
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ResponsiveInput
                    id="firstName"
                    name="firstName"
                    type="text"
                    label="Vorname"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                  <ResponsiveInput
                    id="lastName"
                    name="lastName"
                    type="text"
                    label="Nachname"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <ResponsiveInput
                  id="email"
                  name="email"
                  type="email"
                  label="E-Mail-Adresse"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  placeholder="Ihre E-Mail-Adresse"
                  required
                />
                
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-nordic-dark dark:text-nordic-light mb-1">
                    Rolle
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-nordic-dark dark:text-nordic-light rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-nordic-primary focus:border-nordic-primary"
                  >
                    <option value="employee">Mitarbeiter</option>
                    <option value="hr">HR Manager</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                
                <ResponsiveInput
                  id="password"
                  name="password"
                  type="password"
                  label="Passwort"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  placeholder="Mindestens 6 Zeichen"
                  required
                />
                
                <ResponsiveInput
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  label="Passwort bestätigen"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  placeholder="Passwort wiederholen"
                  required
                />
              </div>

              <ResponsiveButton
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
              >
                {loading ? 'Registrierung...' : 'Konto erstellen'}
              </ResponsiveButton>
            </form>
          </ResponsiveCard>
        </div>
      </ResponsiveContainer>
    </div>
  );
}
