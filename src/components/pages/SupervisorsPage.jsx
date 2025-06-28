import React, { useEffect, useState } from 'react';
import {
  getAllSupervisors,
  deleteSupervisor,
  updateSupervisor,
  createSupervisor,
} from '../apis/index';
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
    <Box p={3} maxWidth={600} mx="auto">
      <Typography
        variant="h5"
        mb={3}
        fontWeight="bold"
        textAlign="center"
        fontSize={24}
      >
        👷‍♂️ Danh sách giám sát
      </Typography>

      <Box
        component="form"
        onSubmit={handleAddSupervisor}
        sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <TextField
          label="Tên giám sát"
          value={newSupervisor.name}
          onChange={(e) =>
            setNewSupervisor({ ...newSupervisor, name: e.target.value })
          }
          required
        />
        <Button type="submit" variant="contained">
          Thêm
        </Button>
      </Box>

      {/* Danh sách có cuộn */}
      <Box
        sx={{
          maxHeight: 400,
          overflowY: 'auto',
          borderRadius: 2,
          border: '1px solid #ddd',
        }}
      >
        <List>
          {supervisors.map((s) => (
            <React.Fragment key={s._id}>
              <ListItem
                secondaryAction={
                  <>
                    <IconButton edge="end" onClick={() => handleEditClick(s)}>
                      <Edit />
                    </IconButton>
                    <IconButton edge="end" onClick={() => handleDelete(s._id)}>
                      <Delete />
                    </IconButton>
                  </>
                }
              >
                {s.name}
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Box>

      {/* Dialog cập nhật */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Cập nhật giám sát</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Tên"
              value={editData.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Huỷ</Button>
          <Button onClick={handleEditSave} variant="contained">
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác thực xoá */}
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
                alert('Sai mật khẩu!');
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

export default SupervisorsPage;
