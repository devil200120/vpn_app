import API from './api';

export const loginUser = (credentials) => API.post('/auth/login', credentials);
export const registerUser = (userData) => API.post('/auth/register', userData);
export const logoutUser = () => API.post('/auth/logout');
export const refreshToken = () => API.post('/auth/refresh');
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/profile', data);
