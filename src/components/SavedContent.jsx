import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { FaTwitter, FaLinkedin, FaInstagram, FaTrash } from 'react-icons/fa';
import { useToast } from '../context/ToastContext';

const platformIcons = {
  twitter: <FaTwitter className="text-blue-400" />,
  linkedin: <FaLinkedin className="text-blue-700" />,
  instagram: <FaInstagram className="text-pink-600" />
};

export default function SavedContent() {
  const { showToast } = useToast();
  const [savedContent, setSavedContent] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState({});

  async function fetchSavedContent() {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('saved_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching saved content:', error);
      } else {
        setSavedContent(data);
      }
    } finally {
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    fetchSavedContent();
  }, []);

  async function handleDelete(id) {
    setIsDeleting(prev => ({ ...prev, [id]: true }));
    try {
      const { error } = await supabase
        .from('saved_content')
        .delete()
        .match({ id });

      if (error) {
        throw error;
      }

      setSavedContent(prev => prev.filter(item => item.id !== id));
      showToast('Content deleted successfully');
    } catch (error) {
      console.error('Error deleting content:', error);
      showToast('Failed to delete content', 'error');
    } finally {
      setIsDeleting(prev => ({ ...prev, [id]: false }));
    }
  }

  return (
    <div className={`fixed right-0 top-0 h-full bg-white shadow-lg transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ width: '300px' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute left-0 top-1/2 -translate-x-full bg-white p-2 shadow-lg rounded-l-lg"
      >
        {isOpen ? '→' : '←'}
      </button>
      
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-bold">Saved Content</h2>
          <button
            onClick={fetchSavedContent}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center w-6 h-6
                      text-gray-600 hover:text-gray-900 
                      hover:bg-gray-100 rounded-full
                      transition-colors duration-200 
                      disabled:opacity-50"
            title="Refresh saved content"
          >
            <svg 
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
          {savedContent.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No saved content yet</p>
          ) : (
            savedContent.map((item) => (
              <div key={item.id} className="border rounded p-3 relative group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {platformIcons[item.platform]}
                    <span className="text-sm text-gray-600">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={isDeleting[item.id]}
                    className="text-gray-400 hover:text-red-500 transition-colors duration-200
                             opacity-0 group-hover:opacity-100 focus:opacity-100
                             disabled:opacity-50"
                    title="Delete content"
                  >
                    {isDeleting[item.id] ? (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <FaTrash className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-sm">{item.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 