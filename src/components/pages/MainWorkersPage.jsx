import React, { useEffect, useState } from 'react';
import {
  getAllWorkers,
  deleteWorker,
  updateWorker,
  getWorkerPerformance,
  getWorkerDailyPerformancePercentage,
} from '../apis/index';
import AddWorkerForm from './AddWorkerForm';
import {
  Typography,
  List,
  ListItem,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Chip,
  Card,
  CardContent,
  Grid,
  Paper,
  Avatar,
  Tooltip,
} from '@mui/material';
import { Edit, Delete, TrendingUp, Person, Phone } from '@mui/icons-material';

const WorkersPage = () => {
  const [workers, setWorkers] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({ id: '', name: '', phone: '' });

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const [performanceOpen, setPerformanceOpen] = useState(false);
  const [performanceData, setPerformanceData] = useState(null);
  const [dailyPercentage, setDailyPercentage] = useState(null);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [performanceError, setPerformanceError] = useState('');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [dailyDate, setDailyDate] = useState('');

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const fetchWorkers = async () => {
    try {
      const res = await getAllWorkers();
      setWorkers(res.data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thợ:', error);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const isPasswordVerified = () => {
    const verifiedUntil = localStorage.getItem('worker_verified_until');
    return verifiedUntil && new Date(verifiedUntil) > new Date();
  };

  const markPasswordVerified = () => {
    const expiry = new Date(Date.now() + 60 * 60 * 10000); // 10 giờ
    localStorage.setItem('worker_verified_until', expiry.toISOString());
  };

  const handleDelete = async (id) => {
    if (isPasswordVerified()) {
      proceedDelete(id);
    } else {
      setDeleteTargetId(id);
      setConfirmDialogOpen(true);
    }
  };

  const proceedDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xoá thợ này?')) return;
    try {
      await deleteWorker(id);
      fetchWorkers();
    } catch (error) {
      console.error('Lỗi khi xoá thợ:', error);
    }
  };

  const handleEditClick = (worker) => {
    setEditData({
      id: worker._id,
      name: worker.name,
      phone: worker.phone || '',
    });
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    try {
      await updateWorker(editData.id, {
        name: editData.name,
        phone: editData.phone,
      });
      setEditOpen(false);
      fetchWorkers();
    } catch (error) {
      console.error('Lỗi khi cập nhật thợ:', error);
    }
  };

  const handleViewPerformance = async (worker) => {
    setSelectedWorker(worker);
    setPerformanceOpen(true);
    setPerformanceData(null);
    setDailyPercentage(null);
    setPerformanceError('');
    setFromDate('');
    setToDate('');

    // Set today's date by default
    const today = getTodayDate();
    setDailyDate(today);

    // Automatically fetch today's performance
    setTimeout(() => {
      fetchDailyPercentageForWorker(worker._id, today);
    }, 100);
  };

  const fetchDailyPercentageForWorker = async (workerId, date) => {
    if (!workerId || !date) return;
    setPerformanceLoading(true);
    setPerformanceError('');
    try {
      const res = await getWorkerDailyPerformancePercentage(workerId, date);
      setDailyPercentage(res.data.data);
    } catch (err) {
      setPerformanceError('Lỗi khi lấy phần trăm hiệu suất ngày!');
    } finally {
      setPerformanceLoading(false);
    }
  };

  const fetchPerformance = async () => {
    if (!selectedWorker || !fromDate || !toDate) return;
    setPerformanceLoading(true);
    setPerformanceError('');
    try {
      const res = await getWorkerPerformance(selectedWorker._id, fromDate, toDate);
      setPerformanceData(res.data.data);
    } catch (err) {
      setPerformanceError('Lỗi khi lấy hiệu suất thợ!');
    } finally {
      setPerformanceLoading(false);
    }
  };

  const fetchDailyPercentage = async () => {
    if (!selectedWorker || !dailyDate) return;
    await fetchDailyPercentageForWorker(selectedWorker._id, dailyDate);
  };

  const filteredWorkers = searchName.trim()
    ? workers.filter(w => w.name.toLowerCase().includes(searchName.trim().toLowerCase()))
    : workers;

  return (
    <Box
      sx={{
        p: 3,
        width: '100%',
        maxWidth: '100%',
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        borderRadius: 0,
        boxSizing: 'border-box',
        px: 2, // horizontal padding
      }}
    >
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
          justifyContent: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <span role="img" aria-label="worker" style={{ fontSize: 40 }}>🛠️</span>
        </Box>
        <Box>
          <Typography variant="h5" fontWeight="bold" color="primary">
            Quản lý thợ
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Thêm mới, chỉnh sửa, tìm kiếm và theo dõi hiệu suất thợ tại đây.
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'stretch',
        justifyContent: 'center',
        gap: 1,
        mb: 2,
        width: '100%',
        maxWidth: 1100,
        mx: 'auto',
      }}>
        <Box
          sx={{
            flex: { xs: 'unset', sm: 1 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fff',
            borderRadius: 3,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            p: { xs: 0, sm: 2.5 },
            minHeight: 80,
            width: '100%',
            maxWidth: '100%',
            mx: 0,
          }}
        >
          <Box sx={{ textAlign: 'center', width: '100%' }}>
            <Typography sx={{ fontWeight: 'bold', fontSize: 22, color: '#2563eb', mb: 1 }}>
              Tổng số thợ
            </Typography>
            <Typography sx={{ fontWeight: 'bold', fontSize: 32, color: '#1e293b' }}>
              {filteredWorkers.length}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            flex: { xs: 'unset', sm: 2 },
            minWidth: 0,
            width: { xs: '100%', sm: 'unset' },
            mb: { xs: 2, sm: 0 },
          }}
        >
          <AddWorkerForm onSuccess={fetchWorkers} searchName={searchName} setSearchName={setSearchName} />
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mt: 3, width: '100%', mx: 0 }} justifyContent="center">
        {filteredWorkers.map((w) => (
          <Grid item xs={12} sm={6} md={2} key={w._id} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Card
              elevation={2}
              sx={{
                width: { xs: '90vw', sm: 200 },
                minHeight: 220,
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 2,
              }}
            >
              <CardContent sx={{ p: 0, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar
                  sx={{
                    bgcolor: '#3b82f6',
                    width: 56,
                    height: 56,
                    mb: 1.5
                  }}
                >
                  <Person fontSize="large" />
                </Avatar>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ color: '#1e293b', fontSize: 18, textAlign: 'center', mb: 2 }}
                >
                  {w.name}
                </Typography>
                {w.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                    <Phone sx={{ fontSize: 16, color: '#64748b', mr: 1 }} />
                    <Typography sx={{ color: '#64748b', fontSize: 14 }}>
                      {w.phone}
                    </Typography>
                  </Box>
                )}
                <Box sx={{ width: '100%', mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 1 }}>
                    <Tooltip title="Chỉnh sửa">
                      <IconButton
                        size="small"
                        onClick={() => handleEditClick(w)}
                        sx={{
                          bgcolor: '#f1f5f9',
                          '&:hover': { bgcolor: '#e2e8f0' }
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(w._id)}
                        sx={{
                          bgcolor: '#fef2f2',
                          '&:hover': { bgcolor: '#fee2e2' }
                        }}
                      >
                        <Delete fontSize="small" sx={{ color: '#dc2626' }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<TrendingUp />}
                      onClick={() => handleViewPerformance(w)}
                      sx={{
                        bgcolor: '#10b981',
                        '&:hover': { bgcolor: '#059669' },
                        fontSize: 12,
                        px: 2,
                        boxShadow: 'none',
                        borderRadius: 2,
                        minWidth: 0,
                        height: 32
                      }}
                    >
                      Hiệu suất
                    </Button>
                  </Box>
                </Box>
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

      {/* Dialog chỉnh sửa */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 22, fontWeight: 'bold', color: '#1e293b' }}>
          ✏️ Cập nhật thông tin thợ
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <TextField
              label="Tên thợ"
              value={editData.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
              required
              fullWidth
              InputProps={{ style: { fontSize: 16 } }}
              InputLabelProps={{ style: { fontSize: 16 } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setEditOpen(false)}
            sx={{ fontSize: 16, px: 3 }}
            variant="outlined"
          >
            Huỷ
          </Button>
          <Button
            onClick={handleEditSave}
            variant="contained"
            sx={{ fontSize: 16, px: 3, bgcolor: '#3b82f6' }}
          >
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác thực mật khẩu xoá */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: '#dc2626', fontWeight: 'bold' }}>
          🔒 Xác thực để xoá
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2, color: '#64748b' }}>
            Vui lòng nhập mật khẩu để xác nhận việc xóa thợ này.
          </Typography>
          <TextField
            type="password"
            label="Nhập mật khẩu"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setConfirmDialogOpen(false)}
            variant="outlined"
            sx={{ px: 3 }}
          >
            Huỷ
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (password === '123456@') {
                markPasswordVerified();
                setConfirmDialogOpen(false);
                setPassword('');
                proceedDelete(deleteTargetId);
              } else {
                alert('❌ Sai mật khẩu!');
              }
            }}
            sx={{ bgcolor: '#dc2626', px: 3 }}
          >
            Xác nhận xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xem hiệu suất thợ */}
      <Dialog open={performanceOpen} onClose={() => setPerformanceOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontSize: 22, fontWeight: 'bold', color: '#1e293b', borderBottom: '1px solid #e2e8f0' }}>
          📊 Hiệu suất của thợ: {selectedWorker?.name}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2, bgcolor: '#f8fafc' }}>
            <Typography fontWeight="bold" sx={{ mb: 2, color: '#1e293b' }}>
              📈 Xem phần trăm hiệu suất trong ngày:
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
              <TextField
                label="Ngày"
                type="date"
                size="small"
                value={dailyDate}
                onChange={e => setDailyDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
              <Button
                variant="contained"
                size="small"
                onClick={fetchDailyPercentage}
                disabled={performanceLoading || !dailyDate}
                sx={{
                  bgcolor: '#10b981',
                  '&:hover': { bgcolor: '#059669' },
                  px: 3
                }}
              >
                {performanceLoading ? 'Đang tải...' : 'Xem hiệu suất'}
              </Button>
            </Box>

            {performanceError && (
              <Typography color="error" sx={{ mb: 2 }}>
                {performanceError}
              </Typography>
            )}

            {dailyPercentage && (
              <Box>
                <Typography fontWeight="bold" sx={{ mb: 2, color: '#1e293b' }}>
                  📋 Thống kê hiệu suất ngày {dailyPercentage.date}:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ bgcolor: '#f0f9ff', border: '1px solid #0ea5e9' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="h6" color="#0c4a6e" fontWeight="bold">
                          {dailyPercentage.totalCarsInDate}
                        </Typography>
                        <Typography variant="body2" color="#0369a1">
                          Tổng số xe trong ngày
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ bgcolor: '#f0fdf4', border: '1px solid #22c55e' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="h6" color="#166534" fontWeight="bold">
                          {dailyPercentage.totalWork}
                        </Typography>
                        <Typography variant="body2" color="#15803d">
                          Tổng số công việc
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Card sx={{ mt: 2, bgcolor: '#fef3c7', border: '1px solid #f59e0b' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h5" color="#92400e" fontWeight="bold" textAlign="center">
                      {dailyPercentage.performancePercentage}
                    </Typography>
                    <Typography variant="body1" color="#a16207" textAlign="center" fontWeight="bold">
                      Phần trăm hiệu suất
                    </Typography>
                  </CardContent>
                </Card>

                {/* Hiển thị chi tiết nếu có */}
                {dailyPercentage.details && Array.isArray(dailyPercentage.details) && dailyPercentage.details.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography fontWeight="bold" sx={{ mb: 2, color: '#1e293b' }}>
                      📝 Chi tiết công việc:
                    </Typography>
                    <Paper elevation={1} sx={{ maxHeight: 300, overflow: 'auto', borderRadius: 2 }}>
                      <Box sx={{ overflow: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                          <thead>
                            <tr style={{ background: '#f1f5f9' }}>
                              {Object.keys(dailyPercentage.details[0]).map((key) => {
                                let viLabel = key;
                                if (key === 'plateNumber') viLabel = 'Biển số';
                                else if (key === 'action') viLabel = 'Hành động';
                                else if (key === 'note') viLabel = 'Ghi chú';
                                else if (key === 'timestamp') viLabel = 'Thời gian';
                                return (
                                  <th key={key} style={{ border: '1px solid #e2e8f0', padding: 8, fontWeight: 600, color: '#1e293b' }}>
                                    {viLabel}
                                  </th>
                                );
                              })}
                            </tr>
                          </thead>
                          <tbody>
                            {dailyPercentage.details.map((row, idx) => (
                              <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                                {Object.entries(row).map(([key, val], i) => (
                                  <td key={i} style={{ border: '1px solid #e2e8f0', padding: 8 }}>
                                    {key === 'timestamp' ? new Date(val).toLocaleString('vi-VN') : String(val)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </Box>
                    </Paper>
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e2e8f0' }}>
          <Button
            onClick={() => setPerformanceOpen(false)}
            sx={{ fontSize: 16, px: 3 }}
            variant="outlined"
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkersPage;
