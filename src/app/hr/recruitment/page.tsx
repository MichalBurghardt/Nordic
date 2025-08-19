'use client';

import { useState, useEffect } from 'react';
import { FileText, Search, Users, CheckCircle } from 'lucide-react';

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  skills: string[];
  experience: string;
  status: 'applied' | 'screening' | 'interview' | 'hired' | 'rejected';
  appliedDate: string;
  position: string;
}

export default function RecruitmentPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Tymczasowe dane - później można podłączyć do API
    const mockCandidates: Candidate[] = [
      {
        id: '1',
        firstName: 'Max',
        lastName: 'Mustermann',
        email: 'max.mustermann@email.de',
        phone: '+49 30 12345678',
        skills: ['Staplerfahrer', 'Lagerarbeit', 'Logistik'],
        experience: '5 Jahre Lagererfahrung',
        status: 'applied',
        appliedDate: '2025-08-15',
        position: 'Lagerarbeiter'
      },
      {
        id: '2',
        firstName: 'Anna',
        lastName: 'Schmidt',
        email: 'anna.schmidt@email.de',
        phone: '+49 40 87654321',
        skills: ['Montage', 'Qualitätskontrolle', 'Maschinenbedienung'],
        experience: '3 Jahre Produktion',
        status: 'interview',
        appliedDate: '2025-08-12',
        position: 'Montagehelfer'
      },
      {
        id: '3',
        firstName: 'Thomas',
        lastName: 'Weber',
        email: 'thomas.weber@email.de',
        phone: '+49 89 11223344',
        skills: ['IT-Support', 'Netzwerk', 'Hardware'],
        experience: '4 Jahre IT-Erfahrung',
        status: 'screening',
        appliedDate: '2025-08-10',
        position: 'IT-Techniker'
      },
      {
        id: '4',
        firstName: 'Lisa',
        lastName: 'Mueller',
        email: 'lisa.mueller@email.de',
        phone: '+49 69 55667788',
        skills: ['Kommunikation', 'Kundenservice', 'Administration'],
        experience: '2 Jahre Büroerfahrung',
        status: 'hired',
        appliedDate: '2025-08-08',
        position: 'Büroassistenz'
      }
    ];

    setCandidates(mockCandidates);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'screening': return 'bg-yellow-100 text-yellow-800';
      case 'interview': return 'bg-purple-100 text-purple-800';
      case 'hired': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'applied': return 'Bewerbung eingegangen';
      case 'screening': return 'In Prüfung';
      case 'interview': return 'Gespräch geplant';
      case 'hired': return 'Eingestellt';
      case 'rejected': return 'Abgelehnt';
      default: return status;
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    if (filter !== 'all' && candidate.status !== filter) return false;
    if (searchTerm && !`${candidate.firstName} ${candidate.lastName} ${candidate.position}`.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ładowanie kandydatów...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Rekrutierung & Bewerbermanagement</h1>
        <p className="text-gray-600 mt-2">
          Verwalten Sie Bewerbungen und den Einstellungsprozess
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Neue Bewerbungen</p>
              <p className="text-2xl font-bold text-gray-900">{candidates.filter(c => c.status === 'applied').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <Search className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Prüfung</p>
              <p className="text-2xl font-bold text-gray-900">{candidates.filter(c => c.status === 'screening').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Gespräche</p>
              <p className="text-2xl font-bold text-gray-900">{candidates.filter(c => c.status === 'interview').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Eingestellt</p>
              <p className="text-2xl font-bold text-gray-900">{candidates.filter(c => c.status === 'hired').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Nach Namen oder Position suchen..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Alle Status</option>
              <option value="applied">Neue Bewerbungen</option>
              <option value="screening">In Prüfung</option>
              <option value="interview">Gespräche</option>
              <option value="hired">Eingestellt</option>
              <option value="rejected">Abgelehnt</option>
            </select>
            <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
              + Neue Bewerbung
            </button>
          </div>
        </div>
      </div>

      {/* Candidates List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kandidat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fähigkeiten
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bewerbungsdatum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCandidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {candidate.firstName} {candidate.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{candidate.email}</div>
                      <div className="text-sm text-gray-500">{candidate.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{candidate.position}</div>
                    <div className="text-sm text-gray-500">{candidate.experience}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(candidate.status)}`}>
                      {getStatusText(candidate.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(candidate.appliedDate).toLocaleDateString('de-DE')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button className="text-green-600 hover:text-green-900">
                        Bearbeiten
                      </button>
                      <button className="text-blue-600 hover:text-blue-900">
                        Kontakt
                      </button>
                      <button className="text-purple-600 hover:text-purple-900">
                        Gespräch
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredCandidates.length === 0 && (
        <div className="text-center py-12">
          <span className="text-6xl">🔍</span>
          <h3 className="text-lg font-medium text-gray-900 mt-4">Keine Kandidaten gefunden</h3>
          <p className="text-gray-500 mt-2">Versuchen Sie andere Suchkriterien oder Filter.</p>
        </div>
      )}
    </div>
  );
}
