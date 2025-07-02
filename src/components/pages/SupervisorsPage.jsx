import React, { useEffect, useState } from 'react';
import {
  getAllSupervisors,
  deleteSupervisor,
  updateSupervisor,
  createSupervisor,
} from '../apis/index';
import {
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
} from '@mui/material';
import { Edit, Delete, SupervisorAccount } from '@mui/icons-material';

const SupervisorsPage = () => {
  const [supervisors, setSupervisors] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({ id: '', name: '', phone: '' });
  const [newSupervisor, setNewSupervisor] = useState({ name: '', phone: '' });

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const fetchSupervisors = async () => {
    try {
      const res = await getAllSupervisors();
      setSupervisors(res.data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách giám sát:', error);
    }
  };

  useEffect(() => {
    fetchSupervisors();
  }, []);

  const isPasswordVerified = () => {
    const verifiedUntil = localStorage.getItem('verified_until');
    return verifiedUntil && new Date(verifiedUntil) > new Date();
  };

  const markPasswordVerified = () => {
    const expiry = new Date(Date.now() + 60 * 60 * 10000); // 10 giờ
    localStorage.setItem('verified_until', expiry.toISOString());
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
    if (window.confirm('Bạn có chắc muốn xoá người giám sát này?')) {
      try {
        await deleteSupervisor(id);
        fetchSupervisors();
      } catch (error) {
        console.error('Lỗi khi xoá:', error);
      }
    }
  };

  const handleEditClick = (supervisor) => {
    setEditData({ id: supervisor._id, name: supervisor.name, phone: supervisor.phone });
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    try {
      await updateSupervisor(editData.id, {
        name: editData.name,
        phone: editData.phone,
      });
      setEditOpen(false);
      fetchSupervisors();
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error);
    }
  };

  const handleAddSupervisor = async (e) => {
    e.preventDefault();
    if (!newSupervisor.name.trim()) {
      return alert('Vui lòng nhập tên giám sát');
    }
    try {
      await createSupervisor(newSupervisor);
      setNewSupervisor({ name: '', phone: '' });
      fetchSupervisors();
    } catch (error) {
      console.error('Lỗi khi thêm giám sát:', error);
    }
  };

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
        px: 2,
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
          <span role="img" aria-label="supervisor" style={{ fontSize: 40 }}>👷‍♂️</span>
        </Box>
        <Box>
          <Typography variant="h5" fontWeight="bold" color="primary">
            Danh sách giám sát
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Quản lý, thêm mới và chỉnh sửa thông tin các giám sát viên tại đây.
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'stretch',
          justifyContent: 'center',
          gap: 1,
          mb: 2,
          width: '100%',
          maxWidth: 1100,
          mx: 'auto',
        }}
      >
        <Box
          sx={{
            flex: { xs: 'unset', sm: 1 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fff',
            borderRadius: 3,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            py: 0.5,
            px: 0,
            minHeight: 80,
            width: '100%',
            maxWidth: '100%',
            mx: 0,
            mb: { xs: 2, sm: 0 },
          }}
        >
          <Box sx={{ textAlign: 'center', width: '100%' }}>
            <Typography sx={{ fontWeight: 'bold', fontSize: 22, color: '#2563eb', mb: 1 }}>
              Tổng số giám sát
            </Typography>
            <Typography sx={{ fontWeight: 'bold', fontSize: 32, color: '#1e293b' }}>
              {supervisors.length}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            flex: { xs: 'unset', sm: 2 },
            minWidth: 0,
            width: { xs: '100%', sm: 'unset' },
          }}
        >
          <Box
            component="form"
            onSubmit={handleAddSupervisor}
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1.5, sm: 2 },
              flexWrap: 'wrap',
              mb: 0,
              justifyContent: 'center',
              background: '#fff',
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              py: 2,
              px: 2,
              alignItems: 'center',
              maxWidth: { xs: '95vw', sm: 500 },
              mx: 'auto',
              position: 'relative',
            }}
          >
            <TextField
              label="Tên giám sát"
              value={newSupervisor.name}
              onChange={(e) => setNewSupervisor({ ...newSupervisor, name: e.target.value })}
              required
              fullWidth
              sx={{
                minWidth: { xs: 0, sm: 200 },
                background: '#f8fafc',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: 17,
                },
                '& .MuiInputLabel-root': {
                  fontSize: 16,
                },
              }}
              inputProps={{ style: { padding: '12px 14px' } }}
            />
            <Button type="submit" variant="contained" fullWidth sx={{
              fontSize: 16,
              px: 3,
              py: 1.5,
              borderRadius: 2,
              bgcolor: '#2563eb',
              boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
              '&:hover': { bgcolor: '#1d4ed8' },
              height: { xs: '44px', sm: '48px' },
              mt: { xs: 1, sm: 0 },
              maxWidth: { xs: '100%', sm: 'unset' },
            }}>
              Thêm
            </Button>
          </Box>
        </Box>
      </Box>
      <Grid container spacing={2} sx={{ mt: 1, width: '100%', mx: 0 }} justifyContent="center">
        {supervisors.map((s, idx) => (
          <Grid item xs={12} sm={6} md={2} key={s._id} sx={{ display: 'flex', justifyContent: 'center' }}>
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
                    bgcolor: '#f59e42',
                    width: 48,
                    height: 48,
                    mb: 1.5
                  }}
                >
                  <SupervisorAccount fontSize="medium" />
                </Avatar>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ color: '#1e293b', fontSize: 17, textAlign: 'center', mb: 1 }}
                >
                  {s.name}
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: 14 }}>
                  STT: {idx + 1}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
                  <IconButton edge="end" onClick={() => handleEditClick(s)} sx={{ bgcolor: '#f1f5f9', '&:hover': { bgcolor: '#e2e8f0' }, mx: 0.5 }}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton edge="end" onClick={() => handleDelete(s._id)} sx={{ bgcolor: '#fef2f2', '&:hover': { bgcolor: '#fee2e2' }, mx: 0.5 }}>
                    <Delete fontSize="small" sx={{ color: '#dc2626' }} />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {/* Add empty placeholders if needed to always show 6 columns */}
        {Array.from({ length: supervisors.length % 6 === 0 ? 0 : 6 - (supervisors.length % 6) }).map((_, idx) => (
          <Grid item xs={12} sm={6} md={2} key={`empty-${idx}`} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ visibility: 'hidden', maxWidth: 200, width: '100%' }}>
              <Card />
            </Box>
          </Grid>
        ))}
      </Grid>
      {/* Dialog cập nhật */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontSize: 22, fontWeight: 'bold', color: '#1e293b', pb: 1 }}>
          ✏️ Cập nhật giám sát
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <TextField
              label="Tên"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              required
              fullWidth
              InputProps={{ style: { fontSize: 16 } }}
              InputLabelProps={{ style: { fontSize: 16 } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ fontSize: 16, px: 3 }} variant="outlined">
            Huỷ
          </Button>
          <Button onClick={handleEditSave} variant="contained" sx={{ fontSize: 16, px: 3, bgcolor: '#3b82f6' }}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
      {/* Dialog xác thực xoá */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ color: '#dc2626', fontWeight: 'bold', fontSize: 20, pb: 1 }}>
          🔒 Xác thực để xoá
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 1 }}>
          <TextField
            type="password"
            label="Nhập mật khẩu"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mt: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            InputProps={{ style: { fontSize: 16 } }}
            InputLabelProps={{ style: { fontSize: 16 } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={() => setConfirmDialogOpen(false)} variant="outlined" sx={{ px: 3 }}>
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
                alert('Sai mật khẩu!');
              }
            }}
            sx={{ bgcolor: '#dc2626', px: 3 }}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupervisorsPage;
