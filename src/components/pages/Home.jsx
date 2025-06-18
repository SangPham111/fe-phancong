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
} from '@mui/material';
import { getAllCars } from '../apis/index';

const Home = () => {
  const [carsToday, setCarsToday] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await getAllCars();
        const todayISO = new Date().toISOString().slice(0, 10);
        const todayCars = res.data.filter((car) => car.currentDate === todayISO);
        setCarsToday(todayCars);
      } catch (err) {
        console.error('Lỗi khi lấy danh sách xe hôm nay:', err);
      }
    };

    fetchCars();
  }, []);

  const todayDisplay = new Date().toLocaleDateString('vi-VN');

  const getWorkersByRole = (workers = []) => {
    const mainWorkers = workers
      .filter((w) => w.role === 'main')
      .map((w) => w.worker?.name)
      .join(', ');
    const subWorkers = workers
      .filter((w) => w.role === 'sub')
      .map((w) => w.worker?.name)
      .join(', ');
    return { mainWorkers, subWorkers };
  };

  return (
    <Box
      sx={{
        width: '100%',
        mt: { xs: '56px', sm: '64px' },
        px: { xs: 1, sm: 2, md: 4 },
        py: 2,
        backgroundColor: '#f9f9f9',
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >
      <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight="bold" gutterBottom>
        Danh sách xe nhận trong ngày ({todayDisplay})
      </Typography>

      <Divider sx={{ my: 2 }} />

      {carsToday.length === 0 ? (
        <Typography>Không có xe nào trong ngày hôm nay.</Typography>
      ) : isMobile ? (
        <Box display="flex" flexDirection="column" gap={2}>
          {carsToday.map((car, index) => {
            const { mainWorkers, subWorkers } = getWorkersByRole(car.workers);
            return (
              <Paper key={car._id} elevation={2} sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  #{index + 1} - {car.plateNumber}
                </Typography>
                <Typography>Loại xe: {car.carType?.name || '---'}</Typography>
                <Typography>Nhận: {car.currentTime}</Typography>
                <Typography>Giao: {car.deliveryTime}</Typography>
                <Typography>Thợ chính: {mainWorkers || '---'}</Typography>
                <Typography>Thợ phụ: {subWorkers || '---'}</Typography>
                <Typography>Giám sát: {car.supervisor?.name || '---'}</Typography>
              </Paper>
            );
          })}
        </Box>
      ) : (
        <Paper elevation={3} sx={{ p: 1 }}>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell>STT</TableCell>
                <TableCell>Biển số</TableCell>
                <TableCell>Loại xe</TableCell>
                <TableCell>Nhận</TableCell>
                <TableCell>Giao</TableCell>
                <TableCell>Thợ chính</TableCell>
                <TableCell>Thợ phụ</TableCell>
                <TableCell>Giám sát</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {carsToday.map((car, index) => {
                const { mainWorkers, subWorkers } = getWorkersByRole(car.workers);
                return (
                  <TableRow key={car._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{car.plateNumber}</TableCell>
                    <TableCell>{car.carType?.name || '---'}</TableCell>
                    <TableCell>{car.currentTime}</TableCell>
                    <TableCell>{car.deliveryTime}</TableCell>
                    <TableCell>{mainWorkers || '---'}</TableCell>
                    <TableCell>{subWorkers || '---'}</TableCell>
                    <TableCell>{car.supervisor?.name || '---'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
};

export default Home;
