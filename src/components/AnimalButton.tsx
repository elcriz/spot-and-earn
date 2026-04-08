import { useState } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { AnimalType, ANIMAL_EMOJIS, ANIMAL_LABELS, ANIMAL_VALUES } from '../models/types';

interface AnimalButtonProps {
  animal: AnimalType;
  disabled: boolean;
  gradient: string;
  onAnimalClick: (animal: AnimalType) => Promise<void>;
}

export default function AnimalButton({ animal, disabled, gradient, onAnimalClick }: AnimalButtonProps) {
  const [pendingClicks, setPendingClicks] = useState(0);

  const handleClick = async () => {
    if (disabled) return;

    setPendingClicks(prev => prev + 1);
    try {
      await onAnimalClick(animal);
    } finally {
      setTimeout(() => {
        setPendingClicks(prev => Math.max(0, prev - 1));
      }, 150);
    }
  };

  const isLoading = pendingClicks > 0;

  return (
    <Button
      variant="contained"
      size="large"
      fullWidth
      disabled={disabled}
      onClick={handleClick}
      sx={{
        fontSize: '1.5rem',
        py: 3,
        justifyContent: 'flex-start',
        background: !disabled && !isLoading ? gradient : undefined,
        position: 'relative',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 2 }}>
        <span style={{ fontSize: '3rem', opacity: isLoading ? 0.5 : 1 }}>{ANIMAL_EMOJIS[animal]}</span>
        <Box sx={{ textAlign: 'left', opacity: isLoading ? 0.5 : 1 }}>
          <Typography variant="h5" component="div">
            {ANIMAL_LABELS[animal]}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            +€{ANIMAL_VALUES[animal].toFixed(2)}
          </Typography>
        </Box>
      </Box>
      {isLoading && (
        <CircularProgress
          size={24}
          sx={{
            position: 'absolute',
            right: 16,
            color: 'white',
          }}
        />
      )}
    </Button>
  );
}
