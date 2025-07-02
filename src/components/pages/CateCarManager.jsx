import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LockIcon from '@mui/icons-material/Lock';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';

import {
  createCateCar,
  getAllCateCars,
  updateCateCar,
  deleteCateCar,
} from '../apis/index';

const CateCarManager = () => {
  const [name, setName] = useState('');
  const [cateCars, setCateCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const fetchCateCars = async () => {
    try {
      setLoading(true);
      const res = await getAllCateCars();
      setCateCars(res.data);
    } catch (error) {
      console.error('❌ Lỗi khi lấy danh mục xe:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCateCars();
  }, []);

  const isPasswordVerified = () => {
    const verifiedUntil = localStorage.getItem('catecar_verified_until');
    return verifiedUntil && new Date(verifiedUntil) > new Date();
  };

  const markPasswordVerified = () => {
    const expiry = new Date(Date.now() + 60 * 60 * 10000); // 10 giờ
    localStorage.setItem('catecar_verified_until', expiry.toISOString());
  };

  const handleAddCateCar = async () => {
    if (!name.trim()) return;
    try {
      await createCateCar({ name });
      setName('');
      fetchCateCars();
    } catch (error) {
      console.error('❌ Lỗi khi thêm danh mục:', error);
    }
  };

  const handleEdit = (id, name) => {
    setEditingId(id);
    setEditingName(name);
  };

  const handleSaveEdit = async () => {
    try {
      await updateCateCar(editingId, { name: editingName });
      setEditingId(null);
      setEditingName('');
      fetchCateCars();
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật danh mục:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
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
    if (!window.confirm('Bạn có chắc muốn xoá loại xe này?')) return;
    try {
      await deleteCateCar(id);
      fetchCateCars();
    } catch (error) {
      console.error('❌ Lỗi khi xoá danh mục:', error);
    }
  };

  return (
    <Box p={3} maxWidth={600} mx="auto">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, justifyContent: 'center' }}>
        <DirectionsCarIcon color="primary" sx={{ fontSize: 36 }} />
        <Typography variant="h5" fontWeight="bold" color="primary">
          Quản lý loại xe
        </Typography>
      </Box>
      <Divider sx={{ mb: 3 }} />

      <Paper elevation={3} sx={{ p: 2, mb: 3, borderRadius: 3, boxShadow: 2 }}>
        <Box display="flex" gap={2}>
          <TextField
            label="Tên loại xe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            variant="outlined"
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddCateCar}
            sx={{ px: 4, borderRadius: 2, fontWeight: 600 }}
          >
            Thêm
          </Button>
        </Box>
      </Paper>

      <Paper elevation={4} sx={{ maxHeight: 680, overflowY: 'auto', borderRadius: 3, boxShadow: 3, p: 1 }}>
        <List>
          {cateCars.map((cate) => (
            <ListItem
              key={cate._id}
              divider
              sx={{
                '&:hover': { backgroundColor: '#f5f5f5' },
                cursor: editingId === cate._id ? 'text' : 'default',
                borderRadius: 2,
                mb: 1,
                px: 1,
              }}
              secondaryAction={
                editingId === cate._id ? (
                  <>
                    <Tooltip title="Lưu">
                      <span>
                        <IconButton color="primary" onClick={handleSaveEdit} sx={{ borderRadius: 2 }}>
                          <SaveIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Huỷ">
                      <span>
                        <IconButton onClick={handleCancelEdit} sx={{ borderRadius: 2 }}>
                          <CancelIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </>
                ) : (
                  <>
                    <Tooltip title="Sửa loại xe">
                      <span>
                        <IconButton onClick={() => handleEdit(cate._id, cate.name)} sx={{ borderRadius: 2 }}>
                          <EditIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Xoá loại xe">
                      <span>
                        <IconButton color="error" onClick={() => handleDelete(cate._id)} sx={{ borderRadius: 2 }}>
                          <DeleteIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </>
                )
              }
            >
              {editingId === cate._id ? (
                <TextField
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{ background: '#fffde7', borderRadius: 1 }}
                />
              ) : (
                <ListItemText
                  primary={cate.name}
                  primaryTypographyProps={{ fontSize: 16, fontWeight: 500 }}
                  sx={{ pointerEvents: 'none', ml: 1 }}
                />
              )}
            </ListItem>
          ))}

          {!loading && cateCars.length === 0 && (
            <ListItem>
              <ListItemText primary="🚫 Chưa có loại xe nào" />
            </ListItem>
          )}
        </List>
      </Paper>

      {/* Dialog xác thực xoá */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LockIcon color="error" />
            <Typography variant="h6" fontWeight="bold">Xác thực để xoá</Typography>
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

export default CateCarManager;
