'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminPageContainer from '@/components/AdminPageContainer';

interface Employee {
  _id: string;
  userId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  employeeId: string;
  skills: string[];
  qualifications: string[];
  hourlyRate: number;
  status: string;
  experience: string;
}

export default function EditEmployee() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    hourlyRate: 0,
    skills: [] as string[],
    qualifications: [] as string[],
    experience: '',
    status: 'available'
  });

  const [newSkill, setNewSkill] = useState('');
  const [newQualification, setNewQualification] = useState('');

  // Load employee data
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/employees/${employeeId}`);
        const data = await response.json();

        if (data.success) {
          const emp = data.employee;
          setEmployee(emp);
          setFormData({
            firstName: emp.userId.firstName,
            lastName: emp.userId.lastName,
            email: emp.userId.email,
            hourlyRate: emp.hourlyRate,
            skills: emp.skills,
            qualifications: emp.qualifications,
            experience: emp.experience || '',
            status: emp.status
          });
        } else {
          setError(data.error);
        }
      } catch {
        setError('Fehler beim Laden des Mitarbeiters');
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
      fetchEmployee();
    }
  }, [employeeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/employees/${employeeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/admin/employees?updated=true');
      } else {
        setError(data.error);
      }
    } catch {
      setError('Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const addQualification = () => {
    if (newQualification.trim() && !formData.qualifications.includes(newQualification.trim())) {
      setFormData({
        ...formData,
        qualifications: [...formData.qualifications, newQualification.trim()]
      });
      setNewQualification('');
    }
  };

  const removeQualification = (qualToRemove: string) => {
    setFormData({
      ...formData,
      qualifications: formData.qualifications.filter(qual => qual !== qualToRemove)
    });
  };

  if (loading) {
    return (
      <AdminPageContainer>
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-nordic-dark dark:text-nordic-light mb-4">Mitarbeiter bearbeiten</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nordic-primary mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Lade Mitarbeiter...</p>
        </div>
      </AdminPageContainer>
    );
  }

  if (!employee) {
    return (
      <AdminPageContainer>
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-nordic-dark dark:text-nordic-light mb-4">Mitarbeiter bearbeiten</h1>
          <p className="text-red-600">Mitarbeiter nicht gefunden</p>
        </div>
      </AdminPageContainer>
    );
  }

  return (
    <AdminPageContainer>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-nordic-dark dark:text-nordic-light mb-6">
          Mitarbeiter bearbeiten: {employee.userId.firstName} {employee.userId.lastName}
        </h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Grunddaten</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Vorname</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nordic-primary"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Nachname</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nordic-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">E-Mail</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nordic-primary"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Stundenlohn (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({...formData, hourlyRate: parseFloat(e.target.value) || 0})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nordic-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nordic-primary"
                >
                  <option value="available">Verfügbar</option>
                  <option value="with_assignments">Mit Umowa</option>
                  <option value="awaiting_assignment">Wartet auf Umowa</option>
                  <option value="on_leave">Urlaub</option>
                  <option value="sick_leave">Krankenschein</option>
                  <option value="comp_time">Freie Zeit</option>
                  <option value="inactive">Inaktiv</option>
                </select>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Fähigkeiten</h3>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Neue Fähigkeit hinzufügen"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nordic-primary"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-3 bg-nordic-primary text-white rounded-lg hover:bg-nordic-dark"
              >
                Hinzufügen
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Qualifications */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Qualifikationen</h3>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newQualification}
                onChange={(e) => setNewQualification(e.target.value)}
                placeholder="Neue Qualifikation hinzufügen"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nordic-primary"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addQualification())}
              />
              <button
                type="button"
                onClick={addQualification}
                className="px-4 py-3 bg-nordic-primary text-white rounded-lg hover:bg-nordic-dark"
              >
                Hinzufügen
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.qualifications.map((qual, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  {qual}
                  <button
                    type="button"
                    onClick={() => removeQualification(qual)}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Erfahrung</h3>
            <textarea
              value={formData.experience}
              onChange={(e) => setFormData({...formData, experience: e.target.value})}
              placeholder="Beschreibung der Berufserfahrung..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nordic-primary"
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/admin/employees')}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 px-4 bg-nordic-primary text-white rounded-lg hover:bg-nordic-dark disabled:opacity-50"
            >
              {saving ? 'Speichern...' : 'Speichern'}
            </button>
          </div>
        </form>
      </div>
    </AdminPageContainer>
  );
}
