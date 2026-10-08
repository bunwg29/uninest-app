import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImagePlus, MapPin, X } from 'lucide-react-native';
import { filterValidUploadImages, resolveImageContentType } from '@core';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import {
  Button,
  DatePickerField,
  FilterChip,
  Input,
  ScreenContainer,
  Typography,
  KeyboardAvoidingContainer,
  KeyboardAwareScrollView,
} from '@ui';
import { useToast } from '@hooks';
import { formatNumberWithDots, parseRawNumberString } from '@core';
import type { RootStackParamList } from '@navigation';
import { ForumBadge, ForumFormField, ForumHeader, ModerationWarningModal } from '../components';
import { useCheckForumContent, useForumPost, useSaveForumPost } from '../hooks';
import type {
  ForumCategory,
  ForumLocalImage,
  ForumPost,
  ModeratedField,
  ModerationResult,
  SaveForumPostPayload,
} from '../types';
import {
  FORUM_COMPOSER_CATEGORY_LABELS,
  FORUM_MAX_IMAGES,
  ROOMMATE_GENDER_OPTIONS,
  ROOMMATE_STATUS_OPTIONS,
} from '../types';
import {
  FORUM_POST_FORM_DEFAULTS,
  forumPostSchema,
  type ForumPostFormValues,
} from '../validations';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ComposerRouteProp = RouteProp<RootStackParamList, 'ForumPostComposer'>;

const TITLE_HELPER_TEXT = 'Ghi rõ khu vực và giá ngay ở tiêu đề để bài dễ được tìm thấy.';

const CATEGORY_ORDER = Object.keys(FORUM_COMPOSER_CATEGORY_LABELS) as ForumCategory[];

const toFormValues = (post: ForumPost): ForumPostFormValues => ({
  category: post.category,
  title: post.title,
  content: post.content,
  gender: post.roommate?.gender ?? 'female',
  costPerPerson: post.roommate ? formatNumberWithDots(post.roommate.costPerPerson) : '',
  moveInDate: post.roommate?.moveInDate?.slice(0, 10) ?? '',
  minStayMonths: post.roommate?.minStayMonths ? String(post.roommate.minStayMonths) : '',
  costNote: post.roommate?.costNote ?? '',
  lifestyle: post.roommate?.lifestyle ?? '',
  area: post.roommate?.area ?? '',
  roommateStatus: post.roommateStatus ?? 'open',
});

const toPayload = (values: ForumPostFormValues): SaveForumPostPayload => {
  const isRoommate = values.category === 'roommate';
  const minStayMonths = Number(values.minStayMonths);

  return {
    category: values.category,
    title: values.title.trim(),
    content: values.content.trim(),
    ...(isRoommate
      ? {
          roommate: {
            gender: values.gender,
            costPerPerson: Number(parseRawNumberString(values.costPerPerson)),
            costNote: values.costNote?.trim() || undefined,
            moveInDate: values.moveInDate || undefined,
            minStayMonths: values.minStayMonths.trim() ? minStayMonths : undefined,
            lifestyle: values.lifestyle?.trim() || undefined,
            area: values.area?.trim() || undefined,
          },
          roommateStatus: values.roommateStatus,
        }
      : {}),
  };
};

