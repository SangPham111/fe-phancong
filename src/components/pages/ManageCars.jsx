import React, { useEffect, useState, useMemo } from 'react';
import {
  getAllCars,
  updateCar,
  deleteCar,
  getAllSupervisors,
  updateCarStatusWithWorker,
  getAvailableWorkers,
  getAllCateCars,
  getCarsByLocation,
  getAllLocations,
  getAllWorkers
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
  MenuItem,
  useMediaQuery,
  useTheme,
  Autocomplete,
  Snackbar,
  Alert,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
} from '@mui/material';
import {
  Edit,
  Delete,
  CheckCircle,
  Schedule,
  BuildCircle,
  LocationOn,
  LocalCarWash,
  Handshake,
  LocalShipping,
  Build,
  Person,
  SwapHoriz,
  History,
  Error,
  Lock,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import moment from 'moment';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

const ManageCars = () => {
  const [filterDate, setFilterDate] = useState(null);
  const [cars, setCars] = useState([]);
  const [allCars, setAllCars] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [statusUpdateData, setStatusUpdateData] = useState({});
  const [workers, setWorkers] = useState([]);
  const [allWorkers, setAllWorkers] = useState([]);
  const [availableWorkers, setAvailableWorkers] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [carTypes, setCarTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedNewWorker, setSelectedNewWorker] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const ErrorIcon = Error;

  // Danh sách xe sau khi lọc theo ngày nhận xe
  const displayedCars = useMemo(() => {
    if (!filterDate) return cars;
    const selected = moment(filterDate).format('YYYY-MM-DD');
    return cars.filter(car => car.currentDate === selected);
  }, [cars, filterDate]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchCars = async () => {
    try {
      const res = await getAllCars();
      setAllCars(res.data);
      setCars(res.data);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách xe:', err);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await getAllLocations();
      setLocations(res.data);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách địa điểm:', err);
    }
  };
  const isCarPasswordVerified = () => {
    const verifiedUntil = localStorage.getItem('car_verified_until');
    return verifiedUntil && new Date(verifiedUntil) > new Date();
  };

  const markCarPasswordVerified = () => {
    const expiry = new Date(Date.now() + 60 * 60 * 10000); // 10 giờ
    localStorage.setItem('car_verified_until', expiry.toISOString());
  };

  const fetchAllWorkers = async () => {
    try {
      const res = await getAllWorkers();
      setAllWorkers(res.data);
    } catch (err) {
      console.error('Lỗi khi lấy tất cả thợ:', err);
    }
  };

  const fetchAvailableWorkers = async () => {
    try {
      const res = await getAvailableWorkers();
      setAvailableWorkers(res.data);
    } catch (err) {
      console.error('Lỗi khi lấy thợ rảnh:', err);
    }
  };

  const STATUS_OPTIONS = [
    { value: 'pending', label: 'Chờ sửa', icon: <Schedule />, color: 'default' },
    { value: 'working', label: 'Đang sửa', icon: <BuildCircle />, color: 'warning' },
    { value: 'done', label: 'Sửa xong', icon: <CheckCircle />, color: 'success' },
    { value: 'waiting_wash', label: 'Chờ rửa xe', icon: <LocalCarWash />, color: 'info' },
    { value: 'waiting_handover', label: 'Chờ giao xe', icon: <Handshake />, color: 'primary' },
    { value: 'delivered', label: 'Đã giao', icon: <LocalShipping />, color: 'success' },
    { value: 'additional_repair', label: 'Sửa bổ sung', icon: <Build />, color: 'error' },
  ];

  const CONDITION_OPTIONS = {
    vip: { label: 'VIP', color: 'warning' },
    good: { label: 'Tốt', color: 'success' },
    normal: { label: 'Bình thường', color: 'default' },
    warranty: { label: 'Bảo hành', color: 'info' },
    rescue: { label: 'Cứu hộ', color: 'error' },
    null: { label: 'Bình thường', color: 'default' }
  };

  const getConditionConfig = (condition) => {
    return CONDITION_OPTIONS[condition] || CONDITION_OPTIONS.null;
  };

  const getStatusConfig = (status) => {
    return STATUS_OPTIONS.find(option => option.value === status) || STATUS_OPTIONS[0];
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

  const handleLocationChange = async (locationId) => {
    setSelectedLocation(locationId);

    if (locationId === 'all') {
      setCars(allCars);
    } else {
      try {
        const res = await getCarsByLocation(locationId);
        setCars(res.data);
      } catch (err) {
        console.error('Lỗi khi lấy xe theo địa điểm:', err);
        setSnackbar({
          open: true,
          message: 'Lỗi khi lọc xe theo địa điểm',
          severity: 'error'
        });
      }
    }
  };

  useEffect(() => {
    fetchCars();
    fetchData();
    fetchCarTypes();
    fetchLocations();
    fetchAllWorkers();
    fetchAvailableWorkers();
  }, []);

  const getWorkerNames = (car, role) => {
    const names = car.workers
      .filter((w) => w.role === role)
      .map((w) => w.worker?.name)
      .filter(Boolean);

    return names.length > 0 ? (
      names.map((name, index) => (
        <React.Fragment key={index}>
          - {name}
          {index !== names.length - 1 && <br />}
        </React.Fragment>
      ))
    ) : (
      <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>Trống</span>
    );
  };

  const renderStatusIcon = (status) => {
    const config = getStatusConfig(status);
    return React.cloneElement(config.icon, { color: config.color });
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

      const mainWorkerIds = car.workers
        .filter((w) => w.role === "main")
        .map((w) => w.worker._id);
      const subWorkerIds = car.workers
        .filter((w) => w.role === "sub")
        .map((w) => w.worker._id);

      // 👇 Xử lý deliveryTime tách ra ngày và giờ
      const momentDelivery = moment(car.deliveryTime, 'DD-MM-YYYY HH[h]');
      const deliveryDate = momentDelivery.isValid()
        ? momentDelivery.format('YYYY-MM-DD') // Phù hợp với type="date"
        : '';
      const deliveryHour = momentDelivery.isValid()
        ? momentDelivery.format('HH') // Giờ dạng '00' đến '23'
        : '';

      setEditData({
        ...car,
        mainWorkers: mainWorkerIds,
        subWorkers: subWorkerIds,
        supervisor: car.supervisor?._id || '',
        carType: car.carType || null,
        deliveryDate,
        deliveryHour,
      });

      setEditOpen(true);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu thợ khi sửa xe:', error);
    }
  };

  const handleEditSave = async () => {
    try {
      // Gộp ngày và giờ lại theo định dạng yêu cầu
      const formattedDate = moment(editData.deliveryDate, 'YYYY-MM-DD').format('DD-MM-YYYY');
      const deliveryTime = `${formattedDate} ${editData.deliveryHour}h`;

      const updatedCar = {
        plateNumber: editData.plateNumber,
        carType: editData.carType?._id || '',
        deliveryTime,
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
    if (isCarPasswordVerified()) {
      confirmDelete(id);
    } else {
      setDeleteTargetId(id);
      setConfirmDialogOpen(true);
    }
  };

  const confirmDelete = async (id) => {
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


  // Kiểm tra xem có thể chuyển trạng thái nào từ trạng thái hiện tại
  const getAvailableStatusTransitions = (currentStatus) => {
    const transitions = {
      'pending': ['working'],
      'working': ['done', 'pending'],
      'done': ['waiting_wash', 'waiting_handover'],
      'waiting_wash': ['waiting_handover', 'additional_repair'], // Chỉ có thể chuyển sang chờ giao hoặc sửa bổ sung
      'waiting_handover': ['additional_repair', 'delivered'],
      'delivered': [],
      'additional_repair': ['done']
    };

    return transitions[currentStatus] || [];
  };

  // Kiểm tra xem có cần chọn thợ mới không
  const needsWorkerSelection = (currentStatus, newStatus) => {
    return (
      (currentStatus === 'done' && newStatus === 'waiting_wash') ||
      (['waiting_wash', 'waiting_handover'].includes(currentStatus) && newStatus === 'additional_repair')
    );
  };

  const handleStatusChangeClick = (car, newStatus) => {
    const needsWorker = needsWorkerSelection(car.status, newStatus);

    if (needsWorker) {
      // Mở dialog chọn thợ
      setStatusUpdateData({ car, newStatus, needsWorker: true });
      setSelectedNewWorker('');
      fetchAvailableWorkers(); // Refresh danh sách thợ rảnh
      setStatusUpdateOpen(true);
    } else {
      // Cập nhật trạng thái trực tiếp
      handleChangeStatus(car._id, newStatus);
    }
  };

  const handleChangeStatus = async (id, newStatus, newWorkerId = null) => {
    try {
      const res = await updateCarStatusWithWorker(id, newStatus, newWorkerId);

      if (selectedLocation === 'all') {
        fetchCars();
      } else {
        handleLocationChange(selectedLocation);
      }

      fetchAvailableWorkers();

      setSnackbar({
        open: true,
        message: res.data.message || 'Cập nhật trạng thái thành công',
        severity: 'success',
      });
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái xe:', err);
      const errorMessage = err.response?.data?.message || 'Cập nhật trạng thái thất bại';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    }
  };

  const handleStatusUpdateConfirm = () => {
    const { car, newStatus } = statusUpdateData;
    const workerId = selectedNewWorker || null;

    handleChangeStatus(car._id, newStatus, workerId);
    setStatusUpdateOpen(false);
    setStatusUpdateData({});
    setSelectedNewWorker('');
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

  const renderCarCard = (car) => (
    <Card key={car._id} sx={{ mb: 2, borderRadius: 3, boxShadow: 3, border: (car.isLate || car.overdue) ? '2px solid #f44336' : undefined }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {(car.isLate || car.overdue) && <Tooltip title="Xe trễ hẹn"><ErrorIcon color="error" fontSize="medium" /></Tooltip>}
            <Typography variant="h6" color={(car.isLate || car.overdue) ? 'error' : 'primary'}>
              {car.plateNumber}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={renderStatusIcon(car.status)}
              label={getStatusConfig(car.status).label}
              color={getStatusConfig(car.status).color}
              size="small"
            />
            {(car.isLate || car.overdue) && <Chip label="Trễ hẹn" color="error" size="small" icon={<ErrorIcon />} />}
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="textSecondary">
              <strong>Loại xe:</strong> {car.carType?.name || 'Chưa xác định'}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="span">
              <strong>Tình trạng:</strong>
              <Chip
                label={getConditionConfig(car.condition).label}
                color={getConditionConfig(car.condition).color}
                size="small"
                sx={{ ml: 1 }}
              />
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <strong>Thời gian giao:</strong> {car.deliveryTime || 'Chưa xác định'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <strong>Địa điểm:</strong> {car.location?.name || 'Chưa xác định'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="textSecondary">
              <strong>Thợ chính:</strong>
            </Typography>
            <Box sx={{ ml: 1, mb: 1 }}>
              {getWorkerNames(car, 'main')}
            </Box>
            <Typography variant="body2" color="textSecondary">
              <strong>Thợ phụ:</strong>
            </Typography>
            <Box sx={{ ml: 1 }}>
              {getWorkerNames(car, 'sub')}
            </Box>
          </Grid>
        </Grid>
      </CardContent>

      <Divider />

      <CardActions sx={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, px: 1 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', flex: 1 }}>
          {getAvailableStatusTransitions(car.status).map((status) => (
            <Button
              key={status}
              size="small"
              variant="outlined"
              startIcon={renderStatusIcon(status)}
              onClick={() => handleStatusChangeClick(car, status)}
              sx={{ textTransform: 'none', minWidth: 0, px: 1 }}
            >
              {getStatusConfig(status).label}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Sửa xe">
            <span>
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleEditClick(car)}
                sx={{ borderRadius: 2 }}
              >
                <Edit />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Xoá xe">
            <span>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDelete(car._id)}
                sx={{ borderRadius: 2 }}
              >
                <Delete />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Lịch sử xe">
            <span>
              <IconButton
                size="small"
                color="secondary"
                component={Link}
                to={`/cars/${car._id}/history`}
                sx={{ borderRadius: 2 }}
              >
                <History />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </CardActions>
    </Card>
  );

  const renderTable = (data) => {
    // Nếu có filterDate, chỉ hiển thị xe có ngày nhận đúng ngày lọc
    let filtered = data || cars;
    if (filterDate) {
      const selected = moment(filterDate).format('YYYY-MM-DD');
      filtered = filtered.filter(car => {
        if (!car.currentDate) return false;
        return car.currentDate === selected;
      });
    }
    const sortedCars = [...filtered].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return (
      <Paper sx={{ width: '100%', overflowX: 'auto', borderRadius: 3, boxShadow: 3 }}>
        <Table stickyHeader sx={{ minWidth: 1100 }}>
          <TableHead>
            <TableRow sx={{ background: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold', background: '#f5f5f5' }}>Biển số</TableCell>
              <TableCell sx={{ fontWeight: 'bold', background: '#f5f5f5' }}>Loại xe</TableCell>
              <TableCell sx={{ fontWeight: 'bold', background: '#f5f5f5' }}>Tình trạng</TableCell>
              <TableCell sx={{ fontWeight: 'bold', background: '#f5f5f5' }}>Trạng thái</TableCell>
              <TableCell sx={{ fontWeight: 'bold', background: '#f5f5f5' }}>Thợ chính</TableCell>
              <TableCell sx={{ fontWeight: 'bold', background: '#f5f5f5' }}>Thợ phụ</TableCell>
              <TableCell sx={{ fontWeight: 'bold', background: '#f5f5f5' }}>Ngày nhận</TableCell>
              <TableCell sx={{ fontWeight: 'bold', background: '#f5f5f5' }}>Thời gian giao</TableCell>
              <TableCell sx={{ fontWeight: 'bold', background: '#f5f5f5' }}>Địa điểm</TableCell>
              <TableCell sx={{ fontWeight: 'bold', background: '#f5f5f5' }}>Chuyển trạng thái</TableCell>
              <TableCell sx={{ fontWeight: 'bold', background: '#f5f5f5' }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedCars.map((car, idx) => {
              const isLate = car.isLate || car.overdue;
              return (
                <TableRow
                  key={car._id}
                  sx={{
                    backgroundColor: isLate ? '#ffebee' : (idx % 2 === 0 ? '#fafafa' : '#fff'),
                    transition: 'background 0.2s',
                    '&:hover': { backgroundColor: isLate ? '#ffcdd2' : '#e3f2fd' }
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {isLate && <Tooltip title="Xe trễ hẹn"><ErrorIcon color="error" fontSize="small" /></Tooltip>}
                      <Typography variant="body2" fontWeight="bold" color={isLate ? 'error' : 'primary'}>
                        {car.plateNumber}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{car.carType?.name || 'Chưa xác định'}</TableCell>
                  <TableCell>
                    <Chip
                      label={getConditionConfig(car.condition).label}
                      color={getConditionConfig(car.condition).color}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        icon={renderStatusIcon(car.status)}
                        label={getStatusConfig(car.status).label}
                        color={getStatusConfig(car.status).color}
                        size="small"
                      />
                      {isLate && <Chip label="Trễ hẹn" color="error" size="small" icon={<ErrorIcon />} />}
                    </Box>
                  </TableCell>
                  <TableCell>{getWorkerNames(car, 'main')}</TableCell>
                  <TableCell>{getWorkerNames(car, 'sub')}</TableCell>
                  <TableCell>{car.currentDate || 'Chưa xác định'}</TableCell>
                  <TableCell>{car.deliveryTime || 'Chưa xác định'}</TableCell>
                  <TableCell>{car.location?.name || 'Chưa xác định'}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {getAvailableStatusTransitions(car.status).map((status) => (
                        <Tooltip key={status} title={`Chuyển sang ${getStatusConfig(status).label}`}>
                          <IconButton
                            size="small"
                            color={getStatusConfig(status).color}
                            onClick={() => handleStatusChangeClick(car, status)}
                            sx={{ borderRadius: 2 }}
                          >
                            {renderStatusIcon(status)}
                          </IconButton>
                        </Tooltip>
                      ))}
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Sửa xe">
                        <span>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditClick(car)}
                            sx={{ borderRadius: 2 }}
                          >
                            <Edit />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Xoá xe">
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(car._id)}
                            sx={{ borderRadius: 2 }}
                          >
                            <Delete />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Lịch sử xe">
                        <span>
                          <IconButton
                            size="small"
                            color="secondary"
                            component={Link}
                            to={`/cars/${car._id}/history`}
                            sx={{ borderRadius: 2 }}
                          >
                            <History />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    );
  };


  return (
    <Box sx={{ p: { xs: 2, sm: 4 } }}>
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
        }}
      >
        <DirectionsCarIcon color="primary" sx={{ fontSize: 40 }} />
        <Box>
          <Typography variant="h5" fontWeight="bold" color="primary">
            Quản lý xe
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Theo dõi, cập nhật trạng thái và lịch sử xe trong hệ thống
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ mb: 2 }} />

      {/* Bộ lọc địa điểm và ngày giao xe */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 3, boxShadow: 3 }}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel><LocationOn sx={{ mr: 1 }} fontSize="small" />Địa điểm</InputLabel>
              <Select
                value={selectedLocation}
                onChange={(e) => handleLocationChange(e.target.value)}
                label={<><LocationOn sx={{ mr: 1 }} fontSize="small" />Địa điểm</>}
              >
                <MenuItem value="all">
                  <Typography variant="body2" fontWeight="bold">
                    Tất cả địa điểm
                  </Typography>
                </MenuItem>
                {locations.map((location) => (
                  <MenuItem key={location._id} value={location._id}>
                    {location.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label={<><Schedule sx={{ mr: 1 }} fontSize="small" />Ngày nhận xe</>}
              type="date"
              size="small"
              fullWidth
              value={filterDate ? moment(filterDate).format('YYYY-MM-DD') : ''}
              onChange={e => setFilterDate(e.target.value ? moment(e.target.value).toDate() : null)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              onClick={() => setFilterDate(null)}
              disabled={!filterDate}
              startIcon={<Delete />}
            >
              Xoá lọc ngày
            </Button>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Paper elevation={0} sx={{ p: 1, textAlign: 'center', background: '#f5f5f5', borderRadius: 2 }}>
              <Typography variant="body2" fontWeight="bold" color="primary">
                <DirectionsCarIcon fontSize="small" sx={{ mr: 1 }} />Tổng cộng
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {displayedCars.length} xe
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>


      {/* Hiển thị danh sách xe */}
      {isMobile ? (
        <Box>
          {[...displayedCars]
            .sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
              const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
              return dateB - dateA; // sắp xếp mới nhất lên trước
            })
            .map(renderCarCard)}
        </Box>
      ) : (
        renderTable(displayedCars)
      )}

      {/* Dialog cập nhật xe */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Edit color="primary" />
            <Typography variant="h6" fontWeight="bold">Cập nhật thông tin xe</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Biển số xe"
                name="plateNumber"
                value={editData.plateNumber || ''}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ngày giao xe (DD-MM-YYYY)"
                type="date"
                value={editData.deliveryDate || ''}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, deliveryDate: e.target.value }))
                }
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel shrink>Giờ giao xe (HH)</InputLabel>
                <Select
                  value={editData.deliveryHour || ''}
                  label="Giờ giao xe (HH)"
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, deliveryHour: e.target.value }))
                  }
                  displayEmpty
                  inputProps={{ 'aria-label': 'Giờ giao xe (HH)' }}
                >
                  {[...Array(24).keys()].map((hour) => (
                    <MenuItem key={hour} value={hour}>
                      {hour}h
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={carTypes}
                getOptionLabel={(option) => option.name || ''}
                value={editData.carType}
                onChange={(event, newValue) => {
                  setEditData((prev) => ({ ...prev, carType: newValue }));
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Loại xe" fullWidth InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} />
                )}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel shrink>Giám sát</InputLabel>
                <Select
                  name="supervisor"
                  value={editData.supervisor || ''}
                  onChange={handleChange}
                  label="Giám sát"
                  displayEmpty
                  inputProps={{ 'aria-label': 'Giám sát' }}
                >
                  <MenuItem value="">
                    <em>Không chọn</em>
                  </MenuItem>
                  {supervisors.map((supervisor) => (
                    <MenuItem key={supervisor._id} value={supervisor._id}>
                      {supervisor.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                multiple
                options={mergeSelectedWorkers(editData.mainWorkers)}
                getOptionLabel={(option) => option.name || ''}
                value={mergeSelectedWorkers(editData.mainWorkers).filter((worker) =>
                  editData.mainWorkers?.includes(worker._id)
                )}
                onChange={(event, newValue) => {
                  setEditData((prev) => ({
                    ...prev,
                    mainWorkers: newValue.map((worker) => worker._id),
                  }));
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Thợ chính" fullWidth InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} />
                )}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                multiple
                options={mergeSelectedWorkers(editData.subWorkers)}
                getOptionLabel={(option) => option.name || ''}
                value={mergeSelectedWorkers(editData.subWorkers).filter((worker) =>
                  editData.subWorkers?.includes(worker._id)
                )}
                onChange={(event, newValue) => {
                  setEditData((prev) => ({
                    ...prev,
                    subWorkers: newValue.map((worker) => worker._id),
                  }));
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Thợ phụ" fullWidth InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} />
                )}
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2, p: 2 }}>
          <Button onClick={() => setEditOpen(false)} variant="outlined">Hủy</Button>
          <Button onClick={handleEditSave} variant="contained" color="primary">
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog chọn thợ cho chuyển trạng thái */}
      <Dialog
        open={statusUpdateOpen}
        onClose={() => setStatusUpdateOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SwapHoriz color="primary" />
            <Typography variant="h6" fontWeight="bold">Chuyển trạng thái xe</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {statusUpdateData.car && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" color="primary" gutterBottom>
                {statusUpdateData.car.plateNumber}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Từ: <strong>{getStatusConfig(statusUpdateData.car.status).label}</strong>
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Sang: <strong>{getStatusConfig(statusUpdateData.newStatus).label}</strong>
              </Typography>
            </Box>
          )}

          {statusUpdateData.needsWorker && (
            <Box>
              <Typography variant="body1" gutterBottom>
                {statusUpdateData.newStatus === 'waiting_wash'
                  ? 'Chọn thợ để rửa xe (tùy chọn - để trống sẽ giữ thợ cũ):'
                  : statusUpdateData.newStatus === 'additional_repair'
                    ? 'Chọn thợ mới cho sửa bổ sung (bắt buộc):'
                    : 'Chọn thợ cho công việc này:'
                }
              </Typography>
              <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
                <InputLabel>Chọn thợ</InputLabel>
                <Select
                  value={selectedNewWorker}
                  onChange={(e) => setSelectedNewWorker(e.target.value)}
                  label="Chọn thợ"
                >
                  {statusUpdateData.newStatus === 'waiting_wash' && (
                    <MenuItem value="">
                      <em>Giữ thợ cũ</em>
                    </MenuItem>
                  )}
                  {availableWorkers.map((worker) => (
                    <MenuItem key={worker._id} value={worker._id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person fontSize="small" />
                        <Box>
                          <Typography variant="body2">
                            {worker.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Trạng thái: {worker.status === 'available' ? 'Rảnh' : 'Bận'}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {availableWorkers.length === 0 && (
                <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
                  Hiện tại không có thợ nào rảnh. Vui lòng thử lại sau.
                </Alert>
              )}

              {/* Thông báo đặc biệt cho từng trường hợp */}
              {statusUpdateData.newStatus === 'waiting_wash' && (
                <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="body2">
                    💡 <strong>Lưu ý:</strong> Nếu không chọn thợ mới, thợ hiện tại sẽ tiếp tục rửa xe và vẫn ở trạng thái bận.
                  </Typography>
                </Alert>
              )}

              {statusUpdateData.newStatus === 'additional_repair' && (
                <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="body2">
                    ⚠️ <strong>Bắt buộc:</strong> Phải chọn thợ mới để thực hiện sửa chữa bổ sung.
                  </Typography>
                </Alert>
              )}
            </Box>
          )}

          {/* Thông báo cho các trạng thái không cần chọn thợ */}
          {!statusUpdateData.needsWorker && (
            <Box>
              {statusUpdateData.newStatus === 'waiting_handover' && (
                <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="body2">
                    ✅ Xe sẽ chuyển sang trạng thái chờ giao. Thợ hiện tại sẽ được giải phóng.
                  </Typography>
                </Alert>
              )}

              {statusUpdateData.newStatus === 'delivered' && (
                <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="body2">
                    🎉 Xe sẽ được đánh dấu là đã giao. Tất cả thợ liên quan sẽ được giải phóng.
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2, p: 2 }}>
          <Button onClick={() => setStatusUpdateOpen(false)} variant="outlined">
            Hủy
          </Button>
          <Button
            onClick={handleStatusUpdateConfirm}
            variant="contained"
            color="primary"
            disabled={
              (statusUpdateData.newStatus === 'additional_repair' && !selectedNewWorker) ||
              (availableWorkers.length === 0 && statusUpdateData.needsWorker && statusUpdateData.newStatus !== 'waiting_wash')
            }
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Lock color="error" />
            <Typography variant="h6" fontWeight="bold">Xác thực để xoá xe</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <TextField
            type="password"
            label="Nhập mật khẩu"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2, p: 2 }}>
          <Button onClick={() => setConfirmDialogOpen(false)} variant="outlined">Huỷ</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (password === '123456@') {
                markCarPasswordVerified();
                setConfirmDialogOpen(false);
                setPassword('');
                confirmDelete(deleteTargetId);
              } else {
                alert('❌ Sai mật khẩu!');
              }
            }}
          >
            Xác nhận
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