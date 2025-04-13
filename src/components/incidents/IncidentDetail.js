import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import IncidentTimeline from './IncidentTimeline';
import ConfirmationDialog from '../ConfirmationDialog';

function IncidentDetail() {
  const { incidentId } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateText, setUpdateText] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResolveDialog, setShowResolveDialog] = useState(false);

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        const incidentDoc = await getDoc(doc(db, 'incidents', incidentId));
        
        if (!incidentDoc.exists()) {
          setError('Incident not found');
          setLoading(false);
          return;
        }
        
        const incidentData = {
          id: incidentDoc.id,
          ...incidentDoc.data(),
          createdAt: incidentDoc.data().createdAt?.toDate(),
          updatedAt: incidentDoc.data().updatedAt?.toDate(),
          resolvedAt: incidentDoc.data().resolvedAt?.toDate(),
          updates: incidentDoc.data().updates?.map(update => ({
            ...update,
            timestamp: update.timestamp?.toDate()
          })) || []
        };
        
        setIncident(incidentData);
        setUpdateStatus(incidentData.status);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching incident:', err);
        setError('Failed to load incident details. Please try again.');
        setLoading(false);
      }
    };

    fetchIncident();
  }, [incidentId]);

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    
    if (!updateText.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const incidentRef = doc(db, 'incidents', incidentId);
      
      await updateDoc(incidentRef, {
        status: updateStatus,
        updatedAt: new Date(),
        updates: arrayUnion({
          text: updateText,
          status: updateStatus,
          timestamp: new Date()
        })
      });
      
      setUpdateText('');
      
      // Refresh incident data
      const updatedDoc = await getDoc(incidentRef);
      const updatedData = {
        id: updatedDoc.id,
        ...updatedDoc.data(),
        createdAt: updatedDoc.data().createdAt?.toDate(),
        updatedAt: updatedDoc.data().updatedAt?.toDate(),
        resolvedAt: updatedDoc.data().resolvedAt?.toDate(),
        updates: updatedDoc.data().updates?.map(update => ({
          ...update,
          timestamp: update.timestamp?.toDate()
        })) || []
      };
      
      setIncident(updatedData);
    } catch (err) {
      console.error('Error updating incident:', err);
      setError('Failed to update incident. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveIncident = async () => {
    setIsSubmitting(true);
    
    try {
      const incidentRef = doc(db, 'incidents', incidentId);
      
      await updateDoc(incidentRef, {
        status: 'resolved',
        resolvedAt: new Date(),
        updatedAt: new Date(),
        updates: arrayUnion({
          text: 'Incident resolved',
          status: 'resolved',
          timestamp: new Date()
        })
      });
      
      // Refresh incident data
      const updatedDoc = await getDoc(incidentRef);
      const updatedData = {
        id: updatedDoc.id,
        ...updatedDoc.data(),
        createdAt: updatedDoc.data().createdAt?.toDate(),
        updatedAt: updatedDoc.data().updatedAt?.toDate(),
        resolvedAt: updatedDoc.data().resolvedAt?.toDate(),
        updates: updatedDoc.data().updates?.map(update => ({
          ...update,
          timestamp: update.timestamp?.toDate()
        })) || []
      };
      
      setIncident(updatedData);
      setShowResolveDialog(false);
    } catch (err) {
      console.error('Error resolving incident:', err);
      setError('Failed to resolve incident. Please try again.');
    } finally {
      setIsSubmitting(false);
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
        <div className="mt-4">
          <button
            onClick={() => navigate('/dashboard/incidents')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Back to Incidents
          </button>
        </div>
      </div>
    );
  }

  if (!incident) {
    return null;
  }

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate('/dashboard/incidents')}
          className="text-blue-500 hover:text-blue-700 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Incidents
        </button>
        
        {incident.status !== 'resolved' && (
          <button
            onClick={() => setShowResolveDialog(true)}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            disabled={isSubmitting}
          >
            Resolve Incident
          </button>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{incident.title}</h1>
          <div className="mt-2 md:mt-0 flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(incident.status)}`}>
              {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getImpactBadgeClass(incident.impact)}`}>
              {incident.impact.charAt(0).toUpperCase() + incident.impact.slice(1)}
            </span>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600">{incident.description}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Created</h3>
            <p>{incident.createdAt ? incident.createdAt.toLocaleString() : 'Unknown'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
            <p>{incident.updatedAt ? incident.updatedAt.toLocaleString() : 'Unknown'}</p>
          </div>
          
          {incident.resolvedAt && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Resolved</h3>
              <p>{incident.resolvedAt.toLocaleString()}</p>
            </div>
          )}
        </div>
        
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Affected Services</h3>
          <div className="flex flex-wrap gap-2">
            {incident.services && incident.services.length > 0 ? (
              incident.services.map((serviceId, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                  {serviceId}
                </span>
              ))
            ) : (
              <span className="text-gray-500">No services specified</span>
            )}
          </div>
        </div>
        
        <IncidentTimeline updates={incident.updates || []} />
        
        {incident.status !== 'resolved' && (
          <form onSubmit={handleUpdateSubmit} className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-medium mb-4">Add Update</h3>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="updateStatus">
                Status
              </label>
              <select
                id="updateStatus"
                value={updateStatus}
                onChange={(e) => setUpdateStatus(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                <option value="investigating">Investigating</option>
                <option value="identified">Identified</option>
                <option value="monitoring">Monitoring</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="updateText">
                Update Message
              </label>
              <textarea
                id="updateText"
                value={updateText}
                onChange={(e) => setUpdateText(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Provide an update on the incident..."
                disabled={isSubmitting}
              ></textarea>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                disabled={isSubmitting || !updateText.trim()}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Post Update'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
      
      <ConfirmationDialog
        isOpen={showResolveDialog}
        onClose={() => setShowResolveDialog(false)}
        onConfirm={handleResolveIncident}
        title="Resolve Incident"
        message="Are you sure you want to resolve this incident? This will mark the incident as resolved and notify all affected users."
        confirmButtonText={isSubmitting ? "Resolving..." : "Resolve Incident"}
        confirmButtonClass="bg-green-600 hover:bg-green-700"
      />
    </div>
  );
}

export default IncidentDetail;
