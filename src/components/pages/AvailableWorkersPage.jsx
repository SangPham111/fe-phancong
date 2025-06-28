// ./components/pages/AvailableWorkersPage.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
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
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredWorkers = workers.filter((worker) =>
    worker.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box p={3} maxWidth={600} mx="auto">
      <Typography variant="h5" gutterBottom fontWeight="bold" textAlign="center">
        🧑‍🔧 Danh sách thợ đang rảnh
      </Typography>

      {/* Ô tìm kiếm styled giống CateCarManager */}
      <Box display="flex" gap={2} mb={3}>
        <TextField
          label="Tìm kiếm thợ rảnh theo tên"
          variant="outlined"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : filteredWorkers.length === 0 ? (
        <Typography align="center">🚫 Hiện không có thợ nào rảnh.</Typography>
      ) : (
        <Paper elevation={3} sx={{ borderRadius: 2 }}>
          <Box sx={{ maxHeight: 680, overflowY: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>STT</TableCell>
                  <TableCell>Tên</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredWorkers.map((worker, index) => (
                  <TableRow key={worker._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{worker.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default AvailableWorkersPage;
