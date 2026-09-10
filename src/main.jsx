import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Intercept Microsoft OAuth redirect if loaded inside popup
const params = new URLSearchParams(window.location.search);
const code = params.get('code');
const state = params.get('state');
if (code && state === 'sgi_onedrive_auth' && window.opener) {
  window.opener.postMessage({ type: 'MS_AUTH_CODE', code }, window.location.origin);
  window.close();
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
