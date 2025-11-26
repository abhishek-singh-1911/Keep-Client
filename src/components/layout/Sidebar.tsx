import { styled } from '@mui/material/styles';
import type { Theme, CSSObject } from '@mui/material/styles';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Drawer as MuiDrawer,
} from '@mui/material';
import {
  LightbulbOutlined as NotesIcon,
  NotificationsNoneOutlined as RemindersIcon,
  EditOutlined as EditIcon,
  ArchiveOutlined as ArchiveIcon,
  DeleteOutline as TrashIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { setSidebarOpen } from '../../store/slices/uiSlice';

const drawerWidth = 280;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
  borderRight: 'none',
  marginTop: 64,
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(9)} + 1px)`,
  borderRight: 'none',
  marginTop: 64,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(9)} + 1px)`,
  },
});

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

const NavItem = styled(ListItemButton)<{ active?: boolean }>(({ active }) => ({
  borderRadius: '0 25px 25px 0',
  marginRight: 12,
  paddingLeft: 24,
  backgroundColor: active ? '#feefc3' : 'transparent',
  '&:hover': {
    backgroundColor: active ? '#feefc3' : '#f1f3f4',
  },
  '& .MuiListItemIcon-root': {
    color: '#202124',
  },
  '& .MuiListItemText-primary': {
    fontWeight: active ? 500 : 400,
    color: '#202124',
  },
}));

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { sidebarOpen } = useAppSelector((state) => state.ui);

  // Close sidebar on mobile when navigating
  const handleNavigation = (path: string) => {
    navigate(path);
    if (window.innerWidth < 600) {
      dispatch(setSidebarOpen(false));
    }
  };

  const menuItems = [
    { text: 'Notes', icon: <NotesIcon />, path: '/dashboard' },
    { text: 'Reminders', icon: <RemindersIcon />, path: '/reminders' },
    { text: 'Edit labels', icon: <EditIcon />, path: '/labels' },
    { text: 'Archive', icon: <ArchiveIcon />, path: '/archive' },
    { text: 'Trash', icon: <TrashIcon />, path: '/trash' },
  ];

  return (
    <Drawer variant="permanent" open={sidebarOpen}>
      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 0.5 }}>
            <NavItem
              active={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: sidebarOpen ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{ opacity: sidebarOpen ? 1 : 0 }}
              />
            </NavItem>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}
