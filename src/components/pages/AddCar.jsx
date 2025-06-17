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

  const [availableWorkers, setAvailableWorkers] = useState([]);
  const [supervisors, setSupervisors] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [workerRes, supervisorRes] = await Promise.all([
          getAvailableWorkers(),
          getAllSupervisors(),
        ]);
        console.log('Danh sách thợ:', workerRes.data);
        setAvailableWorkers(workerRes.data);
        setSupervisors(supervisorRes.data);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
      }
    };
    fetchData();
  }, []);

  // ⚠ Sửa lại từ w.type ➝ w.role
  const mainWorkers = availableWorkers.filter((w) => w.role === 'thợ chính');
  const subWorkers = availableWorkers.filter((w) => w.role === 'thợ phụ');

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
          type="datetime-local"
          value={formData.deliveryTime}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          required
        />

        {/* Thợ chính */}
        <Autocomplete
          options={mainWorkers}
          getOptionLabel={(option) => option.name || ''}
          value={mainWorkers.find((w) => w._id === formData.mainWorker) || null}
          onChange={(e, value) =>
            setFormData((prev) => ({
              ...prev,
              mainWorker: value ? value._id : '',
            }))
          }
          openOnFocus
          noOptionsText="Không có thợ nào đang rảnh"
          renderInput={(params) => <TextField {...params} label="Thợ chính" />}
        />

        {/* Thợ phụ */}
        <Autocomplete
          options={subWorkers}
          getOptionLabel={(option) => option.name || ''}
          value={subWorkers.find((w) => w._id === formData.subWorker) || null}
          onChange={(e, value) =>
            setFormData((prev) => ({
              ...prev,
              subWorker: value ? value._id : '',
            }))
          }
          openOnFocus
          noOptionsText="Không có thợ nào đang rảnh"
          renderInput={(params) => <TextField {...params} label="Thợ phụ" />}
        />

        {/* Giám sát */}
        <Autocomplete
          options={supervisors}
          getOptionLabel={(option) => option.name || ''}
          value={supervisors.find((s) => s._id === formData.supervisor) || null}
          onChange={(e, value) =>
            setFormData((prev) => ({
              ...prev,
              supervisor: value ? value._id : '',
            }))
          }
          openOnFocus
          noOptionsText="Không tìm thấy giám sát"
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
