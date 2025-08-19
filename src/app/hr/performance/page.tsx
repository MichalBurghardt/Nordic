'use client';

import { useState, useEffect } from 'react';

interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  position: string;
  period: string;
  status: 'draft' | 'in-progress' | 'completed' | 'overdue';
  overallRating: number;
  goals: {
    id: string;
    title: string;
    description: string;
    target: string;
    achieved: string;
    rating: number;
  }[];
  competencies: {
    id: string;
    name: string;
    rating: number;
    comment: string;
  }[];
  nextReviewDate: string;
  lastUpdated: string;
}

interface GoalTracking {
  id: string;
  employeeId: string;
  employeeName: string;
  title: string;
  description: string;
  targetDate: string;
  progress: number;
  status: 'on-track' | 'at-risk' | 'delayed' | 'completed';
}

export default function PerformancePage() {
  const [activeTab, setActiveTab] = useState<'reviews' | 'goals'>('reviews');
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [goals, setGoals] = useState<GoalTracking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tymczasowe dane - później można podłączyć do API
    const mockReviews: PerformanceReview[] = [
      {
        id: '1',
        employeeId: 'emp1',
        employeeName: 'Max Mustermann',
        position: 'Lagerarbeiter',
        period: 'Q3 2024',
        status: 'completed',
        overallRating: 4.2,
        goals: [
          {
            id: 'g1',
            title: 'Produktivität steigern',
            description: 'Kommissionierungszeit um 15% reduzieren',
            target: '15% Verbesserung',
            achieved: '18% Verbesserung',
            rating: 5
          },
          {
            id: 'g2',
            title: 'Sicherheit verbessern',
            description: 'Unfallfreie Arbeitszeit erreichen',
            target: '0 Unfälle',
            achieved: '0 Unfälle',
            rating: 5
          }
        ],
        competencies: [
          { id: 'c1', name: 'Teamarbeit', rating: 4, comment: 'Sehr kooperativ' },
          { id: 'c2', name: 'Zuverlässigkeit', rating: 5, comment: 'Immer pünktlich' },
          { id: 'c3', name: 'Qualität', rating: 4, comment: 'Sorgfältige Arbeit' }
        ],
        nextReviewDate: '2025-01-15',
        lastUpdated: '2024-12-15'
      },
      {
        id: '2',
        employeeId: 'emp2',
        employeeName: 'Anna Schmidt',
        position: 'Montagehelfer',
        period: 'Q3 2024',
        status: 'in-progress',
        overallRating: 3.8,
        goals: [
          {
            id: 'g3',
            title: 'Qualifikation erweitern',
            description: 'Maschinenbedienung erlernen',
            target: 'Zertifikat erhalten',
            achieved: 'Kurs begonnen',
            rating: 3
          }
        ],
        competencies: [
          { id: 'c4', name: 'Lernbereitschaft', rating: 5, comment: 'Sehr motiviert' },
          { id: 'c5', name: 'Genauigkeit', rating: 4, comment: 'Präzise Arbeitsweise' }
        ],
        nextReviewDate: '2025-02-01',
        lastUpdated: '2024-12-10'
      }
    ];

    const mockGoals: GoalTracking[] = [
      {
        id: 'gt1',
        employeeId: 'emp1',
        employeeName: 'Max Mustermann',
        title: 'Staplerführerschein erneuern',
        description: 'Auffrischungskurs für Gabelstaplerfahrer absolvieren',
        targetDate: '2025-03-31',
        progress: 60,
        status: 'on-track'
      },
      {
        id: 'gt2',
        employeeId: 'emp2',
        employeeName: 'Anna Schmidt',
        title: 'Erste-Hilfe-Kurs',
        description: 'Erste-Hilfe-Ausbildung für Betriebssanitäter',
        targetDate: '2025-02-15',
        progress: 25,
        status: 'at-risk'
      },
      {
        id: 'gt3',
        employeeId: 'emp3',
        employeeName: 'Thomas Weber',
        title: 'IT-Zertifizierung',
        description: 'Microsoft Azure Fundamentals Zertifikat',
        targetDate: '2025-04-30',
        progress: 90,
        status: 'on-track'
      }
    ];

    setReviews(mockReviews);
    setGoals(mockGoals);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'on-track': return 'bg-green-100 text-green-800';
      case 'at-risk': return 'bg-yellow-100 text-yellow-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Abgeschlossen';
      case 'in-progress': return 'In Bearbeitung';
      case 'draft': return 'Entwurf';
      case 'overdue': return 'Überfällig';
      case 'on-track': return 'Im Plan';
      case 'at-risk': return 'Gefährdet';
      case 'delayed': return 'Verzögert';
      default: return status;
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ⭐
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ładowanie danych wydajności...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Performance Management</h1>
        <p className="text-gray-600 mt-2">
          Bewertungen, Ziele und Leistungsentwicklung verwalten
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Abgeschlossene Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{reviews.filter(r => r.status === 'completed').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <span className="text-2xl">📝</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Laufende Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{reviews.filter(r => r.status === 'in-progress').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aktive Ziele</p>
              <p className="text-2xl font-bold text-gray-900">{goals.filter(g => g.status !== 'completed').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <span className="text-2xl">⭐</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ø Bewertung</p>
              <p className="text-2xl font-bold text-gray-900">
                {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.overallRating, 0) / reviews.length).toFixed(1) : '0.0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reviews'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Performance Reviews
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'goals'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Ziele & Entwicklung
          </button>
        </nav>
      </div>

      {/* Performance Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Performance Reviews</h2>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              + Neues Review
            </button>
          </div>

          <div className="grid gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{review.employeeName}</h3>
                    <p className="text-sm text-gray-600">{review.position} • {review.period}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(review.status)}`}>
                      {getStatusText(review.status)}
                    </span>
                    <div className="mt-2 flex items-center">
                      <span className="text-sm text-gray-600 mr-2">Gesamtbewertung:</span>
                      <div className="flex">{getRatingStars(Math.round(review.overallRating))}</div>
                      <span className="ml-2 text-sm font-medium">{review.overallRating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Ziele</h4>
                    <div className="space-y-2">
                      {review.goals.map((goal) => (
                        <div key={goal.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{goal.title}</p>
                              <p className="text-xs text-gray-600 mt-1">{goal.description}</p>
                              <div className="mt-2 text-xs">
                                <span className="text-gray-500">Ziel: </span>
                                <span>{goal.target}</span>
                                <br />
                                <span className="text-gray-500">Erreicht: </span>
                                <span>{goal.achieved}</span>
                              </div>
                            </div>
                            <div className="flex ml-2">
                              {getRatingStars(goal.rating)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Kompetenzen</h4>
                    <div className="space-y-2">
                      {review.competencies.map((competency) => (
                        <div key={competency.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{competency.name}</p>
                              <p className="text-xs text-gray-600 mt-1">{competency.comment}</p>
                            </div>
                            <div className="flex ml-2">
                              {getRatingStars(competency.rating)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-sm text-gray-600">
                  <span>Nächstes Review: {new Date(review.nextReviewDate).toLocaleDateString('de-DE')}</span>
                  <span>Zuletzt aktualisiert: {new Date(review.lastUpdated).toLocaleDateString('de-DE')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Ziele & Entwicklung</h2>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              + Neues Ziel
            </button>
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
                      Ziel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fortschritt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zieldatum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {goals.map((goal) => (
                    <tr key={goal.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{goal.employeeName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{goal.title}</div>
                        <div className="text-sm text-gray-500">{goal.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${goal.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{goal.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(goal.status)}`}>
                          {getStatusText(goal.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(goal.targetDate).toLocaleDateString('de-DE')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button className="text-green-600 hover:text-green-900">
                            Bearbeiten
                          </button>
                          <button className="text-blue-600 hover:text-blue-900">
                            Update
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
    </div>
  );
}
