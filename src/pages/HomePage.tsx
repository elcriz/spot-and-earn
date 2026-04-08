import { useState, useRef } from 'react';
import {
  Button,
  Chip,
  Container,
  Paper,
  Snackbar,
  Stack,
  Typography,
  Box,
  useTheme,
} from '@mui/material';
import { useApp } from '../hooks/useApp';
import { AnimalType, ANIMAL_VALUES } from '../models/types';
import AnimalButton from '../components/AnimalButton';
import TapCounter, { TapCounterRef } from '../components/TapCounter';
import Loader from '../components/Loader';

export default function HomePage() {
  const theme = useTheme();
  const { children, addSighting, undoLastSighting, toggleChildActive, lastSightingIds, loading } = useApp();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const tapCounterRef = useRef<TapCounterRef>(null);

  const activeChildren = children.filter(c => c.active);
  const hasActiveChildren = activeChildren.length > 0;

  const handleTapComplete = (total: number, childNames: string[]) => {
    const uniqueNames = [...new Set(childNames)];
    setSnackbarMessage(`+€${total.toFixed(2)} (${uniqueNames.join(', ')})`);
    setSnackbarOpen(true);
  };

  const handleAnimalClick = async (animal: AnimalType) => {
    if (!hasActiveChildren) {
      return;
    }

    // Calculate expected values immediately for instant feedback
    const animalValue = ANIMAL_VALUES[animal];
    const expectedTotal = animalValue * activeChildren.length;
    const expectedChildNames = activeChildren.map(c => c.name);

    // Increment tap counter IMMEDIATELY before async operation
    tapCounterRef.current?.incrementTap(expectedTotal, expectedChildNames);

    // Then proceed with async sighting addition
    await addSighting(animal);
  };

  const handleUndo = async () => {
    await undoLastSighting();
    setSnackbarOpen(false);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Typography variant="h5" align="center">
          Spot &amp; Earn
        </Typography>

        {/* Animal Buttons */}
        <Stack spacing={2}>
          <AnimalButton
            animal="deer"
            disabled={!hasActiveChildren}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            onAnimalClick={handleAnimalClick}
          />
          <AnimalButton
            animal="hare"
            disabled={!hasActiveChildren}
            gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            onAnimalClick={handleAnimalClick}
          />
        </Stack>

        {/* Tap Counter Animation */}
        <TapCounter ref={tapCounterRef} onComplete={handleTapComplete} />

        {/* Kids currently with me */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom align="center">
            Kids currently with me
          </Typography>
          {children.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No children added yet. Go to Settings to add children.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
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
          <Paper elevation={1} sx={{ p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'info.dark' : 'info.light' }}>
            <Typography variant="body2" sx={{ color: (theme) => theme.palette.mode === 'dark' ? 'info.light' : 'info.dark' }}>
              💡 Select at least one child to start tracking sightings
            </Typography>
          </Paper>
        )}

        {/* Background Image */}
        <Box
          component="img"
          src={theme.palette.mode === 'dark' 
            ? '/spot-and-earn/background-image-001-dark.png' 
            : '/spot-and-earn/background-image-001-light.png'
          }
          alt="Nature background"
          sx={{
            width: '100%',
            height: 'auto',
            borderRadius: 2,
            display: 'block',
          }}
        />
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
