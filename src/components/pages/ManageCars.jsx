import React, { useEffect, useState } from 'react';
import {
  getAllCars,
  updateCar,
  deleteCar,
  getAllSupervisors,
  getMainWorkers,
  getAssistantWorkers,
  updateCarStatus
} from '../apis/index';
import {
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
  Paper,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Edit, Delete, CheckCircle, HourglassEmpty } from '@mui/icons-material';

const ManageCars = () => {
  const [cars, setCars] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [mainWorkers, setMainWorkers] = useState([]);
  const [subWorkers, setSubWorkers] = useState([]);
  const [supervisors, setSupervisors] = useState([]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchCars = async () => {
    try {
      const res = await getAllCars();
      setCars(res.data);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách xe:', err);
    }
  };

  const fetchWorkers = async () => {
    try {
      const [mainRes, subRes, supervisorRes] = await Promise.all([
        getMainWorkers(),
        getAssistantWorkers(),
        getAllSupervisors(),
      ]);
      setMainWorkers(mainRes.data);
      setSubWorkers(subRes.data);
      setSupervisors(supervisorRes.data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thợ hoặc giám sát:', error);
    }
  };

  useEffect(() => {
    fetchCars();
    fetchWorkers();
  }, []);

  const handleEditClick = (car) => {
    setEditData({
      ...car,
      mainWorker: car.mainWorker?._id || '',
      subWorker: car.subWorker?._id || '',
      supervisor: car.supervisor?._id || '',
    });
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    try {
      await updateCar(editData._id, editData);
      setEditOpen(false);
      fetchCars();
    } catch (err) {
      console.error('Lỗi khi cập nhật xe:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xoá xe này?')) {
      try {
        await deleteCar(id);
        fetchCars();
      } catch (err) {
        console.error('Lỗi khi xoá xe:', err);
      }
    }
  };

  const handleChangeStatus = async (id, newStatus) => {
    try {
      await updateCarStatus(id, newStatus);
      fetchCars();
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái xe:', err);
      alert('Không thể cập nhật trạng thái xe');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4 } }}>
      <Typography variant="h5" gutterBottom>
        Quản lý xe
      </Typography>

      <Paper sx={{ mt: 3, p: { xs: 1, sm: 2 } }}>
        {isMobile ? (
          <Box display="flex" flexDirection="column" gap={2}>
            {cars.map((car, index) => (
              <Paper key={car._id} sx={{ p: 2, border: '1px solid #ccc' }}>
                <Typography variant="subtitle2">STT: {index + 1}</Typography>
                <Typography>Biển số: {car.plateNumber}</Typography>
                <Typography>Loại xe: {car.carType}</Typography>
                <Typography>Ngày nhận: {car.currentDate}</Typography>
                <Typography>Giờ nhận: {car.currentTime}</Typography>
                <Typography>Thời gian giao: {car.deliveryTime}</Typography>
                <Typography>Thợ chính: {car.mainWorker?.name || ''}</Typography>
                <Typography>Thợ phụ: {car.subWorker?.name || ''}</Typography>
                <Typography>Giám sát: {car.supervisor?.name || ''}</Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography>Trạng thái:</Typography>
                  {car.status === 'done' ? (
                    <IconButton
                      title="Đã hoàn thành – bấm để chuyển sang đang xử lý"
                      onClick={() => handleChangeStatus(car._id, 'working')}
                      color="success"
                    >
                      <CheckCircle />
                    </IconButton>
                  ) : (
                    <IconButton
                      title="Đang xử lý – bấm để đánh dấu hoàn thành"
                      onClick={() => handleChangeStatus(car._id, 'done')}
                      color="warning"
                    >
                      <HourglassEmpty />
                    </IconButton>
                  )}
                </Box>
                <Box mt={1}>
                  <IconButton onClick={() => handleEditClick(car)} size="small">
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(car._id)} size="small">
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </Paper>
            ))}
          </Box>
        ) : (
          <Box sx={{ minWidth: 1000, overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>STT</TableCell>
                  <TableCell>Biển số</TableCell>
                  <TableCell>Loại xe</TableCell>
                  <TableCell>Ngày nhận</TableCell>
                  <TableCell>Giờ nhận</TableCell>
                  <TableCell>Thời gian giao</TableCell>
                  <TableCell>Thợ chính</TableCell>
                  <TableCell>Thợ phụ</TableCell>
                  <TableCell>Giám sát</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cars.map((car, index) => (
                  <TableRow key={car._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{car.plateNumber}</TableCell>
                    <TableCell>{car.carType}</TableCell>
                    <TableCell>{car.currentDate}</TableCell>
                    <TableCell>{car.currentTime}</TableCell>
                    <TableCell>{car.deliveryTime}</TableCell>
                    <TableCell>{car.mainWorker?.name || ''}</TableCell>
                    <TableCell>{car.subWorker?.name || ''}</TableCell>
                    <TableCell>{car.supervisor?.name || ''}</TableCell>
                    <TableCell>
                      {car.status === 'done' ? (
                        <IconButton
                          title="Đã hoàn thành – bấm để chuyển sang đang xử lý"
                          onClick={() => handleChangeStatus(car._id, 'working')}
                          color="success"
                        >
                          <CheckCircle />
                        </IconButton>
                      ) : (
                        <IconButton
                          title="Đang xử lý – bấm để đánh dấu hoàn thành"
                          onClick={() => handleChangeStatus(car._id, 'done')}
                          color="warning"
                        >
                          <HourglassEmpty />
                        </IconButton>
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditClick(car)} size="small">
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(car._id)} size="small">
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Cập nhật thông tin xe</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Biển số xe"
              name="plateNumber"
              value={editData.plateNumber || ''}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="Loại xe"
              name="carType"
              value={editData.carType || ''}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="Thời gian giao"
              name="deliveryTime"
              type="datetime-local"
              value={editData.deliveryTime || ''}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />
            <TextField
              select
              label="Thợ chính"
              name="mainWorker"
              value={editData.mainWorker || ''}
              onChange={handleChange}
              fullWidth
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
              value={editData.subWorker || ''}
              onChange={handleChange}
              fullWidth
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
              value={editData.supervisor || ''}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="">-- Không chọn --</MenuItem>
              {supervisors.map((s) => (
                <MenuItem key={s._id} value={s._id}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Huỷ</Button>
          <Button onClick={handleEditSave} variant="contained">Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageCars;
