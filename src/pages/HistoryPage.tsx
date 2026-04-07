import { useMemo } from 'react';
import {
  Box,
  Chip,
  CircularProgress,
  Container,
  List,
  ListItem,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useApp } from '../hooks/useApp';
import { ANIMAL_EMOJIS, ANIMAL_LABELS } from '../models/types';

export default function HistoryPage() {
  const { sightings, loading } = useApp();

  // Sort sightings by timestamp, most recent first
  const sortedSightings = useMemo(() => {
    return [...sightings].sort((a, b) => b.timestamp - a.timestamp);
  }, [sightings]);

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
        <Typography variant="h5">Sighting History</Typography>

        {sortedSightings.length === 0 ? (
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No sightings yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start spotting animals to build your history!
            </Typography>
          </Paper>
        ) : (
          <Paper elevation={2}>
            <List>
              {sortedSightings.map((sighting, index) => (
                <ListItem
                  key={sighting.id}
                  sx={{
                    borderBottom: index < sortedSightings.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                    py: 2,
                    flexDirection: 'column',
                    alignItems: 'flex-start',
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
                      <Typography variant="h6" component="span">
                        {ANIMAL_EMOJIS[sighting.animal]}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {ANIMAL_LABELS[sighting.animal]}
                      </Typography>
                    </Box>

                    <Typography
                      variant="h6"
                      color={sighting.paid ? 'text.secondary' : 'primary'}
                      sx={{ fontWeight: 'bold' }}
                    >
                      €{sighting.value.toFixed(2)}
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
                      {sighting.childNamesSnapshot.map((name, idx) => (
                        <Chip
                          key={idx}
                          label={name}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                      {sighting.paid && (
                        <Chip
                          label="Paid"
                          size="small"
                          color="success"
                          variant="filled"
                        />
                      )}
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                      {formatTimestamp(sighting.timestamp)}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {sortedSightings.length > 0 && (
          <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="body2" color="text.secondary" align="center">
              {sortedSightings.length} total sighting{sortedSightings.length !== 1 ? 's' : ''}
            </Typography>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}
