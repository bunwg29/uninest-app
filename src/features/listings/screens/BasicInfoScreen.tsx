import { useCallback, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronDown } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS } from '@theme';
import { Button, Input, Typography, HeaderBar, ScreenContainer, Modal } from '@ui';
import { formatNumberWithDots, parseRawNumberString } from '@core';
import { useState } from 'react';
import type { ListingPostStackParamList } from '@navigation';
import { useListingPostStore } from '../store/listingPostStore';
import { basicInfoSchema, type BasicInfoFormValues } from '../validations/listingValidation';
import { ROOM_TYPE_OPTIONS, LISTING_FORM_STEPS } from '../types/constants';
import { INITIAL_STEP1 } from '../store/listingPostStore';

type NavigationProp = NativeStackNavigationProp<ListingPostStackParamList>;
type ScreenRouteProp = RouteProp<ListingPostStackParamList, 'ListingPostBasicInfo'>;

const TOTAL_STEPS = LISTING_FORM_STEPS.length;

export const BasicInfoScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { step1, setStep1, editingListingId, initEdit, initCreate } = useListingPostStore();
  const isEditing = Boolean(editingListingId);
  const [isRoomTypeModalVisible, setIsRoomTypeModalVisible] = useState(false);

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
  const selectedRoomTypeLabel =
    ROOM_TYPE_OPTIONS.find((opt) => opt.value === selectedRoomType)?.label ?? '';

  const handleSelectRoomType = useCallback(
    (value: string) => {
      setValue('roomType', value, { shouldValidate: true });
      setIsRoomTypeModalVisible(false);
    },
    [setValue]
  );

  const onSubmit = useCallback(
    (values: BasicInfoFormValues) => {
      setStep1(values);
      navigation.navigate('ListingPostImages');
    },
    [setStep1, navigation]
  );

  return (
    <ScreenContainer applyTopInset applyBottomInset keyboardAvoiding={false}>
      <HeaderBar
        title={isEditing ? 'Chỉnh sửa tin đăng' : 'Đăng tin mới'}
        onBack={() => {
          initCreate();
          navigation.goBack();
        }}
        subtitle={`Bước 1 / ${TOTAL_STEPS}: Thông tin cơ bản`}
        alignTitle="left"
      />

      <StepIndicator currentStep={1} totalSteps={TOTAL_STEPS} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
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
                label="Tiêu đề tin đăng *"
                placeholder="VD: Phòng trọ gần Đại học Bách Khoa, có gác lửng"
                value={value}
                onChangeText={onChange}
                errorMessage={errors.title?.message}
                returnKeyType="next"
                maxLength={150}
              />
            )}
          />

          <View style={styles.fieldWrapper}>
            <Typography
              variant="label"
              weight="MEDIUM"
              colorKey="TEXT_PRIMARY"
              style={styles.label}
            >
              Loại phòng *
            </Typography>

            <TouchableOpacity
              style={[
                styles.selectorTrigger,
                errors.roomType ? styles.selectorError : null,
                selectedRoomType ? styles.selectorSelected : null,
              ]}
              onPress={() => setIsRoomTypeModalVisible(true)}
              activeOpacity={0.7}
            >
              <Typography
                variant="body1"
                color={selectedRoomType ? THEME_COLORS.TEXT_PRIMARY : THEME_COLORS.TEXT_PLACEHOLDER}
              >
                {selectedRoomTypeLabel || 'Chọn loại phòng'}
              </Typography>

              <ChevronDown size={18} color={THEME_COLORS.TEXT_MUTED} />
            </TouchableOpacity>

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
                    label="Giá thuê (đ/tháng) *"
                    placeholder="VD: 2.500.000"
                    value={formatNumberWithDots(value)}
                    onChangeText={(text) => onChange(parseRawNumberString(text))}
                    keyboardType="numeric"
                    errorMessage={errors.price?.message}
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
                    label="Diện tích (m²) *"
                    placeholder="VD: 25"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="numeric"
                    errorMessage={errors.area?.message}
                  />
                )}
              />
            </View>
          </View>

          <Controller
            control={control}
            name="maxOccupants"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Số người ở tối đa *"
                placeholder="VD: 2"
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
                errorMessage={errors.maxOccupants?.message}
              />
            )}
          />

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Controller
                control={control}
                name="electricPrice"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Giá điện (đ/kWh)"
                    placeholder="VD: 4.000"
                    value={formatNumberWithDots(value)}
                    onChangeText={(text) => onChange(parseRawNumberString(text))}
                    keyboardType="numeric"
                    errorMessage={errors.electricPrice?.message}
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
                    label="Giá nước (đ/m³)"
                    placeholder="VD: 100.000"
                    value={formatNumberWithDots(value)}
                    onChangeText={(text) => onChange(parseRawNumberString(text))}
                    keyboardType="numeric"
                    errorMessage={errors.waterPrice?.message}
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
                label="Tiền cọc (đ)"
                placeholder="VD: 2.500.000"
                value={formatNumberWithDots(value)}
                onChangeText={(text) => onChange(parseRawNumberString(text))}
                keyboardType="numeric"
                errorMessage={errors.deposit?.message}
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
              />
            )}
          />

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.bottomBar}>
        <Button variant="primary" size="lg" fullWidth onPress={handleSubmit(onSubmit)}>
          Tiếp tục
        </Button>
      </View>

      <Modal
        isVisible={isRoomTypeModalVisible}
        onClose={() => setIsRoomTypeModalVisible(false)}
        title="Chọn loại phòng"
      >
        <View style={styles.modalBody}>
          {ROOM_TYPE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.modalItem, selectedRoomType === opt.value && styles.modalItemSelected]}
              onPress={() => handleSelectRoomType(opt.value)}
              activeOpacity={0.7}
            >
              <Typography
                variant="body1"
                weight={selectedRoomType === opt.value ? 'SEMIBOLD' : 'REGULAR'}
                color={
                  selectedRoomType === opt.value ? THEME_COLORS.PRIMARY : THEME_COLORS.TEXT_PRIMARY
                }
              >
                {opt.label}
              </Typography>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </ScreenContainer>
  );
};

const StepIndicator = ({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) => {
  const progress = currentStep / totalSteps;

  return (
    <View style={indicatorStyles.container}>
      <View style={indicatorStyles.track}>
        <View style={[indicatorStyles.fill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
};

const indicatorStyles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingVertical: SPACING_TOKENS.SM,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  track: {
    height: 4,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: THEME_COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
  },
});

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.XL,
  },
  fieldWrapper: {
    marginBottom: SPACING_TOKENS.MD,
  },
  label: {
    marginBottom: 6,
  },
  selectorTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    paddingHorizontal: SPACING_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  selectorError: {
    borderColor: THEME_COLORS.ERROR,
  },
  selectorSelected: {
    borderColor: THEME_COLORS.BORDER,
  },
  errorText: {
    marginTop: SPACING_TOKENS.XS,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING_TOKENS.SM,
  },
  halfField: {
    flex: 1,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  bottomPadding: {
    height: SPACING_TOKENS.XL,
  },
  bottomBar: {
    padding: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.DIVIDER,
  },
  modalBody: {
    paddingVertical: SPACING_TOKENS.SM,
  },
  modalItem: {
    paddingVertical: SPACING_TOKENS.SM + 2,
    paddingHorizontal: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
  },
  modalItemSelected: {
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
});
