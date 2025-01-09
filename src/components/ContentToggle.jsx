import React from 'react';

const platforms = [
  { id: 'twitter', label: 'Content to Twitter' },
  { id: 'linkedin', label: 'Content to LinkedIn' },
  { id: 'instagram', label: 'Content to Instagram Caption' }
];

export default function ContentToggle({ activePlatform, onChange }) {
  return (
    <div className="relative w-full max-w-2xl mx-auto mb-6">
      <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-2">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => onChange(platform.id)}
            className={`flex-1 relative py-2 px-4 text-sm font-medium rounded-lg transition-all duration-200
                      ${activePlatform === platform.id 
                        ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
          >
            {platform.label}
          </button>
        ))}
      </div>
    </div>
  );
} 