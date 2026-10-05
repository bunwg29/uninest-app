import { useEffect, useState } from 'react';
import { Clock3 } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';

const getRemainingSeconds = (expiresAt: string) =>
  Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000));

export const CountdownTimer = ({
  expiresAt,
  onExpire,
}: {
  expiresAt: string;
  onExpire?: () => void;
}) => {
  const [seconds, setSeconds] = useState(() => getRemainingSeconds(expiresAt));

  useEffect(() => {
    setSeconds(getRemainingSeconds(expiresAt));
    const timer = setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          clearInterval(timer);
          onExpire?.();

          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  const value = [hours, minutes, remainingSeconds]
    .map((part) => String(part).padStart(2, '0'))
    .join(':');

  return (
    <View style={styles.row}>
      <Clock3 size={15} color={THEME_COLORS.WARNING} />
      <Typography variant="caption" weight="BOLD" colorKey="WARNING">
        Còn {value}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING_TOKENS.XS },
});
