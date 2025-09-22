import React from 'react';
import { Box, Alert, Button, Typography } from '@mui/material';
import { Refresh as RefreshIcon, Error as ErrorIcon } from '@mui/icons-material';

/**
 * Reusable Error Display Component
 * @param {Object} props - Component props
 * @param {string} props.message - Error message to display
 * @param {Function} props.onRetry - Function to call when retry button is clicked
 * @param {string} props.severity - Alert severity (default: 'error')
 * @param {boolean} props.showRetry - Whether to show retry button (default: true)
 * @param {string} props.retryText - Text for retry button (default: 'Retry')
 * @param {boolean} props.fullWidth - Whether to take full width (default: true)
 */
const ErrorDisplay = ({ 
  message = 'An error occurred', 
  onRetry,
  severity = 'error',
  showRetry = true,
  retryText = 'Retry',
  fullWidth = true
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        gap: 2,
        width: fullWidth ? '100%' : 'auto'
      }}
    >
      <Alert 
        severity={severity} 
        icon={<ErrorIcon />}
        sx={{ 
          width: fullWidth ? '100%' : 'auto',
          maxWidth: 600
        }}
      >
        <Typography variant="body2">
          {message}
        </Typography>
      </Alert>
      
      {showRetry && onRetry && (
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
          color={severity === 'error' ? 'error' : 'primary'}
        >
          {retryText}
        </Button>
      )}
    </Box>
  );
};

// Named export for destructuring imports
export { ErrorDisplay };

// Default export
export default ErrorDisplay;
