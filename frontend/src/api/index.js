const BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

function getToken() { return localStorage.getItem('access_token'); }

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers };
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
    if (res.status === 401) { localStorage.removeItem('access_token'); localStorage.removeItem('refresh_token'); window.location.href = '/'; return; }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || data.error || JSON.stringify(data));
    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) throw new Error('Cannot connect to server. Make sure Django and Express are running.');
    throw err;
  }
}

export const auth = {
  register: (data) => request('/auth/register/', { method: 'POST', body: JSON.stringify(data) }),
  login: async (credentials) => {
    const data = await request('/auth/login/', { method: 'POST', body: JSON.stringify(credentials) });
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    return data;
  },
  logout: () => { localStorage.removeItem('access_token'); localStorage.removeItem('refresh_token'); },
  me: () => request('/auth/me/'),
};

export const quizzes = {
  list: () => request('/quizzes/'),
  get: (id) => request(`/quizzes/${id}/`),
  create: (data) => request('/quizzes/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/quizzes/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id) => request(`/quizzes/${id}/`, { method: 'DELETE' }),
  submit: (id, data) => request(`/quizzes/${id}/submit/`, { method: 'POST', body: JSON.stringify(data) }),
};

export const questions = {
  create: (data) => request('/questions/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/questions/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id) => request(`/questions/${id}/`, { method: 'DELETE' }),
};

export const results = {
  list: () => request('/results/'),
  leaderboard: (quizId) => request(`/results/leaderboard/?quiz_id=${quizId}`),
};
