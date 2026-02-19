// API service for making requests to the backend
const API_BASE_URL = "/api";

// Helper function to make API requests with cookies
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    credentials: 'include', // Important: Include cookies in requests
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    // Handle non-JSON responses
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() || `HTTP error! status: ${response.status}` };
    }

    if (!response.ok) {
      const errorMessage = data.message || data.error || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    // Re-throw if it's already an Error with a message
    if (error instanceof Error) {
      throw error;
    }
    // Otherwise wrap in Error
    throw new Error(error.message || 'Network error occurred');
  }
}

// Auth API methods
export const authAPI = {
  login: async (email, password) => {
    // Only send email and password for login (no name field)
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (name, email, password) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },

  // Verify if user is authenticated by checking cookie
  verify: async () => {
    return apiRequest('/auth/verify', {
      method: 'GET',
    });
  },
};

// Event (checklist) API methods
export const eventsAPI = {
  // Create a new event (optionally with tasks)
  createEvent: async (eventData) => {
    return apiRequest('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },

  // Get paginated list of events
  getEvents: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const suffix = query ? `?${query}` : '';
    return apiRequest(`/events${suffix}`, {
      method: 'GET',
    });
  },

  // Get a single event by id
  getEventById: async (id) => {
    return apiRequest(`/events/${id}`, {
      method: 'GET',
    });
  },

  // Update event
  updateEvent: async (id, updates) => {
    return apiRequest(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete event
  deleteEvent: async (id) => {
    return apiRequest(`/events/${id}`, {
      method: 'DELETE',
    });
  },

  // Task operations
  addTask: async (eventId, taskData) => {
    return apiRequest(`/events/${eventId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  updateTask: async (eventId, taskId, updates) => {
    return apiRequest(`/events/${eventId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  deleteTask: async (eventId, taskId) => {
    return apiRequest(`/events/${eventId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },
};

export default apiRequest;
