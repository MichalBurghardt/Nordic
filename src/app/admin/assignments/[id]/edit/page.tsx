'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminPageContainer from '@/components/AdminPageContainer';
import Link from 'next/link';
import { Save, Building, User, Calendar, MapPin, Clock, Euro } from 'lucide-react';

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

interface Assignment {
  _id: string;
  clientId: {
    _id: string;
    name: string;
    contactPerson: string;
  };
  employeeId: {
    _id: string;
    userId: {
      firstName: string;
      lastName: string;
    };
    employeeId: string;
  };
  position: string;
  description: string;
  startDate: string;
  endDate: string;
  workLocation: string;
  hourlyRate: number;
  maxHours: number;
  requirements: string[];
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'paused';
  notes?: string;
}

export default function EditAssignmentPage() {
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [formData, setFormData] = useState({
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
    status: 'pending' as 'pending' | 'active' | 'completed' | 'cancelled' | 'paused',
    notes: '',
  });

  const fetchAssignment = async () => {
    try {
      const response = await fetch(`/api/admin/assignments/${assignmentId}`);
      if (response.ok) {
        const data = await response.json();
        const assignmentData = data.assignment;
        setAssignment(assignmentData);
        
        // Ustaw dane w formularzu
        setFormData({
          clientId: assignmentData.clientId._id,
          employeeId: assignmentData.employeeId._id,
          position: assignmentData.position,
          description: assignmentData.description,
          startDate: assignmentData.startDate.split('T')[0],
          endDate: assignmentData.endDate.split('T')[0],
          workLocation: assignmentData.workLocation,
          hourlyRate: assignmentData.hourlyRate.toString(),
          maxHours: assignmentData.maxHours.toString(),
          requirements: assignmentData.requirements.join(', '),
          status: assignmentData.status,
          notes: assignmentData.notes || '',
        });
      } else {
        setError('Nie udało się załadować danych einsatz');
      }
    } catch {
      setError('Błąd połączenia z serwerem');
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    if (assignmentId) {
      fetchAssignment();
      fetchClients();
      fetchEmployees();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId]);

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

    setSaving(true);
    setError('');

    try {
      const payload = {
        ...formData,
        requirements: formData.requirements.split(',').map(req => req.trim()).filter(req => req),
      };

      const response = await fetch(`/api/admin/assignments/${assignmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push(`/admin/assignments/${assignmentId}?updated=true`);
      } else {
        const data = await response.json();
        setError(data.error || 'Wystąpił błąd podczas aktualizacji einsatz');
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
          <p className="mt-2 text-gray-600">Ładowanie danych einsatz...</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Nie znaleziono einsatz</p>
          <Link href="/admin/assignments" className="text-indigo-600 hover:text-indigo-800 mt-2 inline-block">
            Powrót do listy einsätze
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AdminPageContainer>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-nordic-dark dark:text-nordic-light">
          Einsatz bearbeiten: {assignment.position}
        </h1>
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
                Pozycja *
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

            {/* Daty, stawki i status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="pending">Oczekujący</option>
                  <option value="active">Aktywny</option>
                  <option value="completed">Zakończony</option>
                  <option value="cancelled">Anulowany</option>
                </select>
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
                  Maksymalne godziny *
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

            {/* Lokalizacja */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                <MapPin className="w-5 h-5 inline mr-2" />
                Lokalizacja pracy
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adres miejsca pracy *
                </label>
                <input
                  type="text"
                  value={formData.workLocation}
                  onChange={(e) => handleInputChange('workLocation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="np. Berlin, Hamburg, München..."
                  required
                />
              </div>
            </div>

            {/* Wymagania i notatki */}
            <div className="border-t pt-6 space-y-6">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notatki
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Dodatkowe informacje..."
                />
              </div>
            </div>

            {/* Przyciski */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Link
                href={`/admin/assignments/${assignmentId}`}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Anuluj
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Zapisywanie...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Zapisz zmiany
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
    </AdminPageContainer>
  );
}
