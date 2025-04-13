import React from "react";
import IncidentList from "./incidents/IncidentList";
import { Link } from "react-router-dom";

function Incident() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold mb-4">Incident Management</h2>
        <Link
          to="/dashboard/incidents/new"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create New Incident
        </Link>
      </div>
      <IncidentList />
    </div>
  );
}

export default Incident;