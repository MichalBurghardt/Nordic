'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit2, Building, User, Calendar, MapPin, Clock, Euro, FileText } from 'lucide-react';

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
      email: string;
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
  actualHours?: number;
  requirements: string[];
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'paused';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AssignmentDetailPage() {
  const params = useParams();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAssignment = async () => {
    try {
      const response = await fetch(`/api/admin/assignments/${assignmentId}`);
      if (response.ok) {
        const data = await response.json();
        setAssignment(data.assignment);
      } else {
        setError('Nie udało się załadować danych einsatz');
      }
    } catch {
      setError('Błąd połączenia z serwerem');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assignmentId) {
      fetchAssignment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pl-PL');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Oczekujący' },
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Aktywny' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Zakończony' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Anulowany' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const calculateDays = () => {
    if (!assignment) return 0;
    const start = new Date(assignment.startDate);
    const end = new Date(assignment.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateTotalRevenue = () => {
    if (!assignment) return 0;
    return assignment.hourlyRate * assignment.maxHours;
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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/admin/assignments" className="text-indigo-600 hover:text-indigo-800 mr-4">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">
                Einsatz Details: {assignment.position}
              </h1>
            </div>
            <div className="flex space-x-3">
              {getStatusBadge(assignment.status)}
              <Link
                href={`/admin/assignments/${assignmentId}/edit`}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Bearbeiten
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Główne informacje */}
          <div className="lg:col-span-2 space-y-6">
            {/* Podstawowe informacje */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                <FileText className="w-5 h-5 inline mr-2" />
                Podstawowe informacje
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Position</label>
                  <p className="mt-1 text-lg font-medium text-gray-900">{assignment.position}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    {getStatusBadge(assignment.status)}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-500">Opis</label>
                <p className="mt-1 text-gray-900 whitespace-pre-line">{assignment.description}</p>
              </div>

              {assignment.requirements && assignment.requirements.length > 0 && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-500">Wymagania</label>
                  <ul className="mt-1 list-disc list-inside text-gray-900">
                    {assignment.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {assignment.notes && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-500">Notatki</label>
                  <p className="mt-1 text-gray-900 whitespace-pre-line">{assignment.notes}</p>
                </div>
              )}
            </div>

            {/* Lokalizacja */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                <MapPin className="w-5 h-5 inline mr-2" />
                Lokalizacja pracy
              </h2>
              <div className="space-y-2">
                <p className="text-gray-900">{assignment.workLocation}</p>
              </div>
            </div>
          </div>

          {/* Panel boczny */}
          <div className="space-y-6">
            {/* Klient */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <Building className="w-5 h-5 inline mr-2" />
                Klient
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Firma</label>
                  <p className="text-gray-900 font-medium">{assignment.clientId.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Osoba kontaktowa</label>
                  <p className="text-gray-900">{assignment.clientId.contactPerson}</p>
                </div>
              </div>
            </div>

            {/* Pracownik */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <User className="w-5 h-5 inline mr-2" />
                Pracownik
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Imię i nazwisko</label>
                  <p className="text-gray-900 font-medium">
                    {assignment.employeeId.userId.firstName} {assignment.employeeId.userId.lastName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">ID Pracownika</label>
                  <p className="text-gray-900">{assignment.employeeId.employeeId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{assignment.employeeId.userId.email}</p>
                </div>
              </div>
            </div>

            {/* Daty i czas */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <Calendar className="w-5 h-5 inline mr-2" />
                Terminy
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Data rozpoczęcia</label>
                  <p className="text-gray-900">{formatDate(assignment.startDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Data zakończenia</label>
                  <p className="text-gray-900">{formatDate(assignment.endDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Liczba dni</label>
                  <p className="text-gray-900 font-medium">{calculateDays()} dni</p>
                </div>
              </div>
            </div>

            {/* Finansowe */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <Euro className="w-5 h-5 inline mr-2" />
                Informacje finansowe
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Stawka godzinowa</label>
                  <p className="text-gray-900 font-medium">€{assignment.hourlyRate}/godz</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Maximale Stunden</label>
                  <p className="text-gray-900">{assignment.maxHours}h</p>
                </div>
                {assignment.actualHours && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Przepracowane godziny</label>
                    <p className="text-gray-900 font-medium">{assignment.actualHours}h</p>
                  </div>
                )}
                <div className="border-t pt-3">
                  <label className="block text-sm font-medium text-gray-500">Szacowane wynagrodzenie</label>
                  <p className="text-gray-900 font-bold text-lg">€{calculateTotalRevenue().toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Informacje systemowe */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <Clock className="w-5 h-5 inline mr-2" />
                Informacje systemowe
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Utworzono</label>
                  <p className="text-gray-900">{formatDateTime(assignment.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Ostatnia modyfikacja</label>
                  <p className="text-gray-900">{formatDateTime(assignment.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
