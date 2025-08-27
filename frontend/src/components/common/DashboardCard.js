import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';

const DashboardCard = ({ title, icon, link, linkText = 'View Details', children }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3 }}>
      <CardHeader
        avatar={icon}
        title={<Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>{title}</Typography>}
        sx={{
          backgroundColor: 'grey.200',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      />
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        {children}
      </CardContent>
      {link && (
        <CardActions sx={{ p: 0, mt: 'auto', backgroundColor: 'grey.100' }}>
          <Button
            fullWidth
            component={Link}
            to={link}
            endIcon={<ArrowForwardIcon />}
            sx={{
              justifyContent: 'space-between',
              px: 2,
              py: 1,
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
              },
            }}
          >
            {linkText}
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export default DashboardCard;
