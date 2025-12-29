// API Configuration - Update this URL to match your local backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Generic fetch wrapper with error handling
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Students API
export const studentsAPI = {
  getAll: () => fetchAPI<any[]>('/students'),
  getById: (id: string) => fetchAPI<any>(`/students/${id}`),
  create: (data: any) => fetchAPI<any>('/students', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchAPI<any>(`/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchAPI<any>(`/students/${id}`, {
    method: 'DELETE',
  }),
};

// Courses API
export const coursesAPI = {
  getAll: () => fetchAPI<any[]>('/courses'),
  getById: (id: string) => fetchAPI<any>(`/courses/${id}`),
  create: (data: any) => fetchAPI<any>('/courses', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchAPI<any>(`/courses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchAPI<any>(`/courses/${id}`, {
    method: 'DELETE',
  }),
};

// Payments API
export const paymentsAPI = {
  getAll: () => fetchAPI<any[]>('/payments'),
  getById: (id: string) => fetchAPI<any>(`/payments/${id}`),
  create: (data: any) => fetchAPI<any>('/payments', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchAPI<any>(`/payments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchAPI<any>(`/payments/${id}`, {
    method: 'DELETE',
  }),
};

// Expenses API
export const expensesAPI = {
  getAll: () => fetchAPI<any[]>('/expenses'),
  getById: (id: string) => fetchAPI<any>(`/expenses/${id}`),
  create: (data: any) => fetchAPI<any>('/expenses', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchAPI<any>(`/expenses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchAPI<any>(`/expenses/${id}`, {
    method: 'DELETE',
  }),
};

// Settings API (stored locally since it's app-specific)
export const settingsAPI = {
  getCenterName: () => localStorage.getItem('coaching_center_name') || 'My Coaching Center',
  setCenterName: (name: string) => localStorage.setItem('coaching_center_name', name),
};

// Health check to verify API connection
export const checkAPIHealth = async (): Promise<boolean> => {
  try {
    await fetchAPI('/health');
    return true;
  } catch {
    return false;
  }
};
