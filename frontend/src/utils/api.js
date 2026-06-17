const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  // Retrieve token from localStorage prioritizing based on page pathname
  let token = null;
  if (typeof window !== 'undefined') {
    const isAdminPath = window.location.pathname.startsWith('/admin');
    if (isAdminPath) {
      token = localStorage.getItem('admin_token') || localStorage.getItem('customer_token');
    } else {
      token = localStorage.getItem('customer_token') || localStorage.getItem('admin_token');
    }
  }
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    // Check if empty response (like DELETE 204)
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (err) {
    console.error(`API Request Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Auth Admin
  login: (username, password) => 
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  // Auth Customer
  customerRegister: (name, email, password) =>
    request('/customer/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
  customerLogin: (email, password) =>
    request('/customer/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  customerGoogleLogin: (name, email) =>
    request('/customer/google', {
      method: 'POST',
      body: JSON.stringify({ name, email }),
    }),

  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== '' && val !== null) {
        query.append(key, val);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/products${queryString}`);
  },
  getProductById: (id) => request(`/products/${id}`),
  createProduct: (data) => 
    request('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateProduct: (id, data) => 
    request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteProduct: (id) => 
    request(`/products/${id}`, {
      method: 'DELETE',
    }),

  // Orders
  createOrder: (data) => 
    request('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getOrders: () => request('/orders'),
  getMyOrders: () => request('/orders/my-orders'),
  getOrderById: (id) => request(`/orders/${id}`),
  trackOrderByWhatsapp: (whatsapp) => request(`/orders/track?whatsapp=${encodeURIComponent(whatsapp)}`),
  updateOrderStatus: (id, data) => 
    request(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getSalesStats: () => request('/orders/stats'),

  // Customer Surveys
  submitSurvey: (data) => 
    request('/customers-data', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getSurveys: () => request('/customers-data'),
  getSurveyStats: () => request('/customers-data/stats'),

  // Testimonials
  getTestimonials: () => request('/testimonials'),
  submitTestimonial: (data) => 
    request('/testimonials', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
