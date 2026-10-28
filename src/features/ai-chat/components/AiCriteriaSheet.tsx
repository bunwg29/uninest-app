import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Wallet, X } from 'lucide-react-native';
import { formatVND, parseRawNumberString } from '@core';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { BottomSheet, Button, FilterChip, Input, Typography } from '@ui';
import { UniversityPicker, type University } from '@features/auth';
import { AMENITY_DISPLAY_LIST, ROOM_TYPE_OPTIONS } from '@features/listings';
import type { AiChatCriteria, AiCriteriaDisplay } from '../types';

interface AiCriteriaSheetProps {
  isVisible: boolean;
  criteria: AiChatCriteria;
  display: AiCriteriaDisplay | null;
  onClose: () => void;
  onSubmit: (criteria: AiChatCriteria) => void;
}

interface DraftCriteria {
  minPrice: string;
  maxPrice: string;
  universities: University[];
  amenityIds: number[];
  roomTypes: string[];
  area: { provinceCode?: string; wardCode?: string; label: string } | null;
}

const toDraft = (criteria: AiChatCriteria, display: AiCriteriaDisplay | null): DraftCriteria => ({
  minPrice: criteria.minPrice ? String(criteria.minPrice) : '',
  maxPrice: criteria.maxPrice ? String(criteria.maxPrice) : '',
  universities: display?.university ? [display.university] : [],
  amenityIds: criteria.amenityIds ?? [],
  roomTypes: criteria.roomTypes ?? [],
  area:
    criteria.provinceCode || criteria.wardCode
      ? {
          provinceCode: criteria.provinceCode,
          wardCode: criteria.wardCode,
          label: display?.ward?.name ?? display?.province?.name ?? 'Khu vực đã chọn',
        }
      : null,
});

const toggleValue = <T,>(values: T[], value: T): T[] =>
  values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

const toNumber = (value: string): number | undefined => {
  const raw = parseRawNumberString(value);

  return raw ? Number(raw) : undefined;
};

const FieldLabel = ({ children }: { children: string }) => (
  <Typography variant="body2" weight="SEMIBOLD" colorKey="TEXT_PRIMARY" style={styles.fieldLabel}>
    {children}
  </Typography>
);

