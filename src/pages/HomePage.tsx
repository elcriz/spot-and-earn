import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { useApp } from '../hooks/useApp';
import { AnimalType, ANIMAL_EMOJIS, ANIMAL_LABELS, ANIMAL_VALUES } from '../models/types';

export default function HomePage() {
  const { children, addSighting, undoLastSighting, toggleChildActive, lastSightingIds, loading } = useApp();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const activeChildren = children.filter(c => c.active);
  const hasActiveChildren = activeChildren.length > 0;

  const handleAnimalClick = async (animal: AnimalType) => {
    if (!hasActiveChildren) return;

    const sightings = await addSighting(animal);

    if (sightings.length > 0) {
      const totalAdded = sightings.reduce((sum, s) => sum + s.value, 0);
      const childNames = sightings.map(s => s.childNamesSnapshot[0]).join(', ');
      setSnackbarMessage(`+€${totalAdded.toFixed(2)} (${childNames})`);
      setSnackbarOpen(true);
    }
  };

  const handleUndo = async () => {
    await undoLastSighting();
    setSnackbarOpen(false);
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
        {/* Animal Buttons */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Spot an animal
          </Typography>
          <Stack spacing={2}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled={!hasActiveChildren}
              onClick={() => handleAnimalClick('deer')}
              sx={{
                fontSize: '1.5rem',
                py: 3,
                background: hasActiveChildren
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : undefined,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <span style={{ fontSize: '3rem' }}>{ANIMAL_EMOJIS.deer}</span>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="h5" component="div">
                    {ANIMAL_LABELS.deer}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    +€{ANIMAL_VALUES.deer.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Button>

            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled={!hasActiveChildren}
              onClick={() => handleAnimalClick('hare')}
              sx={{
                fontSize: '1.5rem',
                py: 3,
                background: hasActiveChildren
                  ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                  : undefined,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <span style={{ fontSize: '3rem' }}>{ANIMAL_EMOJIS.hare}</span>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="h5" component="div">
                    {ANIMAL_LABELS.hare}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    +€{ANIMAL_VALUES.hare.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Button>
          </Stack>
        </Paper>

        {/* Kids currently with me */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Kids currently with me
          </Typography>
          {children.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No children added yet. Go to Settings to add children.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {children.map(child => (
                <Chip
                  key={child.id}
                  label={child.name}
                  onClick={() => toggleChildActive(child.id)}
                  color={child.active ? 'primary' : 'default'}
                  variant={child.active ? 'filled' : 'outlined'}
                  sx={{
                    fontSize: '1rem',
                    py: 2.5,
                    px: 1,
                    cursor: 'pointer',
                  }}
                />
              ))}
            </Box>
          )}
        </Paper>

        {!hasActiveChildren && children.length > 0 && (
          <Paper elevation={1} sx={{ p: 2, bgcolor: 'info.lighter' }}>
            <Typography variant="body2" color="info.dark">
              💡 Select at least one child to start tracking sightings
            </Typography>
          </Paper>
        )}
      </Stack>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        action={
          lastSightingIds.length > 0 && (
            <Button color="secondary" size="small" onClick={handleUndo}>
              UNDO
            </Button>
          )
        }
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: 8 }}
      />
    </Container>
  );
}
