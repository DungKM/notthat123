import dayjs, { type ConfigType } from 'dayjs';

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
});

/**
 * Converts any numeric-like input to a finite number with fallback.
 */
export const toSafeNumber = (value: number | string | null | undefined, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/**
 * Formats a numeric-like input to Vietnamese currency, defaulting to 0 ₫ when invalid.
 */
export const formatCurrency = (value: number | string | null | undefined, fallback = 0): string => {
  return currencyFormatter.format(toSafeNumber(value, fallback));
};

/**
 * Formats datetime values consistently with fallback text when the input is invalid.
 */
export const formatDateTime = (
  value: ConfigType | undefined,
  pattern = 'DD/MM/YYYY HH:mm',
  fallbackText = 'Chưa cập nhật'
): string => {
  if (!value) {
    return fallbackText;
  }
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format(pattern) : fallbackText;
};