export const ForumPostComposerScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { params } = useRoute<ComposerRouteProp>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const postId = params?.postId;
  const isEditing = Boolean(postId);
  const [images, setImages] = useState<ForumLocalImage[]>([]);
  const [moderationResult, setModerationResult] = useState<ModerationResult | null>(null);
  const [pendingPayload, setPendingPayload] = useState<SaveForumPostPayload | null>(null);
  const [flaggedFields, setFlaggedFields] = useState<ModeratedField[]>([]);

  const postQuery = useForumPost(postId ?? '');
  const saveMutation = useSaveForumPost();
  const checkMutation = useCheckForumContent();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ForumPostFormValues>({
    resolver: zodResolver(forumPostSchema),
    defaultValues: {
      ...FORUM_POST_FORM_DEFAULTS,
      category: params?.category ?? FORUM_POST_FORM_DEFAULTS.category,
    },
  });

  const category = useWatch({ control, name: 'category' });
  const isRoommate = category === 'roommate';
  const editingPost = postQuery.data;
  const canSaveDraft = !isEditing || editingPost?.status === 'draft';
  const isBusy = saveMutation.isPending || checkMutation.isPending;

  useEffect(() => {
    if (!editingPost) return;

    reset(toFormValues(editingPost));
    setImages(
      editingPost.imageKeys.map((key, index) => ({
        uri: editingPost.imageUrls[index] ?? '',
        fileName: key.split('/').pop() ?? key,
        contentType: 'image/jpeg',
        uploadedKey: key,
      }))
    );
  }, [editingPost, reset]);

  const clearFlag = (field: ModeratedField) => {
    setFlaggedFields((current) =>
      current.includes(field) ? current.filter((f) => f !== field) : current
    );
  };

  const getFlagStyle = (field: ModeratedField) =>
    flaggedFields.includes(field) ? styles.flaggedInput : null;

  const handlePickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Cần quyền truy cập', 'Vui lòng cho phép ứng dụng truy cập thư viện ảnh.');

      return;
    }

    const remaining = FORUM_MAX_IMAGES - images.length;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: remaining,
    });

    if (result.canceled || !result.assets.length) return;

    const { valid, firstError } = filterValidUploadImages(result.assets);

    if (firstError) Alert.alert('Ảnh không hợp lệ', firstError);

    const pickedImages = valid.map((asset, index) => ({
      uri: asset.uri,
      fileName: asset.fileName ?? `forum_${Date.now()}_${index}.jpg`,
      contentType: resolveImageContentType(asset),
    }));

    setImages((currentImages) => [...currentImages, ...pickedImages].slice(0, FORUM_MAX_IMAGES));
  };

  const handleRemoveImage = (index: number) => {
    setImages((currentImages) => currentImages.filter((_, imageIndex) => imageIndex !== index));
  };

  const savePost = (payload: SaveForumPostPayload) => {
    saveMutation.mutate(
      { postId, payload, images },
      {
        onSuccess: (post) => {
          setModerationResult(null);
          setPendingPayload(null);

          if (post.status === 'draft') {
            toast.success(
              'Bạn có thể tiếp tục chỉnh sửa trong mục bài viết của tôi.',
              'Đã lưu nháp'
            );
            navigation.goBack();

            return;
          }

          toast.success(isEditing ? 'Đã cập nhật bài viết' : 'Bài viết đã được đăng');
          navigation.replace('ForumPostDetail', { postId: post.id });
        },
        onError: (error) => {
          setModerationResult(null);
          toast.error(error.message, isEditing ? 'Không thể cập nhật bài' : 'Không thể đăng bài');
        },
      }
    );
  };

  const handlePublish = handleSubmit((values) => {
    const shouldPublish = !isEditing || editingPost?.status === 'draft';
    const payload = { ...toPayload(values), isDraft: shouldPublish ? false : undefined };

    checkMutation.mutate(
      {
        title: payload.title,
        content: payload.content,
        roommate: payload.roommate && {
          costNote: payload.roommate.costNote,
          lifestyle: payload.roommate.lifestyle,
          area: payload.roommate.area,
        },
      },
      {
        onSuccess: (result) => {
          if (result.isClean) {
            savePost(payload);

            return;
          }

          setPendingPayload(payload);
          setModerationResult(result);
          setFlaggedFields(result.violations.map((violation) => violation.field));
        },
        onError: (error) => toast.error(error.message, 'Không kiểm tra được nội dung'),
      }
    );
  });

  const handleSaveDraft = handleSubmit((values) => {
    savePost({ ...toPayload(values), isDraft: true });
  });

  const handleAutoRemove = () => {
    if (!moderationResult) return;

    const { sanitized } = moderationResult;
    const sanitizedFields: [keyof ForumPostFormValues, string | undefined][] = [
      ['title', sanitized.title],
      ['content', sanitized.content],
      ['costNote', sanitized['roommate.costNote']],
      ['lifestyle', sanitized['roommate.lifestyle']],
      ['area', sanitized['roommate.area']],
    ];

    for (const [field, value] of sanitizedFields) {
      if (value !== undefined) {
        setValue(field, value, { shouldValidate: true });
      }
    }

    setModerationResult(null);
    setPendingPayload(null);
    setFlaggedFields([]);
    toast.info('Đã xoá các phần vi phạm, bạn kiểm tra lại rồi đăng nhé.');
  };

  const handlePublishAnyway = () => {
    const payload = pendingPayload ?? toPayload(getValues());

    savePost({ ...payload, acknowledgeWarnings: true });
  };

  const handleClose = () => {
    if (isBusy) return;

    navigation.goBack();
  };

  if (isEditing && postQuery.isLoading) {
    return (
      <ScreenContainer style={styles.centered}>
        <ActivityIndicator color={THEME_COLORS.PRIMARY} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.container} applyBottomInset={false} keyboardAvoiding={false}>
      <ForumHeader
        title={isEditing ? 'Sửa bài viết' : 'Đăng bài'}
        leftIcon="close"
        onBack={handleClose}
        hasBottomBorder
      />

      <KeyboardAvoidingContainer style={styles.flexOne}>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <ForumFormField label="Chuyên mục" style={styles.group}>
            <Controller
              control={control}
              name="category"
              render={({ field: { value, onChange } }) => (
                <View style={styles.chipWrap}>
                  {CATEGORY_ORDER.map((option) => (
                    <FilterChip
                      key={option}
                      label={FORUM_COMPOSER_CATEGORY_LABELS[option]}
                      isSelected={value === option}
                      onPress={() => onChange(option)}
                    />
                  ))}
                </View>
              )}
            />
          </ForumFormField>

          <ForumFormField
            label="Tiêu đề"
            helperText={errors.title ? undefined : TITLE_HELPER_TEXT}
            style={styles.group}
          >
            <Controller
              control={control}
              name="title"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  value={value}
                  onChangeText={(text) => {
                    clearFlag('title');
                    onChange(text);
                  }}
                  onBlur={onBlur}
                  placeholder="VD: Tìm 1 bạn nữ ở ghép Hoà Khánh Bắc, 1,3 triệu/người"
                  errorMessage={errors.title?.message}
                  maxLength={150}
                  multiline
                  idleBorderColor={OVERLAY_COLORS.FIELD_BORDER}
                  inputContainerStyle={[styles.textArea, styles.titleInput, getFlagStyle('title')]}
                  style={styles.textAreaText}
                  containerStyle={styles.inputReset}
                />
              )}
            />
          </ForumFormField>

          <ForumFormField label="Nội dung" style={styles.group}>
            <Controller
              control={control}
              name="content"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  value={value}
                  onChangeText={(text) => {
                    clearFlag('content');
                    onChange(text);
                  }}
                  onBlur={onBlur}
                  placeholder="Chia sẻ chi tiết về phòng, kinh nghiệm hoặc câu hỏi của bạn…"
                  errorMessage={errors.content?.message}
                  maxLength={5000}
                  multiline
                  idleBorderColor={OVERLAY_COLORS.FIELD_BORDER}
                  inputContainerStyle={[
                    styles.textArea,
                    styles.contentInput,
                    getFlagStyle('content'),
                  ]}
                  style={styles.textAreaText}
                  containerStyle={styles.inputReset}
                />
              )}
            />
          </ForumFormField>

          <ForumFormField label={`Ảnh (${images.length}/${FORUM_MAX_IMAGES})`} style={styles.group}>
            <View style={styles.imageGrid}>
              {images.map((image, index) => (
                <View key={`${image.uri}-${index}`} style={styles.imageTile}>
                  <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.removeImage}
                    onPress={() => handleRemoveImage(index)}
                    accessibilityLabel={`Xoá ảnh ${index + 1}`}
                  >
                    <X size={14} color={THEME_COLORS.WHITE} />
                  </TouchableOpacity>
                </View>
              ))}

              {images.length < FORUM_MAX_IMAGES ? (
                <TouchableOpacity
                  style={[styles.imageTile, styles.addImage]}
                  onPress={handlePickImages}
                >
                  <ImagePlus size={24} color={THEME_COLORS.PRIMARY} />
                  <Typography variant="caption" colorKey="PRIMARY">
                    Thêm ảnh
                  </Typography>
                </TouchableOpacity>
              ) : null}
            </View>
          </ForumFormField>

          {isRoommate ? (
            <View>
              <View style={styles.sectionHeader}>
                <Typography variant="label" weight="SEMIBOLD" colorKey="TEXT_SECONDARY">
                  Tiêu chí ở ghép
                </Typography>
                <ForumBadge label="Giúp lọc tốt hơn" />
              </View>

              <ForumFormField label="GIỚI TÍNH" tone="caption" style={styles.subGroup}>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field: { value, onChange } }) => (
                    <View style={styles.chipWrap}>
                      {ROOMMATE_GENDER_OPTIONS.map((option) => (
                        <FilterChip
                          key={option.value}
                          label={option.label}
                          isSelected={value === option.value}
                          onPress={() => onChange(option.value)}
                        />
                      ))}
                    </View>
                  )}
                />
              </ForumFormField>

              <View style={[styles.inlineFields, styles.subGroup]}>
                <ForumFormField label="CHI PHÍ / NGƯỜI" tone="caption" style={styles.inlineField}>
                  <Controller
                    control={control}
                    name="costPerPerson"
                    render={({ field: { value, onChange } }) => (
                      <Input
                        value={value}
                        onChangeText={(text) => onChange(formatNumberWithDots(text))}
                        placeholder="1.300.000"
                        keyboardType="number-pad"
                        errorMessage={errors.costPerPerson?.message}
                        idleBorderColor={OVERLAY_COLORS.FIELD_BORDER}
                        inputContainerStyle={styles.lineInput}
                        style={styles.lineInputText}
                        containerStyle={styles.inputReset}
                      />
                    )}
                  />
                </ForumFormField>

                <ForumFormField label="DỌN VÀO TỪ" tone="caption" style={styles.inlineField}>
                  <Controller
                    control={control}
                    name="moveInDate"
                    render={({ field: { value, onChange } }) => (
                      <DatePickerField
                        value={value}
                        onChange={onChange}
                        placeholder="Chọn ngày dọn vào"
                        minimumDate={new Date()}
                        errorMessage={errors.moveInDate?.message}
                        idleBorderColor={OVERLAY_COLORS.FIELD_BORDER}
                        inputContainerStyle={styles.lineInput}
                        style={styles.lineInputText}
                        containerStyle={styles.inputReset}
                      />
                    )}
                  />
                </ForumFormField>
              </View>

              <ForumFormField label="KHU VỰC" tone="caption" style={styles.subGroup}>
                <Controller
                  control={control}
                  name="area"
                  render={({ field: { value, onChange } }) => (
                    <Input
                      value={value}
                      onChangeText={(text) => {
                        clearFlag('roommate.area');
                        onChange(text);
                      }}
                      placeholder="Kiệt 154 Nguyễn Lương Bằng, P. Hoà Khánh Bắc"
                      errorMessage={errors.area?.message}
                      leftIcon={<MapPin size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
                      idleBorderColor={OVERLAY_COLORS.FIELD_BORDER}
                      inputContainerStyle={[styles.lineInput, getFlagStyle('roommate.area')]}
                      style={styles.lineInputText}
                      containerStyle={styles.inputReset}
                    />
                  )}
                />
              </ForumFormField>

              <ForumFormField
                label="TIÊU CHÍ BẠN CÙNG PHÒNG"
                tone="caption"
                style={styles.subGroup}
              >
                <Controller
                  control={control}
                  name="lifestyle"
                  render={({ field: { value, onChange } }) => (
                    <Input
                      value={value}
                      onChangeText={(text) => {
                        clearFlag('roommate.lifestyle');
                        onChange(text);
                      }}
                      placeholder="Không hút thuốc · Gọn gàng · Ngủ trước 12h"
                      errorMessage={errors.lifestyle?.message}
                      multiline
                      idleBorderColor={OVERLAY_COLORS.FIELD_BORDER}
                      inputContainerStyle={[
                        styles.lineInput,
                        styles.lifestyleInput,
                        getFlagStyle('roommate.lifestyle'),
                      ]}
                      style={styles.lineInputText}
                      containerStyle={styles.inputReset}
                    />
                  )}
                />
              </ForumFormField>

              <View style={[styles.inlineFields, styles.subGroup]}>
                <ForumFormField
                  label="Ở TỐI THIỂU (THÁNG)"
                  tone="caption"
                  style={styles.inlineField}
                >
                  <Controller
                    control={control}
                    name="minStayMonths"
                    render={({ field: { value, onChange } }) => (
                      <Input
                        value={value}
                        onChangeText={(text) => onChange(text.replace(/\D/g, ''))}
                        placeholder="6"
                        keyboardType="number-pad"
                        errorMessage={errors.minStayMonths?.message}
                        idleBorderColor={OVERLAY_COLORS.FIELD_BORDER}
                        inputContainerStyle={styles.lineInput}
                        style={styles.lineInputText}
                        containerStyle={styles.inputReset}
                      />
                    )}
                  />
                </ForumFormField>

                <ForumFormField label="GHI CHÚ CHI PHÍ" tone="caption" style={styles.inlineField}>
                  <Controller
                    control={control}
                    name="costNote"
                    render={({ field: { value, onChange } }) => (
                      <Input
                        value={value}
                        onChangeText={(text) => {
                          clearFlag('roommate.costNote');
                          onChange(text);
                        }}
                        placeholder="Điện nước chia đôi"
                        errorMessage={errors.costNote?.message}
                        idleBorderColor={OVERLAY_COLORS.FIELD_BORDER}
                        inputContainerStyle={[styles.lineInput, getFlagStyle('roommate.costNote')]}
                        style={styles.lineInputText}
                        containerStyle={styles.inputReset}
                      />
                    )}
                  />
                </ForumFormField>
              </View>

              {isEditing ? (
                <ForumFormField label="TRẠNG THÁI" tone="caption" style={styles.subGroup}>
                  <Controller
                    control={control}
                    name="roommateStatus"
                    render={({ field: { value, onChange } }) => (
                      <View style={styles.chipWrap}>
                        {ROOMMATE_STATUS_OPTIONS.map((option) => (
                          <FilterChip
                            key={option.value}
                            label={option.label}
                            isSelected={value === option.value}
                            onPress={() => onChange(option.value)}
                          />
                        ))}
                      </View>
                    )}
                  />
                </ForumFormField>
              ) : null}
            </View>
          ) : null}
        </KeyboardAwareScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + SPACING_TOKENS.SM }]}>
          {canSaveDraft ? (
            <Button
              title="Lưu nháp"
              variant="outline"
              onPress={handleSaveDraft}
              disabled={isBusy}
              style={[styles.footerButton, styles.draftButton]}
              textStyle={styles.draftText}
            />
          ) : null}

          <Button
            title={isEditing && editingPost?.status !== 'draft' ? 'Lưu thay đổi' : 'Đăng bài'}
            onPress={handlePublish}
            isLoading={isBusy}
            style={[styles.footerButton, styles.flexOne]}
          />
        </View>
      </KeyboardAvoidingContainer>

      <ModerationWarningModal
        result={moderationResult}
        isSubmitting={saveMutation.isPending}
        onEdit={() => {
          setModerationResult(null);
          setPendingPayload(null);
        }}
        onAutoRemove={handleAutoRemove}
        onPublishAnyway={handlePublishAnyway}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flexOne: {
    flex: 1,
  },
  form: {
    padding: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.XL,
  },
  group: {
    marginBottom: 18,
  },
  subGroup: {
    marginBottom: SPACING_TOKENS.SM + 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING_TOKENS.SM + 4,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING_TOKENS.SM,
  },
  inputReset: {
    marginBottom: 0,
  },
  textArea: {
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  textAreaText: {
    minHeight: 0,
    fontSize: 15,
    lineHeight: 22,
  },
  titleInput: {
    minHeight: 72,
  },
  contentInput: {
    minHeight: 116,
  },
  flaggedInput: {
    borderColor: THEME_COLORS.ERROR,
    backgroundColor: THEME_COLORS.ERROR_LIGHT,
  },
  lineInput: {
    height: 50,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    paddingHorizontal: 14,
  },
  lifestyleInput: {
    height: undefined,
    minHeight: 50,
    paddingVertical: 12,
  },
  lineInputText: {
    minHeight: 0,
    fontSize: 14,
    lineHeight: 22,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING_TOKENS.SM,
  },
  imageTile: {
    width: 76,
    height: 76,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImage: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: OVERLAY_COLORS.COUNTER_BADGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImage: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: THEME_COLORS.PRIMARY,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING_TOKENS.XXS,
  },
  inlineFields: {
    flexDirection: 'row',
    gap: SPACING_TOKENS.MD,
  },
  inlineField: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: SPACING_TOKENS.SM + 4,
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  footerButton: {
    height: 48,
  },
  draftButton: {
    minWidth: 117,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  draftText: {
    color: THEME_COLORS.TEXT_SECONDARY,
  },
});