export const AiCriteriaSheet = ({
  isVisible,
  criteria,
  display,
  onClose,
  onSubmit,
}: AiCriteriaSheetProps) => {
  const [draft, setDraft] = useState<DraftCriteria>(() => toDraft(criteria, display));

  useEffect(() => {
    if (isVisible) setDraft(toDraft(criteria, display));
  }, [isVisible, criteria, display]);

  const minPrice = toNumber(draft.minPrice);
  const maxPrice = toNumber(draft.maxPrice);
  const priceError =
    minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice
      ? 'Giá tối thiểu không được lớn hơn giá tối đa'
      : undefined;

  const handleSubmit = () => {
    if (priceError) return;

    onSubmit({
      minPrice,
      maxPrice,
      universityCode: draft.universities[0]?.code,
      amenityIds: draft.amenityIds.length > 0 ? draft.amenityIds : undefined,
      roomTypes: draft.roomTypes.length > 0 ? draft.roomTypes : undefined,
      provinceCode: draft.area?.provinceCode,
      wardCode: draft.area?.wardCode,
      minArea: criteria.minArea,
    });
  };

  return (
    <BottomSheet isVisible={isVisible} onClose={onClose} keyboardAvoiding>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Typography variant="h3" weight="BOLD" colorKey="TEXT_PRIMARY">
          Tiêu chí mình hiểu được
        </Typography>

        <Typography variant="label" colorKey="TEXT_MUTED" style={styles.subtitle}>
          Sửa lại nếu mình hiểu sai — kết quả sẽ tìm lại theo đúng ý bạn.
        </Typography>

        <FieldLabel>Ngân sách (VNĐ/tháng)</FieldLabel>

        <View style={styles.priceRow}>
          <Input
            value={formatVND(draft.minPrice)}
            onChangeText={(value) =>
              setDraft((current) => ({ ...current, minPrice: parseRawNumberString(value) }))
            }
            placeholder="Tối thiểu"
            keyboardType="numeric"
            leftIcon={<Wallet size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
            containerStyle={styles.priceInput}
          />

          <Input
            value={formatVND(draft.maxPrice)}
            onChangeText={(value) =>
              setDraft((current) => ({ ...current, maxPrice: parseRawNumberString(value) }))
            }
            placeholder="Tối đa"
            keyboardType="numeric"
            errorMessage={priceError}
            containerStyle={styles.priceInput}
          />
        </View>

        <UniversityPicker
          label="Trường tham chiếu"
          sheetTitle="Chọn trường tham chiếu"
          value={draft.universities}
          maxSelection={1}
          onChange={(universities) => setDraft((current) => ({ ...current, universities }))}
        />

        {draft.area ? (
          <>
            <FieldLabel>Khu vực</FieldLabel>

            <View style={styles.areaChip}>
              <Typography variant="label" weight="SEMIBOLD" color={THEME_COLORS.PRIMARY_DARK}>
                {draft.area.label}
              </Typography>

              <TouchableOpacity
                onPress={() => setDraft((current) => ({ ...current, area: null }))}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityLabel="Bỏ khu vực"
              >
                <X size={14} color={THEME_COLORS.PRIMARY_DARK} />
              </TouchableOpacity>
            </View>
          </>
        ) : null}

        <FieldLabel>Tiện ích bắt buộc</FieldLabel>

        <View style={styles.chips}>
          {AMENITY_DISPLAY_LIST.map((amenity) => (
            <FilterChip
              key={amenity.id}
              label={amenity.name}
              isSelected={draft.amenityIds.includes(amenity.id)}
              onPress={() =>
                setDraft((current) => ({
                  ...current,
                  amenityIds: toggleValue(current.amenityIds, amenity.id),
                }))
              }
            />
          ))}
        </View>

        <FieldLabel>Loại phòng</FieldLabel>

        <View style={styles.chips}>
          {ROOM_TYPE_OPTIONS.map((option) => (
            <FilterChip
              key={option.value}
              label={option.label}
              isSelected={draft.roomTypes.includes(option.value)}
              onPress={() =>
                setDraft((current) => ({
                  ...current,
                  roomTypes: toggleValue(current.roomTypes, option.value),
                }))
              }
            />
          ))}
        </View>

        {draft.roomTypes.length === 0 ? (
          <Typography variant="caption" colorKey="TEXT_PLACEHOLDER" style={styles.helper}>
            Bạn chưa chọn loại phòng nên mình tìm tất cả.
          </Typography>
        ) : null}

        <Button
          title="Tìm lại theo tiêu chí này"
          onPress={handleSubmit}
          disabled={Boolean(priceError)}
          fullWidth
          style={styles.submit}
        />
      </ScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  scroll: {
    maxHeight: 640,
  },
  content: {
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.LG,
  },
  subtitle: {
    marginTop: SPACING_TOKENS.XS,
  },
  fieldLabel: {
    marginTop: SPACING_TOKENS.MD + 4,
    marginBottom: SPACING_TOKENS.SM,
  },
  priceRow: {
    flexDirection: 'row',
    gap: SPACING_TOKENS.SM,
    marginBottom: SPACING_TOKENS.MD,
  },
  priceInput: {
    flex: 1,
  },
  areaChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM,
    height: 34,
    paddingHorizontal: SPACING_TOKENS.MD - 4,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.INFO_BORDER,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING_TOKENS.SM,
  },
  helper: {
    marginTop: SPACING_TOKENS.SM,
  },
  submit: {
    marginTop: SPACING_TOKENS.LG,
  },
});
