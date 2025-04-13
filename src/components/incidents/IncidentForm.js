import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';

function IncidentForm({ onIncidentCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('investigating');
  const [impact, setImpact] = useState('minor');
  const [selectedServices, setSelectedServices] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch available services from Firestore
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesCollection = collection(db, 'services');
        const servicesSnapshot = await getDocs(servicesCollection);
        const servicesList = servicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAvailableServices(servicesList);
      } catch (error) {
        console.error('Error fetching services:', error);
        setError('Failed to load services. Please try again.');
      }
    };

    fetchServices();
  }, []);

  const handleServiceToggle = (serviceId) => {
    setSelectedServices(prevSelected => 
      prevSelected.includes(serviceId)
        ? prevSelected.filter(id => id !== serviceId)
        : [...prevSelected, serviceId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!title.trim()) {
      setError('Title is required');
      setIsLoading(false);
      return;
    }

    if (selectedServices.length === 0) {
      setError('Please select at least one affected service');
      setIsLoading(false);
      return;
    }

    try {
      const incidentData = {
        title,
        description,
        status,
        impact,
        services: selectedServices,
        createdAt: new Date(),
        updatedAt: new Date(),
        updates: [{
          text: `Incident identified: ${description}`,
          status,
          timestamp: new Date()
        }]
      };

      const docRef = await addDoc(collection(db, 'incidents'), incidentData);
      console.log('Incident created with ID:', docRef.id);
      
      // Reset form
      setTitle('');
      setDescription('');
      setStatus('investigating');
      setImpact('minor');
      setSelectedServices([]);
      
      if (onIncidentCreated) {
        onIncidentCreated({ id: docRef.id, ...incidentData });
      }
    } catch (error) {
      console.error('Error creating incident:', error);
      setError('Failed to create incident. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Report New Incident</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Brief title describing the incident"
            disabled={isLoading}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Detailed description of the incident"
            disabled={isLoading}
          ></textarea>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value="investigating">Investigating</option>
              <option value="identified">Identified</option>
              <option value="monitoring">Monitoring</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="impact">
              Impact
            </label>
            <select
              id="impact"
              value={impact}
              onChange={(e) => setImpact(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value="critical">Critical - Service unusable</option>
              <option value="major">Major - Service impaired</option>
              <option value="minor">Minor - Service partially affected</option>
            </select>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Affected Services
          </label>
          <div className="max-h-40 overflow-y-auto border rounded p-2">
            {availableServices.length === 0 ? (
              <p className="text-gray-500">No services available</p>
            ) : (
              availableServices.map(service => (
                <div key={service.id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={`service-${service.id}`}
                    checked={selectedServices.includes(service.id)}
                    onChange={() => handleServiceToggle(service.id)}
                    className="mr-2"
                    disabled={isLoading}
                  />
                  <label htmlFor={`service-${service.id}`} className="text-gray-700">
                    {service.name}
                  </label>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              'Create Incident'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default IncidentForm;
