export const formatVnd = (amount: number): string => `${amount.toLocaleString('vi-VN')}đ`;

export const formatShortDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

export const formatFullDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

export const formatPercent = (ratio: number): string =>
  `${(ratio * 100).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`;

export const formatCountdown = (milliseconds: number): string => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};
