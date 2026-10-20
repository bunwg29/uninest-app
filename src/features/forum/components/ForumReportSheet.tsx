import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Info } from 'lucide-react-native';
import {
  BORDER_RADIUS_TOKENS,
  OVERLAY_COLORS,
  SPACING_TOKENS,
  THEME_COLORS,
  TYPOGRAPHY_TOKENS,
} from '@theme';
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
        {FORUM_REPORT_REASON_OPTIONS.map((option, index) => {
          const isSelected = option.value === reason;

          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                index < FORUM_REPORT_REASON_OPTIONS.length - 1 && styles.optionDivider,
                isSelected && styles.optionSelected,
              ]}
              onPress={() => setReason(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
            >
              <Typography
                variant="body1"
                weight={isSelected ? 'SEMIBOLD' : 'REGULAR'}
                style={styles.optionLabel}
              >
                {option.label}
              </Typography>

              <View style={[styles.radio, isSelected && styles.radioSelected]} />
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
        <Info size={18} color={THEME_COLORS.PRIMARY_DARK} />
        <Typography variant="body2" colorKey="PRIMARY_DARK" style={styles.infoText}>
          Bài bị nhiều người báo cáo sẽ tự động ẩn và chuyển quản trị viên xem xét.
        </Typography>
      </View>

      <Button
        title="Gửi báo cáo"
        variant="danger"
        size="lg"
        style={styles.submitButton}
        textStyle={styles.submitText}
        isLoading={reportMutation.isPending}
        disabled={!canSubmit}
        onPress={handleSubmit}
      />
    </ForumBottomSheet>
  );
};

const styles = StyleSheet.create({
  options: {},
  option: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING_TOKENS.MD + 4,
  },
  optionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.DIVIDER,
  },
  optionSelected: {
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  optionLabel: {
    flex: 1,
    fontSize: TYPOGRAPHY_TOKENS.FONT_SIZES.BASE,
    lineHeight: TYPOGRAPHY_TOKENS.LINE_HEIGHTS.BASE,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.FIELD_BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  radioSelected: {
    borderWidth: 6,
    borderColor: THEME_COLORS.PRIMARY,
  },
  noteInput: {
    minHeight: 72,
    marginHorizontal: SPACING_TOKENS.MD,
    marginTop: SPACING_TOKENS.MD,
    padding: SPACING_TOKENS.SM + 4,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.FIELD_BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    color: THEME_COLORS.TEXT_PRIMARY,
    textAlignVertical: 'top',
  },
  infoBox: {
    flexDirection: 'row',
    gap: SPACING_TOKENS.SM + 2,
    marginHorizontal: SPACING_TOKENS.MD,
    marginVertical: SPACING_TOKENS.MD,
    paddingTop: 11,
    paddingBottom: 13,
    paddingHorizontal: 13,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.INFO_BORDER,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY_TOKENS.FONT_SIZES.SUB,
  },
  submitButton: {
    alignSelf: 'stretch',
    marginHorizontal: SPACING_TOKENS.MD,
  },
  submitText: {
    fontSize: TYPOGRAPHY_TOKENS.FONT_SIZES.BASE,
    lineHeight: TYPOGRAPHY_TOKENS.LINE_HEIGHTS.BASE,
  },
});
