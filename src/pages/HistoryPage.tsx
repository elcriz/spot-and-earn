import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PaymentIcon from '@mui/icons-material/Payment';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useApp } from '../hooks/useApp';
import { ANIMAL_EMOJIS, ANIMAL_LABELS, Sighting, HistoryEntry } from '../models/types';
import { getMapUrl } from '../services/geolocation';

export default function HistoryPage() {
  const { sightings, paymentRecords, deleteSighting, loading } = useApp();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sightingToDelete, setSightingToDelete] = useState<Sighting | null>(null);

  // Merge and sort all history entries by timestamp, most recent first
  const sortedHistory = useMemo(() => {
    const entries: HistoryEntry[] = [
      ...sightings.map(s => ({ type: 'sighting' as const, data: s })),
      ...paymentRecords.map(p => ({ type: 'payment' as const, data: p })),
    ];
    return entries.sort((a, b) => b.data.timestamp - a.data.timestamp);
  }, [sightings, paymentRecords]);

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    // Today
    if (diffInDays === 0) {
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInHours < 24) return `${diffInHours}h ago`;
    }

    // Yesterday
    if (diffInDays === 1) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    }

    // This week
    if (diffInDays < 7) {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    // Default
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDeleteClick = (sighting: Sighting) => {
    setSightingToDelete(sighting);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (sightingToDelete) {
      await deleteSighting(sightingToDelete.id);
      setDeleteDialogOpen(false);
      setSightingToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSightingToDelete(null);
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Typography variant="h5" align="center">History</Typography>

        {sortedHistory.length === 0 ? (
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No history yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start spotting animals to build your history!
            </Typography>
          </Paper>
        ) : (
          <>
            <Paper elevation={1} sx={{ p: 2, bgcolor: 'action.hover' }}>
              <Typography variant="body2" color="text.secondary" align="center">
                {sortedHistory.length} total {sortedHistory.length !== 1 ? 'entries' : 'entry'}
              </Typography>
            </Paper>

            <Paper elevation={2}>
              <List>
                {sortedHistory.map((entry, index) => (
                  <Box key={entry.type === 'sighting' ? entry.data.id : entry.data.id}>
                    {entry.type === 'sighting' ? (
                      // Sighting Entry
                      <ListItem
                        sx={{
                          borderBottom: index < sortedHistory.length - 1 ? '1px solid' : 'none',
                          borderColor: 'divider',
                          py: 2,
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          position: 'relative',
                        }}
                      >
                        <IconButton
                          aria-label="delete"
                          size="small"
                          onClick={() => handleDeleteClick(entry.data)}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            color: 'error.main',
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>

                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            width: '100%',
                            mb: 1,
                            pr: 5,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6" component="span">
                              {ANIMAL_EMOJIS[entry.data.animal]}
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                              {ANIMAL_LABELS[entry.data.animal]}
                            </Typography>
                            {entry.data.location && (
                              <IconButton
                                size="small"
                                href={getMapUrl(entry.data.location.latitude, entry.data.location.longitude)}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="View on map"
                                sx={{ ml: 0.5 }}
                              >
                                <LocationOnIcon fontSize="small" color="primary" />
                              </IconButton>
                            )}
                          </Box>

                          <Typography
                            variant="h6"
                            color={entry.data.paid ? 'text.secondary' : 'primary'}
                            sx={{ fontWeight: 'bold' }}
                          >
                            €{entry.data.value.toFixed(2)}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            width: '100%',
                            alignItems: 'center',
                          }}
                        >
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {entry.data.childNamesSnapshot.map((name, idx) => (
                              <Chip
                                key={idx}
                                label={name}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                            {entry.data.paid && (
                              <Chip
                                label="Paid"
                                size="small"
                                color="success"
                                variant="filled"
                              />
                            )}
                          </Box>

                          <Typography variant="caption" color="text.secondary">
                            {formatTimestamp(entry.data.timestamp)}
                          </Typography>
                        </Box>
                      </ListItem>
                    ) : (
                      // Payment Entry
                      <ListItem
                        sx={{
                          borderBottom: index < sortedHistory.length - 1 ? '1px solid' : 'none',
                          borderColor: 'divider',
                          py: 2,
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          bgcolor: (theme) => theme.palette.mode === 'dark' ? 'success.dark' : 'success.light',
                          backgroundImage: (theme) => theme.palette.mode === 'dark' ? 'none' : undefined,
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            width: '100%',
                            mb: 1,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PaymentIcon color="success" />
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }} color="success.dark">
                              Payment Made
                            </Typography>
                          </Box>

                          <Typography
                            variant="h6"
                            color="success.dark"
                            sx={{ fontWeight: 'bold' }}
                          >
                            €{entry.data.totalAmount.toFixed(2)}
                          </Typography>
                        </Box>

                        <Box sx={{ width: '100%', mb: 1 }}>
                          <Divider sx={{ my: 1 }} />
                          {entry.data.childBalances.map((balance, idx) => (
                            <Box
                              key={idx}
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                py: 0.5,
                              }}
                            >
                              <Typography variant="body2" color="text.secondary">
                                {balance.childName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                                €{balance.amount.toFixed(2)}
                              </Typography>
                            </Box>
                          ))}
                        </Box>

                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            width: '100%',
                            alignItems: 'center',
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {entry.data.sightingIds.length} sighting{entry.data.sightingIds.length !== 1 ? 's' : ''} paid
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTimestamp(entry.data.timestamp)}
                          </Typography>
                        </Box>
                      </ListItem>
                    )}
                  </Box>
                ))}
              </List>
            </Paper>
          </>
        )}
      </Stack>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Sighting?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this sighting? This will adjust the balance and cannot be undone.
            {sightingToDelete && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>{ANIMAL_EMOJIS[sightingToDelete.animal]} {ANIMAL_LABELS[sightingToDelete.animal]}</strong> - €{sightingToDelete.value.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {sightingToDelete.childNamesSnapshot.join(', ')}
                </Typography>
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
