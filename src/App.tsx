import React from 'react'
import './App.css'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Web3 Testing App</h1>
        <p>Testing Gala DeFi website with Playwright and Dappwright</p>
        <div className="info">
          <h2>Target Website</h2>
          <a 
            href="https://lpad-frontend-dev1.defi.gala.com/" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            https://lpad-frontend-dev1.defi.gala.com/
          </a>
        </div>
        <div className="instructions">
          <h3>How to run tests:</h3>
          <ul>
            <li><code>npm run test</code> - Run tests headlessly</li>
            <li><code>npm run test:headed</code> - Run tests with browser UI</li>
            <li><code>npm run test:ui</code> - Run tests with Playwright UI</li>
          </ul>
        </div>
      </header>
    </div>
  )
}

export default App

