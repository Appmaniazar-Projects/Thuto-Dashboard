import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Reusable Loading Spinner Component
 * @param {Object} props - Component props
 * @param {number} props.size - Size of the spinner (default: 40)
 * @param {string} props.message - Loading message to display
 * @param {number} props.height - Height of the container (default: 200)
 * @param {boolean} props.fullPage - Whether to take full page height
 * @param {string} props.color - Color of the spinner (default: 'primary')
 */
const LoadingSpinner = ({ 
  size = 40, 
  message = 'Loading...', 
  height = 200, 
  fullPage = false,
  color = 'primary' 
}) => {
  const containerHeight = fullPage ? '100vh' : height;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: containerHeight,
        gap: 2,
        p: 3
      }}
    >
      <CircularProgress size={size} color={color} />
      {message && (
        <Typography variant="body2" color="text.secondary" textAlign="center">
          {message}
        </Typography>
      )}
    </Box>
  );
};

// Named export for destructuring imports
export { LoadingSpinner };

// Default export
export default LoadingSpinner;
