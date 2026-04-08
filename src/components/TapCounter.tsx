import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Box, Typography } from '@mui/material';

interface TapCounterProps {
  onComplete?: (total: number, childNames: string[]) => void;
  timeout?: number;
}

export interface TapCounterRef {
  incrementTap: (amount: number, childNames: string[]) => void;
}

const TapCounter = forwardRef<TapCounterRef, TapCounterProps>(
  ({ onComplete, timeout = 500 }, ref) => {
    const [tapCount, setTapCount] = useState(0);
    const [accumulatedTotal, setAccumulatedTotal] = useState(0);
    const [showTapAnimation, setShowTapAnimation] = useState(false);

    const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const accumulatedChildNamesRef = useRef<string[]>([]);

    // Expose incrementTap method to parent component
    useImperativeHandle(ref, () => ({
      incrementTap: (amount: number, childNames: string[]) => {
        setTapCount((prev) => prev + 1);
        setShowTapAnimation(true);
        setAccumulatedTotal((prev) => prev + amount);
        accumulatedChildNamesRef.current.push(...childNames);
      },
    }));

    // Reset tap count and call onComplete after inactivity
    useEffect(() => {
      if (tapCount > 0) {
        if (tapTimeoutRef.current) {
          clearTimeout(tapTimeoutRef.current);
        }

        tapTimeoutRef.current = setTimeout(() => {
          // Call onComplete with accumulated total and child names
          if (accumulatedTotal > 0 && accumulatedChildNamesRef.current.length > 0) {
            onComplete?.(accumulatedTotal, accumulatedChildNamesRef.current);
          }

          // Reset everything
          setTapCount(0);
          setAccumulatedTotal(0);
          setShowTapAnimation(false);
          accumulatedChildNamesRef.current = [];
        }, timeout);
      }

      return () => {
        if (tapTimeoutRef.current) {
          clearTimeout(tapTimeoutRef.current);
        }
      };
    }, [tapCount, accumulatedTotal, onComplete, timeout]);

    if (!showTapAnimation || tapCount === 0) {
      return null;
    }

    return (
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
    );
  }
);

TapCounter.displayName = 'TapCounter';

export default TapCounter;
