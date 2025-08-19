'use client';

import { useState, useEffect, useCallback } from 'react';
import { BarChart, TrendingUp, Calendar, DollarSign, Users, Clock, Download, FileText } from 'lucide-react';

interface ReportData {
  totalRevenue: number;
  totalHours: number;
  activeAssignments: number;
  completedAssignments: number;
  totalEmployees: number;
  totalClients: number;
  monthlyRevenue: Array<{ month: string; revenue: number; hours: number }>;
  topClients: Array<{ companyName: string; revenue: number; assignments: number }>;
  employeePerformance: Array<{ 
    name: string; 
    hours: number; 
    revenue: number; 
    assignments: number;
  }>;
}

export default function ReportsManagement() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('last-30-days');

  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/reports?range=${dateRange}`);
      const data = await response.json();

      if (data.success) {
        setReportData(data.reportData);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const downloadReport = async (type: string) => {
    try {
      const response = await fetch(`/api/admin/reports/download?type=${type}&range=${dateRange}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${type}-${dateRange}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Ładowanie raportów...</span>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Nie udało się załadować danych raportów</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Berichte & Analysen</h1>
          <p className="text-gray-600">Przegląd wyników i statystyk biznesowych</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="last-7-days">Ostatnie 7 dni</option>
            <option value="last-30-days">Ostatnie 30 dni</option>
            <option value="last-3-months">Ostatnie 3 miesiące</option>
            <option value="last-year">Ostatni rok</option>
          </select>
          <button
            onClick={() => downloadReport('summary')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Eksport PDF
          </button>
        </div>
      </div>

      {/* Główne KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Całkowite przychody</p>
              <p className="text-2xl font-bold text-gray-900">
                €{(reportData.totalRevenue || 0).toLocaleString('de-DE')}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Przepracowane godziny</p>
              <p className="text-2xl font-bold text-gray-900">
                {(reportData.totalHours || 0).toLocaleString('de-DE')}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktywne einsätze</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.activeAssignments}</p>
            </div>
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <BarChart className="w-4 h-4 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktywni pracownicy</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.totalEmployees}</p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Miesięczne przychody */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Miesięczne przychody</h3>
          <TrendingUp className="w-5 h-5 text-green-600" />
        </div>
        <div className="space-y-4">
          {reportData.monthlyRevenue.map((month, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-900">{month.month}</span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  €{(month.revenue || 0).toLocaleString('de-DE')}
                </div>
                <div className="text-sm text-gray-600">{month.hours || 0}h</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top klienci i pracownicy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top klienci */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Najlepsi klienci</h3>
          <div className="space-y-4">
            {reportData.topClients.map((client, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{client.companyName}</div>
                  <div className="text-sm text-gray-600">{client.assignments || 0} einsätze</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">
                    €{(client.revenue || 0).toLocaleString('de-DE')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top pracownicy */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Najlepsi pracownicy</h3>
          <div className="space-y-4">
            {reportData.employeePerformance.map((employee, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{employee.name}</div>
                  <div className="text-sm text-gray-600">
                    {employee.hours || 0}h • {employee.assignments || 0} einsätze
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-blue-600">
                    €{(employee.revenue || 0).toLocaleString('de-DE')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Szybkie akcje */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Szybkie eksporty</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => downloadReport('revenue')}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <FileText className="w-5 h-5 text-blue-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Raport przychodów</div>
              <div className="text-sm text-gray-600">Szczegółowy breakdown</div>
            </div>
          </button>

          <button
            onClick={() => downloadReport('employees')}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <Users className="w-5 h-5 text-green-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Raport pracowników</div>
              <div className="text-sm text-gray-600">Wydajność i statystyki</div>
            </div>
          </button>

          <button
            onClick={() => downloadReport('clients')}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <BarChart className="w-5 h-5 text-orange-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Raport klientów</div>
              <div className="text-sm text-gray-600">Analiza współpracy</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
