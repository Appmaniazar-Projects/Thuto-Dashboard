import { format } from 'date-fns';

const coerceDate = (value) => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
};

export const formatDisplayDate = (value) => {
  const d = coerceDate(value);
  if (!d) return '';
  return format(d, 'dd/MM/yyyy');
};

export const formatDisplayDateTime = (value) => {
  const d = coerceDate(value);
  if (!d) return '';
  return format(d, 'dd/MM/yyyy, HH:mm');
};
