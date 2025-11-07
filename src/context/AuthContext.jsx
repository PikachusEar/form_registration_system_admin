import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../service/api.js';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on mount
        const storedUser = localStorage.getItem('adminUser');
        const token = localStorage.getItem('adminToken');

        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await authAPI.login(username, password);
            const userData = {
                username: response.username,
                email: response.email,
                role: response.role,
            };
            setUser(userData);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message || 'Login failed' };
        }
    };

    const logout = () => {
        authAPI.logout();
        setUser(null);
    };

    const hasRole = (roles) => {
        if (!user) return false;
        if (Array.isArray(roles)) {
            return roles.includes(user.role);
        }
        return user.role === roles;
    };

    const value = {
        user,
        login,
        logout,
        hasRole,
        isAuthenticated: !!user,
        loading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};