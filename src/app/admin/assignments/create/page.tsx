'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Building, User, Calendar, MapPin, Clock, Euro } from 'lucide-react';

interface Client {
  _id: string;
  name: string;
  contactPerson: string;
}

interface Employee {
  _id: string;
  userId: {
    firstName: string;
    lastName: string;
  };
  employeeId: string;
}

interface AssignmentFormData {
  clientId: string;
  employeeId: string;
  position: string;
  description: string;
  startDate: string;
  endDate: string;
  workLocation: string;
  hourlyRate: string;
  maxHours: string;
  requirements: string;
}

export default function CreateAssignmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState<AssignmentFormData>({
    clientId: '',
    employeeId: '',
    position: '',
    description: '',
    startDate: '',
    endDate: '',
    workLocation: '',
    hourlyRate: '',
    maxHours: '',
    requirements: '',
  });

  useEffect(() => {
    fetchClients();
    fetchEmployees();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/admin/clients?limit=100');
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/admin/employees?limit=100');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.employees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientId || !formData.employeeId || !formData.position || !formData.description || 
        !formData.startDate || !formData.endDate || !formData.hourlyRate || !formData.maxHours ||
        !formData.workLocation) {
      setError('Proszę wypełnić wszystkie wymagane pola');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        requirements: formData.requirements.split(',').map(req => req.trim()).filter(req => req),
      };

      const response = await fetch('/api/admin/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push('/admin/assignments?created=true');
      } else {
        const data = await response.json();
        setError(data.error || 'Wystąpił błąd podczas tworzenia einsatz');
      }
    } catch {
      setError('Błąd połączenia z serwerem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/admin/assignments" className="text-indigo-600 hover:text-indigo-800 mr-4">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Neuen Einsatz erstellen</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  <Building className="w-4 h-4 inline mr-2" />
                  Klient *
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) => handleInputChange('clientId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Wybierz klienta</option>
                  {clients.map(client => (
                    <option key={client._id} value={client._id}>
                      {client.name} - {client.contactPerson}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Pracownik *
                </label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => handleInputChange('employeeId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Wybierz pracownika</option>
                  {employees.map(employee => (
                    <option key={employee._id} value={employee._id}>
                      {employee.userId.lastName}, {employee.userId.firstName} (ID: {employee.employeeId})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position / Einsatz *
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="np. Pracownik magazynu, Kierowca, etc."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opis einsatz *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Szczegółowy opis zadań i obowiązków..."
                required
              />
            </div>

            {/* Daty i stawki */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Data rozpoczęcia *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Data zakończenia *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Euro className="w-4 h-4 inline mr-2" />
                  Stawka godzinowa (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.hourlyRate}
                  onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="15.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Maximale Stunden *
                </label>
                <input
                  type="number"
                  value={formData.maxHours}
                  onChange={(e) => handleInputChange('maxHours', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="160"
                  required
                />
              </div>
            </div>

            {/* Lokalizacja pracy */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                <MapPin className="w-5 h-5 inline mr-2" />
                Lokalizacja pracy
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Miejsce pracy *
                </label>
                <input
                  type="text"
                  value={formData.workLocation}
                  onChange={(e) => handleInputChange('workLocation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="np. Hamburg, Hauptstraße 15"
                  required
                />
              </div>
            </div>

            {/* Wymagania */}
            <div className="border-t pt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wymagania (oddzielone przecinkami)
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="np. Prawo jazdy kat. B, Znajomość języka niemieckiego, Doświadczenie w magazynie"
                />
              </div>
            </div>

            {/* Przyciski */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Link
                href="/admin/assignments"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Anuluj
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Tworzenie...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Utwórz einsatz
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
