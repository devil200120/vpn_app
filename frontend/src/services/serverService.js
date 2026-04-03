import API from './api';

export const getServers = () => API.get('/servers');
export const getServer = (id) => API.get(`/servers/${id}`);
export const seedServers = () => API.post('/servers/seed');
