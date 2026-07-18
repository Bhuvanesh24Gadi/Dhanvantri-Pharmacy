import axios from 'axios';

const api = axios.create({
    // If you are using Vite, use this line:
    baseURL: import.meta.env.VITE_API_BASE_URL, 
    
    // OR, if you just want to hardcode it for now to get it working, use this:
    // baseURL: 'https://dhanvantri-backend-3par.onrender.com', 
});

// This "Interceptor" automatically attaches your JWT token to the headers
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;