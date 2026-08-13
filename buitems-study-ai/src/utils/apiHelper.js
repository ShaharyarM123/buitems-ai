//2nd edit

// src/utils/apiHelper.js

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://your-railway-backend.up.railway.app';

export async function secureFetch(endpoint, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // 1. Agar endpoint relative path hai ('/api/...'), toh Backend URL prepend karein
  const fullUrl = endpoint.startsWith('http') 
    ? endpoint 
    : `${BACKEND_URL}${endpoint}`;

  // 2. Default Headers set karein
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(fullUrl, { ...options, headers });

    // 3. Unauthorized (401) Error Handling: Token exp/invalid par auto logout
    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('profileName');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
        window.location.href = '/login'; // Ya '/' home page
      }
      return null;
    }

    return res;
  } catch (error) {
    console.error('API Fetch Error:', error);
    throw error;
  }
}




// // src/utils/apiHelper.js
// export async function secureFetch(url, options = {}) {
//   const token = localStorage.getItem('token');
 
//   const headers = {
//     'Content-Type': 'application/json',
//     ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
//     ...(options.headers || {})
//   };
 
//   const res = await fetch(url, { ...options, headers });
 
//   if (res.status === 401) {
//     localStorage.removeItem('token');
//     localStorage.removeItem('profileName');
//     document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
//     window.location.href = '/'; // Ya router.push('/') agar component mein hain
//     return null;
//   }
 
//   return res;
// }
 