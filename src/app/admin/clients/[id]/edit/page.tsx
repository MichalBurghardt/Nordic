'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminPageContainer from '@/components/AdminPageContainer';
import Link from 'next/link';

interface Client {
  _id: string;
  name: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  industry: string;
  hourlyRateMultiplier: number;
  taxNumber?: string;
  description?: string;
  isActive: boolean;
}

export default function EditClient() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [client, setClient] = useState<Client | null>(null);

  const fetchClient = async () => {
    try {
      const response = await fetch(`/api/clients/${clientId}`);
      if (response.ok) {
        const data = await response.json();
        setClient(data.data);
      } else {
        setError('Nie udało się załadować danych klienta');
      }
    } catch {
      setError('Błąd połączenia z serwerem');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchClient();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  const handleInputChange = (field: string, value: string | boolean | number) => {
    if (!client) return;

    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setClient(prev => prev ? {
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      } : null);
    } else {
      setClient(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!client) return;

    if (!client.name.trim() || !client.contactPerson.trim() || !client.email.trim() || 
        !client.phoneNumber.trim() || !client.address.street.trim() || 
        !client.address.city.trim() || !client.address.postalCode.trim() || 
        !client.industry.trim() || !client.hourlyRateMultiplier || 
        client.hourlyRateMultiplier < 0.8 || client.hourlyRateMultiplier > 1.2) {
      setError('Proszę wypełnić wszystkie wymagane pola i sprawdzić czy mnożnik stawki jest w przedziale 0.8-1.2');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(client),
      });

      if (response.ok) {
        router.push('/admin/clients?updated=true');
      } else {
        const data = await response.json();
        setError(data.error || 'Wystąpił błąd podczas aktualizacji klienta');
      }
    } catch {
      setError('Błąd połączenia z serwerem');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Ładowanie danych klienta...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Nie znaleziono klienta</p>
          <Link href="/admin/clients" className="text-indigo-600 hover:text-indigo-800 mt-2 inline-block">
            Powrót do listy klientów
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AdminPageContainer>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-nordic-dark dark:text-nordic-light">Klienta bearbeiten</h1>
      </div>

      {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Podstawowe informacje */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nazwa firmy *
                </label>
                <input
                  type="text"
                  value={client.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Osoba kontaktowa *
                </label>
                <input
                  type="text"
                  value={client.contactPerson}
                  onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={client.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon *
                </label>
                <input
                  type="tel"
                  value={client.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branża *
                </label>
                <input
                  type="text"
                  value={client.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mnożnik stawki godzinowej *
                </label>
                <input
                  type="number"
                  min="0.8"
                  max="1.2"
                  step="0.01"
                  value={client.hourlyRateMultiplier}
                  onChange={(e) => handleInputChange('hourlyRateMultiplier', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Mnożnik stawki godzinowej pracownika (80% - 120%). Przykład: 1.1 = 110%
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NIP
                </label>
                <input
                  type="text"
                  value={client.taxNumber || ''}
                  onChange={(e) => handleInputChange('taxNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Adres */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Adres</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ulica *
                  </label>
                  <input
                    type="text"
                    value={client.address.street}
                    onChange={(e) => handleInputChange('address.street', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Miasto *
                  </label>
                  <input
                    type="text"
                    value={client.address.city}
                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kod pocztowy *
                  </label>
                  <input
                    type="text"
                    value={client.address.postalCode}
                    onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kraj *
                  </label>
                  <select
                    value={client.address.country}
                    onChange={(e) => handleInputChange('address.country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="Germany">Niemcy</option>
                    <option value="Poland">Polska</option>
                    <option value="Austria">Austria</option>
                    <option value="Netherlands">Holandia</option>
                    <option value="Belgium">Belgia</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Status i opis */}
            <div className="border-t pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={client.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Klient aktywny
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opis dodatkowy
                </label>
                <textarea
                  value={client.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Dodatkowe informacje o kliencie..."
                />
              </div>
            </div>

            {/* Przyciski */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Link
                href="/admin/clients"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Anuluj
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
              </button>
            </div>
          </form>
        </div>
    </AdminPageContainer>
  );
}
