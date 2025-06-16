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

  const handleDelete = async (id) => {
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
    <div style={{ padding: 20 }}>
      <Typography variant="h5" gutterBottom>
        Danh sách giám sát
      </Typography>

      <Box
        component="form"
        onSubmit={handleAddSupervisor}
        sx={{ display: 'flex', gap: 2, mb: 2 }}
      >
        <TextField
          label="Tên giám sát"
          value={newSupervisor.name}
          onChange={(e) => setNewSupervisor({ ...newSupervisor, name: e.target.value })}
          required
        />
        <Button type="submit" variant="contained">
          Thêm
        </Button>
      </Box>

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
    </div>
  );
};

export default SupervisorsPage;
