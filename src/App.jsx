import React, { useState } from 'react';
import { remixContent, saveContent } from './lib/claude'
import SavedContent from './components/SavedContent';
import { ContentItem } from './components/ContentDisplay';
import { useToast } from './context/ToastContext';
import { FaCheck, FaTimes, FaPencilAlt, FaLinkedin, FaInstagram } from 'react-icons/fa';
import ContentToggle from './components/ContentToggle';

const XIcon = ({ className }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    fill="currentColor"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

function App() {
  const { showToast } = useToast();
  const [input, setInput] = useState('')
  const [outputs, setOutputs] = useState({
    twitter: '',
    linkedin: '',
    instagram: ''
  })
  const [isLoading, setIsLoading] = useState({
    twitter: false,
    linkedin: false,
    instagram: false
  })
  const [generatedContent, setGeneratedContent] = useState([]);
  const [editingTweet, setEditingTweet] = useState(null);
  const [editText, setEditText] = useState('');
  const [activePlatform, setActivePlatform] = useState('twitter');

  const handleRemix = async () => {
    if (!input.trim()) return;

    setIsLoading(prev => ({ ...prev, [activePlatform]: true }));
    try {
      const remixedContent = await remixContent(input, activePlatform);
      if (!remixedContent) {
        throw new Error('No content received from remix service');
      }

      if (activePlatform === 'twitter') {
        const parsedTweets = parseTweets(remixedContent);
        if (parsedTweets.length === 0) {
          throw new Error('No valid tweets found in the remixed content');
        }
        setOutputs(prev => ({
          ...prev,
          [activePlatform]: parsedTweets
        }));
      } else {
        setOutputs(prev => ({
          ...prev,
          [activePlatform]: Array.isArray(remixedContent) ? remixedContent[0] : remixedContent
        }));
      }
    } catch (error) {
      console.error(`Error remixing for ${activePlatform}:`, error);
      showToast(`Failed to remix content: ${error.message}`, 'error');
    } finally {
      setIsLoading(prev => ({ ...prev, [activePlatform]: false }));
    }
  };

  const parseTweets = (tweetText) => {
    if (!tweetText) return [];
    
    // If tweetText is an array, join it with newlines
    const textToProcess = Array.isArray(tweetText) ? tweetText.join('\n') : tweetText.toString();
    
    // Split the text into lines
    const lines = textToProcess.split('\n');
    
    // Find tweets that start with numbers (e.g., "1.", "2.", etc.)
    const tweets = lines
      .filter(line => line.trim())  // Remove empty lines
      .map(line => line.trim())
      .filter(line => /^\d+\./.test(line))  // Find lines starting with numbers
      .map(tweet => {
        // Remove the numbering (e.g., "1. ", "2. ", etc.) from the beginning
        return tweet.replace(/^\d+\.\s*/, '').trim();
      });
    
    // If no numbered tweets were found, try to use the original content
    if (tweets.length === 0 && Array.isArray(tweetText)) {
      return tweetText.map(tweet => tweet.trim());
    }
    
    return tweets;
  };

  const getCharacterCount = (tweet) => {
    return {
      current: tweet.length,
      remaining: 280 - tweet.length
    };
  };

  const openTwitterIntent = (tweet) => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;
    window.open(twitterUrl, '_blank');
  };

  const openLinkedInShare = (content) => {
    // LinkedIn's sharing URL
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodeURIComponent(content)}`;
    window.open(linkedInUrl, '_blank');
  };

  const openInstagramShare = (content) => {
    // Since Instagram doesn't have a direct share URL, we'll copy the content and open Instagram
    navigator.clipboard.writeText(content);
    window.open('https://instagram.com', '_blank');
    showToast('Content copied - paste it into Instagram');
  };

  const handleEditTweet = (tweet, index) => {
    setEditingTweet(index);
    setEditText(tweet);
  };

  const handleCancelEdit = () => {
    setEditingTweet(null);
    setEditText('');
  };

  const handleSaveEdit = (index) => {
    const newOutputs = [...outputs.twitter];
    newOutputs[index] = editText;
    setOutputs(prev => ({
      ...prev,
      twitter: newOutputs
    }));
    setEditingTweet(null);
  };

  return (
    <div className="relative min-h-screen">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          <header className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
              Content Remixer
            </h1>
          </header>

          <ContentToggle 
            activePlatform={activePlatform}
            onChange={setActivePlatform}
          />

          <div className="space-y-6">
            {/* Input Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your content here..."
                className="w-full h-32 rounded-lg border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-800 p-3 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         resize-none"
              />
            </div>

            {/* Single Remix Button */}
            <button
              onClick={handleRemix}
              disabled={isLoading[activePlatform] || !input.trim()}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg 
                       hover:bg-blue-600 transition-colors duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading[activePlatform] ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Remixing...
                </span>
              ) : (
                'Remix Content'
              )}
            </button>

            {/* Output Section */}
            {outputs[activePlatform] && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 capitalize">
                  {activePlatform === 'twitter' ? 'X' : activePlatform} Output
                </h2>
                <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                  {activePlatform === 'twitter' ? (
                    <div className="space-y-6">
                      {outputs.twitter.map((tweet, index) => (
                        <div 
                          key={index}
                          className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden"
                        >
                          {editingTweet === index ? (
                            <div className="p-4">
                              <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full p-2 border rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                rows={3}
                                autoFocus
                              />
                              <div className="mt-2 flex justify-between items-center">
                                <span className="text-sm text-gray-500">
                                  {editText.length}/280 ({280 - editText.length} remaining)
                                </span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleSaveEdit(index)}
                                    className="text-green-500 hover:text-green-600 transition-colors duration-200"
                                    title="Save changes"
                                  >
                                    <FaCheck className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                    title="Cancel edit"
                                  >
                                    <FaTimes className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="p-4">
                                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                                  {tweet.trim()}
                                </p>
                              </div>

                              {editingTweet !== index && (
                                <div className="px-4 pb-2">
                                  <span className="text-sm text-gray-500">
                                    {tweet.length}/280 ({280 - tweet.length} remaining)
                                  </span>
                                </div>
                              )}

                              <div className="px-4 pb-4">
                                {editingTweet !== index && (
                                  <div className="flex justify-end items-center gap-2">
                                    <button
                                      onClick={() => handleEditTweet(tweet, index)}
                                      className="text-gray-400 hover:text-blue-500 transition-colors duration-200"
                                      title="Edit tweet"
                                    >
                                      <FaPencilAlt className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      onClick={() => navigator.clipboard.writeText(tweet.trim())}
                                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5
                                               bg-gray-100 hover:bg-gray-200 
                                               dark:bg-gray-700 dark:hover:bg-gray-600 
                                               text-gray-700 dark:text-gray-300
                                               text-sm rounded-md transition-colors duration-200"
                                    >
                                      Copy
                                    </button>

                                    <button
                                      onClick={() => openTwitterIntent(tweet)}
                                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5
                                               bg-gray-900 hover:bg-gray-800
                                               text-white
                                               text-sm rounded-md transition-colors duration-200"
                                    >
                                      <XIcon className="w-3.5 h-3.5" />
                                      Post to X
                                    </button>

                                    <button
                                      onClick={async () => {
                                        try {
                                          await saveContent(tweet.trim(), 'twitter');
                                          showToast('Post saved successfully!');
                                        } catch (error) {
                                          console.error('Error saving post:', error);
                                          showToast('Failed to save post', 'error');
                                        }
                                      }}
                                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5
                                               bg-green-500 hover:bg-green-600
                                               text-white
                                               text-sm rounded-md transition-colors duration-200"
                                    >
                                      Save
                                    </button>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                        {outputs[activePlatform] || 'Remixed content will appear here...'}
                      </p>
                      {outputs[activePlatform] && (
                        <div className="mt-4 flex justify-end gap-2">
                          <button
                            onClick={() => navigator.clipboard.writeText(outputs[activePlatform])}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5
                                     bg-gray-100 hover:bg-gray-200 
                                     dark:bg-gray-700 dark:hover:bg-gray-600 
                                     text-gray-700 dark:text-gray-300
                                     text-sm rounded-md transition-colors duration-200"
                          >
                            Copy
                          </button>

                          {activePlatform === 'linkedin' && (
                            <button
                              onClick={() => openLinkedInShare(outputs[activePlatform])}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5
                                       bg-[#0A66C2] hover:bg-[#004182]
                                       text-white
                                       text-sm rounded-md transition-colors duration-200"
                            >
                              <FaLinkedin className="w-3.5 h-3.5" />
                              Share
                            </button>
                          )}

                          {activePlatform === 'instagram' && (
                            <button
                              onClick={() => openInstagramShare(outputs[activePlatform])}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5
                                       bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737]
                                       hover:opacity-90
                                       text-white
                                       text-sm rounded-md transition-colors duration-200"
                            >
                              <FaInstagram className="w-3.5 h-3.5" />
                              Share
                            </button>
                          )}

                          <button
                            onClick={async () => {
                              try {
                                await saveContent(outputs[activePlatform], activePlatform);
                                showToast(`${activePlatform} content saved successfully!`);
                              } catch (error) {
                                console.error(`Error saving ${activePlatform} content:`, error);
                                showToast(`Failed to save ${activePlatform} content`, 'error');
                              }
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5
                                     bg-green-500 hover:bg-green-600
                                     text-white
                                     text-sm rounded-md transition-colors duration-200"
                          >
                            Save
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <SavedContent />
    </div>
  )
}

export default App 