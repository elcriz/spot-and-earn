import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const routeToIndex: Record<string, number> = {
    '/': 0,
    '/balances': 1,
    '/history': 2,
    '/settings': 3,
  };

  const indexToRoute = ['/', '/balances', '/history', '/settings'];

  const currentIndex = routeToIndex[location.pathname] ?? 0;

  const handleNavigationChange = (_event: React.SyntheticEvent, newValue: number) => {
    navigate(indexToRoute[newValue]);
  };

  return (
    <Box sx={{ pb: 7 }}>
      {children}

      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        }}
        elevation={3}
      >
        <BottomNavigation
          value={currentIndex}
          onChange={handleNavigationChange}
          showLabels
        >
          <BottomNavigationAction label="Home" icon={<HomeIcon />} />
          <BottomNavigationAction label="Balances" icon={<AccountBalanceWalletIcon />} />
          <BottomNavigationAction label="History" icon={<HistoryIcon />} />
          <BottomNavigationAction label="Settings" icon={<SettingsIcon />} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
