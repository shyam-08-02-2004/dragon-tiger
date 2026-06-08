import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  if (typeof resource === 'string' && resource.startsWith('/api')) {
    resource = 'https://dragon-tiger-shyam-babu-s-projects.vercel.app' + resource;
  } else if (resource instanceof Request && resource.url.startsWith('/api')) {
    resource = new Request('https://dragon-tiger-shyam-babu-s-projects.vercel.app' + resource.url, resource);
  }
  return originalFetch(resource, config);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
