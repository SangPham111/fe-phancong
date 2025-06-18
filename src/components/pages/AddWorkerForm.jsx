import React, { useState } from 'react';
import { createWorker } from '../apis/index';
import { TextField, Button, Box } from '@mui/material';

const AddWorkerForm = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data = { name };

    try {
      setLoading(true);
      await createWorker(data);
      onSuccess && onSuccess();
      setName('');
    } catch (err) {
      console.error('Lỗi khi tạo thợ:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}
    >
      <TextField
        label="Tên thợ"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Button type="submit" variant="contained" disabled={loading}>
        {loading ? 'Đang thêm...' : 'Thêm thợ'}
      </Button>
    </Box>
  );
};

export default AddWorkerForm;
