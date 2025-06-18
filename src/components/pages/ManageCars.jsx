// QUAN TRỌNG: Phần import có thêm getAvailableWorkers
import React, { useEffect, useState } from 'react';
import {
  getAllCars,
  updateCar,
  deleteCar,
  getAllSupervisors,
  updateCarStatus,
  getAvailableWorkers,
  getAllCateCars,
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
  Box,
  Paper,
  useMediaQuery,
  useTheme,
  Autocomplete,
  Snackbar,
  Alert,
} from '@mui/material';
import { Edit, Delete, CheckCircle, HourglassEmpty } from '@mui/icons-material';

const ManageCars = () => {
  const [cars, setCars] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [workers, setWorkers] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [carTypes, setCarTypes] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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

  const fetchData = async () => {
    try {
      const [workerRes, supervisorRes] = await Promise.all([
        getAvailableWorkers(),
        getAllSupervisors(),
      ]);
      setWorkers(workerRes.data);
      setSupervisors(supervisorRes.data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thợ hoặc giám sát:', error);
    }
  };

  const fetchCarTypes = async () => {
    try {
      const res = await getAllCateCars();
      setCarTypes(res.data);
    } catch (error) {
      console.error('Lỗi khi lấy loại xe:', error);
    }
  };

  useEffect(() => {
    fetchCars();
    fetchData();
    fetchCarTypes();
  }, []);

  const getWorkerNames = (car, role) => {
    return car.workers
      .filter((w) => w.role === role)
      .map((w) => w.worker?.name)
      .filter(Boolean)
      .join(', ');
  };

  const handleEditClick = async (car) => {
    try {
      const availableRes = await getAvailableWorkers();
      let merged = [...availableRes.data];

      car.workers.forEach(({ worker }) => {
        if (!merged.find((w) => w._id === worker._id)) {
          merged.push(worker);
        }
      });

      setWorkers(merged);

      const mainWorkerIds = car.workers.filter((w) => w.role === 'main').map((w) => w.worker._id);
      const subWorkerIds = car.workers.filter((w) => w.role === 'sub').map((w) => w.worker._id);

      setEditData({
        ...car,
        mainWorkers: mainWorkerIds,
        subWorkers: subWorkerIds,
        supervisor: car.supervisor?._id || '',
        carType: car.carType || null,
      });

      setEditOpen(true);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu thợ khi sửa xe:', error);
    }
  };

  const handleEditSave = async () => {
    try {
      const updatedCar = {
        plateNumber: editData.plateNumber,
        carType: editData.carType?._id || '',
        deliveryTime: editData.deliveryTime,
        supervisor: editData.supervisor || null,
        workers: [
          ...editData.mainWorkers.map((id) => ({ worker: id, role: 'main' })),
          ...editData.subWorkers.map((id) => ({ worker: id, role: 'sub' })),
        ],
      };

      await updateCar(editData._id, updatedCar);
      setEditOpen(false);
      fetchCars();
      fetchData();
      setSnackbar({ open: true, message: 'Cập nhật xe thành công', severity: 'success' });
    } catch (err) {
      console.error('Lỗi khi cập nhật xe:', err);
      setSnackbar({ open: true, message: 'Cập nhật xe thất bại', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xoá xe này?')) {
      try {
        await deleteCar(id);
        fetchCars();
        setSnackbar({ open: true, message: 'Xoá xe thành công', severity: 'success' });
      } catch (err) {
        console.error('Lỗi khi xoá xe:', err);
        setSnackbar({ open: true, message: 'Xoá xe thất bại', severity: 'error' });
      }
    }
  };

  const handleChangeStatus = async (id, newStatus) => {
    try {
      await updateCarStatus(id, newStatus);
      fetchCars();
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái xe:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const mergeSelectedWorkers = (selectedIds) => {
    const selectedWorkers = selectedIds?.map((id) => {
      const fromAvailable = workers.find((w) => w._id === id);
      return fromAvailable || { _id: id, name: '(Không rõ)' };
    }) || [];
    const all = [...workers, ...selectedWorkers];
    return all.filter((w, i, arr) => arr.findIndex(a => a._id === w._id) === i);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4 } }}>
      <Typography variant="h5" gutterBottom>
        Quản lý xe
      </Typography>

      <Paper sx={{ mt: 3, p: { xs: 1, sm: 2 } }}>
        {isMobile ? (
          // Giao diện mobile - dạng dọc
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {cars.map((car, index) => (
              <Paper key={car._id} sx={{ p: 2 }}>
                <Typography><strong>#{index + 1}</strong> - {car.plateNumber}</Typography>
                <Typography><strong>Loại xe:</strong> {car.carType?.name}</Typography>
                <Typography><strong>Ngày nhận:</strong> {car.currentDate}</Typography>
                <Typography><strong>Giờ nhận:</strong> {car.currentTime}</Typography>
                <Typography><strong>Thời gian giao:</strong> {car.deliveryTime}</Typography>
                <Typography><strong>Thợ chính:</strong> {getWorkerNames(car, 'main')}</Typography>
                <Typography><strong>Thợ phụ:</strong> {getWorkerNames(car, 'sub')}</Typography>
                <Typography><strong>Giám sát:</strong> {car.supervisor?.name || ''}</Typography>
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  <IconButton
                    onClick={() => handleChangeStatus(car._id, car.status === 'done' ? 'working' : 'done')}
                    color={car.status === 'done' ? 'success' : 'warning'}
                  >
                    {car.status === 'done' ? <CheckCircle /> : <HourglassEmpty />}
                  </IconButton>
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
          // Giao diện desktop - dạng bảng
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
                    <TableCell>{car.carType?.name}</TableCell>
                    <TableCell>{car.currentDate}</TableCell>
                    <TableCell>{car.currentTime}</TableCell>
                    <TableCell>{car.deliveryTime}</TableCell>
                    <TableCell>{getWorkerNames(car, 'main')}</TableCell>
                    <TableCell>{getWorkerNames(car, 'sub')}</TableCell>
                    <TableCell>{car.supervisor?.name || ''}</TableCell>
                    <TableCell>
                      {car.status === 'done' ? (
                        <IconButton onClick={() => handleChangeStatus(car._id, 'working')} color="success">
                          <CheckCircle />
                        </IconButton>
                      ) : (
                        <IconButton onClick={() => handleChangeStatus(car._id, 'done')} color="warning">
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
            <Autocomplete
              options={carTypes}
              getOptionLabel={(option) => option.name}
              value={carTypes.find((c) => c._id === editData.carType?._id) || null}
              onChange={(e, newValue) => {
                setEditData((prev) => ({ ...prev, carType: newValue }));
              }}
              renderInput={(params) => (
                <TextField {...params} label="Loại xe" required fullWidth />
              )}
              isOptionEqualToValue={(option, value) => option._id === value._id}
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
            <Autocomplete
              multiple
              options={mergeSelectedWorkers(editData.mainWorkers)}
              getOptionLabel={(option) => option.name}
              value={mergeSelectedWorkers(editData.mainWorkers).filter((w) => editData.mainWorkers?.includes(w._id))}
              onChange={(e, newValue) => {
                const selectedIds = newValue.map((w) => w._id);
                // Loại bỏ các ID bị trùng với subWorkers
                const filtered = selectedIds.filter((id) => !editData.subWorkers.includes(id));
                setEditData((prev) => ({ ...prev, mainWorkers: filtered }));
              }}
              renderInput={(params) => (
                <TextField {...params} label="Thợ chính" placeholder="Tìm theo tên" />
              )}
            />

            <Autocomplete
              multiple
              options={mergeSelectedWorkers(editData.subWorkers)}
              getOptionLabel={(option) => option.name}
              value={mergeSelectedWorkers(editData.subWorkers).filter((w) => editData.subWorkers?.includes(w._id))}
              onChange={(e, newValue) => {
                const selectedIds = newValue.map((w) => w._id);
                // Loại bỏ các ID bị trùng với mainWorkers
                const filtered = selectedIds.filter((id) => !editData.mainWorkers.includes(id));
                setEditData((prev) => ({ ...prev, subWorkers: filtered }));
              }}
              renderInput={(params) => (
                <TextField {...params} label="Thợ phụ" placeholder="Tìm theo tên" />
              )}
            />

            <Autocomplete
              options={supervisors}
              getOptionLabel={(option) => option.name}
              value={supervisors.find((s) => s._id === editData.supervisor) || null}
              onChange={(e, newValue) =>
                setEditData((prev) => ({
                  ...prev,
                  supervisor: newValue ? newValue._id : '',
                }))
              }
              renderInput={(params) => (
                <TextField {...params} label="Giám sát" placeholder="Tìm theo tên" />
              )}
              isOptionEqualToValue={(option, value) => option._id === value._id}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Huỷ</Button>
          <Button onClick={handleEditSave} variant="contained">
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageCars;
