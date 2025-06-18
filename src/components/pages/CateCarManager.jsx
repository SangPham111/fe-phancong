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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

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
      <Typography variant="h5" mb={3} fontWeight="bold" textAlign="center">
        🛠️ Quản lý loại xe
      </Typography>

      <Box display="flex" gap={2} mb={3}>
        <TextField
          label="Tên loại xe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          variant="outlined"
          size="small"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddCateCar}
          sx={{ px: 4 }}
        >
          Thêm
        </Button>
      </Box>

      <Paper elevation={4} sx={{ maxHeight: 400, overflowY: 'auto', borderRadius: 2 }}>
        <List>
          {cateCars.map((cate) => (
            <ListItem
              key={cate._id}
              divider
              sx={{
                '&:hover': { backgroundColor: '#f9f9f9' },
                cursor: editingId === cate._id ? 'text' : 'default',
              }}
              secondaryAction={
                editingId === cate._id ? (
                  <>
                    <IconButton color="primary" onClick={handleSaveEdit}>
                      <SaveIcon />
                    </IconButton>
                    <IconButton onClick={handleCancelEdit}>
                      <CancelIcon />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <IconButton onClick={() => handleEdit(cate._id, cate.name)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(cate._id)}>
                      <DeleteIcon />
                    </IconButton>
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
                />
              ) : (
                <ListItemText
                  primary={cate.name}
                  primaryTypographyProps={{ fontSize: 16, fontWeight: 500 }}
                  sx={{ pointerEvents: 'none' }} // ⛔ không cho click vào
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
    </Box>
  );
};

export default CateCarManager;
