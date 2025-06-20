import React, { useState, useEffect } from 'react';
import {
  getAllLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} from '../apis/index';

import {
  Box,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { Edit, Delete, Save, Close } from '@mui/icons-material';

const LocationManager = () => {
  const [locations, setLocations] = useState([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);

  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await getAllLocations();
      setLocations(res.data);
    } catch (err) {
      console.error('Lỗi khi tải địa điểm:', err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      setLoading(true);
      await createLocation({ name: newName });
      setNewName('');
      fetchLocations();
    } catch (err) {
      console.error('Lỗi khi tạo địa điểm:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id) => {
    try {
      await updateLocation(id, { name: editName });
      setEditId(null);
      setEditName('');
      fetchLocations();
    } catch (err) {
      console.error('Lỗi khi cập nhật địa điểm:', err);
    }
  };

  const isPasswordVerified = () => {
    const verifiedUntil = localStorage.getItem('location_verified_until');
    return verifiedUntil && new Date(verifiedUntil) > new Date();
  };

  const markPasswordVerified = () => {
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 giờ
    localStorage.setItem('location_verified_until', expiry.toISOString());
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
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa điểm này không?')) return;
    try {
      await deleteLocation(id);
      fetchLocations();
    } catch (err) {
      console.error('Lỗi khi xóa địa điểm:', err);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Quản lý địa điểm
      </Typography>

      {/* Form thêm địa điểm */}
      <Box
        component="form"
        onSubmit={handleCreate}
        sx={{ display: 'flex', gap: 2, mb: 3 }}
      >
        <TextField
          label="Tên địa điểm mới"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          fullWidth
        />
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? 'Đang thêm...' : 'Thêm'}
        </Button>
      </Box>

      {/* Danh sách địa điểm */}
      <List>
        {locations.map((loc) => (
          <React.Fragment key={loc._id}>
            <ListItem
              secondaryAction={
                editId === loc._id ? (
                  <>
                    <IconButton onClick={() => handleUpdate(loc._id)}>
                      <Save />
                    </IconButton>
                    <IconButton onClick={() => setEditId(null)}>
                      <Close />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <IconButton
                      onClick={() => {
                        setEditId(loc._id);
                        setEditName(loc.name);
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(loc._id)}>
                      <Delete />
                    </IconButton>
                  </>
                )
              }
            >
              {editId === loc._id ? (
                <TextField
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  fullWidth
                  variant="standard"
                />
              ) : (
                <ListItemText primary={loc.name} />
              )}
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>

      {/* Dialog xác thực mật khẩu xóa */}
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

export default LocationManager;
