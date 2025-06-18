import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Autocomplete
} from '@mui/material';
import {
  createCar,
  getAvailableWorkers,
  getAllSupervisors,
  getAllCateCars,
} from '../apis/index';

const AddCar = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    plateNumber: '',
    carType: null,
    deliveryTime: '',
    mainWorkers: [],
    subWorkers: [],
    supervisor: null,
  });

  const [availableWorkers, setAvailableWorkers] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [cateCars, setCateCars] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [workerRes, supervisorRes, cateCarRes] = await Promise.all([
          getAvailableWorkers(),
          getAllSupervisors(),
          getAllCateCars(),
        ]);
        setAvailableWorkers(workerRes.data);
        setSupervisors(supervisorRes.data);
        setCateCars(cateCarRes.data);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const workers = [];

    formData.mainWorkers.forEach((worker) => {
      workers.push({ worker: worker._id, role: 'main' });
    });

    formData.subWorkers.forEach((worker) => {
      const isAlreadyMain = formData.mainWorkers.some(
        (main) => main._id === worker._id
      );
      if (!isAlreadyMain) {
        workers.push({ worker: worker._id, role: 'sub' });
      }
    });

    const carToCreate = {
      plateNumber: formData.plateNumber,
      carType: formData.carType?._id || null,
      deliveryTime: formData.deliveryTime,
      supervisor: formData.supervisor?._id || null,
      workers,
    };

    try {
      await createCar(carToCreate);
      setFormData({
        plateNumber: '',
        carType: null,
        deliveryTime: '',
        mainWorkers: [],
        subWorkers: [],
        supervisor: null,
      });
      onSuccess && onSuccess();
    } catch (error) {
      console.error('Lỗi khi thêm xe:', error);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Thêm xe mới
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <TextField
          label="Biển số xe"
          name="plateNumber"
          value={formData.plateNumber}
          onChange={handleChange}
          required
        />

        <Autocomplete
          options={cateCars}
          getOptionLabel={(option) => option.name || ''}
          value={formData.carType}
          onChange={(e, value) =>
            setFormData((prev) => ({ ...prev, carType: value }))
          }
          renderInput={(params) => <TextField {...params} label="Loại xe" required />}
        />

        <TextField
          label="Thời gian hẹn giao xe"
          name="deliveryTime"
          type="datetime-local"
          value={formData.deliveryTime}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          required
        />

        <Autocomplete
          multiple
          options={availableWorkers.filter(
            (w) => !formData.subWorkers.some((sub) => sub._id === w._id)
          )}
          getOptionLabel={(option) => option.name || ''}
          value={formData.mainWorkers}
          onChange={(e, value) =>
            setFormData((prev) => ({ ...prev, mainWorkers: value }))
          }
          renderInput={(params) => (
            <TextField {...params} label="Thợ chính (có thể chọn nhiều)" />
          )}
        />

        <Autocomplete
          multiple
          options={availableWorkers.filter(
            (w) => !formData.mainWorkers.some((main) => main._id === w._id)
          )}
          getOptionLabel={(option) => option.name || ''}
          value={formData.subWorkers}
          onChange={(e, value) =>
            setFormData((prev) => ({ ...prev, subWorkers: value }))
          }
          renderInput={(params) => (
            <TextField {...params} label="Thợ phụ (có thể chọn nhiều)" />
          )}
        />

        <Autocomplete
          options={supervisors}
          getOptionLabel={(option) => option.name || ''}
          value={formData.supervisor}
          onChange={(e, value) =>
            setFormData((prev) => ({ ...prev, supervisor: value }))
          }
          renderInput={(params) => <TextField {...params} label="Giám sát" />}
        />

        <Button type="submit" variant="contained">
          Thêm xe
        </Button>
      </Box>
    </Paper>
  );
};

export default AddCar;
