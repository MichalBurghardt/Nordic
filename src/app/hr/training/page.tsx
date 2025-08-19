'use client';

import { useState, useEffect } from 'react';

interface Training {
  id: string;
  title: string;
  description: string;
  category: 'safety' | 'technical' | 'compliance' | 'soft-skills' | 'leadership';
  instructor: string;
  duration: string;
  maxParticipants: number;
  currentParticipants: number;
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  location: string;
  cost: number;
  mandatory: boolean;
}

interface TrainingRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  position: string;
  trainingId: string;
  trainingTitle: string;
  completionDate: string;
  score: number;
  certificate: boolean;
  validUntil?: string;
}

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState<'trainings' | 'records' | 'calendar'>('trainings');
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [records, setRecords] = useState<TrainingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    // Tymczasowe dane
    const mockTrainings: Training[] = [
      {
        id: '1',
        title: 'Arbeitssicherheit Grundschulung',
        description: 'Grundlagen der Arbeitssicherheit und Unfallverhütung',
        category: 'safety',
        instructor: 'Hans Mueller (Sicherheitsingenieur)',
        duration: '4 Stunden',
        maxParticipants: 15,
        currentParticipants: 8,
        status: 'planned',
        startDate: '2025-09-15',
        endDate: '2025-09-15',
        location: 'Schulungsraum A',
        cost: 150,
        mandatory: true
      },
      {
        id: '2',
        title: 'Gabelstaplerführerschein',
        description: 'Ausbildung zum Gabelstaplerfahrer nach DGUV',
        category: 'technical',
        instructor: 'Peter Schmidt (Fahrlehrer)',
        duration: '16 Stunden (2 Tage)',
        maxParticipants: 8,
        currentParticipants: 6,
        status: 'ongoing',
        startDate: '2025-08-20',
        endDate: '2025-08-21',
        location: 'Lagerhalle + Fahrschule',
        cost: 350,
        mandatory: false
      },
      {
        id: '3',
        title: 'DSGVO Schulung',
        description: 'Datenschutz-Grundverordnung für Mitarbeiter',
        category: 'compliance',
        instructor: 'Dr. Lisa Weber (Rechtsanwältin)',
        duration: '3 Stunden',
        maxParticipants: 20,
        currentParticipants: 20,
        status: 'completed',
        startDate: '2025-07-10',
        endDate: '2025-07-10',
        location: 'Online (Teams)',
        cost: 75,
        mandatory: true
      },
      {
        id: '4',
        title: 'Kommunikation & Teamwork',
        description: 'Soft Skills für bessere Zusammenarbeit',
        category: 'soft-skills',
        instructor: 'Maria Kowalski (Coach)',
        duration: '6 Stunden',
        maxParticipants: 12,
        currentParticipants: 4,
        status: 'planned',
        startDate: '2025-10-05',
        endDate: '2025-10-05',
        location: 'Konferenzraum',
        cost: 200,
        mandatory: false
      }
    ];

    const mockRecords: TrainingRecord[] = [
      {
        id: '1',
        employeeId: 'emp1',
        employeeName: 'Max Mustermann',
        position: 'Lagerarbeiter',
        trainingId: '3',
        trainingTitle: 'DSGVO Schulung',
        completionDate: '2025-07-10',
        score: 95,
        certificate: true,
        validUntil: '2026-07-10'
      },
      {
        id: '2',
        employeeId: 'emp2',
        employeeName: 'Anna Schmidt',
        position: 'Montagehelfer',
        trainingId: '3',
        trainingTitle: 'DSGVO Schulung',
        completionDate: '2025-07-10',
        score: 88,
        certificate: true,
        validUntil: '2026-07-10'
      },
      {
        id: '3',
        employeeId: 'emp1',
        employeeName: 'Max Mustermann',
        position: 'Lagerarbeiter',
        trainingId: '2',
        trainingTitle: 'Gabelstaplerführerschein',
        completionDate: '2024-06-15',
        score: 92,
        certificate: true,
        validUntil: '2027-06-15'
      }
    ];

    setTrainings(mockTrainings);
    setRecords(mockRecords);
    setLoading(false);
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'safety': return 'bg-red-100 text-red-800';
      case 'technical': return 'bg-blue-100 text-blue-800';
      case 'compliance': return 'bg-purple-100 text-purple-800';
      case 'soft-skills': return 'bg-green-100 text-green-800';
      case 'leadership': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'safety': return 'Sicherheit';
      case 'technical': return 'Technik';
      case 'compliance': return 'Compliance';
      case 'soft-skills': return 'Soft Skills';
      case 'leadership': return 'Führung';
      default: return category;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planned': return 'Geplant';
      case 'ongoing': return 'Laufend';
      case 'completed': return 'Abgeschlossen';
      case 'cancelled': return 'Abgesagt';
      default: return status;
    }
  };

  const filteredTrainings = trainings.filter(training => {
    if (filter === 'all') return true;
    if (filter === 'mandatory') return training.mandatory;
    if (filter === 'upcoming') return training.status === 'planned';
    if (filter === 'ongoing') return training.status === 'ongoing';
    return training.category === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ładowanie szkoleń...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Schulungs- & Weiterbildungsmanagement</h1>
        <p className="text-gray-600 mt-2">
          Planen, verwalten und verfolgen Sie Mitarbeiterschulungen
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <span className="text-2xl">📚</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Geplante Schulungen</p>
              <p className="text-2xl font-bold text-gray-900">{trainings.filter(t => t.status === 'planned').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <span className="text-2xl">🏃</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Laufende Schulungen</p>
              <p className="text-2xl font-bold text-gray-900">{trainings.filter(t => t.status === 'ongoing').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Abgeschlossene Schulungen</p>
              <p className="text-2xl font-bold text-gray-900">{trainings.filter(t => t.status === 'completed').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <span className="text-2xl">🎓</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Zertifikate erhalten</p>
              <p className="text-2xl font-bold text-gray-900">{records.filter(r => r.certificate).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('trainings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'trainings'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Schulungen
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'records'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Teilnahme-Protokoll
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'calendar'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Schulungskalender
          </button>
        </nav>
      </div>

      {/* Trainings Tab */}
      {activeTab === 'trainings' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex gap-2">
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">Alle Schulungen</option>
                <option value="mandatory">Pflichtschulungen</option>
                <option value="upcoming">Kommende Schulungen</option>
                <option value="ongoing">Laufende Schulungen</option>
                <option value="safety">Sicherheit</option>
                <option value="technical">Technik</option>
                <option value="compliance">Compliance</option>
                <option value="soft-skills">Soft Skills</option>
              </select>
            </div>
            <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
              + Neue Schulung
            </button>
          </div>

          <div className="grid gap-6">
            {filteredTrainings.map((training) => (
              <div key={training.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{training.title}</h3>
                      {training.mandatory && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                          Pflicht
                        </span>
                      )}
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(training.category)}`}>
                        {getCategoryText(training.category)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{training.description}</p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p><strong>Dozent:</strong> {training.instructor}</p>
                        <p><strong>Dauer:</strong> {training.duration}</p>
                        <p><strong>Ort:</strong> {training.location}</p>
                      </div>
                      <div>
                        <p><strong>Datum:</strong> {new Date(training.startDate).toLocaleDateString('de-DE')} - {new Date(training.endDate).toLocaleDateString('de-DE')}</p>
                        <p><strong>Teilnehmer:</strong> {training.currentParticipants}/{training.maxParticipants}</p>
                        <p><strong>Kosten:</strong> €{training.cost}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(training.status)}`}>
                      {getStatusText(training.status)}
                    </span>
                    <div className="mt-4 space-y-2">
                      <button className="block w-full bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                        Bearbeiten
                      </button>
                      <button className="block w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                        Teilnehmer
                      </button>
                    </div>
                  </div>
                </div>

                {/* Progress bar for participants */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Anmeldungen</span>
                    <span>{training.currentParticipants} von {training.maxParticipants}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(training.currentParticipants / training.maxParticipants) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Records Tab */}
      {activeTab === 'records' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Teilnahme-Protokoll</h2>
            <div className="flex gap-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Export Excel
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                + Manueller Eintrag
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mitarbeiter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Schulung
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Abschlussdatum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bewertung
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zertifikat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gültig bis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{record.employeeName}</div>
                          <div className="text-sm text-gray-500">{record.position}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{record.trainingTitle}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(record.completionDate).toLocaleDateString('de-DE')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900 mr-2">{record.score}%</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${record.score >= 80 ? 'bg-green-500' : record.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${record.score}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.certificate ? (
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            ✓ Erhalten
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                            ✗ Nicht erhalten
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.validUntil ? new Date(record.validUntil).toLocaleDateString('de-DE') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button className="text-green-600 hover:text-green-900">
                            Zertifikat
                          </button>
                          <button className="text-blue-600 hover:text-blue-900">
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Schulungskalender</h2>
            <div className="flex gap-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Monatsansicht
              </button>
              <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                Listenansicht
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12">
              <span className="text-6xl">📅</span>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Kalenderansicht</h3>
              <p className="text-gray-500 mt-2">Hier wird der interaktive Schulungskalender angezeigt.</p>
              <p className="text-sm text-gray-400 mt-2">Integration mit Kalenderbibliothek erforderlich</p>
            </div>
          </div>

          {/* Upcoming Trainings List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Kommende Schulungen</h3>
            <div className="space-y-3">
              {trainings.filter(t => t.status === 'planned').map((training) => (
                <div key={training.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{training.title}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(training.startDate).toLocaleDateString('de-DE')} • {training.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{training.currentParticipants}/{training.maxParticipants} Teilnehmer</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(training.category)}`}>
                      {getCategoryText(training.category)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
