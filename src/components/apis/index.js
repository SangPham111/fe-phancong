import axios from 'axios';

// ⚙️ Tự phát hiện IP nội bộ hay từ xa
const isInternalNetwork =
  window.location.hostname.startsWith('192.') ||
  window.location.hostname === 'localhost';

const API_BASE = isInternalNetwork
  ? 'http://192.168.1.20:3000/api'         // 👉 IP nội bộ khi ở cùng Wi-Fi
  : 'http://100.127.133.38:3000/api';      // 👉 IP Tailscale khi ở mạng khác

// ============================= WORKER =============================
export const getAllWorkers = () => axios.get(`${API_BASE}/worker`);
export const getWorkerById = (id) => axios.get(`${API_BASE}/worker/${id}`);
export const createWorker = (data) => axios.post(`${API_BASE}/worker`, data);
export const updateWorker = (id, data) => axios.put(`${API_BASE}/worker/${id}`, data);
export const deleteWorker = (id) => axios.delete(`${API_BASE}/worker/${id}`);
export const getAvailableWorkers = () => axios.get(`${API_BASE}/worker/available`);
export const getBusyWorkersWithCars = () => axios.get(`${API_BASE}/worker/busy`);

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

export const updateCarStatus = (id, status = []) =>
  axios.put(`${API_BASE}/cars/${id}/status`, { status });

export const updateCarStatusWithWorker = (id, status, newWorkerId = null) =>
  axios.put(`${API_BASE}/cars/${id}/status`, {
    status,
    ...(newWorkerId && { newWorkerId }),
  });

export const getCarByPlateNumber = (plateNumber) =>
  axios.get(`${API_BASE}/cars/by-plate/${plateNumber}`);

export const getCarStats = () => axios.get(`${API_BASE}/cars/stats`);
export const getWorkingAndPendingCars = () =>
  axios.get(`${API_BASE}/cars/working-pending`);
export const getCarsByLocation = (locationId) =>
  axios.get(`${API_BASE}/cars/by-location/${locationId}`);
export const getOverdueCars = () => axios.get(`${API_BASE}/cars/overdue`);

// ============================= CATE CAR =============================
export const getAllCateCars = () => axios.get(`${API_BASE}/catecar`);
export const createCateCar = (data) => axios.post(`${API_BASE}/catecar/create`, data);
export const updateCateCar = (id, data) => axios.put(`${API_BASE}/catecar/${id}`, data);
export const deleteCateCar = (id) => axios.delete(`${API_BASE}/catecar/${id}`);

// ============================= LOCATION =============================
export const getAllLocations = () => axios.get(`${API_BASE}/locations`);
export const getLocationById = (id) => axios.get(`${API_BASE}/locations/${id}`);
export const createLocation = (data) => axios.post(`${API_BASE}/locations`, data);
export const updateLocation = (id, data) => axios.put(`${API_BASE}/locations/${id}`, data);
export const deleteLocation = (id) => axios.delete(`${API_BASE}/locations/${id}`);
