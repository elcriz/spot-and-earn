import {
  Box,
  Button,
  Container,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useApp } from '../hooks/useApp';
import { useBalances } from '../hooks/useBalances';

export default function BalancesPage() {
  const { markAllAsPaid } = useApp();
  const { balances, totalOwed } = useBalances();

  const hasUnpaidBalances = totalOwed > 0;

  const handleMarkAllPaid = async () => {
    if (window.confirm('Mark all balances as paid? This cannot be undone.')) {
      await markAllAsPaid();
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Current Balances
          </Typography>

          {balances.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No children added yet. Go to Settings to add children.
            </Typography>
          ) : (
            <>
              <List>
                {balances.map(({ child, balance }) => (
                  <ListItem
                    key={child.id}
                    disableGutters
                    sx={{
                      py: 2,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    <ListItemText
                      primary={child.name}
                      primaryTypographyProps={{
                        variant: 'h6',
                      }}
                    />
                    <Typography
                      variant="h6"
                      color={balance > 0 ? 'primary' : 'text.secondary'}
                      sx={{ fontWeight: 'bold' }}
                    >
                      €{balance.toFixed(2)}
                    </Typography>
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Total Owed
                </Typography>
                <Typography
                  variant="h4"
                  color="primary"
                  sx={{ fontWeight: 'bold' }}
                >
                  €{totalOwed.toFixed(2)}
                </Typography>
              </Box>
            </>
          )}
        </Paper>

        {hasUnpaidBalances && (
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleMarkAllPaid}
            sx={{
              py: 2,
              fontSize: '1.1rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            Mark All as Paid
          </Button>
        )}

        {!hasUnpaidBalances && balances.length > 0 && (
          <Paper elevation={1} sx={{ p: 3, bgcolor: 'success.lighter', textAlign: 'center' }}>
            <Typography variant="h6" color="success.dark">
              🎉 All paid up!
            </Typography>
            <Typography variant="body2" color="success.dark" sx={{ mt: 1 }}>
              No outstanding balances
            </Typography>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}
