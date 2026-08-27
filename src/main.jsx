import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { WeddingProvider } from './context/WeddingContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <WeddingProvider>
        <App />
      </WeddingProvider>
    </BrowserRouter>
  </StrictMode>,
)
