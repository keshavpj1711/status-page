import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

function PublicStatusPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overallStatus, setOverallStatus] = useState('Operational');

  useEffect(() => {
    const servicesCollection = collection(db, 'services');
    const q = query(servicesCollection, orderBy('name'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const servicesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServices(servicesList);
      
      // Determine overall system status
      calculateOverallStatus(servicesList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const calculateOverallStatus = (servicesList) => {
    if (servicesList.length === 0) {
      setOverallStatus('Operational');
      return;
    }

    const statusPriority = {
      'Operational': 0,
      'Degraded Performance': 1,
      'Partial Outage': 2,
      'Major Outage': 3
    };

    let highestPriority = 0;
    
    servicesList.forEach(service => {
      const priority = statusPriority[service.status] || 0;
      if (priority > highestPriority) {
        highestPriority = priority;
      }
    });

    const statusMap = {
      0: 'Operational',
      1: 'Degraded Performance',
      2: 'Partial Outage',
      3: 'Major Outage'
    };

    setOverallStatus(statusMap[highestPriority]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Operational':
        return 'bg-green-100 text-green-800';
      case 'Degraded Performance':
        return 'bg-yellow-100 text-yellow-800';
      case 'Partial Outage':
        return 'bg-orange-100 text-orange-800';
      case 'Major Outage':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto pt-12 pb-24 px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">System Status</h1>
          <div className={`inline-block px-4 py-2 rounded-full ${getStatusColor(overallStatus)} font-medium`}>
            {overallStatus}
          </div>
          <p className="mt-4 text-gray-600">
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Services</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {services.length === 0 ? (
              <div className="px-6 py-4 text-gray-500">No services to display.</div>
            ) : (
              services.map(service => (
                <div key={service.id} className="px-6 py-4 flex justify-between items-center">
                  <span className="font-medium text-gray-900">{service.name}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(service.status)}`}>
                    {service.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Placeholder for incident timeline - you can expand this later */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Incidents</h2>
          </div>
          <div className="px-6 py-4 text-gray-500">
            No incidents reported in the last 90 days.
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublicStatusPage;
