
import React from 'react';

function ConfirmationDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to perform this action?", 
  confirmButtonText = "Confirm", 
  cancelButtonText = "Cancel",
  confirmButtonClass = "bg-red-600 hover:bg-red-700",
  dangerText = "This action is irreversible."
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-lg font-bold text-red-600 mb-4">{title}</h3>
        <p className="mb-6">
          {message}
          {dangerText && <span className="font-semibold block mt-2">{dangerText}</span>}
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            {cancelButtonText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-md ${confirmButtonClass}`}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationDialog;
