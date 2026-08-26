// src/components/legal/TermsAndConditions.js
import React from 'react';
import { Box, Container, Typography, Divider, Link as MuiLink } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { APP_TEXT } from '../../utils/appText';

const Section = ({ title, children }) => (
  <Box sx={{ mb: 4 }}>
    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
      {title}
    </Typography>
    <Typography variant="body1" color="text.secondary" component="div" sx={{ lineHeight: 1.7 }}>
      {children}
    </Typography>
  </Box>
);

const TermsAndConditions = () => {
  const siteName = APP_TEXT.SITE_NAME;
  const lastUpdated = 'August 2026';
  const navigate = useNavigate();

  // Go back to whatever page the person was actually on. If this page was
  // opened directly (e.g. a bookmarked/shared link with no real in-app
  // history), navigate(-1) has nothing to go back to, so fall back to the
  // landing page instead of leaving the person stuck.
  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, sm: 6 } }}>
      <MuiLink
        component="button"
        onClick={handleBack}
        underline="hover"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          mb: 3,
          color: 'text.secondary',
          fontWeight: 600,
          fontSize: 14,
          '&:hover': { color: 'primary.main' },
        }}
      >
        <ArrowBackIcon sx={{ fontSize: 18 }} />
        Back
      </MuiLink>

      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
        Terms and Conditions
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Last updated: {lastUpdated}
      </Typography>
      <Divider sx={{ mb: 4 }} />

      <Section title="1. Acceptance of These Terms">
        By accessing or using {siteName} ("the Platform"), whether as a super
        admin, admin, teacher, parent/guardian, or student, you agree to be
        bound by these Terms and Conditions. If you do not agree to these
        terms, please do not use the Platform. If you are accepting these
        terms on behalf of a school or organisation, you confirm that you
        have the authority to do so.
      </Section>

      <Section title="2. Description of the Platform">
        {siteName} is a school management platform that helps schools manage
        users, attendance, academic reports, events, and related
        administrative functions. Features and access differ depending on
        your role on the Platform (super admin, regional admin, admin,
        teacher, or parent).
      </Section>

      <Section title="3. Accounts and Eligibility">
        <Box component="ul" sx={{ pl: 3, m: 0 }}>
          <li>
            Admin, teacher, and parent accounts are created either directly
            by a school administrator or through self-registration that
            requires administrator approval before the account is activated.
          </li>
          <li>
            You are responsible for keeping your login credentials
            confidential and for all activity that occurs under your account.
          </li>
          <li>
            You must provide accurate and current information when using the
            Platform, including when adding or updating student, parent, or
            staff records.
          </li>
          <li>
            Student accounts are managed on behalf of the student by the
            school and the student's parent or guardian.
          </li>
        </Box>
      </Section>

      <Section title="4. Acceptable Use">
        You agree to use the Platform only for its intended purpose of
        supporting school administration and communication. You may not:
        <Box component="ul" sx={{ pl: 3, m: 0, mt: 1 }}>
          <li>Use the Platform to submit false, misleading, or harmful information;</li>
          <li>Attempt to access accounts, records, or data that do not belong to you or that you are not authorised to view;</li>
          <li>Interfere with or disrupt the operation of the Platform;</li>
          <li>Use the Platform in a way that violates any applicable law.</li>
        </Box>
      </Section>

      <Section title="5. Personal Information and Children's Data">
        The Platform processes personal information, including information
        relating to children, in order to provide school management
        services. This is handled in accordance with our Privacy Policy and
        the Protection of Personal Information Act (POPIA). Where personal
        information about a student is submitted to the Platform, it is done
        so with the involvement and consent of a parent or guardian, or by
        the school acting within its lawful basis for processing such
        information.
      </Section>

      <Section title="6. Availability of the Platform">
        We aim to keep the Platform available and functioning correctly, but
        we do not guarantee uninterrupted or error-free operation. The
        Platform may be unavailable from time to time for maintenance,
        updates, or reasons outside our control. If you encounter a problem,
        please report it using the bug reporting feature available within the
        Platform.
      </Section>

      <Section title="7. Intellectual Property">
        All content, branding, and software associated with {siteName},
        other than content you submit yourself (such as student records or
        school information), remains the property of its respective owners.
        You may not copy, modify, or distribute any part of the Platform
        without prior written permission.
      </Section>

      <Section title="8. Limitation of Liability">
        The Platform is provided on an "as is" and "as available" basis. To
        the fullest extent permitted by law, we are not liable for any
        indirect, incidental, or consequential loss or damage arising from
        your use of, or inability to use, the Platform.
      </Section>

      <Section title="9. Changes to These Terms">
        We may update these Terms and Conditions from time to time. Where
        changes are material, we will take reasonable steps to notify users.
        Continued use of the Platform after changes take effect constitutes
        acceptance of the updated terms.
      </Section>

      <Section title="10. Governing Law">
        These Terms and Conditions are governed by the laws of the Republic
        of South Africa.
      </Section>

      <Section title="11. Contact Us">
        If you have questions about these Terms and Conditions, please
        contact your school administrator, or reach out to the {siteName}{' '}
        team directly.
      </Section>

      <Divider sx={{ my: 4 }} />
      <Typography variant="body2" color="text.secondary">
        For questions about how your personal information is handled, please
        contact your school administrator.
      </Typography>
    </Container>
  );
};

export default TermsAndConditions;