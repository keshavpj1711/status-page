import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import ConfirmationDialog from './ConfirmationDialog';

function ServiceManagement() {
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({ name: '', status: 'Operational' });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  // States to manage deleting of a service
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch services from Firestore with real-time updates
  useEffect(() => {
    console.log("Setting up Firestore listener");
    const servicesCollection = collection(db, 'services');
    const unsubscribe = onSnapshot(servicesCollection, (snapshot) => {
      console.log("Snapshot received:", snapshot.docs.length, "documents");
      const servicesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("Parsed services:", servicesList);
      setServices(servicesList);
    }, (error) => {
      console.error("Firestore listener error:", error);
      setError("Failed to connect to the database: " + error.message);
    });

    return () => {
      console.log("Cleaning up Firestore listener");
      unsubscribe();
    };
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  const addService = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true); // Start loading indicator
    
    if (!newService.name.trim()) {
      setError("Service name cannot be empty");
      setIsLoading(false); // Stop loading indicator
      return;
    }
    
    try {
      await addDoc(collection(db, 'services'), newService);
      // Don't manually update services array - let the onSnapshot listener do it
      setSuccessMessage('Service added successfully!');
      setNewService({ name: '', status: 'Operational' });
    } catch (error) {
      console.error("Error adding service:", error);
      setError("Error adding service: " + error.message);
    } finally {
      setIsLoading(false); // Stop loading indicator
    }
  };

  const updateService = async (id, updatedService) => {
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true); // Start loading indicator
    
    try {
      await updateDoc(doc(db, 'services', id), updatedService);
      // Don't manually update services array - let the onSnapshot listener do it
      setSuccessMessage('Service updated successfully!');
    } catch (error) {
      console.error("Error updating service:", error);
      setError("Error updating service: " + error.message);
    } finally {
      setIsLoading(false); // Stop loading indicator
    }
  };

  // Handle delete button click
  const handleDeleteClick = (service) => {
    setServiceToDelete(service);
    setIsDeleteModalOpen(true);
  };

  // Handle confirmation of deletion
  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    
    setIsLoading(true); // Start loading indicator
    
    try {
      await deleteDoc(doc(db, 'services', serviceToDelete.id));
      // Don't manually update services array - let the onSnapshot listener do it
      setSuccessMessage("Service deleted successfully!");
    } catch (error) {
      console.error("Error deleting service:", error);
      setError("Error deleting service: " + error.message);
    } finally {
      setIsLoading(false); // Stop loading indicator
      setIsDeleteModalOpen(false);
      setServiceToDelete(null);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Service Management</h2>
      
      {/* Display error and success messages */}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {successMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{successMessage}</div>}

      {/* Global loading indicator */}
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 bg-blue-500 text-white text-center py-1 z-50">
          Processing...
        </div>
      )}

      {/* Add Service Form */}
      <form onSubmit={addService} className="mb-8 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3">Add New Service</h3>
        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            value={newService.name}
            onChange={(e) => setNewService({ ...newService, name: e.target.value })}
            placeholder="Service Name"
            className="flex-grow p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isLoading}
          />
          <select
            value={newService.status}
            onChange={(e) => setNewService({ ...newService, status: e.target.value })}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            <option value="Operational">Operational</option>
            <option value="Degraded Performance">Degraded Performance</option>
            <option value="Partial Outage">Partial Outage</option>
            <option value="Major Outage">Major Outage</option>
          </select>
          <button 
            type="submit" 
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </>
            ) : (
              'Add Service'
            )}
          </button>
        </div>
      </form>

      {/* Service List */}
      <div className="bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold p-4 border-b">Services</h3>
        {services.length === 0 ? (
          <p className="p-4 text-gray-500">No services added yet. Add your first service above.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {services.map(service => (
              <li key={service.id} className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <span className="font-bold text-lg">{service.name}</span>
                    <span className={`ml-2 px-2 py-1 rounded text-sm ${
                      service.status === 'Operational' ? 'bg-green-100 text-green-800' :
                      service.status === 'Degraded Performance' ? 'bg-yellow-100 text-yellow-800' :
                      service.status === 'Partial Outage' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {service.status}
                    </span>
                  </div>
                  <div className="mt-2 md:mt-0 flex items-center">
                    <select
                      value={service.status}
                      onChange={(e) => updateService(service.id, { status: e.target.value })}
                      className="mr-2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                    >
                      <option value="Operational">Operational</option>
                      <option value="Degraded Performance">Degraded Performance</option>
                      <option value="Partial Outage">Partial Outage</option>
                      <option value="Major Outage">Major Outage</option>
                    </select>
                    <button
                      onClick={() => handleDeleteClick(service)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Use the reusable confirmation dialog component */}
      <ConfirmationDialog
        isOpen={isDeleteModalOpen}
        onClose={() => !isLoading && setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete the service "${serviceToDelete?.name}"?`}
        confirmButtonText={isLoading ? "Deleting..." : "Delete"}
        dangerText="This action is irreversible."
      />
    </div>
  );
}

export default ServiceManagement;
