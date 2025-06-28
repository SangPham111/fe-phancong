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

const Home = () => {
  const [carsToday, setCarsToday] = useState([]);
  const [overdueCars, setOverdueCars] = useState([]);
  const [carsByStatus, setCarsByStatus] = useState({});
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedSectionKey, setSelectedSectionKey] = useState('');
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
      const filtered = filterByLocation(cars);
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

      const overdueIds = new Set(overdueRaw.map((car) => car._id));

      const todayCarsWithLateFlag = todayCars.map((car) => ({
        ...car,
        isLate: overdueIds.has(car._id),
      }));

      const overdueTodayCars = todayCarsWithLateFlag.filter((car) => car.isLate);

      setCarsToday(todayCarsWithLateFlag);
      setOverdueCars(overdueTodayCars);
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
      <Paper key={car._id} elevation={3} sx={{ p: 3 }}>
        <Typography fontSize={24} fontWeight="bold" gutterBottom sx={{ color }}>
          #{index + 1} - {car.plateNumber}
        </Typography>
        <Typography fontSize={22} mb={1} sx={{ color }}>
          📍 Địa điểm: {car.location?.name || '---'}
        </Typography>
        <Typography fontSize={22} mb={1} sx={{ color }}>
          🚗 Loại xe: {car.carType?.name || '---'}
        </Typography>
        <Typography fontSize={22} mb={1} sx={{ color }}>
          🕑 Nhận: {car.currentTime}
        </Typography>
        <Typography fontSize={22} mb={1} sx={{ whiteSpace: 'pre-line', color }}>
          🛠️ Thợ chính:
          {'\n'}
          <Box component="span" sx={{ color: mainWorkers ? 'inherit' : '#d32f2f', fontWeight: mainWorkers ? 'normal' : 'bold' }}>
            {mainWorkers || 'Trống'}
          </Box>
        </Typography>
        <Typography fontSize={22} mb={1} sx={{ whiteSpace: 'pre-line', color }}>
          🔧 Thợ phụ:
          {'\n'}
          <Box component="span" sx={{ color: subWorkers ? 'inherit' : '#d32f2f', fontWeight: subWorkers ? 'normal' : 'bold' }}>
            {subWorkers || 'Trống'}
          </Box>
        </Typography>
        <Typography fontSize={22} mb={1} sx={{ color }}>
          👨‍💼 Giám sát: {car.supervisor?.name || '---'}
        </Typography>
      </Paper>
    );
  };

  const renderCarTable = (cars) => (
    <Table>
      <TableHead>
        <TableRow>
          {['STT', 'Biển số', 'Địa điểm', 'Loại xe', 'Nhận', 'Thợ chính', 'Thợ phụ', 'Giám sát'].map((title) => (
            <TableCell key={title}>
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
            <TableRow key={car._id}>
              <TableCell><Typography fontSize={19} sx={{ color }}>{index + 1}</Typography></TableCell>
              <TableCell><Typography fontSize={19} sx={{ color }}>{car.plateNumber}</Typography></TableCell>
              <TableCell><Typography fontSize={19} sx={{ color }}>{car.location?.name || '---'}</Typography></TableCell>
              <TableCell><Typography fontSize={19} sx={{ color }}>{car.carType?.name || '---'}</Typography></TableCell>
              <TableCell><Typography fontSize={19} sx={{ color }}>{car.currentTime}</Typography></TableCell>
              <TableCell>
                <Typography fontSize={19} sx={{ whiteSpace: 'pre-line', color: mainWorkers ? color : '#d32f2f', fontWeight: mainWorkers ? 'normal' : 'bold' }}>
                  {mainWorkers || 'Trống'}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography fontSize={19} sx={{ whiteSpace: 'pre-line', color: subWorkers ? color : '#d32f2f', fontWeight: subWorkers ? 'normal' : 'bold' }}>
                  {subWorkers || 'Trống'}
                </Typography>
              </TableCell>
              <TableCell><Typography fontSize={19} sx={{ color }}>{car.supervisor?.name || '---'}</Typography></TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  const filterByLocation = (cars) => {
    if (!selectedLocation) return cars;
    return cars.filter((car) => car.location?._id === selectedLocation);
  };

  return (
    <Box sx={{ width: '100%', mt: 0, px: { xs: 1, sm: 2, md: 4 }, py: 2, backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight="bold" gutterBottom>
        Danh sách xe trong ngày (
        <Box component="span" sx={{ color: '#d32f2f', fontWeight: 'bold', display: 'inline' }}>{todayDisplay}</Box>)
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <FormControl
          fullWidth
          sx={{
            maxWidth: 300,
            minWidth: 200,
            flexGrow: 1,
            flexShrink: 0,
          }}
        >
          <InputLabel>Chọn địa điểm</InputLabel>
          <Select
            value={selectedLocation}
            label="Chọn địa điểm"
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <MenuItem value="">Tất cả địa điểm</MenuItem>
            {locations.map((loc) => (
              <MenuItem key={loc._id} value={loc._id}>{loc.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl
          fullWidth
          sx={{
            maxWidth: 300,
            minWidth: 200,
            flexGrow: 1,
            flexShrink: 0,
          }}
        >
          <InputLabel>Chọn mục hiển thị</InputLabel>
          <Select
            value={selectedSectionKey}
            label="Chọn mục hiển thị"
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

      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>📊 Thống kê xe:</Typography>
        <Stack direction="row" flexWrap="wrap" spacing={2} rowGap={1}>
          <Typography>⏳ Chờ: <b>{getFilteredStats().pending}</b></Typography>
          <Typography>🚧 Đang sửa: <b>{getFilteredStats().working}</b></Typography>
          <Typography>✅ Hoàn thành: <b>{getFilteredStats().done}</b></Typography>
          <Typography>🧼 Chờ rửa: <b>{getFilteredStats().waiting_wash}</b></Typography>
          <Typography>🚚 Chờ giao: <b>{getFilteredStats().waiting_handover}</b></Typography>
          <Typography>📦 Đã giao: <b>{getFilteredStats().delivered}</b></Typography>
          <Typography>🔁 Bổ sung: <b>{getFilteredStats().additional_repair}</b></Typography>
        </Stack>
      </Paper>

      <Divider sx={{ mb: 3 }} />

      {(!selectedSectionKey || selectedSectionKey === 'today') && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>🗓️ Xe hôm nay:</Typography>
          {filterByLocation(carsToday).length === 0 ? (
            <Typography>Không có xe nào.</Typography>
          ) : isMobile ? (
            <Stack spacing={2}>{filterByLocation(carsToday).map(renderCarCard)}</Stack>
          ) : (
            <Paper elevation={2} sx={{ p: 2 }}>{renderCarTable(filterByLocation(carsToday))}</Paper>
          )}
        </Box>
      )}

      {(!selectedSectionKey || selectedSectionKey === 'late') && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>⏰ Xe trễ hẹn:</Typography>
          {filterByLocation(overdueCars).length === 0 ? (
            <Typography>Không có xe nào.</Typography>
          ) : isMobile ? (
            <Stack spacing={2}>{filterByLocation(overdueCars).map(renderCarCard)}</Stack>
          ) : (
            <Paper elevation={2} sx={{ p: 2 }}>{renderCarTable(filterByLocation(overdueCars))}</Paper>
          )}
        </Box>
      )}

      {carSections
        .filter(({ key }) => !selectedSectionKey || key === selectedSectionKey)
        .map(({ key, label }) => {
          const cars = carsByStatus[key] || [];
          const carsTodayOnly = cars.filter((car) => car.currentDate === todayISO);
          const filtered = filterByLocation(carsTodayOnly);
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
