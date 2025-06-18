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

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xoá thợ này?')) {
      try {
        await deleteWorker(id);
        fetchWorkers();
      } catch (error) {
        console.error('Lỗi khi xoá thợ:', error);
      }
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
    <div style={{ padding: 20 }}>
      <Typography variant="h5" gutterBottom>
        Danh sách thợ
      </Typography>

      <AddWorkerForm onSuccess={fetchWorkers} />

      <List>
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
            >
              {w.name} {w.phone ? `- ${w.phone}` : ''}
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Cập nhật thợ</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Tên thợ"
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

export default WorkersPage;
