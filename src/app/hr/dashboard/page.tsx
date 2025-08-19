'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Target, 
  Briefcase, 
  TrendingUp,
  Calendar,
  UserPlus,
  FileText,
  BarChart3,
  Award,
  Clock
} from 'lucide-react';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'hr' | 'employee' | 'client';
}

interface HRStats {
  totalEmployees: number;
  activeEmployees: number;
  totalAssignments: number;
  activeAssignments: number;
  pendingAssignments: number;
  completedAssignments: number;
  totalClients: number;
  thisMonthHires: number;
  avgAssignmentDuration: number;
  topSkills: { skill: string; count: number }[];
}

export default function HRDashboardPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [stats, setStats] = useState<HRStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    totalAssignments: 0,
    activeAssignments: 0,
    pendingAssignments: 0,
    completedAssignments: 0,
    totalClients: 0,
    thisMonthHires: 0,
    avgAssignmentDuration: 0,
    topSkills: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user);
        }
      } catch (error) {
        console.error('Błąd pobierania użytkownika:', error);
      }
    };

    const getHRStats = async () => {
      try {
        // Dla teraz używamy endpoint z admin, potem możemy utworzyć dedykowany HR endpoint
        const response = await fetch('/api/dashboard/stats', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          // Mapuj dane admin na dane HR
          setStats({
            totalEmployees: data.stats.totalEmployees || 0,
            activeEmployees: Math.floor((data.stats.totalEmployees || 0) * 0.85), // Przybliżenie
            totalAssignments: data.stats.totalAssignments || 0,
            activeAssignments: data.stats.activeAssignments || 0,
            pendingAssignments: Math.floor((data.stats.totalAssignments || 0) * 0.2),
            completedAssignments: Math.floor((data.stats.totalAssignments || 0) * 0.6),
            totalClients: data.stats.totalClients || 0,
            thisMonthHires: Math.floor(Math.random() * 15) + 5, // Tymczasowe
            avgAssignmentDuration: 90, // Tymczasowe
            topSkills: [
              { skill: 'Lagerarbeit', count: 45 },
              { skill: 'Staplerfahrer', count: 32 },
              { skill: 'Montage', count: 28 },
              { skill: 'Logistik', count: 25 },
              { skill: 'Kommissionierung', count: 22 }
            ] // Tymczasowe
          });
        }
      } catch (error) {
        console.error('Błąd pobierania statystyk HR:', error);
      }
    };

    const loadData = async () => {
      await Promise.all([getCurrentUser(), getHRStats()]);
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ładowanie HR Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Błąd autoryzacji</h1>
          <p className="text-gray-600">Nie udało się załadować danych użytkownika.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Willkommen, {currentUser.firstName} {currentUser.lastName}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          HR Dashboard - Personalverwaltung & Recruitment
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Gesamt Mitarbeiter</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aktive Einsätze</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeAssignments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Wartende Einsätze</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingAssignments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <Briefcase className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Kunden</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Schnellaktionen</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/hr/employees" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="font-medium text-gray-900">Mitarbeiter verwalten</p>
                  <p className="text-sm text-gray-600">Profile, Fähigkeiten, Status</p>
                </div>
              </Link>
              <Link href="/hr/recruitment" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <UserPlus className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="font-medium text-gray-900">Rekrutierung</p>
                  <p className="text-sm text-gray-600">Neue Kandidaten, Bewerbungen</p>
                </div>
              </Link>
              <Link href="/hr/assignments" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <FileText className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="font-medium text-gray-900">Einsätze planen</p>
                  <p className="text-sm text-gray-600">Zuweisungen, Verträge</p>
                </div>
              </Link>
              <Link href="/hr/schedule" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <Calendar className="w-8 h-8 text-yellow-600" />
                  </div>
                  <p className="font-medium text-gray-900">Terminplan</p>
                  <p className="text-sm text-gray-600">Schichten, Urlaube</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Performance Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Leistungsübersicht</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Erfolgreich abgeschlossene Einsätze</span>
                <span className="font-semibold text-green-600">{stats.completedAssignments}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Durchschnittliche Einsatzdauer</span>
                <span className="font-semibold text-blue-600">{stats.avgAssignmentDuration} Tage</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Neueinstellungen diesen Monat</span>
                <span className="font-semibold text-purple-600">{stats.thisMonthHires}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Skills & Info */}
        <div className="space-y-6">
          {/* Top Skills */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Gefragte Fähigkeiten</h2>
            <div className="space-y-3">
              {stats.topSkills.map((skill, index) => (
                <div key={skill.skill} className="flex justify-between items-center">
                  <span className="text-gray-700">{index + 1}. {skill.skill}</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                    {skill.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Weitere Optionen</h2>
            <div className="space-y-3">
              <Link href="/hr/performance" className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Leistungsanalyse</p>
                    <p className="text-sm text-gray-600">Mitarbeiter Performance</p>
                  </div>
                </div>
              </Link>
              <Link href="/hr/training" className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <Award className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Schulungen</p>
                    <p className="text-sm text-gray-600">Weiterbildungsplan</p>
                  </div>
                </div>
              </Link>
              <Link href="/hr/reports" className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <BarChart3 className="w-5 h-5 text-purple-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Berichte</p>
                    <p className="text-sm text-gray-600">HR Analytics</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
