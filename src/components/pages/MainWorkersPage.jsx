import React, { useEffect, useState } from 'react';
import {
  getAllWorkers,
  deleteWorker,
  updateWorker,
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
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

const WorkersPage = () => {
  const [workers, setWorkers] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({ id: '', name: '', phone: '' });

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState(null);

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
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 giờ
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

  return (
    <Box sx={{ padding: { xs: 2, sm: 4 }, backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ fontSize: 32 }}>
        🛠️ Danh sách thợ
      </Typography>

      <AddWorkerForm onSuccess={fetchWorkers} />

      <List sx={{ mt: 3 }}>
        {workers.map((w) => (
          <React.Fragment key={w._id}>
            <ListItem
              secondaryAction={
                <>
                  <IconButton edge="end" onClick={() => handleEditClick(w)}>
                    <Edit />
                  </IconButton>
                  <IconButton edge="end" onClick={() => handleDelete(w._id)}>
                    <Delete />
                  </IconButton>
                </>
              }
              sx={{ fontSize: 18 }}
            >
              <Typography fontSize={19}>
                {w.name} {w.phone ? `- ${w.phone}` : ''}
              </Typography>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>

      {/* Dialog chỉnh sửa */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle sx={{ fontSize: 22, fontWeight: 'bold' }}>Cập nhật thợ</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Tên thợ"
              value={editData.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
              required
              InputProps={{ style: { fontSize: 18 } }}
              InputLabelProps={{ style: { fontSize: 18 } }}
            />
            <TextField
              label="Số điện thoại"
              value={editData.phone}
              onChange={(e) =>
                setEditData({ ...editData, phone: e.target.value })
              }
              InputProps={{ style: { fontSize: 18 } }}
              InputLabelProps={{ style: { fontSize: 18 } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} sx={{ fontSize: 16 }}>
            Huỷ
          </Button>
          <Button onClick={handleEditSave} variant="contained" sx={{ fontSize: 16 }}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác thực mật khẩu xoá */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Xác thực để xoá</DialogTitle>
        <DialogContent>
          <TextField
            type="password"
            label="Nhập mật khẩu"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Huỷ</Button>
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
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkersPage;
