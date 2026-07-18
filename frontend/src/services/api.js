import axios from 'axios';

const api = axios.create({
    baseURL: "https://dhanvantri-backend-3par.onrender.com",
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