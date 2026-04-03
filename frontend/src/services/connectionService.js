import API from './api';

export const connectToServer = (serverId) => API.post('/connections/connect', { serverId });
export const disconnectFromServer = (connectionId) => API.post('/connections/disconnect', { connectionId });
export const getConnectionStatus = () => API.get('/connections/status');
export const getConnectionHistory = (page = 1, limit = 10) =>
  API.get(`/connections/history?page=${page}&limit=${limit}`);
export const disconnectAll = () => API.post('/connections/disconnect-all');
