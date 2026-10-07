import { useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS, OVERLAY_COLORS } from '@theme';
import {
  Button,
  Input,
  Typography,
  ScreenContainer,
  FilterChip,
  KeyboardAvoidingContainer,
  KeyboardAwareScrollView,
} from '@ui';
import { formatNumberWithDots, parseRawNumberString } from '@core';
import type { ListingPostStackParamList } from '@navigation';
import { useListingPostStore } from '../store/listingPostStore';
import { basicInfoSchema, type BasicInfoFormValues } from '../validations/listingValidation';
import { ROOM_TYPE_OPTIONS } from '../types/constants';
import { WizardHeader } from '../components/landlord/WizardHeader';
import { INITIAL_STEP1 } from '../store/listingPostStore';

type NavigationProp = NativeStackNavigationProp<ListingPostStackParamList>;
type ScreenRouteProp = RouteProp<ListingPostStackParamList, 'ListingPostBasicInfo'>;

const TITLE_MAX_LENGTH = 150;
const OCCUPANT_OPTIONS = [1, 2, 3, 4] as const;
const MAX_OCCUPANT_CHIP = 4;

export const BasicInfoScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { step1, setStep1, editingListingId, initEdit, initCreate } = useListingPostStore();
  const isEditing = Boolean(editingListingId);

  const {
    control,
    handleSubmit,
    reset: resetForm,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      title: step1.title,
      roomType: step1.roomType,
      price: step1.price,
      area: step1.area,
      maxOccupants: step1.maxOccupants,
      description: step1.description,
      electricPrice: step1.electricPrice,
      waterPrice: step1.waterPrice,
      deposit: step1.deposit,
    },
  });

  useEffect(() => {
    const listing = route.params?.listing;

    if (listing) {
      initEdit(listing);
      resetForm({
        title: listing.title || '',
        roomType: listing.roomType || '',
        price: listing.price ? String(listing.price) : '',
        area: listing.area ? String(listing.area) : '',
        maxOccupants: listing.maxOccupants ? String(listing.maxOccupants) : '',
        description: listing.description || '',
        electricPrice: listing.electricPrice ? String(listing.electricPrice) : '',
        waterPrice: listing.waterPrice ? String(listing.waterPrice) : '',
        deposit: listing.deposit ? String(listing.deposit) : '',
      });
    } else if (!editingListingId) {
      resetForm(INITIAL_STEP1);
    }
  }, [route.params?.listing, editingListingId, initEdit, resetForm]);

  const selectedRoomType = watch('roomType');
  const title = watch('title');
  const maxOccupants = watch('maxOccupants');
  const occupantCount = Number(maxOccupants) || 0;

  const onSubmit = useCallback(
    (values: BasicInfoFormValues) => {
      setStep1(values);
      navigation.navigate('ListingPostImages');
    },
    [setStep1, navigation]
  );

  const renderSuffix = (suffix: string) => (
    <Typography variant="body2" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
      {suffix}
    </Typography>
  );

  return (
    <ScreenContainer applyTopInset applyBottomInset keyboardAvoiding={false}>
      <WizardHeader
        step={1}
        isEditing={isEditing}
        onBack={() => {
          initCreate();
          navigation.goBack();
        }}
      />

      <KeyboardAvoidingContainer style={styles.flex}>
        <KeyboardAwareScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Tiêu đề tin đăng"
                placeholder="VD: Phòng trọ gần Đại học Bách Khoa, có gác lửng"
                value={value}
                onChangeText={onChange}
                errorMessage={errors.title?.message}
                returnKeyType="next"
                maxLength={TITLE_MAX_LENGTH}
                multiline
                idleBorderColor={OVERLAY_COLORS.FIELD_BORDER}
                containerStyle={styles.field}
                inputContainerStyle={styles.titleInput}
              />
            )}
          />
          <View style={styles.titleHint}>
            <Typography variant="caption" colorKey="TEXT_PLACEHOLDER">
              Ghi rõ điểm mạnh và trường gần nhất
            </Typography>
            <Typography variant="caption" colorKey="TEXT_PLACEHOLDER">
              {title.length} / {TITLE_MAX_LENGTH}
            </Typography>
          </View>

          <View style={styles.fieldWrapper}>
            <Typography
              variant="label"
              weight="SEMIBOLD"
              colorKey="TEXT_PRIMARY"
              style={styles.label}
            >
              Loại phòng
            </Typography>

            <View style={styles.chipRow}>
              {ROOM_TYPE_OPTIONS.map((option) => (
                <FilterChip
                  key={option.value}
                  label={option.label}
                  isSelected={selectedRoomType === option.value}
                  onPress={() => setValue('roomType', option.value, { shouldValidate: true })}
                  style={styles.roomChip}
                />
              ))}
            </View>

            {errors.roomType ? (
              <Typography variant="caption" colorKey="ERROR" style={styles.errorText}>
                {errors.roomType.message}
              </Typography>
            ) : null}
          </View>

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Controller
                control={control}
                name="price"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Giá thuê"
                    placeholder="2.500.000"
                    value={formatNumberWithDots(value)}
                    onChangeText={(text) => onChange(parseRawNumberString(text))}
                    keyboardType="numeric"
                    errorMessage={errors.price?.message}
                    rightIcon={renderSuffix('đ')}
                    idleBorderColor={OVERLAY_COLORS.FIELD_BORDER}
                    containerStyle={styles.field}
                    inputContainerStyle={styles.fieldInput}
                  />
                )}
              />
            </View>

            <View style={styles.halfField}>
              <Controller
                control={control}
                name="area"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Diện tích"
                    placeholder="22"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="numeric"
                    errorMessage={errors.area?.message}
                    rightIcon={renderSuffix('m²')}
                    idleBorderColor={OVERLAY_COLORS.FIELD_BORDER}
                    containerStyle={styles.field}
                    inputContainerStyle={styles.fieldInput}
                  />
                )}
              />
            </View>
          </View>

          <View style={styles.fieldWrapper}>
            <Typography
              variant="label"
              weight="SEMIBOLD"
              colorKey="TEXT_PRIMARY"
              style={styles.label}
            >
              Số người ở tối đa
            </Typography>

            <View style={styles.chipRow}>
              {OCCUPANT_OPTIONS.map((count) => {
                const isLast = count === MAX_OCCUPANT_CHIP;
                const isSelected = isLast ? occupantCount >= count : occupantCount === count;

                return (
                  <FilterChip
                    key={count}
                    label={isLast ? `${count}+` : String(count)}
                    isSelected={isSelected}
                    onPress={() =>
                      setValue('maxOccupants', String(count), { shouldValidate: true })
                    }
                    style={styles.occupantChip}
                  />
                );
              })}
            </View>

            {errors.maxOccupants ? (
              <Typography variant="caption" colorKey="ERROR" style={styles.errorText}>
                {errors.maxOccupants.message}
              </Typography>
            ) : null}
          </View>

          <Typography variant="body1" weight="BOLD" colorKey="TEXT_PRIMARY" style={styles.section}>
            Chi phí kèm theo
          </Typography>

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Controller
                control={control}
                name="electricPrice"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Tiền điện"
                    placeholder="3.500"
                    value={formatNumberWithDots(value)}
                    onChangeText={(text) => onChange(parseRawNumberString(text))}
                    keyboardType="numeric"
                    errorMessage={errors.electricPrice?.message}
                    rightIcon={renderSuffix('đ/kWh')}
                    idleBorderColor={OVERLAY_COLORS.FIELD_BORDER}
                    containerStyle={styles.field}
                    inputContainerStyle={styles.fieldInput}
                  />
                )}
              />
            </View>

            <View style={styles.halfField}>
              <Controller
                control={control}
                name="waterPrice"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Tiền nước"
                    placeholder="100.000"
                    value={formatNumberWithDots(value)}
                    onChangeText={(text) => onChange(parseRawNumberString(text))}
                    keyboardType="numeric"
                    errorMessage={errors.waterPrice?.message}
                    rightIcon={renderSuffix('đ/m³')}
                    idleBorderColor={OVERLAY_COLORS.FIELD_BORDER}
                    containerStyle={styles.field}
                    inputContainerStyle={styles.fieldInput}
                  />
                )}
              />
            </View>
          </View>

          <Controller
            control={control}
            name="deposit"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Tiền cọc"
                placeholder="2.500.000"
                value={formatNumberWithDots(value)}
                onChangeText={(text) => onChange(parseRawNumberString(text))}
                keyboardType="numeric"
                errorMessage={errors.deposit?.message}
                rightIcon={renderSuffix('đ')}
                idleBorderColor={OVERLAY_COLORS.FIELD_BORDER}
                containerStyle={styles.field}
                inputContainerStyle={styles.fieldInput}
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Mô tả phòng"
                placeholder="Mô tả chi tiết về phòng, khu vực xung quanh, giờ giấc tự do..."
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={4}
                style={styles.textArea}
                errorMessage={errors.description?.message}
                idleBorderColor={OVERLAY_COLORS.FIELD_BORDER}
                containerStyle={styles.field}
                inputContainerStyle={styles.titleInput}
              />
            )}
          />
        </KeyboardAwareScrollView>
      </KeyboardAvoidingContainer>

      <View style={styles.bottomBar}>
        <Button variant="primary" size="lg" fullWidth onPress={handleSubmit(onSubmit)}>
          Tiếp tục
        </Button>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { padding: SPACING_TOKENS.MD, paddingBottom: SPACING_TOKENS.XL },
  field: { marginBottom: 0 },
  fieldWrapper: { gap: 8, marginBottom: 20 },
  label: { marginBottom: 0 },
  fieldInput: { height: 52, borderRadius: BORDER_RADIUS_TOKENS.MD },
  titleInput: { minHeight: 76, borderRadius: BORDER_RADIUS_TOKENS.MD },
  titleHint: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 20,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roomChip: { height: 40, paddingHorizontal: 16 },
  occupantChip: { minWidth: 48, height: 40 },
  errorText: { marginTop: SPACING_TOKENS.XS },
  row: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  halfField: { flex: 1 },
  section: { marginTop: 4, marginBottom: 12 },
  textArea: { minHeight: 96, textAlignVertical: 'top' },
  bottomBar: {
    padding: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.DIVIDER,
  },
});
