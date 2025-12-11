const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5051/api';

const getAuthToken = () => {
    return localStorage.getItem('adminToken');
};

const apiRequest = async (endpoint, options = {}) => {
    const token = getAuthToken();

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers,
        },
        ...options,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        // Handle 401 Unauthorized
        if (response.status === 401) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            window.location.href = '/login';
            throw new Error('Unauthorized');
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        return {
            success: false,
            message: error.message || 'Network error. Please check your connection.',
            errors: [error.message],
        };
    }
};

// Authentication API
export const authAPI = {
    login: async (username, password) => {
        const response = await apiRequest('/admin/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });

        if (response.token) {
            localStorage.setItem('adminToken', response.token);
            localStorage.setItem('adminUser', JSON.stringify({
                username: response.username,
                email: response.email,
                role: response.role,
            }));
        }

        return response;
    },

    logout: () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
    },

    getCurrentUser: async () => {
        return await apiRequest('/admin/me');
    },
};

// Registration API
export const registrationAPI = {
    getAll: async () => {
        return await apiRequest('/registrations');
    },

    getById: async (id) => {
        return await apiRequest(`/registrations/${id}`);
    },

    updateInfo: async (id, userData) => {
        return await apiRequest(`/registrations/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData),
        });
    },

    updateStatus: async (id, statusData) => {
        return await apiRequest(`/registrations/${id}/payment-status`, {
            method: 'PUT',
            body: JSON.stringify(statusData),
        });
    },

    bulkUpdateStatus: async (bulkData) => {
        return await apiRequest('/registrations/bulk-status', {
            method: 'PUT',
            body: JSON.stringify(bulkData),
        });
    },

    sendNotification: async (id, customMessage = null) => {
        return await apiRequest(`/registrations/${id}/send-notification`, {
            method: 'POST',
            body: JSON.stringify({ registrationId: id, Message: customMessage }),
        });
    },

    sendCompleteNotification: async (id) => {
        return await apiRequest(`/registrations/${id}/send-registration-complete`, {
            method: 'POST',
        });
    },

    exportCSV: async () => {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/registrations/export-csv`, {
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
        });

        if (!response.ok) {
            throw new Error('Failed to export CSV');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `registrations_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    },

    delete: async (id) => {
        return await apiRequest(`/registrations/${id}`, {
            method: 'DELETE',
        });
    },
};

// Admin User API
export const adminUserAPI = {
    getAll: async () => {
        return await apiRequest('/Admin/getAllusers');
    },

    getById: async (id) => {
        return await apiRequest(`/admin/users/${id}`);
    },

    create: async (userData) => {
        return await apiRequest('/admin/users', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    },

    update: async (id, userData) => {
        return await apiRequest(`/admin/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData),
        });
    },

    updatePassword: async (id, newPassword) => {
        return await apiRequest(`/admin/users/${id}/password`, {
            method: 'PUT',
            body: JSON.stringify({ userId: id, newPassword }),
        });
    },

    delete: async (id) => {
        return await apiRequest(`/admin/users/${id}`, {
            method: 'DELETE',
        });
    },
};

// Exam Section Names API
export const examSectionNamesAPI = {
    getAll: async () => {
        return await apiRequest('/SectionNames');
    },

    getActive: async () => {
        return await apiRequest('/SectionNames/active');
    },

    getById: async (id) => {
        return await apiRequest(`/SectionNames/${id}`);
    },

    getByDate: async (date) => {
        return await apiRequest(`/SectionNames/by-date/${date}`);
    },

    create: async (sectionData) => {
        return await apiRequest('/SectionNames', {
            method: 'POST',
            body: JSON.stringify(sectionData),
        });
    },

    update: async (id, sectionData) => {
        return await apiRequest(`/SectionNames/${id}`, {
            method: 'PUT',
            body: JSON.stringify(sectionData),
        });
    },

    toggleActive: async (id) => {
        return await apiRequest(`/SectionNames/${id}/toggle-active`, {
            method: 'PATCH',
        });
    },

    delete: async (id) => {
        return await apiRequest(`/SectionNames/${id}`, {
            method: 'DELETE',
        });
    },
};