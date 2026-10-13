import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Film, X } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Typography } from '../atoms/Typography';

const BYTES_PER_MEGABYTE = 1024 * 1024;

export interface VideoPickerFieldProps {
  video: { fileName: string; fileSize?: number } | null;
  onAdd: () => void;
  onRemove: () => void;
}

export const VideoPickerField = ({ video, onAdd, onRemove }: VideoPickerFieldProps) => {
  if (!video) {
    return (
      <TouchableOpacity
        style={styles.add}
        onPress={onAdd}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Thêm video"
      >
        <Film size={20} color={THEME_COLORS.TEXT_MUTED} />
        <Typography variant="body2" weight="SEMIBOLD" colorKey="TEXT_MUTED">
          Thêm video (mp4, mov, tối đa 100MB)
        </Typography>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <Film size={20} color={THEME_COLORS.PRIMARY} />
      </View>

      <View style={styles.info}>
        <Typography variant="body2" weight="SEMIBOLD" numberOfLines={1}>
          {video.fileName}
        </Typography>
        {video.fileSize ? (
          <Typography variant="caption" colorKey="TEXT_MUTED">
            {(video.fileSize / BYTES_PER_MEGABYTE).toFixed(1)} MB
          </Typography>
        ) : null}
      </View>

      <TouchableOpacity
        onPress={onRemove}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel="Xoá video"
      >
        <X size={18} color={THEME_COLORS.TEXT_MUTED} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING_TOKENS.SM + 2,
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: OVERLAY_COLORS.FIELD_BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM + 4,
    padding: SPACING_TOKENS.SM + 4,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  icon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  info: { flex: 1, gap: SPACING_TOKENS.XXS },
});
