'use client';

import { useState, useEffect } from 'react';

interface HRMetrics {
  totalEmployees: number;
  newHires: number;
  turnoverRate: number;
  averageTenure: number;
  trainingHours: number;
  satisfactionScore: number;
  absenteeismRate: number;
  recruitmentCost: number;
}

interface DepartmentData {
  name: string;
  employees: number;
  turnover: number;
  satisfaction: number;
  productivity: number;
}

interface TurnoverData {
  month: string;
  hired: number;
  left: number;
  total: number;
}

export default function ReportsPage() {
  const [metrics, setMetrics] = useState<HRMetrics | null>(null);
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [turnoverData, setTurnoverData] = useState<TurnoverData[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<'overview' | 'turnover' | 'performance' | 'training'>('overview');

  useEffect(() => {
    // Tymczasowe dane - później można podłączyć do API
    const mockMetrics: HRMetrics = {
      totalEmployees: 245,
      newHires: 12,
      turnoverRate: 8.5,
      averageTenure: 3.2,
      trainingHours: 1240,
      satisfactionScore: 7.8,
      absenteeismRate: 3.2,
      recruitmentCost: 15600
    };

    const mockDepartments: DepartmentData[] = [
      { name: 'Lager & Logistik', employees: 85, turnover: 12.3, satisfaction: 7.5, productivity: 92 },
      { name: 'Produktion', employees: 95, turnover: 6.8, satisfaction: 8.1, productivity: 95 },
      { name: 'Administration', employees: 35, turnover: 5.2, satisfaction: 8.3, productivity: 88 },
      { name: 'IT & Technik', employees: 18, turnover: 15.6, satisfaction: 7.9, productivity: 91 },
      { name: 'Vertrieb', employees: 12, turnover: 8.9, satisfaction: 8.0, productivity: 94 }
    ];

    const mockTurnoverData: TurnoverData[] = [
      { month: 'Jan 2024', hired: 8, left: 3, total: 240 },
      { month: 'Feb 2024', hired: 5, left: 2, total: 243 },
      { month: 'Mar 2024', hired: 7, left: 4, total: 246 },
      { month: 'Apr 2024', hired: 6, left: 1, total: 251 },
      { month: 'May 2024', hired: 4, left: 5, total: 250 },
      { month: 'Jun 2024', hired: 9, left: 2, total: 257 },
      { month: 'Jul 2024', hired: 3, left: 6, total: 254 },
      { month: 'Aug 2024', hired: 12, left: 4, total: 262 }
    ];

    setMetrics(mockMetrics);
    setDepartments(mockDepartments);
    setTurnoverData(mockTurnoverData);
    setLoading(false);
  }, []);

  const exportReport = (format: 'pdf' | 'excel') => {
    // Placeholder for export functionality
    alert(`Export als ${format.toUpperCase()} wird vorbereitet...`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ładowanie raportów...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">HR Analytics & Reports</h1>
        <p className="text-gray-600 mt-2">
          Umfassende Berichte und Kennzahlen für das Personalmanagement
        </p>
      </div>

      {/* Report Type Selector */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setReportType('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              reportType === 'overview'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Übersicht
          </button>
          <button
            onClick={() => setReportType('turnover')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              reportType === 'turnover'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Fluktuation
          </button>
          <button
            onClick={() => setReportType('performance')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              reportType === 'performance'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Leistung
          </button>
          <button
            onClick={() => setReportType('training')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              reportType === 'training'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Schulungen
          </button>
        </nav>
      </div>

      {/* Export Actions */}
      <div className="mb-6 flex justify-end gap-2">
        <button
          onClick={() => exportReport('excel')}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          📊 Excel Export
        </button>
        <button
          onClick={() => exportReport('pdf')}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          📄 PDF Export
        </button>
      </div>

      {/* Overview Tab */}
      {reportType === 'overview' && metrics && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Gesamtmitarbeiter</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.totalEmployees}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <span className="text-2xl">📈</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Neue Einstellungen</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.newHires}</p>
                  <p className="text-xs text-green-600">letzten 30 Tage</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100">
                  <span className="text-2xl">🔄</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Fluktuationsrate</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.turnoverRate}%</p>
                  <p className="text-xs text-yellow-600">jährlich</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <span className="text-2xl">😊</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Zufriedenheit</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.satisfactionScore}/10</p>
                  <p className="text-xs text-purple-600">letzte Umfrage</p>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Durchschnittliche Betriebszugehörigkeit</h3>
              <p className="text-xl font-bold text-gray-900">{metrics.averageTenure} Jahre</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Schulungsstunden (YTD)</h3>
              <p className="text-xl font-bold text-gray-900">{metrics.trainingHours.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Abwesenheitsrate</h3>
              <p className="text-xl font-bold text-gray-900">{metrics.absenteeismRate}%</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Rekrutierungskosten</h3>
              <p className="text-xl font-bold text-gray-900">€{metrics.recruitmentCost.toLocaleString()}</p>
            </div>
          </div>

          {/* Department Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Abteilungsübersicht</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Abteilung</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Mitarbeiter</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Fluktuation</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Zufriedenheit</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Produktivität</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium">{dept.name}</td>
                      <td className="py-3 px-4">{dept.employees}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          dept.turnover > 10 ? 'bg-red-100 text-red-800' : 
                          dept.turnover > 7 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {dept.turnover}%
                        </span>
                      </td>
                      <td className="py-3 px-4">{dept.satisfaction}/10</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${dept.productivity}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{dept.productivity}%</span>
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

      {/* Turnover Tab */}
      {reportType === 'turnover' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Fluktuationstrend</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Monat</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Einstellungen</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Abgänge</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Nettoänderung</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Gesamtmitarbeiter</th>
                  </tr>
                </thead>
                <tbody>
                  {turnoverData.map((data, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium">{data.month}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          +{data.hired}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                          -{data.left}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          data.hired - data.left > 0 ? 'bg-green-100 text-green-800' : 
                          data.hired - data.left < 0 ? 'bg-red-100 text-red-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {data.hired - data.left > 0 ? '+' : ''}{data.hired - data.left}
                        </span>
                      </td>
                      <td className="py-3 px-4">{data.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Abgangsgründe</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Bessere Bezahlung</span>
                  <span className="font-medium">35%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Karriereentwicklung</span>
                  <span className="font-medium">28%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Work-Life-Balance</span>
                  <span className="font-medium">20%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Standortwechsel</span>
                  <span className="font-medium">12%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Sonstiges</span>
                  <span className="font-medium">5%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Kritische Positionen</h3>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="font-medium text-red-800">IT-Techniker</p>
                  <p className="text-sm text-red-600">Hohe Fluktuation (25%) - Schwer zu ersetzen</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="font-medium text-yellow-800">Staplerfahrer</p>
                  <p className="text-sm text-yellow-600">Mittlere Fluktuation (15%) - Zertifikat erforderlich</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-800">Teamleiter Produktion</p>
                  <p className="text-sm text-blue-600">Niedrige Fluktuation (5%) - Stabile Position</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {reportType === 'performance' && (
        <div className="space-y-6">
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <span className="text-6xl">📊</span>
            <h3 className="text-lg font-medium text-gray-900 mt-4">Leistungsberichte</h3>
            <p className="text-gray-500 mt-2">Detaillierte Performance-Analysen und Bewertungsberichte</p>
            <p className="text-sm text-gray-400 mt-2">Erweiterter Bericht in Entwicklung</p>
          </div>
        </div>
      )}

      {/* Training Tab */}
      {reportType === 'training' && (
        <div className="space-y-6">
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <span className="text-6xl">🎓</span>
            <h3 className="text-lg font-medium text-gray-900 mt-4">Schulungsberichte</h3>
            <p className="text-gray-500 mt-2">Umfassende Analysen zu Schulungen und Weiterbildungen</p>
            <p className="text-sm text-gray-400 mt-2">Erweiterter Bericht in Entwicklung</p>
          </div>
        </div>
      )}
    </div>
  );
}
