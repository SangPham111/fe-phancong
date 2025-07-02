import React from 'react';
import { createWorker } from '../apis/index';
import { TextField, Button, Box } from '@mui/material';

const AddWorkerForm = ({ onSuccess, searchName, setSearchName }) => {
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!searchName.trim()) return;
    const data = { name: searchName };
    try {
      setLoading(true);
      await createWorker(data);
      onSuccess && onSuccess();
      setSearchName('');
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
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1.5, sm: 2 },
        flexWrap: 'wrap',
        mt: 2,
        justifyContent: 'center',
        background: '#fff',
        borderRadius: 3,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        p: { xs: 1.5, sm: 2.5 },
        mb: 3,
        alignItems: 'center',
        maxWidth: { xs: '95vw', sm: 500 },
        mx: 'auto',
        position: 'relative',
      }}
    >
      <Box sx={{ width: '100%', position: 'relative' }}>
        <TextField
          label="Tên thợ"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
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
      </Box>
      <Button 
        type="submit" 
        variant="contained" 
        disabled={loading}
        fullWidth
        sx={{
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
        }}
      >
        {loading ? 'Đang thêm...' : 'THÊM THỢ'}
      </Button>
    </Box>
  );
};

export default AddWorkerForm;
