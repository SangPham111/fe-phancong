import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  MenuItem,
  Typography,
  Paper,
} from '@mui/material';
import {
  createCar,
  getAllSupervisors,
  getMainWorkers,
  getAssistantWorkers
} from '../apis/index';

const AddCar = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    plateNumber: '',
    carType: '',
    deliveryTime: '',
    mainWorker: '',
    subWorker: '',
    supervisor: '',
  });

  const [mainWorkers, setMainWorkers] = useState([]);
  const [subWorkers, setSubWorkers] = useState([]);
  const [supervisors, setSupervisors] = useState([]);

  const fetchWorkers = async () => {
    try {
      const [mainRes, subRes, supervisorRes] = await Promise.all([
        getMainWorkers(),
        getAssistantWorkers(),
        getAllSupervisors(), // ✅ Dùng API giám sát riêng
      ]);

      setMainWorkers(mainRes.data);
      setSubWorkers(subRes.data);
      setSupervisors(supervisorRes.data); // ✅
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thợ hoặc giám sát:', error);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.plateNumber || !formData.carType || !formData.deliveryTime) {
      return alert('Vui lòng nhập đầy đủ thông tin bắt buộc');
    }

    try {
      await createCar(formData);
      setFormData({
        plateNumber: '',
        carType: '',
        deliveryTime: '',
        mainWorker: '',
        subWorker: '',
        supervisor: '',
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
        <TextField
          label="Loại xe"
          name="carType"
          value={formData.carType}
          onChange={handleChange}
          required
        />
        <TextField
  label="Thời gian hẹn giao xe"
  name="deliveryTime"
  type="datetime-local" // ✅ thay đổi tại đây
  value={formData.deliveryTime}
  onChange={handleChange}
  InputLabelProps={{ shrink: true }}
  required
/>

        <TextField
          select
          label="Thợ chính"
          name="mainWorker"
          value={formData.mainWorker}
          onChange={handleChange}
        >
          <MenuItem value="">-- Không chọn --</MenuItem>
          {mainWorkers.map((w) => (
            <MenuItem key={w._id} value={w._id}>
              {w.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Thợ phụ"
          name="subWorker"
          value={formData.subWorker}
          onChange={handleChange}
        >
          <MenuItem value="">-- Không chọn --</MenuItem>
          {subWorkers.map((w) => (
            <MenuItem key={w._id} value={w._id}>
              {w.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Giám sát"
          name="supervisor"
          value={formData.supervisor}
          onChange={handleChange}
        >
          <MenuItem value="">-- Không chọn --</MenuItem>
          {supervisors.map((s) => (
            <MenuItem key={s._id} value={s._id}>
              {s.name}
            </MenuItem>
          ))}
        </TextField>

        <Button type="submit" variant="contained">
          Thêm xe
        </Button>
      </Box>
    </Paper>
  );
};

export default AddCar;
