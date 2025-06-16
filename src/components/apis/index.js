// src/api/api.js
import axios from 'axios';

const API_BASE = 'https://phancong.onrender.com/api'; // Thay đổi nếu cần

// ============================= WORKER =============================
export const getAllWorkers = () => axios.get(`${API_BASE}/worker`);
export const getWorkerById = (id) => axios.get(`${API_BASE}/worker/${id}`);
export const createWorker = (data) => axios.post(`${API_BASE}/worker`, data);
export const updateWorker = (id, data) => axios.put(`${API_BASE}/worker/${id}`, data);
export const deleteWorker = (id) => axios.delete(`${API_BASE}/worker/${id}`);
export const getMainWorkers = () => axios.get(`${API_BASE}/worker/main`);
export const getAssistantWorkers = () => axios.get(`${API_BASE}/worker/assistant`);

// ============================= SUPERVISOR =============================
export const getAllSupervisors = () => axios.get(`${API_BASE}/supervisors`);
export const getSupervisorById = (id) => axios.get(`${API_BASE}/supervisors/${id}`);
export const createSupervisor = (data) => axios.post(`${API_BASE}/supervisors`, data);
export const updateSupervisor = (id, data) => axios.put(`${API_BASE}/supervisors/${id}`, data);
export const deleteSupervisor = (id) => axios.delete(`${API_BASE}/supervisors/${id}`);

// ============================= CAR =============================
export const getAllCars = () => axios.get(`${API_BASE}/cars`);
export const getCarById = (id) => axios.get(`${API_BASE}/cars/${id}`);
export const createCar = (data) => axios.post(`${API_BASE}/cars`, data);
export const updateCar = (id, data) => axios.put(`${API_BASE}/cars/${id}`, data);
export const deleteCar = (id) => axios.delete(`${API_BASE}/cars/${id}`);
