import { useState } from 'react'
import './App.css'

function App() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState(null)

  const handleScrape = async (e) => {
    e.preventDefault()
    if (!url) return
    
    setIsLoading(true)
    // Placeholder for actual scraping logic
    setTimeout(() => {
      setResults({ message: 'Scraping functionality will be implemented here' })
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🔍 Grantify</h1>
        <p className="subtitle">Powerful Web Scraping Made Simple</p>
      </header>

      <main className="main-content">
        <div className="hero-section">
          <h2>Extract Data from Any Website</h2>
          <p>Enter a URL below to start scraping data quickly and efficiently</p>
        </div>

        <form onSubmit={handleScrape} className="scrape-form">
          <div className="input-group">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="url-input"
              required
            />
            <button 
              type="submit" 
              className="scrape-button"
              disabled={isLoading}
            >
              {isLoading ? 'Scraping...' : 'Start Scraping'}
            </button>
          </div>
        </form>

        {results && (
          <div className="results-section">
            <h3>Results</h3>
            <div className="results-content">
              <p>{results.message}</p>
            </div>
          </div>
        )}

        <div className="features">
          <div className="feature-card">
            <h3>⚡ Fast</h3>
            <p>High-performance scraping engine</p>
          </div>
          <div className="feature-card">
            <h3>🎯 Accurate</h3>
            <p>Precise data extraction</p>
          </div>
          <div className="feature-card">
            <h3>🔒 Secure</h3>
            <p>Your data stays private</p>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>© 2026 Grantify - Web Scraping Tool</p>
      </footer>
    </div>
  )
}

export default App
