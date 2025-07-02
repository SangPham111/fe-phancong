import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Autocomplete,
  MenuItem,
  Divider,
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
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

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
    condition: '',
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

    // ✅ Kiểm tra deliveryTime
    if (!formData.deliveryDate || formData.deliveryHour === '') {
      alert('Vui lòng chọn ngày và giờ giao xe');
      return;
    }

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

    const deliveryTime = dayjs(formData.deliveryDate)
      .hour(formData.deliveryHour)
      .minute(0)
      .format('DD-MM-YYYY HH') + 'h';

    const carToCreate = {
      plateNumber: formData.plateNumber,
      carType: formData.carType?._id || null,
      supervisor: formData.supervisor?._id || null,
      location: formData.location?._id || null,
      deliveryTime,
      condition: formData.condition || null,
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
        condition: '',
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
    <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, mb: 4, borderRadius: 4, boxShadow: '0 4px 24px rgba(37,99,235,0.10)' }}>
      <Box
        sx={{
          background: '#f5f5f5',
          borderRadius: 2,
          px: { xs: 2, sm: 4 },
          py: { xs: 2, sm: 3 },
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          justifyContent: 'center'
        }}
      >
        <DirectionsCarIcon color="primary" sx={{ fontSize: 40 }} />
        <Box>
          <Typography variant="h5" fontWeight="bold" color="primary">
            Thêm xe mới
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Nhập thông tin xe, nhân sự và lịch giao nhận để thêm xe vào hệ thống.
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ mb: 2 }} />
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
          sx={{ flex: 1 }}
          helperText="Nhập đúng biển số, tự động nhận diện loại xe nếu có."
        />
        <Autocomplete
          options={cateCars}
          getOptionLabel={(option) => option.name || ''}
          value={formData.carType}
          onChange={(e, value) =>
            setFormData((prev) => ({ ...prev, carType: value }))
          }
          renderInput={(params) => (
            <TextField {...params} label="Loại xe" required helperText="Chọn loại xe" />
          )}
          sx={{ flex: 1 }}
        />
        <TextField
          select
          label="Tình trạng xe"
          value={formData.condition}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, condition: e.target.value }))
          }
          fullWidth
          sx={{ flex: 1 }}
          helperText="Chọn tình trạng xe nếu cần"
        >
          <MenuItem value="">Mặc định (null)</MenuItem>
          <MenuItem value="vip">VIP</MenuItem>
          <MenuItem value="good">Tốt</MenuItem>
          <MenuItem value="normal">Bình thường</MenuItem>
          <MenuItem value="warranty">Bảo hành</MenuItem>
          <MenuItem value="rescue">Cứu hộ</MenuItem>
        </TextField>

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
            <TextField {...params} label="Thợ chính" helperText="Có thể chọn nhiều thợ chính" />
          )}
          sx={{ flex: 1 }}
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
            <TextField {...params} label="Thợ phụ" helperText="Có thể chọn nhiều thợ phụ" />
          )}
          sx={{ flex: 1 }}
        />
        <Autocomplete
          options={supervisors}
          getOptionLabel={(option) => option.name || ''}
          value={formData.supervisor}
          onChange={(e, value) =>
            setFormData((prev) => ({ ...prev, supervisor: value }))
          }
          renderInput={(params) => <TextField {...params} label="Giám sát" helperText="Chọn giám sát viên" />}
          sx={{ flex: 1 }}
        />

        <Autocomplete
          options={locations}
          getOptionLabel={(option) => option.name || ''}
          value={formData.location}
          onChange={(e, value) =>
            setFormData((prev) => ({ ...prev, location: value }))
          }
          renderInput={(params) => (
            <TextField {...params} label="Địa điểm" required helperText="Chọn địa điểm nhận xe" />
          )}
          sx={{ flex: 1 }}
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Ngày giao xe"
            value={formData.deliveryDate}
            onChange={(newDate) =>
              setFormData((prev) => ({ ...prev, deliveryDate: newDate }))
            }
            format="DD-MM-YYYY"
            slotProps={{
              textField: { fullWidth: true, helperText: 'Chọn ngày giao xe' },
            }}
            sx={{ flex: 1 }}
          />
        </LocalizationProvider>
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
          helperText="Chọn giờ giao xe"
          sx={{ flex: 1 }}
        >
          {hourOptions.map((hour) => (
            <MenuItem key={hour.value} value={hour.value}>
              {hour.label}
            </MenuItem>
          ))}
        </TextField>

        <Button type="submit" variant="contained" sx={{ mt: 2, width: { xs: '100%', sm: 'auto' }, fontWeight: 'bold', fontSize: 18, borderRadius: 2, px: 4, py: 1.5, bgcolor: '#2563eb', '&:hover': { bgcolor: '#1d4ed8' } }}>
          Thêm xe
        </Button>
      </Box>
    </Paper>
  );
};

export default AddCar;
