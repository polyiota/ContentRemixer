import { useState } from 'react'
import { remixContent } from './lib/claude'

function App() {
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

  const handleRemix = async (platform) => {
    if (!input.trim()) return

    setIsLoading(prev => ({ ...prev, [platform]: true }))
    try {
      const remixedContent = await remixContent(input, platform)
      setOutputs(prev => ({
        ...prev,
        [platform]: remixedContent
      }))
    } catch (error) {
      console.error(`Error remixing for ${platform}:`, error)
    } finally {
      setIsLoading(prev => ({ ...prev, [platform]: false }))
    }
  }

  return (
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

          {/* Output Sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(outputs).map(([platform, output]) => (
              <div
                key={platform}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4"
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 capitalize">
                  {platform}
                </h2>
                <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 min-h-[100px]">
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {output || 'Remixed content will appear here...'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App 