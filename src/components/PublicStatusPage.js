import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, where, limit } from 'firebase/firestore';

function PublicStatusPage() {
  const [services, setServices] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [activeIncidents, setActiveIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overallStatus, setOverallStatus] = useState('Operational');

  useEffect(() => {
    // Fetch services
    const servicesCollection = collection(db, 'services');
    const servicesQuery = query(servicesCollection, orderBy('name'));
    
    const servicesUnsubscribe = onSnapshot(servicesQuery, (snapshot) => {
      const servicesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServices(servicesList);
      
      // Determine overall system status
      calculateOverallStatus(servicesList);
    });

    // Fetch active incidents (not resolved)
    const incidentsCollection = collection(db, 'incidents');
    const activeIncidentsQuery = query(
      incidentsCollection, 
      where('status', '!=', 'resolved'),
      orderBy('status'),
      orderBy('createdAt', 'desc')
    );
    
    const activeIncidentsUnsubscribe = onSnapshot(activeIncidentsQuery, (snapshot) => {
      const activeIncidentsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      }));
      setActiveIncidents(activeIncidentsList);
    });

    // Fetch recent incidents (including resolved ones)
    const recentIncidentsQuery = query(
      incidentsCollection,
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    
    const recentIncidentsUnsubscribe = onSnapshot(recentIncidentsQuery, (snapshot) => {
      const incidentsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        resolvedAt: doc.data().resolvedAt?.toDate(),
        updates: doc.data().updates?.map(update => ({
          ...update,
          timestamp: update.timestamp instanceof Date ? update.timestamp : update.timestamp?.toDate()
        })) || []
      }));
      setIncidents(incidentsList);
      setLoading(false);
    });

    return () => {
      servicesUnsubscribe();
      activeIncidentsUnsubscribe();
      recentIncidentsUnsubscribe();
    };
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

  const getIncidentStatusColor = (status) => {
    switch (status) {
      case 'investigating':
        return 'bg-yellow-100 text-yellow-800';
      case 'identified':
        return 'bg-blue-100 text-blue-800';
      case 'monitoring':
        return 'bg-purple-100 text-purple-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'major':
        return 'bg-orange-100 text-orange-800';
      case 'minor':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown';
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

        {/* Active Incidents Section */}
        {activeIncidents.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
              <h2 className="text-lg font-medium text-red-800">Active Incidents</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {activeIncidents.map(incident => (
                <div key={incident.id} className="px-6 py-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                    <h3 className="font-medium text-lg">{incident.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-1 md:mt-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getIncidentStatusColor(incident.status)}`}>
                        {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                      </span>
                      {incident.impact && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getImpactColor(incident.impact)}`}>
                          {incident.impact.charAt(0).toUpperCase() + incident.impact.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-2">{incident.description}</p>
                  <p className="text-sm text-gray-500">
                    Started: {formatDate(incident.createdAt)}
                  </p>
                  
                  {/* Show the most recent update if available */}
                  {incident.updates && incident.updates.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Latest update:</span> {incident.updates[0].text}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {incident.updates[0].timestamp ? formatDate(incident.updates[0].timestamp) : 'Unknown time'}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Services Section */}
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

        {/* Recent Incidents Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Incidents</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {incidents.length === 0 ? (
              <div className="px-6 py-4 text-gray-500">No incidents reported in the last 90 days.</div>
            ) : (
              incidents.map(incident => (
                <div key={incident.id} className="px-6 py-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                    <h3 className="font-medium">{incident.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-1 md:mt-0">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIncidentStatusColor(incident.status)}`}>
                        {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      {formatDate(incident.createdAt)}
                    </span>
                    {incident.resolvedAt && (
                      <span className="text-green-600">
                        Resolved: {formatDate(incident.resolvedAt)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublicStatusPage;
