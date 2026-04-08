import { useState, useRef, useEffect } from 'react';
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
import { AnimalType } from '../models/types';
import AnimalButton from '../components/AnimalButton';

export default function HomePage() {
  const { children, addSighting, undoLastSighting, toggleChildActive, lastSightingIds, loading } = useApp();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [tapCount, setTapCount] = useState(0);
  const [accumulatedTotal, setAccumulatedTotal] = useState(0);
  const [showTapAnimation, setShowTapAnimation] = useState(false);

  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accumulatedChildNamesRef = useRef<string[]>([]);

  const activeChildren = children.filter(c => c.active);
  const hasActiveChildren = activeChildren.length > 0;

  // Reset tap count and show snackbar after inactivity
  useEffect(() => {
    if (tapCount > 0) {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }

      tapTimeoutRef.current = setTimeout(() => {
        // Show final snackbar with accumulated total
        if (accumulatedTotal > 0 && accumulatedChildNamesRef.current.length > 0) {
          const uniqueNames = [...new Set(accumulatedChildNamesRef.current)];
          setSnackbarMessage(`+€${accumulatedTotal.toFixed(2)} (${uniqueNames.join(', ')})`);
          setSnackbarOpen(true);
        }

        // Reset everything
        setTapCount(0);
        setAccumulatedTotal(0);
        setShowTapAnimation(false);
        accumulatedChildNamesRef.current = [];
      }, 500);
    }

    return () => {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
    };
  }, [tapCount, accumulatedTotal]);

  const handleAnimalClick = async (animal: AnimalType) => {
    if (!hasActiveChildren) return;

    // Increment tap count immediately for visual feedback
    setTapCount(prev => prev + 1);
    setShowTapAnimation(true);

    const sightings = await addSighting(animal);

    if (sightings.length > 0) {
      const totalAdded = sightings.reduce((sum, s) => sum + s.value, 0);
      const childNames = sightings.map(s => s.childNamesSnapshot[0]);

      // Accumulate values
      setAccumulatedTotal(prev => prev + totalAdded);
      accumulatedChildNamesRef.current.push(...childNames);
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
        {showTapAnimation && tapCount > 0 && (
          <Box
            key={tapCount}
            sx={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 9999,
              pointerEvents: 'none',
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: '8rem',
                fontWeight: 'bold',
                color: (theme) => theme.palette.primary.main,
                textShadow: '0 0 20px rgba(0,0,0,0.3)',
                animation: 'tapPulse 0.3s ease-out',
                '@keyframes tapPulse': {
                  '0%': {
                    transform: 'scale(0.5)',
                    opacity: 0,
                  },
                  '50%': {
                    transform: 'scale(1.2)',
                    opacity: 1,
                  },
                  '100%': {
                    transform: 'scale(1)',
                    opacity: 0.9,
                  },
                },
              }}
            >
              {tapCount}
            </Typography>
          </Box>
        )}

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
