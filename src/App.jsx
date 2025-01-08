import React from 'react';
import { useState } from 'react'
import { remixContent, saveContent } from './lib/claude'
import SavedContent from './components/SavedContent';
import { ContentItem } from './components/ContentDisplay';
import { useToast } from './context/ToastContext';

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

  const handleRemix = async (platform) => {
    if (!input.trim()) return

    setIsLoading(prev => ({ ...prev, [platform]: true }))
    try {
      const remixedContent = await remixContent(input, platform)
      if (platform === 'twitter') {
        setOutputs(prev => ({
          ...prev,
          [platform]: remixedContent
        }))
      } else {
        setOutputs(prev => ({
          ...prev,
          [platform]: remixedContent[0]
        }))
      }
    } catch (error) {
      console.error(`Error remixing for ${platform}:`, error)
    } finally {
      setIsLoading(prev => ({ ...prev, [platform]: false }))
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

  return (
    <div className="relative min-h-screen">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          <header className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Content Remixer
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Transform your content for different social media platforms
            </p>
          </header>

          <div className="space-y-6">
            {/* Input Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Your Content
              </label>
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

            {/* Platform Buttons */}
            <div className="flex flex-wrap gap-4">
              {Object.keys(outputs).map((platform) => (
                <button
                  key={platform}
                  onClick={() => handleRemix(platform)}
                  disabled={isLoading[platform] || !input.trim()}
                  className="flex-1 min-w-[150px] px-4 py-2 bg-blue-500 text-white rounded-lg 
                           hover:bg-blue-600 transition-colors duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading[platform] ? (
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
                    `Remix for ${platform.charAt(0).toUpperCase() + platform.slice(1)}`
                  )}
                </button>
              ))}
            </div>

            {/* Modified Output Sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(outputs).map(([platform, output]) => (
                <div
                  key={platform}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4"
                >
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 capitalize">
                    {platform}
                  </h2>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                    {platform === 'twitter' && output ? (
                      <div className="space-y-6">
                        {output.map((tweet, index) => (
                          <div 
                            key={index}
                            className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden"
                          >
                            {/* Tweet content */}
                            <div className="p-4">
                              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                                {tweet.trim()}
                              </p>
                            </div>

                            {/* Character count */}
                            <div className="px-4 pb-2">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {tweet.length}/280 ({280 - tweet.length} remaining)
                              </span>
                            </div>

                            {/* Action buttons in a vertical stack */}
                            <div className="px-4 pb-4 flex flex-col gap-2">
                              <button
                                onClick={() => navigator.clipboard.writeText(tweet.trim())}
                                className="inline-flex items-center justify-center gap-1.5 px-4 py-2
                                         bg-gray-100 hover:bg-gray-200 
                                         dark:bg-gray-700 dark:hover:bg-gray-600 
                                         text-gray-700 dark:text-gray-300
                                         rounded-md transition-colors duration-200"
                              >
                                <svg 
                                  className="w-4 h-4" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" 
                                  />
                                </svg>
                                Copy
                              </button>

                              <button
                                onClick={() => openTwitterIntent(tweet)}
                                className="inline-flex items-center justify-center gap-1.5 px-4 py-2
                                         bg-[#1DA1F2] hover:bg-[#1a8cd8]
                                         text-white
                                         rounded-md transition-colors duration-200"
                              >
                                <svg 
                                  className="w-4 h-4" 
                                  fill="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                </svg>
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
                                <svg 
                                  className="w-4 h-4" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M5 13l4 4L19 7" 
                                  />
                                </svg>
                                Save
                              </button>
                            </div>

                            {/* Divider for visual separation */}
                            {index < output.length - 1 && (
                              <div className="border-t border-gray-200 dark:border-gray-600 mt-2" />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                          {output || 'Remixed content will appear here...'}
                        </p>
                        {output && (
                          <div className="mt-4 flex gap-2">
                            <button
                              onClick={() => navigator.clipboard.writeText(output)}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-md
                                       bg-gray-100 hover:bg-gray-200 
                                       dark:bg-gray-700 dark:hover:bg-gray-600 
                                       text-gray-700 dark:text-gray-300
                                       transition-colors duration-200"
                            >
                              <svg 
                                className="w-4 h-4" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" 
                                />
                              </svg>
                              Copy
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  await saveContent(output, platform);
                                  showToast(`${platform.charAt(0).toUpperCase() + platform.slice(1)} content saved successfully!`);
                                } catch (error) {
                                  console.error(`Error saving ${platform} content:`, error);
                                  showToast(`Failed to save ${platform} content`, 'error');
                                }
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-md
                                       bg-green-500 hover:bg-green-600
                                       text-white
                                       transition-colors duration-200"
                            >
                              <svg 
                                className="w-4 h-4" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M5 13l4 4L19 7" 
                                />
                              </svg>
                              Save
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Add the SavedContent sidebar */}
      <SavedContent />
    </div>
  )
}

export default App 