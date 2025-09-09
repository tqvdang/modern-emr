'use client';

import { useState } from 'react';
import { usePatientProfile } from '@/hooks/usePatientProfile';
import { usePatientAppointments } from '@/hooks/usePatientAppointments';

export default function PatientDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // Patient data hooks
  const { profile, loading: profileLoading, getAge, getProfileCompleteness } = usePatientProfile();
  const { 
    upcomingAppointments, 
    loading: appointmentsLoading, 
    getAppointmentStats,
    canCancelAppointment,
    canRescheduleAppointment
  } = usePatientAppointments();

  // Get computed data
  const age = getAge();
  const profileCompleteness = getProfileCompleteness();
  const appointmentStats = getAppointmentStats();

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (profileLoading || appointmentsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Patient Portal
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Welcome, {profile?.firstName}
              </span>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {['overview', 'appointments', 'records', 'messages', 'profile'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  selectedTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedTab === 'overview' && (
          <>
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Welcome back, {profile?.firstName}!
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Here's an overview of your healthcare information and upcoming appointments.
              </p>
            </div>

            {/* Profile Completion Alert */}
            {profileCompleteness.percentage < 80 && (
              <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-yellow-400 text-xl">⚠️</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Complete Your Profile ({profileCompleteness.percentage}% complete)
                    </h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      A complete profile helps us provide better care. Please update your information.
                    </p>
                    <button
                      onClick={() => setSelectedTab('profile')}
                      className="mt-2 text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200"
                    >
                      Complete Profile
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm">📅</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Next Appointment</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {appointmentStats.nextAppointment ? 
                        formatDateTime(appointmentStats.nextAppointment.startDateTime).date : 
                        'None scheduled'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm">✅</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Completed Sessions</p>
                    <p className="text-lg font-semibold text-gray-900">{appointmentStats.completed}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm">🎂</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Age</p>
                    <p className="text-lg font-semibold text-gray-900">{age || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm">📊</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Profile Complete</p>
                    <p className="text-lg font-semibold text-gray-900">{profileCompleteness.percentage}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Upcoming Appointments</h3>
                <button
                  onClick={() => setSelectedTab('appointments')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View All
                </button>
              </div>
              
              {upcomingAppointments.length > 0 ? (
                <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
                  {upcomingAppointments.slice(0, 3).map((appointment) => {
                    const { date, time } = formatDateTime(appointment.startDateTime);
                    return (
                      <div key={appointment.id} className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">
                                  {appointment.title || appointment.appointmentType}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  with {appointment.provider?.firstName} {appointment.provider?.lastName}
                                </p>
                                <div className="mt-1 flex items-center text-sm text-gray-500">
                                  <span>{date}</span>
                                  <span className="mx-1">•</span>
                                  <span>{time}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </span>
                            {canRescheduleAppointment(appointment) && (
                              <button className="text-sm text-blue-600 hover:text-blue-800">
                                Reschedule
                              </button>
                            )}
                            {canCancelAppointment(appointment) && (
                              <button className="text-sm text-red-600 hover:text-red-800">
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                        {appointment.description && (
                          <p className="mt-2 text-sm text-gray-600">{appointment.description}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                  <p className="text-gray-500">No upcoming appointments</p>
                  <button
                    onClick={() => setSelectedTab('appointments')}
                    className="mt-2 text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Book Appointment
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedTab('appointments')}
                    className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">📅</span>
                      <div>
                        <p className="font-medium text-gray-900">Book Appointment</p>
                        <p className="text-sm text-gray-500">Schedule your next session</p>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setSelectedTab('messages')}
                    className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">💬</span>
                      <div>
                        <p className="font-medium text-gray-900">Message Provider</p>
                        <p className="text-sm text-gray-500">Ask questions or get advice</p>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setSelectedTab('records')}
                    className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">📋</span>
                      <div>
                        <p className="font-medium text-gray-900">View Records</p>
                        <p className="text-sm text-gray-500">Access your medical history</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Health Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Emergency Contact</span>
                    <span className="text-sm font-medium text-gray-900">
                      {profile?.emergencyContact?.name || 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Allergies</span>
                    <span className="text-sm font-medium text-gray-900">
                      {profile?.medicalHistory?.allergies?.length || 0} listed
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Medications</span>
                    <span className="text-sm font-medium text-gray-900">
                      {profile?.medicalHistory?.medications?.length || 0} active
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedTab('profile')}
                    className="w-full mt-4 text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
                  >
                    Update Health Information
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Placeholder content for other tabs */}
        {selectedTab === 'appointments' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Appointments</h2>
            <p className="text-gray-600">Appointment booking and management interface coming soon...</p>
          </div>
        )}

        {selectedTab === 'records' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Medical Records</h2>
            <p className="text-gray-600">Medical records viewer coming soon...</p>
          </div>
        )}

        {selectedTab === 'messages' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Messages</h2>
            <p className="text-gray-600">Secure messaging with providers coming soon...</p>
          </div>
        )}

        {selectedTab === 'profile' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Settings</h2>
            <p className="text-gray-600">Profile management interface coming soon...</p>
          </div>
        )}
      </main>
    </div>
  );
}