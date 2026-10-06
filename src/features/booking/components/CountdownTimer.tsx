import { useEffect, useState } from 'react';
import { Clock3 } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { SPACING_TOKENS, THEME_COLORS } from '@theme';
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
    <View style={styles.row}>
      <Clock3 size={15} color={THEME_COLORS.WARNING} />
      <Typography variant="caption" weight="BOLD" colorKey="WARNING">
        {formatRemaining(remainingMs)}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING_TOKENS.XS },
});
