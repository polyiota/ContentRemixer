import React, { useState } from 'react';
import { saveContent } from '../lib/claude';
import Toast from './Toast';

export function ContentItem({ content, platform }) {
  const [showToast, setShowToast] = useState(false);

  const handleSave = async () => {
    try {
      await saveContent(content, platform);
      setShowToast(true);
    } catch (error) {
      console.error('Error saving content:', error);
      // You could add error toast here
    }
  };

  return (
    <>
      <div className="border rounded p-4 mb-4">
        <p className="whitespace-pre-wrap">{content}</p>
        <button 
          onClick={handleSave}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save for Later
        </button>
      </div>

      {showToast && (
        <Toast 
          message="Content saved successfully!"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
} 