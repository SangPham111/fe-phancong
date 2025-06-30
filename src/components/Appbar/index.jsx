import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Typography,
  useTheme,
  useMediaQuery,
  GlobalStyles,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';

const AppBarComponent = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const navItems = [
    { label: 'Xe trong ngày', path: '/cars' },
    { label: 'Quản lý xe', path: '/cars/manage' },
    { label: 'Thêm xe', path: '/cars/add' },
    { label: 'Loại xe', path: '/catecars' },
    { label: 'Thợ', path: '/workers/main' },
    { label: 'Địa điểm', path: '/locations' },
    { label: 'Thợ rảnh', path: '/workers/available' },
    { label: 'Giám sát', path: '/supervisors' },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    setOpenDrawer(false);
  };

  return (
    <>
      {/* Keyframes cho hiệu ứng marquee */}
      <GlobalStyles
        styles={{
          '@keyframes marquee': {
            '0%': { transform: 'translateX(100%)' },
            '100%': { transform: 'translateX(-100%)' },
          },
        }}
      />

      {/* AppBar chính */}
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: '#b71c1c',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            position: 'relative',
            minHeight: '64px',
          }}
        >
          {/* Logo bên trái */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              component="img"
              src="https://res.cloudinary.com/drbjrsm0s/image/upload/v1745463450/logo_ulbaie.png"
              alt="Bá Thành Logo"
              sx={{ height: 40, width: 80, cursor: 'pointer' }}
              onClick={() => navigate('/')} // ✅ Điều hướng về trang gốc
            />
          </Box>

          {/* Thông báo giữa thanh navbar (chỉ hiện trên desktop) */}
          {!isMobile && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '80%',
                overflow: 'hidden',
                pointerEvents: 'none',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'nowrap',
                  display: 'inline-block',
                  animation: 'marquee 10s linear infinite',
                  backgroundColor: '#ffeb3b',
                  color: '#000',
                  px: 2,
                  py: 0.5,
                  borderRadius: 1,
                  fontWeight: 500,
                  fontSize: '1.5rem',
                }}
              >
                🚨 <strong>THÔNG BÁO:</strong> Mới cập nhật thêm phần xe trễ hẹn 🚗🛠️
              </Typography>
            </Box>
          )}

          {/* Icon menu (bên phải) */}
          <IconButton
            edge="end"
            color="inherit"
            aria-label="menu"
            onClick={() => setOpenDrawer((prev) => !prev)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Offset chiều cao AppBar */}
      <Toolbar sx={{ minHeight: isMobile ? '85px' : '64px' }} />

      {/* Thông báo tách riêng trên mobile */}
      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            top: '64px',
            left: 0,
            right: 0,
            backgroundColor: '#ffeb3b',
            overflow: 'hidden',
            py: 0.5,
            zIndex: theme.zIndex.drawer + 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              whiteSpace: 'nowrap',
              display: 'inline-block',
              animation: 'marquee 10s linear infinite',
              color: '#000',
              px: 2,
              fontWeight: 500,
              fontSize: '1rem',
            }}
          >
            🚨 <strong>THÔNG BÁO:</strong> Mới cập nhật thêm phần lọc danh sách hiển thị xe trong hôm nay. 🚗🛠️
          </Typography>
        </Box>
      )}

      {/* Drawer Menu */}
      <Drawer
        anchor="right"
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        PaperProps={{
          sx: {
            width: 250,
            height: 'calc(100% - 64px)',
            top: '64px',
          },
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            overflowY: 'auto',
          }}
          role="presentation"
          onClick={() => setOpenDrawer(false)}
          onKeyDown={() => setOpenDrawer(false)}
        >
          <List sx={{ mt: 2 }}>
            {navItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  onClick={() => handleNavigate(item.path)}
                  sx={{ mt: 1 }} // thêm khoảng cách trên
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
        </Box>
      </Drawer>
    </>
  );
};

export default AppBarComponent;