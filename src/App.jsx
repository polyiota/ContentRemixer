import { useState } from 'react'

function App() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleRemix = async () => {
    setIsLoading(true)
    try {
      // We'll implement the API call later
      const response = await fetch('/api/remix', {
        method: 'POST',
        body: JSON.stringify({ text: inputText }),
        headers: {
          'Content-Type': 'application/json',
        }
      })
      const data = await response.json()
      setOutputText(data.remixedText)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Content Remixer</h1>
      
      <div className="space-y-4">
        <textarea
          className="w-full h-40 p-2 border rounded"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste your text here..."
        />

        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={handleRemix}
          disabled={isLoading || !inputText}
        >
          {isLoading ? 'Remixing...' : 'Remix Content'}
        </button>

        {outputText && (
          <div className="mt-4">
            <h2 className="text-xl font-bold mb-2">Remixed Content:</h2>
            <div className="w-full h-40 p-2 border rounded bg-gray-50">
              {outputText}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App 