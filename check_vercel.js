fetch('https://dragon-tiger-shyam-babu-s-projects.vercel.app').then(r=>r.text()).then(html=>{console.log(html.includes('index-DwFJkBxb.js') ? 'VERCEL_IS_UPDATED' : 'VERCEL_NOT_UPDATED');})
