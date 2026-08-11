// src/utils/apiHelper.js
export async function secureFetch(url, options = {}) {
  const token = localStorage.getItem('token');
 
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };
 
  const res = await fetch(url, { ...options, headers });
 
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('profileName');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    window.location.href = '/'; // Ya router.push('/') agar component mein hain
    return null;
  }
 
  return res;
}
 