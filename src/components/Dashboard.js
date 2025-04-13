import React, { useState } from 'react';
import { useNavigate, Link, Routes, Route } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from './auth/AuthContext';
import ServiceManagement from './ServiceManagement';
import IncidentList from './incidents/IncidentList';
import IncidentDetail from './incidents/IncidentDetail';
import IncidentForm from './incidents/IncidentForm';
import Incident from './Incident';

function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('services');

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Status Page App</h1>
            </div>
            <div className="flex items-center">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="mr-4 text-blue-500 hover:text-blue-700"
              >
                View Public Status Page
              </a>
              <span className="mr-4">{currentUser.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
          <p className="mb-6">Welcome to your status page dashboard. Here you can manage your services and incidents.</p>
          
          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('services')}
                className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'services'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Services
              </button>
              <button
                onClick={() => setActiveTab('incidents')}
                className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'incidents'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Incidents
              </button>
            </nav>
          </div>
          
          {/* Content based on active tab */}
          {activeTab === 'services' ? (
            <ServiceManagement />
          ) : (
            <Incident />
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
