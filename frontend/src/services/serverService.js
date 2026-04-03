import API from './api';

export const getServers = () => API.get('/servers');
export const getServer = (id) => API.get(`/servers/${id}`);
export const seedServers = () => API.post('/servers/seed');
export const downloadVpnConfig = (serverId) =>
  API.get(`/vpn/config/${serverId}`, { responseType: 'blob' });
