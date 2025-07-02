// ./components/pages/AvailableWorkersPage.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Paper,
  TextField,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Person } from '@mui/icons-material';
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
    <Box
      sx={{
        p: { xs: 1, sm: 3 },
        width: '100%',
        maxWidth: '100%',
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        borderRadius: 0,
        boxSizing: 'border-box',
        px: { xs: 0, sm: 2 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 3,
          background: '#fff',
          borderRadius: 4,
          boxShadow: '0 4px 24px rgba(37,99,235,0.07)',
          mb: 4,
          py: { xs: 3, sm: 4 },
          px: { xs: 2, sm: 6 },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(59,130,246,0.08)',
            borderRadius: '50%',
            width: 72,
            height: 72,
            mr: { xs: 0, sm: 2 },
            mb: { xs: 2, sm: 0 },
          }}
        >
          <span role="img" aria-label="worker" style={{ fontSize: 44 }}>🧑‍🔧</span>
        </Box>
        <Box>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              fontSize: { xs: 24, sm: 32 },
              color: '#1e293b',
              mb: 1,
              textShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            Danh sách thợ đang rảnh
          </Typography>
          <Typography sx={{ color: '#64748b', fontSize: 17, fontWeight: 400, maxWidth: 600 }}>
            Tra cứu nhanh các thợ hiện đang rảnh để phân công công việc hiệu quả hơn.
          </Typography>
        </Box>
      </Paper>
      <Box mb={3}><Divider /></Box>
      <Box display="flex" gap={2} mb={3} justifyContent="center">
        <TextField
          label="Tìm kiếm thợ rảnh theo tên"
          variant="outlined"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ maxWidth: 400, background: '#fff', borderRadius: 2 }}
        />
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : filteredWorkers.length === 0 ? (
        <Typography align="center">🚫 Hiện không có thợ nào rảnh.</Typography>
      ) : (
        <Grid container spacing={2} sx={{ mt: 1, width: '100%', mx: 0 }} justifyContent="center">
          {filteredWorkers.map((worker, idx) => (
            <Grid item xs={12} sm={6} md={2} key={worker._id} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Card
                elevation={2}
                sx={{
                  width: { xs: '90vw', sm: 200 },
                  minHeight: 160,
                  borderRadius: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 2,
                }}
              >
                <CardContent sx={{ p: 0, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Avatar
                    sx={{
                      bgcolor: '#3b82f6',
                      width: 48,
                      height: 48,
                      mb: 1.5
                    }}
                  >
                    <Person fontSize="medium" />
                  </Avatar>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ color: '#1e293b', fontSize: 17, textAlign: 'center', mb: 1 }}
                  >
                    {worker.name}
                  </Typography>
                  <Typography sx={{ color: '#64748b', fontSize: 14 }}>
                    STT: {idx + 1}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {/* Add empty placeholders if needed to always show 6 columns */}
          {Array.from({ length: filteredWorkers.length % 6 === 0 ? 0 : 6 - (filteredWorkers.length % 6) }).map((_, idx) => (
            <Grid item xs={12} sm={6} md={2} key={`empty-${idx}`} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ visibility: 'hidden', maxWidth: 200, width: '100%' }}>
                <Card />
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default AvailableWorkersPage;
