import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Autocomplete,
  MenuItem,
} from '@mui/material';
import {
  createCar,
  getAvailableWorkers,
  getAllSupervisors,
  getAllCateCars,
  getCarByPlateNumber,
  getAllLocations,
} from '../apis/index';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const AddCar = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    plateNumber: '',
    carType: null,
    mainWorkers: [],
    subWorkers: [],
    supervisor: null,
    location: null,
    deliveryDate: null,
    deliveryHour: '',
    condition: '', // ✅ Thêm tình trạng xe
  });

  const [availableWorkers, setAvailableWorkers] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [cateCars, setCateCars] = useState([]);
  const [locations, setLocations] = useState([]);

  const hourOptions = Array.from({ length: 24 }, (_, i) => ({
    label: `${i.toString().padStart(2, '0')}:00`,
    value: i,
  }));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [workerRes, supervisorRes, cateCarRes, locationRes] =
          await Promise.all([
            getAvailableWorkers(),
            getAllSupervisors(),
            getAllCateCars(),
            getAllLocations(),
          ]);
        setAvailableWorkers(workerRes.data);
        setSupervisors(supervisorRes.data);
        setCateCars(cateCarRes.data);
        setLocations(locationRes.data);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
      }
    };
    fetchData();
  }, []);

  const handlePlateChange = async (e) => {
    const plate = e.target.value.toUpperCase();
    setFormData((prev) => ({ ...prev, plateNumber: plate }));

    if (plate.length >= 5) {
      try {
        const res = await getCarByPlateNumber(plate);
        if (res.data) {
          const foundCate = cateCars.find(
            (c) => c._id === res.data.carType?._id
          );
          if (foundCate) {
            setFormData((prev) => ({ ...prev, carType: foundCate }));
          }
        }
      } catch (err) {
        // Không cần xử lý nếu không tìm thấy
      }
    }
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

    const deliveryTime =
      formData.deliveryDate && formData.deliveryHour !== ''
        ? dayjs(formData.deliveryDate)
            .hour(formData.deliveryHour)
            .minute(0)
            .format('DD-MM-YYYY HH') + '[h]'
        : undefined;

    const carToCreate = {
      plateNumber: formData.plateNumber,
      carType: formData.carType?._id || null,
      supervisor: formData.supervisor?._id || null,
      location: formData.location?._id || null,
      deliveryTime,
      condition: formData.condition || null, // ✅ Thêm vào gửi API
      workers,
    };

    try {
      await createCar(carToCreate);
      setFormData({
        plateNumber: '',
        carType: null,
        mainWorkers: [],
        subWorkers: [],
        supervisor: null,
        location: null,
        deliveryDate: null,
        deliveryHour: '',
        condition: '', // ✅ Reset
      });
      onSuccess && onSuccess();
      navigate('/cars/manage');
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || 'Đã xảy ra lỗi khi thêm xe';
      alert(errorMsg);
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
          onChange={handlePlateChange}
          required
          fullWidth
        />

        <Autocomplete
          options={cateCars}
          getOptionLabel={(option) => option.name || ''}
          value={formData.carType}
          onChange={(e, value) =>
            setFormData((prev) => ({ ...prev, carType: value }))
          }
          renderInput={(params) => (
            <TextField {...params} label="Loại xe" required />
          )}
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

        <Autocomplete
          options={locations}
          getOptionLabel={(option) => option.name || ''}
          value={formData.location}
          onChange={(e, value) =>
            setFormData((prev) => ({ ...prev, location: value }))
          }
          renderInput={(params) => (
            <TextField {...params} label="Địa điểm" required />
          )}
        />

        {/* ✅ Tình trạng xe */}
        <TextField
          select
          label="Tình trạng xe"
          value={formData.condition}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, condition: e.target.value }))
          }
          fullWidth
        >
          <MenuItem value="">Mặc định (null)</MenuItem>
          <MenuItem value="vip">VIP</MenuItem>
          <MenuItem value="good">Tốt</MenuItem>
          <MenuItem value="normal">Bình thường</MenuItem>
          <MenuItem value="warranty">Bảo hành</MenuItem>
          <MenuItem value="rescue">Cứu hộ</MenuItem>
        </TextField>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <DatePicker
              label="Ngày giao xe"
              value={formData.deliveryDate}
              onChange={(newDate) =>
                setFormData((prev) => ({ ...prev, deliveryDate: newDate }))
              }
              format="DD-MM-YYYY"
              slotProps={{
                textField: { fullWidth: true },
              }}
            />

            <TextField
              select
              label="Giờ giao xe"
              value={formData.deliveryHour}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  deliveryHour: Number(e.target.value),
                }))
              }
              fullWidth
            >
              {hourOptions.map((hour) => (
                <MenuItem key={hour.value} value={hour.value}>
                  {hour.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </LocalizationProvider>

        <Button type="submit" variant="contained">
          Thêm xe
        </Button>
      </Box>
    </Paper>
  );
};

export default AddCar;
