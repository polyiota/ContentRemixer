import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';

const platformIcons = {
  twitter: <FaTwitter className="text-blue-400" />,
  linkedin: <FaLinkedin className="text-blue-700" />,
  instagram: <FaInstagram className="text-pink-600" />
};

export default function SavedContent() {
  const [savedContent, setSavedContent] = useState([]);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    fetchSavedContent();
  }, []);

  async function fetchSavedContent() {
    const { data, error } = await supabase
      .from('saved_content')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved content:', error);
    } else {
      setSavedContent(data);
    }
  }

  return (
    <div className={`fixed right-0 top-0 h-full bg-white shadow-lg transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ width: '300px' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute left-0 top-1/2 -translate-x-full bg-white p-2 shadow-lg"
      >
        {isOpen ? '→' : '←'}
      </button>
      
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Saved Content</h2>
        <div className="space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
          {savedContent.map((item) => (
            <div key={item.id} className="border rounded p-3">
              <div className="flex items-center gap-2 mb-2">
                {platformIcons[item.platform]}
                <span className="text-sm text-gray-600">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm">{item.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 