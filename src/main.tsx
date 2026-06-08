import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const originalFetch = window.fetch.bind(window);
window.fetch = async (...args) => {
  let [resource, config] = args;
  let url = '';
  if (typeof resource === 'string' && resource.startsWith('/api')) {
    url = 'https://dragon-tiger-royal-vip-game.vercel.app' + resource;
    resource = url;
  } else if (resource instanceof Request && resource.url.startsWith('/api')) {
    url = 'https://dragon-tiger-royal-vip-game.vercel.app' + resource.url;
    resource = new Request(url, resource);
  }

  return originalFetch(resource, config);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
