import React from 'react';

function IncidentTimeline({ updates = [] }) {
  if (!updates || updates.length === 0) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">Timeline</h3>
        <p className="text-gray-500">No updates yet.</p>
      </div>
    );
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

  // Sort updates by timestamp (newest first)
  const sortedUpdates = [...updates].sort((a, b) => {
    const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : 0;
    const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : 0;
    return timeB - timeA;
  });

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-4">Timeline</h3>
      <div className="flow-root">
        <ul className="-mb-8">
          {sortedUpdates.map((update, index) => (
            <li key={index}>
              <div className="relative pb-8">
                {index !== sortedUpdates.length - 1 ? (
                  <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getStatusBadgeClass(update.status)}`}>
                      {update.status === 'investigating' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                      )}
                      {update.status === 'identified' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      )}
                      {update.status === 'monitoring' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      )}
                      {update.status === 'resolved' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div>
                      <div className="text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(update.status)}`}>
                          {update.status.charAt(0).toUpperCase() + update.status.slice(1)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {update.timestamp instanceof Date ? update.timestamp.toLocaleString() : 'Unknown time'}
                      </p>
                    </div>
                    <div className="mt-2 text-sm text-gray-700">
                      <p>{update.text}</p>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default IncidentTimeline;
