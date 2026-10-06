import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Info } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Button, Typography } from '@ui';
import { useToast } from '@hooks';
import { useReportForumContent } from '../hooks';
import type { ForumReportEntityType, ForumReportReason } from '../types';
import { FORUM_REPORT_REASON_OPTIONS } from '../types';
import { ForumBottomSheet } from './ForumBottomSheet';

export interface ForumReportTarget {
  entityType: ForumReportEntityType;
  entityId: string;
}

export interface ForumReportSheetProps {
  target: ForumReportTarget | null;
  onClose: () => void;
}

export const ForumReportSheet = ({ target, onClose }: ForumReportSheetProps) => {
  const toast = useToast();
  const reportMutation = useReportForumContent();
  const [reason, setReason] = useState<ForumReportReason>('scam');
  const [note, setNote] = useState('');

  const isPost = target?.entityType === 'forum_post';
  const isOtherReason = reason === 'other';
  const canSubmit = !isOtherReason || note.trim().length > 0;

  useEffect(() => {
    if (target) {
      setReason('scam');
      setNote('');
    }
  }, [target]);

  const handleSubmit = () => {
    if (!target) return;

    reportMutation.mutate(
      { entityType: target.entityType, entityId: target.entityId, reason, note },
      {
        onSuccess: (result) => {
          toast.success(
            result.isHidden
              ? 'Nội dung đã được ẩn và chuyển quản trị viên xem xét.'
              : 'Cảm ơn bạn, báo cáo đã được gửi tới quản trị viên.',
            'Đã gửi báo cáo'
          );
          onClose();
        },
        onError: (error) => {
          toast.error(error.message, 'Không thể gửi báo cáo');
        },
      }
    );
  };

  return (
    <ForumBottomSheet
      isVisible={Boolean(target)}
      onClose={onClose}
      title={isPost ? 'Báo cáo bài viết' : 'Báo cáo bình luận'}
      description="Báo cáo được gửi tới quản trị viên, người đăng không biết ai đã báo cáo."
    >
      <View style={styles.options}>
        {FORUM_REPORT_REASON_OPTIONS.map((option) => {
          const isSelected = option.value === reason;

          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => setReason(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
            >
              <Typography variant="body1" style={styles.optionLabel}>
                {option.label}
              </Typography>

              <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected ? <View style={styles.radioDot} /> : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {isOtherReason ? (
        <TextInput
          style={styles.noteInput}
          value={note}
          onChangeText={setNote}
          placeholder="Mô tả ngắn lý do báo cáo…"
          placeholderTextColor={THEME_COLORS.TEXT_PLACEHOLDER}
          multiline
          maxLength={500}
        />
      ) : null}

      <View style={styles.infoBox}>
        <Info size={16} color={THEME_COLORS.PRIMARY} />
        <Typography variant="caption" colorKey="PRIMARY" style={styles.infoText}>
          Bài bị nhiều người báo cáo sẽ tự động ẩn và chuyển quản trị viên xem xét.
        </Typography>
      </View>

      <Button
        title="Gửi báo cáo"
        variant="danger"
        size="lg"
        fullWidth
        isLoading={reportMutation.isPending}
        disabled={!canSubmit}
        onPress={handleSubmit}
      />
    </ForumBottomSheet>
  );
};

const styles = StyleSheet.create({
  options: {
    marginHorizontal: -SPACING_TOKENS.MD,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingVertical: SPACING_TOKENS.MD,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: THEME_COLORS.DIVIDER,
  },
  optionSelected: {
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  optionLabel: {
    flex: 1,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    borderWidth: 1.5,
    borderColor: THEME_COLORS.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: THEME_COLORS.PRIMARY,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.PRIMARY,
  },
  noteInput: {
    minHeight: 72,
    marginTop: SPACING_TOKENS.MD,
    padding: SPACING_TOKENS.SM + 4,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    color: THEME_COLORS.TEXT_PRIMARY,
    textAlignVertical: 'top',
  },
  infoBox: {
    flexDirection: 'row',
    gap: SPACING_TOKENS.SM,
    marginVertical: SPACING_TOKENS.MD,
    padding: SPACING_TOKENS.SM + 4,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    borderWidth: 1,
    borderColor: '#C7D7FB',
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  infoText: {
    flex: 1,
  },
});
