'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminPageContainer from '@/components/AdminPageContainer';
import Link from 'next/link';
import { Save, User, Mail, Shield, Eye, EyeOff, UserX, UserCheck, Trash2 } from 'lucide-react';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusAction, setStatusAction] = useState<'activate' | 'deactivate'>('deactivate');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    isActive: true,
    newPassword: '',
    confirmPassword: '',
  });

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/admin/users/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setFormData({
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            email: data.user.email,
            role: data.user.role,
            isActive: data.user.isActive,
            newPassword: '',
            confirmPassword: '',
          });
        } else {
          setError('Benutzer nicht gefunden');
        }
      } catch {
        setError('Fehler beim Laden der Benutzerdaten');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    // Validate password if provided
    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        setError('Passwort muss mindestens 6 Zeichen lang sein');
        setSaving(false);
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError('Passwörter stimmen nicht überein');
        setSaving(false);
        return;
      }
    }

    try {
      const updateData: {
        firstName: string;
        lastName: string;
        email: string;
        role: string;
        isActive: boolean;
        password?: string;
      } = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
        isActive: formData.isActive,
      };

      // Add password if provided
      if (formData.newPassword) {
        updateData.password = formData.newPassword;
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
        setShowPasswordFields(false);
        
        // Update local user state
        setUser(prev => prev ? { ...prev, ...updateData } : null);
        
        setTimeout(() => {
          router.push('/admin/users');
        }, 2000);
      } else {
        setError(data.error || 'Fehler beim Aktualisieren des Benutzers');
      }
    } catch {
      setError('Netzwerkfehler. Bitte versuchen Sie es erneut.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async () => {
    try {
      const newStatus = statusAction === 'activate';
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (response.ok) {
        setUser(prev => prev ? { ...prev, isActive: newStatus } : null);
        setFormData(prev => ({ ...prev, isActive: newStatus }));
        setShowStatusModal(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('Fehler beim Aktualisieren des Status');
      }
    } catch {
      setError('Netzwerkfehler');
    }
  };

  const handleDeleteUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/admin/users?deleted=true');
      } else {
        setError('Fehler beim Löschen des Benutzers');
      }
    } catch {
      setError('Netzwerkfehler');
    }
  };

  if (loading) {
    return (
      <AdminPageContainer>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nordic-primary mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Lade Benutzerdaten...</p>
        </div>
      </AdminPageContainer>
    );
  }

  if (!user) {
    return (
      <AdminPageContainer>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-nordic-dark dark:text-nordic-light mb-4">Benutzer nicht gefunden</h1>
          <Link
            href="/admin/users"
            className="text-nordic-primary hover:text-nordic-dark dark:hover:text-nordic-light"
          >
            ← Zurück zur Benutzerliste
          </Link>
        </div>
      </AdminPageContainer>
    );
  }

  return (
    <AdminPageContainer>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-nordic-dark dark:text-nordic-light">
          Benutzer bearbeiten: {user.lastName}, {user.firstName}
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setStatusAction(user.isActive ? 'deactivate' : 'activate');
              setShowStatusModal(true);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors ${
              user.isActive 
                ? 'bg-orange-500 hover:bg-orange-600' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
            {user.isActive ? 'Deaktivieren' : 'Aktivieren'}
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Löschen
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 px-4 py-3 rounded mb-6">
          {user.isActive 
            ? 'Benutzer wurde erfolgreich aktualisiert!'
            : 'Benutzer wurde temporär deaktiviert und kann sich nicht anmelden.'
          }
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-nordic-dark dark:text-nordic-light">Benutzerinformationen</h2>
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
              user.isActive 
                ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' 
                : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
            }`}>
              {user.isActive ? 'Aktiv' : 'Deaktiviert'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Vorname
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Nachname
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                E-Mail-Adresse
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  <Shield className="w-4 h-4 inline mr-2" />
                  Rolle
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="employee">Mitarbeiter</option>
                  <option value="hr">HR Manager</option>
                  <option value="admin">Administrator</option>
                  <option value="client">Kunde</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Benutzer ist aktiv
                  </label>
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Passwort ändern</h3>
                <button
                  type="button"
                  onClick={() => setShowPasswordFields(!showPasswordFields)}
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800"
                >
                  {showPasswordFields ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showPasswordFields ? 'Ausblenden' : 'Passwort ändern'}
                </button>
              </div>

              {showPasswordFields && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Neues Passwort
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      placeholder="Mindestens 6 Zeichen"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Passwort bestätigen
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Passwort wiederholen"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Speichern...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Änderungen speichern
                    </>
                  )}
                </button>

                <Link
                  href="/admin/users"
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Abbrechen
                </Link>
              </div>
            </div>
          </form>
        </div>

        {/* User Metadata */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Benutzerinformationen</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Benutzer-ID:</span>
              <span className="ml-2 text-gray-600">{user._id}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Erstellt am:</span>
              <span className="ml-2 text-gray-600">
                {new Date(user.createdAt).toLocaleDateString('de-DE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Status Change Modal */}
        {showStatusModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-nordic-dark dark:text-nordic-light mb-4">
                  Benutzer {statusAction === 'deactivate' ? 'deaktivieren' : 'aktivieren'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {statusAction === 'deactivate' 
                    ? 'Der Benutzer wird temporär deaktiviert und kann sich nicht mehr anmelden. Diese Aktion kann rückgängig gemacht werden.'
                    : 'Der Benutzer wird wieder aktiviert und kann sich anmelden.'
                  }
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handleStatusChange}
                    className={`px-4 py-2 text-white rounded-lg ${
                      statusAction === 'deactivate' 
                        ? 'bg-orange-500 hover:bg-orange-600' 
                        : 'bg-green-500 hover:bg-green-600'
                    }`}
                  >
                    {statusAction === 'deactivate' ? 'Deaktivieren' : 'Aktivieren'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
                  Benutzer löschen
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Sind Sie sicher, dass Sie den Benutzer <strong>{user.firstName} {user.lastName}</strong> dauerhaft löschen möchten? 
                  Diese Aktion kann nicht rückgängig gemacht werden.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handleDeleteUser}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </AdminPageContainer>
  );
}
