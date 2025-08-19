'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';

interface Employee {
  _id: string;
  employeeId: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

interface Client {
  _id: string;
  name: string;
  nordicClientNumber: string;
}

// Typ dla danych formularza (przed wysłaniem do API)
interface ScheduleFormData {
  employeeId: string;
  clientId: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  weeklyHours: number;
  notes: string;
}

// Typ dla pełnego obiektu Schedule (po pobraniu z API z populowanymi polami)
interface Schedule {
  _id?: string;
  employeeId: {
    _id: string;
    employeeId: string;
    userId: {
      firstName: string;
      lastName: string;
    };
  };
  clientId: {
    _id: string;
    name: string;
    nordicClientNumber: string;
  };
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  weeklyHours: number;
  status?: 'planned' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  notes?: string;
}

interface CreateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (schedule: Schedule) => void;
  employees: Employee[];
  clients: Client[];
  selectedDate?: Date | null;
}

export default function CreateScheduleModal({
  isOpen,
  onClose,
  onSave,
  employees,
  clients,
  selectedDate
}: CreateScheduleModalProps) {
  const [formData, setFormData] = useState<ScheduleFormData>({
    employeeId: '',
    clientId: '',
    startDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
    endDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
    startTime: '08:00',
    endTime: '16:00',
    weeklyHours: 40,
    notes: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        onSave(data.schedule);
        onClose();
        setFormData({
          employeeId: '',
          clientId: '',
          startDate: '',
          endDate: '',
          startTime: '08:00',
          endTime: '16:00',
          weeklyHours: 40,
          notes: ''
        });
      } else {
        const error = await response.json();
        alert(error.error || 'Fehler beim Erstellen des Termins');
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
      alert('Fehler beim Erstellen des Termins');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4 max-h-90vh overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Neuer Termin</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Pracownik */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mitarbeiter *
              </label>
              <select
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Mitarbeiter wählen...</option>
                {employees.map(employee => (
                  <option key={employee._id} value={employee._id}>
                    {employee.employeeId}
                  </option>
                ))}
              </select>
            </div>

            {/* Klient */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kunde *
              </label>
              <select
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Kunde wählen...</option>
                {clients.map(client => (
                  <option key={client._id} value={client._id}>
                    {client.nordicClientNumber} - {client.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Daty */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Startdatum *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enddatum *
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Czasy */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Startzeit *
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endzeit *
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Godziny tygodniowe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wochenstunden *
              </label>
              <input
                type="number"
                name="weeklyHours"
                value={formData.weeklyHours}
                onChange={handleChange}
                required
                min="1"
                max="60"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Notatki */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notizen
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                maxLength={500}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Zusätzliche Informationen..."
              />
            </div>

            {/* Przyciski */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {isLoading ? 'Speichert...' : 'Speichern'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
