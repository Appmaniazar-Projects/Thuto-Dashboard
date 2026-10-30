// src/components/notifications/NotificationItem.js
//
// One notification row. Used by both the top-bar dropdown (variant="dark")
// and the full Notifications page (variant="light").
//   - Unread: bold subject, accent dot and tinted background (Card 1 / Card 3)
//   - "Mark as read" tick (only while unread) and trash "expire" action (Card 1 / Card 4)
//   - Clicking an unread row also marks it as read

import React from 'react';
import { Box, CircularProgress, IconButton, Tooltip, Typography } from '@mui/material';
import { DeleteOutline as DeleteOutlineIcon, DoneAll as DoneAllIcon } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { formatDisplayDateTime } from '../../utils/date';

const PALETTE = {
  dark: {
    text: '#f9fafb',
    muted: '#9ca3af',
    border: '#374151',
    unreadBg: 'rgba(59, 130, 246, 0.12)',
    hoverBg: 'rgba(255, 255, 255, 0.06)',
    dot: '#60a5fa',
    icon: '#d1d5db',
  },
  light: {
    text: 'text.primary',
    muted: 'text.secondary',
    border: 'divider',
    unreadBg: 'rgba(25, 118, 210, 0.06)',
    hoverBg: 'action.hover',
    dot: 'primary.main',
    icon: 'text.secondary',
  },
};

const relativeTime = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return formatDistanceToNow(d, { addSuffix: true });
};

const NotificationItem = ({ notification, pending = false, onMarkRead, onExpire, variant = 'light', clampContent = false }) => {
  const c = PALETTE[variant] || PALETTE.light;
  const { id, subject, content, read, createdAt } = notification;

  const handleRowClick = () => {
    if (!read && !pending) onMarkRead?.(id);
  };

  const stop = (handler) => (event) => {
    event.stopPropagation();
    handler?.(id);
  };

  return (
    <Box
      component="li"
      role="listitem"
      aria-label={`${read ? 'Read' : 'Unread'} notification: ${subject}`}
      onClick={handleRowClick}
      sx={{
        listStyle: 'none',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        px: 2,
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: c.border,
        bgcolor: read ? 'transparent' : c.unreadBg,
        cursor: read ? 'default' : 'pointer',
        opacity: pending ? 0.6 : 1,
        transition: 'background-color 0.15s ease, opacity 0.15s ease',
        '&:hover': { bgcolor: read ? c.hoverBg : c.unreadBg },
        '&:last-of-type': { borderBottom: 'none' },
      }}
    >
      {/* Unread indicator (kept as a fixed-width slot so read and unread rows align) */}
      <Box sx={{ width: 8, pt: '7px', flexShrink: 0 }}>
        {!read && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c.dot }} />}
      </Box>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{ color: c.text, fontWeight: read ? 400 : 700, lineHeight: 1.4, wordBreak: 'break-word' }}
        >
          {subject}
        </Typography>

        {content && (
          <Typography
            variant="body2"
            sx={{
              color: c.muted,
              fontWeight: read ? 400 : 500,
              mt: 0.25,
              whiteSpace: 'pre-line',
              wordBreak: 'break-word',
              ...(clampContent && {
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }),
            }}
          >
            {content}
          </Typography>
        )}

        {createdAt && (
          <Tooltip title={formatDisplayDateTime(createdAt)} placement="bottom-start">
            <Typography variant="caption" component="time" dateTime={createdAt} sx={{ color: c.muted, mt: 0.5, display: 'inline-block' }}>
              {relativeTime(createdAt)}
            </Typography>
          </Tooltip>
        )}
      </Box>

      {/* Actions are always visible (not hover-only) so they work on touch screens */}
      <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, mt: -0.5, mr: -1 }}>
        {pending ? (
          <Box sx={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress size={18} sx={{ color: c.icon }} />
          </Box>
        ) : (
          <>
            {!read && (
              <Tooltip title="Mark as read">
                <IconButton size="small" aria-label={`Mark "${subject}" as read`} onClick={stop(onMarkRead)} sx={{ color: c.icon }}>
                  <DoneAllIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Remove notification">
              <IconButton
                size="small"
                aria-label={`Remove "${subject}"`}
                onClick={stop(onExpire)}
                sx={{ color: c.icon, '&:hover': { color: 'error.main' } }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>
    </Box>
  );
};

export default NotificationItem;
