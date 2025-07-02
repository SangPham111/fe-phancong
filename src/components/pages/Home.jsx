import React, { useEffect, useState } from 'react';
import {
  Typography,
  Paper,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  useTheme,
  useMediaQuery,
  Stack,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
} from '@mui/material';
import {
  getWorkingAndPendingCars,
  getCarStats,
  getOverdueCars,
  getAllLocations,
} from '../apis/index';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';
import BuildIcon from '@mui/icons-material/Build';
import DoneIcon from '@mui/icons-material/Done';
import LocalCarWashIcon from '@mui/icons-material/LocalCarWash';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReplayIcon from '@mui/icons-material/Replay';
import ErrorIcon from '@mui/icons-material/Error';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import FilterListIcon from '@mui/icons-material/FilterList';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';

const Home = () => {
  const [carsToday, setCarsToday] = useState([]);
  const [overdueCars, setOverdueCars] = useState([]);
  const [carsByStatus, setCarsByStatus] = useState({});
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedSectionKey, setSelectedSectionKey] = useState('');
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [stats, setStats] = useState({
    pending: 0,
    working: 0,
    done: 0,
    waiting_wash: 0,
    waiting_handover: 0,
    delivered: 0,
    additional_repair: 0,
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const todayISO = new Date().toISOString().slice(0, 10);
  const todayDisplay = new Date().toLocaleDateString('vi-VN');

  const getColor = (car) => {
    if (car.isLate || ['warranty', 'rescue'].includes(car.condition)) return '#d32f2f';
    if (['vip', 'good'].includes(car.condition)) return 'green';
    return 'inherit';
  };

  const carSections = [
    { key: 'pending', label: '⏳ Xe chờ sửa:' },
    { key: 'working', label: '🔧 Xe đang sửa:' },
    { key: 'done', label: '✅ Xe hoàn thành:' },
    { key: 'waiting_wash', label: '🧼 Xe chờ rửa:' },
    { key: 'waiting_handover', label: '🚚 Xe chờ giao:' },
    { key: 'delivered', label: '📦 Xe đã giao:' },
    { key: 'additional_repair', label: '🔁 Xe sửa bổ sung:' },
  ];

  const statsConfig = [
    { key: 'pending', label: 'Chờ', icon: <QueryBuilderIcon color="warning" /> },
    { key: 'working', label: 'Đang sửa', icon: <BuildIcon color="primary" /> },
    { key: 'done', label: 'Hoàn thành', icon: <DoneIcon color="success" /> },
    { key: 'waiting_wash', label: 'Chờ rửa', icon: <LocalCarWashIcon color="info" /> },
    { key: 'waiting_handover', label: 'Chờ giao', icon: <LocalShippingIcon color="secondary" /> },
    { key: 'delivered', label: 'Đã giao', icon: <InventoryIcon color="action" /> },
    { key: 'additional_repair', label: 'Bổ sung', icon: <ReplayIcon color="error" /> },
    { key: 'late', label: 'Trễ hẹn', icon: <ErrorIcon color="error" /> },
  ];

  const getFilteredStats = () => {
    const result = {
      pending: 0,
      working: 0,
      done: 0,
      waiting_wash: 0,
      waiting_handover: 0,
      delivered: 0,
      additional_repair: 0,
    };

    for (const key in carsByStatus) {
      const cars = (carsByStatus[key] || []).filter((car) => car.currentDate === todayISO);
      const filtered = filterCars(cars);
      result[key] = filtered.length;
    }

    return result;
  };

  const fetchData = async () => {
    try {
      const [resWorkingPending, resStats, resOverdue, resLocations] = await Promise.all([
        getWorkingAndPendingCars(),
        getCarStats(),
        getOverdueCars(),
        getAllLocations(),
      ]);

      const carStatusData = resWorkingPending.data || {};
      const overdueRaw = resOverdue.data.cars || [];

      const todayCars = [];

      Object.values(carStatusData).forEach((cars) => {
        (cars || []).forEach((car) => {
          if (car.currentDate === todayISO) {
            todayCars.push(car);
          }
        });
      });

      // Gắn cờ isLate cho xe hôm nay
      const overdueIds = new Set(overdueRaw.map((car) => car._id));
      const todayCarsWithLateFlag = todayCars.map((car) => ({
        ...car,
        isLate: overdueIds.has(car._id),
      }));

      // Gắn cờ isLate cho tất cả xe trễ hẹn (overdueRaw)
      const overdueCarsWithLateFlag = overdueRaw.map((car) => ({
        ...car,
        isLate: true,
      }));

      setCarsToday(todayCarsWithLateFlag);
      setOverdueCars(overdueCarsWithLateFlag); // Sửa ở đây: luôn in ra tất cả xe trễ hẹn
      setCarsByStatus(carStatusData);
      setStats(resStats.data);
      setLocations(resLocations.data || []);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu:', err);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getWorkersByRole = (workers = []) => {
    const formatWorkers = (role) =>
      workers
        .filter((w) => w.role === role)
        .map((w) => `- ${w.worker?.name}`)
        .filter(Boolean)
        .join('\n');

    return {
      mainWorkers: formatWorkers('main'),
      subWorkers: formatWorkers('sub'),
    };
  };

  const renderCarCard = (car, index) => {
    const { mainWorkers, subWorkers } = getWorkersByRole(car.workers);
    const color = getColor(car);
    return (
      <Paper key={car._id} elevation={4} sx={{ p: 3, borderRadius: 3, border: color !== 'inherit' ? `2px solid ${color}` : undefined, boxShadow: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <DirectionsCarIcon fontSize="large" color={color === '#d32f2f' ? 'error' : color === 'green' ? 'success' : 'primary'} />
          <Typography fontSize={24} fontWeight="bold" gutterBottom sx={{ color }}>{car.plateNumber}</Typography>
        </Stack>
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1}><LocationOnIcon fontSize="small" /><Typography fontSize={18}>{car.location?.name || '---'}</Typography></Stack>
          <Stack direction="row" alignItems="center" spacing={1}><DirectionsCarIcon fontSize="small" /><Typography fontSize={18}>{car.carType?.name || '---'}</Typography></Stack>
          <Stack direction="row" alignItems="center" spacing={1}><QueryBuilderIcon fontSize="small" /><Typography fontSize={18}>{car.currentTime}</Typography></Stack>
          <Stack direction="row" alignItems="center" spacing={1}><PersonIcon fontSize="small" /><Typography fontSize={18}>Thợ chính:</Typography> {mainWorkers ? <Chip label={mainWorkers} color="primary" size="small" /> : <Chip label="Trống" color="error" size="small" />}</Stack>
          <Stack direction="row" alignItems="center" spacing={1}><GroupIcon fontSize="small" /><Typography fontSize={18}>Thợ phụ:</Typography> {subWorkers ? <Chip label={subWorkers} color="secondary" size="small" /> : <Chip label="Trống" color="error" size="small" />}</Stack>
          <Stack direction="row" alignItems="center" spacing={1}><SupervisorAccountIcon fontSize="small" /><Typography fontSize={18}>Giám sát:</Typography> <Typography fontSize={18}>{car.supervisor?.name || '---'}</Typography></Stack>
        </Stack>
      </Paper>
    );
  };

  const renderCarTable = (cars) => (
    <Box sx={{ width: '100%' }}>
      <Table sx={{ width: '100%' }} stickyHeader>
        <TableHead>
          <TableRow>
            {['STT', 'Biển số', 'Địa điểm', 'Loại xe', 'Nhận', 'Thợ chính', 'Thợ phụ', 'Giám sát'].map((title, idx) => (
              <TableCell key={title} align={idx === 0 ? 'center' : 'left'} sx={{ background: '#f5f5f5' }}>
                <Typography fontWeight="bold" fontSize={20}>{title}</Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {cars.map((car, index) => {
            const { mainWorkers, subWorkers } = getWorkersByRole(car.workers);
            const color = getColor(car);
            return (
              <TableRow key={car._id} sx={{ backgroundColor: index % 2 === 0 ? '#fafafa' : '#fff', transition: 'background 0.2s', '&:hover': { backgroundColor: '#e3f2fd' } }}>
                <TableCell align="center"><Typography fontSize={19} sx={{ color }}>{index + 1}</Typography></TableCell>
                <TableCell><Typography fontSize={19} sx={{ color }}>{car.plateNumber}</Typography></TableCell>
                <TableCell><Typography fontSize={19} sx={{ color }}>{car.location?.name || '---'}</Typography></TableCell>
                <TableCell><Typography fontSize={19} sx={{ color }}>{car.carType?.name || '---'}</Typography></TableCell>
                <TableCell><Typography fontSize={19} sx={{ color }}>{car.currentTime}</Typography></TableCell>
                <TableCell>{mainWorkers ? <Chip label={mainWorkers} color="primary" size="small" /> : <Chip label="Trống" color="error" size="small" />}</TableCell>
                <TableCell>{subWorkers ? <Chip label={subWorkers} color="primary" size="small" /> : <Chip label="Trống" color="error" size="small" />}</TableCell>
                <TableCell><Typography fontSize={19} sx={{ color }}>{car.supervisor?.name || '---'}</Typography></TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );

  // Lấy danh sách giám sát viên duy nhất từ tất cả xe
  const getAllSupervisors = () => {
    const allCars = [
      ...carsToday,
      ...overdueCars,
      ...Object.values(carsByStatus).flat()
    ];
    const supervisors = allCars
      .map(car => car.supervisor)
      .filter(Boolean)
      .filter((v, i, a) => v && a.findIndex(t => t?._id === v._id) === i);
    return supervisors;
  };

  // Lọc theo địa điểm và giám sát viên
  const filterCars = (cars) => {
    let filtered = cars;
    if (selectedLocation) {
      filtered = filtered.filter((car) => car.location?._id === selectedLocation);
    }
    if (selectedSupervisor) {
      filtered = filtered.filter((car) => car.supervisor?._id === selectedSupervisor);
    }
    return filtered;
  };

  return (
    <Box sx={{ width: '100%', mt: 0, px: { xs: 1, sm: 2, md: 4 }, py: 2, backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight="bold" gutterBottom>
        Danh sách xe trong ngày (
        <Box component="span" sx={{ color: '#d32f2f', fontWeight: 'bold', display: 'inline' }}>{todayDisplay}</Box>)
      </Typography>

      <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <FilterListIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">Bộ lọc</Typography>
        </Stack>
        <Divider sx={{ mb: 2 }} />
        <Box
          sx={theme => ({
            display: 'flex',
            flexWrap: 'wrap',
            gap: { xs: 0, sm: 2 },
            mb: 1,
            flexDirection: { xs: 'column', sm: 'row' },
          })}
        >
          <FormControl
            sx={{
              maxWidth: { xs: '100%', sm: 300 },
              minWidth: { xs: 0, sm: 200 },
              width: '100%',
              flexGrow: 1,
              flexShrink: 0,
              mb: { xs: 2, sm: 0 },
            }}
          >
            <InputLabel><LocationOnIcon fontSize="small" sx={{ mr: 1 }} />Chọn địa điểm</InputLabel>
            <Select
              value={selectedLocation}
              label={<><LocationOnIcon fontSize="small" sx={{ mr: 1 }} />Chọn địa điểm</>}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <MenuItem value="">Tất cả địa điểm</MenuItem>
              {locations.map((loc) => (
                <MenuItem key={loc._id} value={loc._id}>{loc.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            sx={{
              maxWidth: { xs: '100%', sm: 300 },
              minWidth: { xs: 0, sm: 200 },
              width: '100%',
              flexGrow: 1,
              flexShrink: 0,
              mb: { xs: 2, sm: 0 },
            }}
          >
            <InputLabel><SupervisorAccountIcon fontSize="small" sx={{ mr: 1 }} />Chọn giám sát</InputLabel>
            <Select
              value={selectedSupervisor}
              label={<><SupervisorAccountIcon fontSize="small" sx={{ mr: 1 }} />Chọn giám sát</>}
              onChange={(e) => setSelectedSupervisor(e.target.value)}
            >
              <MenuItem value="">Tất cả giám sát</MenuItem>
              {getAllSupervisors().map((sup) => (
                <MenuItem key={sup._id} value={sup._id}>{sup.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            sx={{
              maxWidth: { xs: '100%', sm: 300 },
              minWidth: { xs: 0, sm: 200 },
              width: '100%',
              flexGrow: 1,
              flexShrink: 0,
              mb: { xs: 2, sm: 0 },
            }}
          >
            <InputLabel><DirectionsCarIcon fontSize="small" sx={{ mr: 1 }} />Chọn mục hiển thị</InputLabel>
            <Select
              value={selectedSectionKey}
              label={<><DirectionsCarIcon fontSize="small" sx={{ mr: 1 }} />Chọn mục hiển thị</>}
              onChange={(e) => setSelectedSectionKey(e.target.value)}
            >
              <MenuItem value="">Tất cả mục</MenuItem>
              <MenuItem value="today">🗓️ Xe hôm nay</MenuItem>
              <MenuItem value="late">⏰ Xe trễ hẹn</MenuItem>
              {carSections.map((section) => (
                <MenuItem key={section.key} value={section.key}>{section.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>📊 Thống kê xe:</Typography>
        <Grid container spacing={2} sx={{ width: '100%' }}>
          {statsConfig.map((stat, idx) => (
            <Grid item xs={3} sm={3} md={2} key={stat.key}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  minHeight: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: stat.key === 'late' ? '#fff3e0' : '#f5f5f5',
                }}
              >
                {stat.icon}
                <Typography fontWeight="bold" fontSize={18}>{stat.label}</Typography>
                <Typography fontSize={20} color={stat.key === 'late' ? 'error' : 'primary'}>
                  {stat.key === 'late' ? filterCars(overdueCars).length : getFilteredStats()[stat.key]}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Divider sx={{ mb: 3 }} />

      {(!selectedSectionKey || selectedSectionKey === 'today') && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>🗓️ Xe hôm nay:</Typography>
          {filterCars(carsToday).length === 0 ? (
            <Typography>Không có xe nào.</Typography>
          ) : isMobile ? (
            <Stack spacing={2}>{filterCars(carsToday).map(renderCarCard)}</Stack>
          ) : (
            <Paper elevation={2} sx={{ p: 2 }}>{renderCarTable(filterCars(carsToday))}</Paper>
          )}
        </Box>
      )}

      {(!selectedSectionKey || selectedSectionKey === 'late') && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>⏰ Xe trễ hẹn:</Typography>
          {filterCars(overdueCars).length === 0 ? (
            <Typography>Không có xe nào.</Typography>
          ) : isMobile ? (
            <Stack spacing={2}>{filterCars(overdueCars).map(renderCarCard)}</Stack>
          ) : (
            <Paper elevation={2} sx={{ p: 2 }}>{renderCarTable(filterCars(overdueCars))}</Paper>
          )}
        </Box>
      )}

      {carSections
        .filter(({ key }) => !selectedSectionKey || key === selectedSectionKey)
        .map(({ key, label }) => {
          const cars = carsByStatus[key] || [];
          const carsTodayOnly = cars.filter((car) => car.currentDate === todayISO);
          const filtered = filterCars(carsTodayOnly);
          return (
            <Box key={key} sx={{ mt: 4 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>{label}</Typography>
              {filtered.length === 0 ? (
                <Typography>Không có xe nào.</Typography>
              ) : isMobile ? (
                <Stack spacing={2}>{filtered.map(renderCarCard)}</Stack>
              ) : (
                <Paper elevation={2} sx={{ p: 2 }}>{renderCarTable(filtered)}</Paper>
              )}
            </Box>
          );
        })}
    </Box>
  );
};

export default Home;
