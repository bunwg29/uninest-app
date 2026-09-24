import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { MapPin, ChevronDown, Search, Navigation } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS } from '@theme';
import { Button, Typography, HeaderBar, ScreenContainer, Modal, Input } from '@ui';
import { useToast } from '@hooks';
import type { ListingPostStackParamList } from '@navigation';
import {
  locationsService,
  type LocationProvince,
  type LocationWard,
} from '@features/auth/services/locationsService';
import { useListingPostStore } from '../store/listingPostStore';
import { LISTING_FORM_STEPS } from '../types/constants';
import { LocationMap, type MapCoordinate } from '../components/LocationMap';

type NavigationProp = NativeStackNavigationProp<ListingPostStackParamList>;

const TOTAL_STEPS = LISTING_FORM_STEPS.length;
const DEFAULT_REGION = {
  latitude: 10.7769,
  longitude: 106.7009,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export const LocationScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const toast = useToast();
  const { step3, setStep3 } = useListingPostStore();

  const [streetAddress, setStreetAddress] = useState(step3.streetAddress);
  const [selectedProvince, setSelectedProvince] = useState<LocationProvince | null>(
    step3.provinceCode
      ? {
          code: step3.provinceCode,
          name: step3.provinceName,
          fullName: step3.provinceName,
          codeName: '',
        }
      : null
  );
  const [selectedWard, setSelectedWard] = useState<LocationWard | null>(
    step3.wardCode
      ? {
          code: step3.wardCode,
          name: step3.wardName,
          fullName: step3.wardName,
          codeName: '',
          provinceCode: step3.provinceCode,
        }
      : null
  );

  const [markerCoord, setMarkerCoord] = useState<{ latitude: number; longitude: number } | null>(
    step3.latitude !== null && step3.longitude !== null
      ? { latitude: step3.latitude, longitude: step3.longitude }
      : null
  );

  const [provinces, setProvinces] = useState<LocationProvince[]>([]);
  const [wards, setWards] = useState<LocationWard[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [isProvinceModalVisible, setIsProvinceModalVisible] = useState(false);
  const [isWardModalVisible, setIsWardModalVisible] = useState(false);
  const [provinceSearch, setProvinceSearch] = useState('');
  const [wardSearch, setWardSearch] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadProvinces = async () => {
      try {
        setIsLoadingProvinces(true);
        const data = await locationsService.getProvinces();

        if (isMounted) setProvinces(data);
      } catch {
        if (isMounted) toast.error('Không thể tải danh sách tỉnh/thành phố');
      } finally {
        if (isMounted) setIsLoadingProvinces(false);
      }
    };

    void loadProvinces();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectProvince = useCallback(
    async (province: LocationProvince) => {
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
    },
    [toast]
  );

  const handleSelectWard = useCallback((ward: LocationWard) => {
    setSelectedWard(ward);
    setIsWardModalVisible(false);
    setWardSearch('');
  }, []);

  const handleCurrentLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        toast.info('Không có quyền truy cập vị trí. Vui lòng cấp quyền trong Cài đặt thiết bị.');

        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coord = { latitude: location.coords.latitude, longitude: location.coords.longitude };

      setMarkerCoord(coord);
      toast.success('Đã lấy vị trí hiện tại');
    } catch {
      toast.error('Không thể lấy vị trí hiện tại. Vui lòng chạm vào bản đồ để chọn.');
    }
  }, [toast]);

  const filteredProvinces = useMemo(() => {
    if (!provinceSearch.trim()) return provinces;

    const kw = provinceSearch.toLowerCase();

    return provinces.filter(
      (p) => p.name.toLowerCase().includes(kw) || p.fullName.toLowerCase().includes(kw)
    );
  }, [provinces, provinceSearch]);

  const filteredWards = useMemo(() => {
    if (!wardSearch.trim()) return wards;

    const kw = wardSearch.toLowerCase();

    return wards.filter(
      (w) => w.name.toLowerCase().includes(kw) || w.fullName.toLowerCase().includes(kw)
    );
  }, [wards, wardSearch]);

  const canContinue =
    streetAddress.trim().length > 0 &&
    selectedProvince !== null &&
    selectedWard !== null &&
    markerCoord !== null;

  const handleContinue = useCallback(() => {
    if (!selectedProvince) {
      toast.error('Vui lòng chọn Tỉnh/Thành phố');

      return;
    }

    if (!selectedWard) {
      toast.error('Vui lòng chọn Phường/Xã');

      return;
    }

    if (!streetAddress.trim()) {
      toast.error('Vui lòng nhập địa chỉ đường phố');

      return;
    }

    if (!markerCoord) {
      Alert.alert(
        'Chưa chọn vị trí',
        'Vui lòng nhấn vào bản đồ để chọn vị trí chính xác của phòng.',
        [{ text: 'Đồng ý' }]
      );

      return;
    }

    setStep3({
      streetAddress: streetAddress.trim(),
      provinceCode: selectedProvince.code,
      provinceName: selectedProvince.fullName,
      wardCode: selectedWard.code,
      wardName: selectedWard.fullName,
      latitude: markerCoord.latitude,
      longitude: markerCoord.longitude,
    });

    navigation.navigate('ListingPostAmenities');
  }, [selectedProvince, selectedWard, streetAddress, markerCoord, setStep3, navigation, toast]);

  return (
    <ScreenContainer applyTopInset applyBottomInset={false} keyboardAvoiding={false}>
      <HeaderBar
        title="Đăng tin mới"
        onBack={() => navigation.goBack()}
        subtitle={`Bước 3 / ${TOTAL_STEPS}: Vị trí`}
        alignTitle="left"
      />

      <StepIndicator currentStep={3} totalSteps={TOTAL_STEPS} />

      <View style={styles.flex}>
        <View style={styles.formSection}>
          <View style={styles.fieldRow}>
            <View style={styles.halfField}>
              <Typography
                variant="label"
                weight="MEDIUM"
                colorKey="TEXT_PRIMARY"
                style={styles.label}
              >
                Tỉnh/Thành phố *
              </Typography>

              <TouchableOpacity
                style={[styles.selector, !selectedProvince && styles.selectorPlaceholder]}
                onPress={() => setIsProvinceModalVisible(true)}
                activeOpacity={0.7}
              >
                <MapPin
                  size={16}
                  color={selectedProvince ? THEME_COLORS.PRIMARY : THEME_COLORS.TEXT_PLACEHOLDER}
                />

                <Typography
                  variant="body2"
                  color={
                    selectedProvince ? THEME_COLORS.TEXT_PRIMARY : THEME_COLORS.TEXT_PLACEHOLDER
                  }
                  style={styles.selectorText}
                  numberOfLines={1}
                >
                  {selectedProvince ? selectedProvince.name : 'Chọn tỉnh'}
                </Typography>

                {isLoadingProvinces ? (
                  <ActivityIndicator size="small" color={THEME_COLORS.PRIMARY} />
                ) : (
                  <ChevronDown size={16} color={THEME_COLORS.TEXT_MUTED} />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.halfField}>
              <Typography
                variant="label"
                weight="MEDIUM"
                colorKey="TEXT_PRIMARY"
                style={styles.label}
              >
                Phường/Xã *
              </Typography>

              <TouchableOpacity
                style={[
                  styles.selector,
                  !selectedProvince && styles.selectorDisabled,
                  !selectedWard && styles.selectorPlaceholder,
                ]}
                onPress={() => {
                  if (!selectedProvince) {
                    toast.info('Vui lòng chọn Tỉnh/Thành phố trước');

                    return;
                  }

                  setIsWardModalVisible(true);
                }}
                activeOpacity={selectedProvince ? 0.7 : 1}
              >
                <MapPin
                  size={16}
                  color={selectedWard ? THEME_COLORS.PRIMARY : THEME_COLORS.TEXT_PLACEHOLDER}
                />

                <Typography
                  variant="body2"
                  color={selectedWard ? THEME_COLORS.TEXT_PRIMARY : THEME_COLORS.TEXT_PLACEHOLDER}
                  style={styles.selectorText}
                  numberOfLines={1}
                >
                  {selectedWard ? selectedWard.name : 'Chọn phường'}
                </Typography>

                {isLoadingWards ? (
                  <ActivityIndicator size="small" color={THEME_COLORS.PRIMARY} />
                ) : (
                  <ChevronDown size={16} color={THEME_COLORS.TEXT_MUTED} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <Input
            label="Số nhà, tên đường *"
            placeholder="VD: Số 12, đường Lý Thường Kiệt"
            value={streetAddress}
            onChangeText={setStreetAddress}
            containerStyle={styles.streetInput}
          />
        </View>

        <View style={styles.mapContainer}>
          <View style={styles.mapHeader}>
            <Typography variant="label" weight="MEDIUM" colorKey="TEXT_PRIMARY">
              Vị trí trên bản đồ *
            </Typography>

            <TouchableOpacity
              style={styles.locationBtn}
              onPress={handleCurrentLocation}
              activeOpacity={0.7}
            >
              <Navigation size={14} color={THEME_COLORS.PRIMARY} />
              <Typography variant="caption" colorKey="PRIMARY" style={styles.locationBtnText}>
                Vị trí hiện tại
              </Typography>
            </TouchableOpacity>
          </View>

          <LocationMap
            coordinate={markerCoord}
            defaultRegion={DEFAULT_REGION}
            onCoordinateChange={(coordinate: MapCoordinate) => setMarkerCoord(coordinate)}
          />

          <View style={styles.coordCard}>
            <MapPin
              size={18}
              color={markerCoord ? THEME_COLORS.PRIMARY : THEME_COLORS.TEXT_PLACEHOLDER}
            />
            <View style={styles.coordTextContainer}>
              <Typography variant="caption" weight="SEMIBOLD" colorKey="TEXT_PRIMARY">
                {markerCoord
                  ? `Toạ độ đã chọn: ${markerCoord.latitude.toFixed(6)}, ${markerCoord.longitude.toFixed(6)}`
                  : 'Chưa chọn toạ độ trên bản đồ'}
              </Typography>
              <Typography variant="caption" colorKey="TEXT_SECONDARY">
                {markerCoord
                  ? 'Kéo marker hoặc chạm vào bản đồ để tinh chỉnh vị trí'
                  : 'Chạm vào bản đồ hoặc bấm "Vị trí hiện tại" để ghim'}
              </Typography>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.bottomBar}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canContinue}
          onPress={handleContinue}
        >
          Tiếp tục
        </Button>
      </View>

      <Modal
        isVisible={isProvinceModalVisible}
        onClose={() => setIsProvinceModalVisible(false)}
        title="Chọn Tỉnh / Thành phố"
        style={styles.modal}
      >
        <View style={styles.modalBody}>
          <Input
            placeholder="Tìm kiếm..."
            value={provinceSearch}
            onChangeText={setProvinceSearch}
            leftIcon={<Search size={16} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
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
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Typography variant="body2" colorKey="TEXT_MUTED">
                    Không tìm thấy tỉnh/thành phố
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
        title={`Chọn Phường/Xã (${selectedProvince?.name ?? ''})`}
        style={styles.modal}
      >
        <View style={styles.modalBody}>
          <Input
            placeholder="Tìm kiếm..."
            value={wardSearch}
            onChangeText={setWardSearch}
            leftIcon={<Search size={16} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
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
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Typography variant="body2" colorKey="TEXT_MUTED">
                    Không tìm thấy phường/xã
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
  formSection: {
    backgroundColor: THEME_COLORS.SURFACE,
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.SM,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: SPACING_TOKENS.SM,
    marginBottom: SPACING_TOKENS.SM,
  },
  halfField: {
    flex: 1,
  },
  label: {
    marginBottom: 6,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    paddingHorizontal: SPACING_TOKENS.SM,
    backgroundColor: THEME_COLORS.SURFACE,
    gap: SPACING_TOKENS.XS,
  },
  selectorPlaceholder: {
    borderColor: THEME_COLORS.BORDER,
  },
  selectorDisabled: {
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
    opacity: 0.7,
  },
  selectorText: {
    flex: 1,
  },
  streetInput: {
    marginBottom: SPACING_TOKENS.SM,
  },
  mapContainer: {
    flex: 1,
    minHeight: 280,
    margin: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingVertical: SPACING_TOKENS.SM,
    backgroundColor: THEME_COLORS.SURFACE,
    borderTopLeftRadius: BORDER_RADIUS_TOKENS.MD,
    borderTopRightRadius: BORDER_RADIUS_TOKENS.MD,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.DIVIDER,
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
    paddingHorizontal: SPACING_TOKENS.SM,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
  },
  locationBtnText: {
    marginLeft: 2,
    fontWeight: '600',
  },
  coordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM,
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingVertical: SPACING_TOKENS.SM,
    backgroundColor: THEME_COLORS.SURFACE,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.DIVIDER,
    borderBottomLeftRadius: BORDER_RADIUS_TOKENS.MD,
    borderBottomRightRadius: BORDER_RADIUS_TOKENS.MD,
  },
  coordTextContainer: {
    flex: 1,
  },
  bottomBar: {
    padding: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.DIVIDER,
  },
  modal: {
    maxHeight: '85%',
  },
  modalBody: {
    maxHeight: 450,
  },
  searchInput: {
    marginBottom: SPACING_TOKENS.SM,
  },
  modalLoading: {
    paddingVertical: SPACING_TOKENS.XL,
    alignItems: 'center',
  },
  list: {
    maxHeight: 360,
  },
  listItem: {
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

// Suppress unused import warning for TextInput (used implicitly via Input component)
const _TextInput = TextInput;

void _TextInput;
