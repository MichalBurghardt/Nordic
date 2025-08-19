'use client';

import React from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

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

interface Assignment {
  _id: string;
  clientId: {
    _id: string;
    name: string;
  };
  employeeId: {
    _id: string;
    employeeId: string;
    userId: {
      _id: string;
      firstName: string;
      lastName: string;
    };
  };
  position: string;
  startDate: string;
  endDate: string;
  workLocation: string;
  hourlyRate: number;
  maxHours: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'paused';
}

interface DayDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNew: () => void;
  onEditSchedule: (schedule: Schedule) => void;
  selectedDate: Date | null;
  schedules: Schedule[];
  assignments: Assignment[];
}

export default function DayDetailsModal({
  isOpen,
  onClose,
  onCreateNew,
  onEditSchedule,
  selectedDate,
  schedules,
  assignments
}: DayDetailsModalProps) {
  if (!isOpen || !selectedDate) return null;

  const calculateHours = (startTime: string, endTime: string) => {
    const start = parseInt(startTime.split(':')[0]);
    const end = parseInt(endTime.split(':')[0]);
    let hours = end - start;
    if (hours <= 0) hours += 24; // Handle overnight shifts
    return hours;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'active': return 'bg-green-100 border-green-300 text-green-800';
      case 'completed': return 'bg-gray-100 border-gray-300 text-gray-800';
      case 'cancelled': return 'bg-red-100 border-red-300 text-red-800';
      case 'pending': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'paused': return 'bg-purple-100 border-purple-300 text-purple-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">
                {format(selectedDate, 'EEEE, d. MMMM yyyy', { locale: de })}
              </h2>
              <p className="text-indigo-100 mt-1">
                {schedules.length} Harmonogramy • {assignments.length} Zlecenia
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Harmonogramy */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  📅 Harmonogramy ({schedules.length})
                </h3>
                <button
                  onClick={onCreateNew}
                  className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
                >
                  + Nowy
                </button>
              </div>
              
              <div className="space-y-3">
                {schedules.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">
                    <div className="text-4xl mb-2">📅</div>
                    <p>Brak harmonogramów na ten dzień</p>
                  </div>
                ) : (
                  schedules.map((schedule) => (
                    <div
                      key={schedule._id}
                      className={`p-4 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-shadow ${getStatusColor(schedule.status || 'planned')}`}
                      onClick={() => onEditSchedule(schedule)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold">
                            {schedule.employeeId.userId.firstName} {schedule.employeeId.userId.lastName}
                          </div>
                          <div className="text-sm opacity-75">
                            ID: {schedule.employeeId.employeeId}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {schedule.startTime} - {schedule.endTime}
                          </div>
                          <div className="text-sm opacity-75">
                            {calculateHours(schedule.startTime, schedule.endTime)}h
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-sm font-medium mb-1">
                        🏢 {schedule.clientId.nordicClientNumber} - {schedule.clientId.name}
                      </div>
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className="px-2 py-1 rounded-full bg-white bg-opacity-50">
                          {(schedule.status || 'planned').toUpperCase()}
                        </span>
                        <span>
                          📊 {schedule.weeklyHours}h/Woche
                        </span>
                      </div>
                      
                      {schedule.notes && (
                        <div className="mt-2 text-xs opacity-75">
                          💬 {schedule.notes}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Zlecenia */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📋 Zlecenia ({assignments.length})
              </h3>
              
              <div className="space-y-3">
                {assignments.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">
                    <div className="text-4xl mb-2">📋</div>
                    <p>Brak zleceń na ten dzień</p>
                  </div>
                ) : (
                  assignments.map((assignment) => (
                    <div
                      key={assignment._id}
                      className={`p-4 rounded-lg border-l-4 ${getStatusColor(assignment.status)}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold">
                            {assignment.employeeId.userId.firstName} {assignment.employeeId.userId.lastName}
                          </div>
                          <div className="text-sm opacity-75">
                            ID: {assignment.employeeId.employeeId}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {assignment.hourlyRate}€/h
                          </div>
                          <div className="text-sm opacity-75">
                            Max {assignment.maxHours}h
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-sm font-medium mb-1">
                        🏢 {assignment.clientId.name}
                      </div>
                      
                      <div className="text-sm mb-2">
                        👨‍💼 {assignment.position}
                      </div>
                      
                      <div className="text-sm opacity-75 mb-2">
                        📍 {assignment.workLocation}
                      </div>
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className="px-2 py-1 rounded-full bg-white bg-opacity-50">
                          {assignment.status.toUpperCase()}
                        </span>
                        <span>
                          📅 {format(new Date(assignment.startDate), 'dd.MM')} - {format(new Date(assignment.endDate), 'dd.MM')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Kliknij na harmonogram aby go edytować
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onCreateNew}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              + Dodaj harmonogram
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Zamknij
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
