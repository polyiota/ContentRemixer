import React from 'react';
import { FaLinkedin, FaInstagram } from 'react-icons/fa';

// Custom X (Twitter) icon component
const XIcon = ({ className }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    fill="currentColor"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const platforms = [
  { 
    id: 'twitter', 
    label: 'X', 
    icon: <XIcon className="w-5 h-5" />,
    color: 'text-gray-900 dark:text-white'
  },
  { 
    id: 'linkedin', 
    label: 'LinkedIn', 
    icon: <FaLinkedin className="w-5 h-5" />,
    color: 'text-[#0A66C2]'
  },
  { 
    id: 'instagram', 
    label: 'Instagram', 
    icon: <FaInstagram className="w-5 h-5" />,
    color: 'text-[#E4405F]'
  }
];

export default function ContentToggle({ activePlatform, onChange }) {
  return (
    <div className="relative w-full max-w-md mx-auto mb-6">
      <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-2">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => onChange(platform.id)}
            className={`flex-1 relative py-2 px-4 flex flex-col items-center gap-1 rounded-lg transition-all duration-200
                      ${activePlatform === platform.id 
                        ? 'bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-600'}`}
          >
            <span className={`${activePlatform === platform.id ? platform.color : 'text-gray-500 dark:text-gray-400'}`}>
              {platform.icon}
            </span>
            <span className={`text-xs font-medium ${
              activePlatform === platform.id 
                ? 'text-gray-900 dark:text-white' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {platform.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
} 