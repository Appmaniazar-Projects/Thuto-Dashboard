import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useSnackbar } from 'notistack';

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    enqueueSnackbar('Create events from the Events page.', { variant: 'info' });
    navigate('/events?create=1', { replace: true });
  }, [enqueueSnackbar, navigate]);

  return <Box sx={{ height: 1 }} />;
};

export default CreateEventPage;
