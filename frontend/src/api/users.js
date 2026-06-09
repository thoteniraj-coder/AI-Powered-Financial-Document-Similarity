import client from './client';

export const getUsers = () => client.get('/users');
export const getRoles = () => client.get('/users/roles');
export const createUser = (data) => client.post('/users', data);
export const updateUser = (id, data) => client.put(`/users/${id}`, data);
