import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
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
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: '#b71c1c',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
  <Box
    component="img"
    src="https://res.cloudinary.com/drbjrsm0s/image/upload/v1745463450/logo_ulbaie.png"
    alt="Bá Thành Logo"
    sx={{
      height: 60,
      width: 'auto',
    }}
  />
</Box>


          {isMobile ? (
            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={() => setOpenDrawer((prev) => !prev)}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <Box sx={{ display: 'flex', gap: 2 }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  onClick={() => handleNavigate(item.path)}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Toolbar />

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
          <List>
            {navItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton onClick={() => handleNavigate(item.path)}>
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
