// ./components/pages/AvailableWorkersPage.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
} from '@mui/material';
import { getAvailableWorkers } from '../apis'; // ✅ nhớ đúng path

const AvailableWorkersPage = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailableWorkers = async () => {
      try {
        const res = await getAvailableWorkers();
        setWorkers(res.data);
      } catch (err) {
        console.error('Lỗi khi lấy danh sách thợ rảnh:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableWorkers();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Danh sách thợ đang rảnh
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : workers.length === 0 ? (
        <Typography>Hiện không có thợ nào rảnh.</Typography>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>STT</TableCell>
                <TableCell>Tên</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {workers.map((worker, index) => (
                <TableRow key={worker._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{worker.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
};

export default AvailableWorkersPage;
