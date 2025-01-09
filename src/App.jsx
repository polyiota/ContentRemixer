import React, { useState } from 'react';
import { remixContent, saveContent } from './lib/claude'
import SavedContent from './components/SavedContent';
import { ContentItem } from './components/ContentDisplay';
import { useToast } from './context/ToastContext';
import { FaCheck, FaTimes, FaPencilAlt } from 'react-icons/fa';
import ContentToggle from './components/ContentToggle';

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
    if (!input.trim()) return

    setIsLoading(prev => ({ ...prev, [activePlatform]: true }))
    try {
      const remixedContent = await remixContent(input, activePlatform)
      if (activePlatform === 'twitter') {
        setOutputs(prev => ({
          ...prev,
          [activePlatform]: remixedContent
        }))
      } else {
        setOutputs(prev => ({
          ...prev,
          [activePlatform]: remixedContent[0]
        }))
      }
    } catch (error) {
      console.error(`Error remixing for ${activePlatform}:`, error)
    } finally {
      setIsLoading(prev => ({ ...prev, [activePlatform]: false }))
    }
  }

  const parseTweets = (tweetText) => {
    if (!tweetText) return [];
    
    // Split the text into lines
    const lines = tweetText.split('\n');
    
    // Find the index where the actual tweets start (usually after "Here are 5 engaging tweets...")
    const startIndex = lines.findIndex(line => 
      line.trim().match(/^\d+\./) // Looks for lines starting with numbers and period
    );
    
    // If we found the start of tweets, remove the intro text
    const tweetLines = startIndex !== -1 
      ? lines.slice(startIndex).join('\n')
      : tweetText;
      
    // Split on numbered lines and filter empty lines
    return tweetLines
      .split(/(?:\r?\n){2,}/)
      .filter(tweet => tweet.trim() && tweet.trim().match(/^\d+\./)); // Only keep numbered tweets
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
                  {activePlatform} Output
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

                              <div className="px-4 pb-4 flex flex-col gap-2">
                                {editingTweet !== index && (
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => handleEditTweet(tweet, index)}
                                      className="text-gray-400 hover:text-blue-500 transition-colors duration-200"
                                      title="Edit tweet"
                                    >
                                      <FaPencilAlt className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}

                                <button
                                  onClick={() => navigator.clipboard.writeText(tweet.trim())}
                                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2
                                           bg-gray-100 hover:bg-gray-200 
                                           dark:bg-gray-700 dark:hover:bg-gray-600 
                                           text-gray-700 dark:text-gray-300
                                           rounded-md transition-colors duration-200"
                                >
                                  Copy
                                </button>

                                <button
                                  onClick={() => openTwitterIntent(tweet)}
                                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2
                                           bg-[#1DA1F2] hover:bg-[#1a8cd8]
                                           text-white
                                           rounded-md transition-colors duration-200"
                                >
                                  Tweet
                                </button>

                                <button
                                  onClick={async () => {
                                    try {
                                      await saveContent(tweet.trim(), 'twitter');
                                      showToast('Tweet saved successfully!');
                                    } catch (error) {
                                      console.error('Error saving tweet:', error);
                                      showToast('Failed to save tweet', 'error');
                                    }
                                  }}
                                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2
                                           bg-green-500 hover:bg-green-600
                                           text-white
                                           rounded-md transition-colors duration-200"
                                >
                                  Save
                                </button>
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
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => navigator.clipboard.writeText(outputs[activePlatform])}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-md
                                     bg-gray-100 hover:bg-gray-200 
                                     dark:bg-gray-700 dark:hover:bg-gray-600 
                                     text-gray-700 dark:text-gray-300
                                     transition-colors duration-200"
                          >
                            Copy
                          </button>
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
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-md
                                     bg-green-500 hover:bg-green-600
                                     text-white
                                     transition-colors duration-200"
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