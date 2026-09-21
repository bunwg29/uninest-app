import { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MapPin, ChevronDown, ChevronLeft, Search, Check } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS } from '@theme';
import { Button, Input, Modal, ScreenContainer, Typography } from '@ui';
import { useToast } from '@hooks';
import type { AuthStackParamList } from '@navigation';
import { useAuth } from '../hooks';
import {
  locationsService,
  type LocationProvince,
  type LocationWard,
} from '../services/locationsService';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;
type RegisterAddressRouteProp = RouteProp<AuthStackParamList, 'RegisterAddress'>;

export const RegisterAddressScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RegisterAddressRouteProp>();
  const { register, isLoading, error } = useAuth();
  const toast = useToast();

  const { fullName, phoneNumber, email, password, role } = route.params;

  const [provinces, setProvinces] = useState<LocationProvince[]>([]);
  const [wards, setWards] = useState<LocationWard[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<LocationProvince | null>(null);
  const [selectedWard, setSelectedWard] = useState<LocationWard | null>(null);
  const [streetAddress, setStreetAddress] = useState('');

  const [isProvinceModalVisible, setIsProvinceModalVisible] = useState(false);
  const [isWardModalVisible, setIsWardModalVisible] = useState(false);

  const [provinceSearch, setProvinceSearch] = useState('');
  const [wardSearch, setWardSearch] = useState('');

  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchProvinces = async () => {
      try {
        setIsLoadingProvinces(true);

        const data = await locationsService.getProvinces();

        if (isMounted) {
          setProvinces(data);
        }
      } catch {
        if (isMounted) {
          toast.error('Không thể tải danh sách tỉnh/thành phố');
        }
      } finally {
        if (isMounted) {
          setIsLoadingProvinces(false);
        }
      }
    };

    void fetchProvinces();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectProvince = async (province: LocationProvince) => {
    setSelectedProvince(province);
    setSelectedWard(null);
    setIsProvinceModalVisible(false);
    setProvinceSearch('');

    try {
      setIsLoadingWards(true);

      const wardsData = await locationsService.getWardsByProvince(province.code);

      setWards(wardsData);
    } catch {
      toast.error('Không thể tải danh sách phường/xã');
    } finally {
      setIsLoadingWards(false);
    }
  };

  const handleSelectWard = (ward: LocationWard) => {
    setSelectedWard(ward);
    setIsWardModalVisible(false);
    setWardSearch('');
  };

  const handleOpenWardModal = () => {
    if (!selectedProvince) {
      toast.info('Vui lòng chọn Tỉnh/Thành phố trước');

      return;
    }

    setIsWardModalVisible(true);
  };

  const filteredProvinces = useMemo(() => {
    if (!provinceSearch.trim()) {
      return provinces;
    }

    const keyword = provinceSearch.toLowerCase().trim();

    return provinces.filter(
      (p) => p.name.toLowerCase().includes(keyword) || p.fullName.toLowerCase().includes(keyword)
    );
  }, [provinces, provinceSearch]);

  const filteredWards = useMemo(() => {
    if (!wardSearch.trim()) {
      return wards;
    }

    const keyword = wardSearch.toLowerCase().trim();

    return wards.filter(
      (w) => w.name.toLowerCase().includes(keyword) || w.fullName.toLowerCase().includes(keyword)
    );
  }, [wards, wardSearch]);

  const fullAddressPreview = useMemo(() => {
    const parts = [streetAddress.trim(), selectedWard?.fullName, selectedProvince?.fullName].filter(
      Boolean
    );

    return parts.join(', ');
  }, [streetAddress, selectedWard, selectedProvince]);

  const handleSubmit = async () => {
    if (!selectedProvince) {
      toast.error('Vui lòng chọn Tỉnh/Thành phố');

      return;
    }

    if (!selectedWard) {
      toast.error('Vui lòng chọn Phường/Xã');

      return;
    }

    try {
      await register({
        fullName,
        phoneNumber,
        email: email || undefined,
        password,
        role,
        provinceCode: selectedProvince.code,
        wardCode: selectedWard.code,
        streetAddress: streetAddress.trim() || undefined,
      });

      toast.success(`Mã xác thực đã được gửi tới ${phoneNumber}`);

      navigation.navigate('OtpVerification', {
        target: phoneNumber,
        flow: 'register',
        role,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi đăng ký');
    }
  };

  return (
    <ScreenContainer scrollable style={styles.container}>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <ChevronLeft size={22} color={THEME_COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>

          <View style={styles.stepBadge}>
            <Typography variant="caption" weight="SEMIBOLD" color={THEME_COLORS.PRIMARY}>
              Bước 2 / 2
            </Typography>
          </View>
        </View>

        <Typography variant="h1" weight="BOLD" style={styles.title}>
          Thông tin địa chỉ
        </Typography>

        <Typography variant="body1" color={THEME_COLORS.TEXT_SECONDARY}>
          Cung cấp địa chỉ khu vực của bạn để nhận các đề xuất và kết nối chuẩn xác nhất.
        </Typography>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Typography variant="caption" color={THEME_COLORS.ERROR}>
            {error}
          </Typography>
        </View>
      ) : null}

      <View style={styles.form}>
        <View style={styles.fieldWrapper}>
          <Typography variant="caption" weight="MEDIUM" style={styles.label}>
            Tỉnh / Thành phố{' '}
            <Typography variant="caption" color={THEME_COLORS.ERROR}>
              *
            </Typography>
          </Typography>

          <TouchableOpacity
            style={[styles.selectorTrigger, !selectedProvince && styles.selectorPlaceholder]}
            onPress={() => setIsProvinceModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.triggerLeft}>
              <MapPin
                size={18}
                color={selectedProvince ? THEME_COLORS.PRIMARY : THEME_COLORS.TEXT_PLACEHOLDER}
              />

              <Typography
                variant="body1"
                color={selectedProvince ? THEME_COLORS.TEXT_PRIMARY : THEME_COLORS.TEXT_PLACEHOLDER}
                style={styles.triggerText}
              >
                {selectedProvince ? selectedProvince.fullName : 'Chọn Tỉnh / Thành phố'}
              </Typography>
            </View>

            <ChevronDown size={18} color={THEME_COLORS.TEXT_MUTED} />
          </TouchableOpacity>
        </View>

        <View style={styles.fieldWrapper}>
          <Typography variant="caption" weight="MEDIUM" style={styles.label}>
            Phường / Xã{' '}
            <Typography variant="caption" color={THEME_COLORS.ERROR}>
              *
            </Typography>
          </Typography>

          <TouchableOpacity
            style={[
              styles.selectorTrigger,
              !selectedProvince && styles.selectorDisabled,
              !selectedWard && styles.selectorPlaceholder,
            ]}
            onPress={handleOpenWardModal}
            activeOpacity={selectedProvince ? 0.7 : 1}
          >
            <View style={styles.triggerLeft}>
              <MapPin
                size={18}
                color={selectedWard ? THEME_COLORS.PRIMARY : THEME_COLORS.TEXT_PLACEHOLDER}
              />

              <Typography
                variant="body1"
                color={
                  !selectedProvince
                    ? THEME_COLORS.TEXT_MUTED
                    : selectedWard
                      ? THEME_COLORS.TEXT_PRIMARY
                      : THEME_COLORS.TEXT_PLACEHOLDER
                }
                style={styles.triggerText}
              >
                {!selectedProvince
                  ? 'Vui lòng chọn Tỉnh/Thành trước'
                  : selectedWard
                    ? selectedWard.fullName
                    : 'Chọn Phường / Xã'}
              </Typography>
            </View>

            {isLoadingWards ? (
              <ActivityIndicator size="small" color={THEME_COLORS.PRIMARY} />
            ) : (
              <ChevronDown size={18} color={THEME_COLORS.TEXT_MUTED} />
            )}
          </TouchableOpacity>
        </View>

        <Input
          label="Số nhà, tên đường"
          placeholder="Ví dụ: Số 123 Đường Nguyễn Huệ"
          value={streetAddress}
          onChangeText={setStreetAddress}
          autoCapitalize="words"
          helperText="Tùy chọn số nhà, tên đường cụ thể"
        />

        {fullAddressPreview ? (
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <MapPin size={16} color={THEME_COLORS.PRIMARY} />

              <Typography
                variant="caption"
                weight="SEMIBOLD"
                color={THEME_COLORS.PRIMARY}
                style={styles.previewTitle}
              >
                Địa chỉ đầy đủ
              </Typography>
            </View>

            <Typography
              variant="body2"
              color={THEME_COLORS.TEXT_PRIMARY}
              style={styles.previewText}
            >
              {fullAddressPreview}
            </Typography>
          </View>
        ) : null}

        <Button
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          onPress={handleSubmit}
          style={styles.submitButton}
        >
          Hoàn tất đăng ký
        </Button>
      </View>

      <Modal
        isVisible={isProvinceModalVisible}
        onClose={() => setIsProvinceModalVisible(false)}
        title="Chọn Tỉnh / Thành phố"
        style={styles.modalContent}
      >
        <View style={styles.modalBody}>
          <Input
            placeholder="Tìm kiếm tỉnh/thành phố..."
            value={provinceSearch}
            onChangeText={setProvinceSearch}
            leftIcon={<Search size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
            containerStyle={styles.searchInput}
          />

          {isLoadingProvinces ? (
            <View style={styles.modalLoading}>
              <ActivityIndicator size="large" color={THEME_COLORS.PRIMARY} />
            </View>
          ) : (
            <FlatList
              data={filteredProvinces}
              keyExtractor={(item) => item.code}
              keyboardShouldPersistTaps="handled"
              style={styles.list}
              renderItem={({ item }) => {
                const isSelected = selectedProvince?.code === item.code;

                return (
                  <TouchableOpacity
                    style={[styles.listItem, isSelected && styles.listItemSelected]}
                    onPress={() => handleSelectProvince(item)}
                    activeOpacity={0.7}
                  >
                    <Typography
                      variant="body1"
                      weight={isSelected ? 'SEMIBOLD' : 'REGULAR'}
                      color={isSelected ? THEME_COLORS.PRIMARY : THEME_COLORS.TEXT_PRIMARY}
                    >
                      {item.fullName}
                    </Typography>

                    {isSelected ? <Check size={18} color={THEME_COLORS.PRIMARY} /> : null}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Typography variant="body2" color={THEME_COLORS.TEXT_MUTED}>
                    Không tìm thấy tỉnh/thành phố phù hợp
                  </Typography>
                </View>
              }
            />
          )}
        </View>
      </Modal>

      <Modal
        isVisible={isWardModalVisible}
        onClose={() => setIsWardModalVisible(false)}
        title={`Chọn Phường/Xã (${selectedProvince?.name || ''})`}
        style={styles.modalContent}
      >
        <View style={styles.modalBody}>
          <Input
            placeholder="Tìm kiếm phường/xã..."
            value={wardSearch}
            onChangeText={setWardSearch}
            leftIcon={<Search size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
            containerStyle={styles.searchInput}
          />

          {isLoadingWards ? (
            <View style={styles.modalLoading}>
              <ActivityIndicator size="large" color={THEME_COLORS.PRIMARY} />
            </View>
          ) : (
            <FlatList
              data={filteredWards}
              keyExtractor={(item) => item.code}
              keyboardShouldPersistTaps="handled"
              style={styles.list}
              renderItem={({ item }) => {
                const isSelected = selectedWard?.code === item.code;

                return (
                  <TouchableOpacity
                    style={[styles.listItem, isSelected && styles.listItemSelected]}
                    onPress={() => handleSelectWard(item)}
                    activeOpacity={0.7}
                  >
                    <Typography
                      variant="body1"
                      weight={isSelected ? 'SEMIBOLD' : 'REGULAR'}
                      color={isSelected ? THEME_COLORS.PRIMARY : THEME_COLORS.TEXT_PRIMARY}
                    >
                      {item.fullName}
                    </Typography>

                    {isSelected ? <Check size={18} color={THEME_COLORS.PRIMARY} /> : null}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Typography variant="body2" color={THEME_COLORS.TEXT_MUTED}>
                    Không tìm thấy phường/xã phù hợp
                  </Typography>
                </View>
              }
            />
          )}
        </View>
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING_TOKENS.LG,
    paddingVertical: SPACING_TOKENS.MD,
  },
  header: {
    marginTop: SPACING_TOKENS.SM,
    marginBottom: SPACING_TOKENS.LG,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING_TOKENS.XS,
    marginBottom: SPACING_TOKENS.MD,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.SURFACE,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
  },
  stepBadge: {
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING_TOKENS.SM,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
  },
  title: {
    marginBottom: SPACING_TOKENS.XS,
  },
  errorBanner: {
    backgroundColor: THEME_COLORS.ERROR_LIGHT,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    padding: SPACING_TOKENS.SM,
    marginBottom: SPACING_TOKENS.MD,
  },
  form: {
    width: '100%',
  },
  fieldWrapper: {
    marginBottom: SPACING_TOKENS.MD,
  },
  label: {
    marginBottom: 6,
    color: THEME_COLORS.TEXT_PRIMARY,
  },
  selectorTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingVertical: SPACING_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  selectorPlaceholder: {
    borderColor: THEME_COLORS.BORDER,
  },
  selectorDisabled: {
    backgroundColor: THEME_COLORS.BACKGROUND,
    opacity: 0.7,
  },
  triggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  triggerText: {
    marginLeft: SPACING_TOKENS.SM,
    flex: 1,
  },
  previewCard: {
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    padding: SPACING_TOKENS.MD,
    marginTop: SPACING_TOKENS.SM,
    marginBottom: SPACING_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.PRIMARY + '33',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  previewTitle: {
    marginLeft: 6,
  },
  previewText: {
    lineHeight: 20,
  },
  submitButton: {
    marginTop: SPACING_TOKENS.MD,
    marginBottom: SPACING_TOKENS.XL,
  },
  modalContent: {
    maxHeight: '80%',
  },
  modalBody: {
    maxHeight: 400,
  },
  searchInput: {
    marginBottom: SPACING_TOKENS.SM,
  },
  modalLoading: {
    paddingVertical: SPACING_TOKENS.XL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    maxHeight: 320,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING_TOKENS.SM + 2,
    paddingHorizontal: SPACING_TOKENS.SM,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: THEME_COLORS.DIVIDER,
  },
  listItemSelected: {
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
    borderRadius: BORDER_RADIUS_TOKENS.SM,
  },
  emptyList: {
    paddingVertical: SPACING_TOKENS.LG,
    alignItems: 'center',
  },
});
