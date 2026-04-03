import API from './api';

export const getPlans = () => API.get('/subscriptions/plans');
export const createOrder = (tier) => API.post('/subscriptions/create-order', { tier });
export const verifyPayment = (orderId) => API.post('/subscriptions/verify', { orderId });
export const getCurrentSubscription = () => API.get('/subscriptions/current');
