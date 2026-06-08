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

  if (url && config && config.headers) {
    const headers = new Headers(config.headers);
    if (headers.get('Content-Type') === 'application/json' && config.body && typeof config.body === 'string') {
      headers.set('Content-Type', 'application/x-www-form-urlencoded');
      try {
        const bodyObj = JSON.parse(config.body);
        const urlParams = new URLSearchParams();
        for (const [key, value] of Object.entries(bodyObj)) {
            if (typeof value === 'object') {
                urlParams.append(key, JSON.stringify(value));
            } else {
                urlParams.append(key, String(value));
            }
        }
        config.body = urlParams.toString();
      } catch(e) {}
      config.headers = headers;
    }
  }

  return originalFetch(resource, config);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
