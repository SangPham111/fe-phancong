// // src/api/api.js
// import axios from 'axios';

// const API_BASE = 'http://localhost:3000/api'; // Thay đổi nếu cần

// // ============================= WORKER =============================
// export const getAllWorkers = () => axios.get(`${API_BASE}/worker`);
// export const getWorkerById = (id) => axios.get(`${API_BASE}/worker/${id}`);
// export const createWorker = (data) => axios.post(`${API_BASE}/worker`, data);
// export const updateWorker = (id, data) => axios.put(`${API_BASE}/worker/${id}`, data);
// export const deleteWorker = (id) => axios.delete(`${API_BASE}/worker/${id}`);
// export const getAvailableWorkers = () => axios.get(`${API_BASE}/worker/available`);
// export const getBusyWorkersWithCars = () => axios.get(`${API_BASE}/worker/busy`);

// // ============================= SUPERVISOR =============================
// export const getAllSupervisors = () => axios.get(`${API_BASE}/supervisors`);
// export const getSupervisorById = (id) => axios.get(`${API_BASE}/supervisors/${id}`);
// export const createSupervisor = (data) => axios.post(`${API_BASE}/supervisors`, data);
// export const updateSupervisor = (id, data) => axios.put(`${API_BASE}/supervisors/${id}`, data);
// export const deleteSupervisor = (id) => axios.delete(`${API_BASE}/supervisors/${id}`);

// // ============================= CAR =============================
// export const getAllCars = () => axios.get(`${API_BASE}/cars`);
// export const getCarById = (id) => axios.get(`${API_BASE}/cars/${id}`);
// export const createCar = (data) => axios.post(`${API_BASE}/cars`, data);
// export const updateCar = (id, data) => axios.put(`${API_BASE}/cars/${id}`, data);
// export const deleteCar = (id) => axios.delete(`${API_BASE}/cars/${id}`);
// export const updateCarStatus = (id, status = []) =>
//   axios.put(`${API_BASE}/cars/${id}/status`, { status });

// export const getCarByPlateNumber = (plateNumber) =>
//   axios.get(`${API_BASE}/cars/by-plate/${plateNumber}`);

// // ✅ Mới thêm
// export const getCarStats = () => axios.get(`${API_BASE}/cars/stats`);
// export const getWorkingAndPendingCars = () =>
//   axios.get(`${API_BASE}/cars/working-pending`);
// export const getCarsByLocation = (locationId) =>
//   axios.get(`${API_BASE}/cars/by-location/${locationId}`);
// // ============================= CATE CAR (Loại xe) =============================
// export const getAllCateCars = () => axios.get(`${API_BASE}/catecar`);
// export const createCateCar = (data) => axios.post(`${API_BASE}/catecar/create`, data);
// export const updateCateCar = (id, data) => axios.put(`${API_BASE}/catecar/${id}`, data);
// export const deleteCateCar = (id) => axios.delete(`${API_BASE}/catecar/${id}`);
// // ============================= LOCATION =============================
// export const getAllLocations = () => axios.get(`${API_BASE}/locations`);
// export const getLocationById = (id) => axios.get(`${API_BASE}/locations/${id}`);
// export const createLocation = (data) => axios.post(`${API_BASE}/locations`, data);
// export const updateLocation = (id, data) => axios.put(`${API_BASE}/locations/${id}`, data);
// export const deleteLocation = (id) => axios.delete(`${API_BASE}/locations/${id}`);
// src/api/api.js
import axios from 'axios';

const API_BASE = '/api/proxy';

// ============================= WORKER =============================
export const getAllWorkers = () => axios.get(`${API_BASE}/worker`).then(res => res.data);
export const getWorkerById = (id) => axios.get(`${API_BASE}/worker/${id}`).then(res => res.data);
export const createWorker = (data) => axios.post(`${API_BASE}/worker`, data).then(res => res.data);
export const updateWorker = (id, data) => axios.put(`${API_BASE}/worker/${id}`, data).then(res => res.data);
export const deleteWorker = (id) => axios.delete(`${API_BASE}/worker/${id}`).then(res => res.data);
export const getAvailableWorkers = () => axios.get(`${API_BASE}/worker/available`).then(res => res.data);
export const getBusyWorkersWithCars = () => axios.get(`${API_BASE}/worker/busy`).then(res => res.data);

// ============================= SUPERVISOR =============================
export const getAllSupervisors = () => axios.get(`${API_BASE}/supervisors`).then(res => res.data);
export const getSupervisorById = (id) => axios.get(`${API_BASE}/supervisors/${id}`).then(res => res.data);
export const createSupervisor = (data) => axios.post(`${API_BASE}/supervisors`, data).then(res => res.data);
export const updateSupervisor = (id, data) => axios.put(`${API_BASE}/supervisors/${id}`, data).then(res => res.data);
export const deleteSupervisor = (id) => axios.delete(`${API_BASE}/supervisors/${id}`).then(res => res.data);

// ============================= CAR =============================
export const getAllCars = () => axios.get(`${API_BASE}/cars`).then(res => res.data);
export const getCarById = (id) => axios.get(`${API_BASE}/cars/${id}`).then(res => res.data);
export const createCar = (data) => axios.post(`${API_BASE}/cars`, data).then(res => res.data);
export const updateCar = (id, data) => axios.put(`${API_BASE}/cars/${id}`, data).then(res => res.data);
export const deleteCar = (id) => axios.delete(`${API_BASE}/cars/${id}`).then(res => res.data);

export const updateCarStatus = (id, status = []) =>
  axios.put(`${API_BASE}/cars/${id}/status`, { status }).then(res => res.data);

export const updateCarStatusWithWorker = (id, status, newWorkerId = null) =>
  axios.put(`${API_BASE}/cars/${id}/status`, {
    status,
    ...(newWorkerId && { newWorkerId }),
  }).then(res => res.data);

export const getCarByPlateNumber = (plateNumber) =>
  axios.get(`${API_BASE}/cars/by-plate/${plateNumber}`).then(res => res.data);

export const getCarStats = () => axios.get(`${API_BASE}/cars/stats`).then(res => res.data);
export const getWorkingAndPendingCars = () => axios.get(`${API_BASE}/cars/working-pending`).then(res => res.data);
export const getCarsByLocation = (locationId) => axios.get(`${API_BASE}/cars/by-location/${locationId}`).then(res => res.data);
export const getOverdueCars = () => axios.get(`${API_BASE}/cars/overdue`).then(res => res.data);

// ============================= CATE CAR =============================
export const getAllCateCars = () => axios.get(`${API_BASE}/catecar`).then(res => res.data);
export const createCateCar = (data) => axios.post(`${API_BASE}/catecar/create`, data).then(res => res.data);
export const updateCateCar = (id, data) => axios.put(`${API_BASE}/catecar/${id}`, data).then(res => res.data);
export const deleteCateCar = (id) => axios.delete(`${API_BASE}/catecar/${id}`).then(res => res.data);

// ============================= LOCATION =============================
export const getAllLocations = () => axios.get(`${API_BASE}/locations`).then(res => res.data);
export const getLocationById = (id) => axios.get(`${API_BASE}/locations/${id}`).then(res => res.data);
export const createLocation = (data) => axios.post(`${API_BASE}/locations`, data).then(res => res.data);
export const updateLocation = (id, data) => axios.put(`${API_BASE}/locations/${id}`, data).then(res => res.data);
export const deleteLocation = (id) => axios.delete(`${API_BASE}/locations/${id}`).then(res => res.data);
