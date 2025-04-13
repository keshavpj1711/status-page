import React, { useState } from 'react';
import { db } from '../../firebase';
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';

function IncidentUpdate({ incidentId, onUpdateAdded }) {
  const [updateText, setUpdateText] = useState('');
  const [updateStatus, setUpdateStatus] = useState('investigating');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!updateText.trim()) return;

    setIsSubmitting(true);
    setError(null);

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

      console.log('Incident update submitted successfully:', {
        incidentId,
        updateText,
        updateStatus,
        timestamp: new Date()
      });

      setUpdateText('');
      if (onUpdateAdded) {
        onUpdateAdded();
      }
    } catch (err) {
      console.error('Error adding update:', err);
      setError('Failed to add update. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 pt-6 border-t">
      <h3 className="text-lg font-medium mb-4">Add Update</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

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
  );
}

export default IncidentUpdate;
