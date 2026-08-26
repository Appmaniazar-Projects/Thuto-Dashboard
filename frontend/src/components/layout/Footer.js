// src/components/layout/Footer.js
import React from 'react';
import { Box, Typography, Link, Stack, Divider } from '@mui/material';

const FOOTER_LINKS = [
  { label: 'Terms and Conditions', href: '/terms' },
  { label: 'Privacy Policy', href: '/Thuto%20App%20Privacy%20Policy.pdf', external: true },
  { label: 'PAIA Manual', href: '/PAIA-Manual.pdf', external: true },
];

const Footer = () => {
  return (
    <Box sx={{ mt: 5, pt: 3, pb: 3 }}>
      <Divider sx={{ mb: 2.5 }} />
      <Stack spacing={1} alignItems="center">
        <Typography variant="body2" color="text.secondary">
          {`© ${new Date().getFullYear()} Thuto Educational Management Platform | All rights reserved.`}
        </Typography>
        <Stack
          direction="row"
          spacing={{ xs: 1.5, sm: 3 }}
          divider={<Box component="span" sx={{ color: 'text.disabled' }}>•</Box>}
          flexWrap="wrap"
          justifyContent="center"
        >
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              underline="hover"
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontWeight: 600,
                '&:hover': { color: 'primary.main' },
              }}
            >
              {link.label}
            </Link>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
};

export default Footer;