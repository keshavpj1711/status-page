import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';

function IncidentList() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const incidentsQuery = query(
      collection(db, 'incidents'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      incidentsQuery,
      (snapshot) => {
        const incidentsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
          resolvedAt: doc.data().resolvedAt?.toDate()
        }));
        setIncidents(incidentsList);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching incidents:', err);
        setError('Failed to load incidents. Please try again.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const getStatusBadgeClass = (status) => {
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

  const getImpactBadgeClass = (impact) => {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold p-4 border-b">Incidents</h2>
      
      {incidents.length === 0 ? (
        <p className="p-4 text-gray-500">No incidents reported.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {incidents.map(incident => (
            <li key={incident.id} className="p-4 hover:bg-gray-50">
              <Link to={`/dashboard/incidents/${incident.id}`} className="block">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h3 className="font-medium text-lg">{incident.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {incident.createdAt ? new Date(incident.createdAt).toLocaleString() : 'Date unknown'}
                    </p>
                  </div>
                  <div className="mt-2 md:mt-0 flex flex-wrap gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(incident.status)}`}>
                      {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactBadgeClass(incident.impact)}`}>
                      {incident.impact.charAt(0).toUpperCase() + incident.impact.slice(1)}
                    </span>
                  </div>
                </div>
                {incident.description && (
                  <p className="text-gray-600 mt-2 line-clamp-2">{incident.description}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default IncidentList;
