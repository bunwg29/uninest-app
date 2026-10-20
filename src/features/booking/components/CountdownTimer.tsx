import { useEffect, useState } from 'react';
import { Typography } from '@ui';

const TICK_INTERVAL_MS = 30_000;

const getRemainingMs = (expiresAt: string) =>
  Math.max(0, new Date(expiresAt).getTime() - Date.now());

export const formatRemaining = (remainingMs: number) => {
  const minutes = Math.ceil(remainingMs / 60_000);

  if (minutes >= 2 * 24 * 60) return `Còn ${Math.ceil(minutes / (24 * 60))} ngày`;

  if (minutes >= 60) return `Còn ${Math.ceil(minutes / 60)} giờ`;

  return `Còn ${Math.max(minutes, 0)} phút`;
};

export const CountdownTimer = ({
  expiresAt,
  onExpire,
}: {
  expiresAt: string;
  onExpire?: () => void;
}) => {
  const [remainingMs, setRemainingMs] = useState(() => getRemainingMs(expiresAt));

  useEffect(() => {
    setRemainingMs(getRemainingMs(expiresAt));

    const timer = setInterval(() => {
      const next = getRemainingMs(expiresAt);

      setRemainingMs(next);

      if (next <= 0) {
        clearInterval(timer);
        onExpire?.();
      }
    }, TICK_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  return (
    <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
      {formatRemaining(remainingMs)}
    </Typography>
  );
};
